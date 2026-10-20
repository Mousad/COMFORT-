
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول كمدير." },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك برفع الصور." },
        { status: 403 }
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { success: false, error: "إعدادات تخزين الصور غير مكتملة." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "اختر صورة صالحة أولًا." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "الصيغ المدعومة: JPG وPNG وWebP وAVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "حجم الصورة يجب ألا يتجاوز 4 ميجابايت.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "comfort/products",
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
          },
          (error, uploaded) => {
            if (error) {
              reject(error);
              return;
            }

            if (!uploaded?.secure_url) {
              reject(new Error("Cloudinary did not return an image URL."));
              return;
            }

            resolve({ secure_url: uploaded.secure_url });
          }
        );

        stream.end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      image: result.secure_url,
    });
  } catch (error) {
    console.error("Product image upload failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "تعذّر رفع الصورة. تحقق من إعدادات Cloudinary وسجل السيرفر.",
      },
      { status: 500 }
    );
  }
}
