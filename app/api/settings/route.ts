import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = {
  id: 1,
  storeName: "COMFORT KEEPERS",
  storeDescription: "متجر العطور والجمال",
  phone: "",
  whatsapp: "",
  address: "",
  shippingCost: 50,
  freeShippingMinimum: 500,
  currency: "جنيه",
  instagram: "",
  facebook: "",
  acceptOrders: true,
};

/**
 * GET
 * جلب إعدادات المتجر
 */
export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: {
        id: 1,
      },
    });

    // لو مفيش إعدادات، ننشئ الإعدادات الافتراضية
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب إعدادات المتجر",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * PUT
 * تحديث إعدادات المتجر
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const storeName =
      typeof body.storeName === "string"
        ? body.storeName.trim()
        : DEFAULT_SETTINGS.storeName;

    const storeDescription =
      typeof body.storeDescription === "string"
        ? body.storeDescription.trim()
        : DEFAULT_SETTINGS.storeDescription;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const whatsapp =
      typeof body.whatsapp === "string"
        ? body.whatsapp.trim()
        : "";

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    const currency =
      typeof body.currency === "string"
        ? body.currency.trim()
        : DEFAULT_SETTINGS.currency;

    const instagram =
      typeof body.instagram === "string"
        ? body.instagram.trim()
        : "";

    const facebook =
      typeof body.facebook === "string"
        ? body.facebook.trim()
        : "";

    const shippingCost = Number(body.shippingCost);

    const freeShippingMinimum = Number(
      body.freeShippingMinimum
    );

    const acceptOrders =
      typeof body.acceptOrders === "boolean"
        ? body.acceptOrders
        : DEFAULT_SETTINGS.acceptOrders;

    // -----------------------------
    // التحقق من البيانات
    // -----------------------------

    if (!storeName) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم المتجر مطلوب",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(shippingCost) ||
      shippingCost < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "سعر الشحن غير صحيح",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(freeShippingMinimum) ||
      freeShippingMinimum < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "حد الشحن المجاني غير صحيح",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // حفظ الإعدادات
    // -----------------------------

    const settings = await prisma.storeSettings.upsert({
      where: {
        id: 1,
      },

      create: {
        id: 1,
        storeName,
        storeDescription,
        phone,
        whatsapp,
        address,
        shippingCost,
        freeShippingMinimum,
        currency,
        instagram,
        facebook,
        acceptOrders,
      },

      update: {
        storeName,
        storeDescription,
        phone,
        whatsapp,
        address,
        shippingCost,
        freeShippingMinimum,
        currency,
        instagram,
        facebook,
        acceptOrders,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ إعدادات المتجر بنجاح",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء حفظ إعدادات المتجر",
      },
      {
        status: 500,
      }
    );
  }
}