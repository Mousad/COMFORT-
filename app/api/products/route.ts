import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب المنتجات",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const price = Number(body.price);
    const stock = Number(body.stock);

    const isBestSeller =
      typeof body.isBestSeller === "boolean"
        ? body.isBestSeller
        : false;

    const isTrending =
      typeof body.isTrending === "boolean"
        ? body.isTrending
        : false;

    const isNew =
      typeof body.isNew === "boolean"
        ? body.isNew
        : false;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم المنتج مطلوب",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "تصنيف المنتج مطلوب",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "السعر غير صحيح",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "الكمية غير صحيحة",
        },
        { status: 400 }
      );
    }

    const status =
      stock === 0
        ? "out"
        : stock <= 5
        ? "low"
        : "available";

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price,
        stock,
        image: image || null,
        description: description || null,
        status,
        isAvailable: stock > 0,
        isBestSeller,
        isTrending,
        isNew,
        salesCount: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "تمت إضافة المنتج بنجاح",
        product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إضافة المنتج",
      },
      {
        status: 500,
      }
    );
  }
}