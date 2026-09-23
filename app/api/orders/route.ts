import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STORE_WHATSAPP = "201157499163";

const DEFAULT_SHIPPING_COST = 50;
const DEFAULT_FREE_SHIPPING_MINIMUM = 500;

function cleanPhone(value: string) {
  return value.replace(/\D/g, "");
}

function createWhatsAppUrl(message: string) {
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(
    message
  )}`;
}

/**
 * GET
 * جلب كل الطلبات
 */
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب الطلبات",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 * إنشاء طلب جديد
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const customer = body.customer;
    const items = body.items;

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات العميل مطلوبة",
        },
        {
          status: 400,
        }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "السلة فارغة",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       التحقق من بيانات العميل
    ========================= */

    const customerName =
      typeof customer.name === "string"
        ? customer.name.trim()
        : "";

    const customerPhone =
      typeof customer.phone === "string"
        ? customer.phone.trim()
        : "";

    const whatsappCountryCode =
      typeof customer.whatsappCountryCode === "string"
        ? customer.whatsappCountryCode.trim()
        : "";

    const whatsappPhone =
      typeof customer.whatsappPhone === "string"
        ? customer.whatsappPhone.trim()
        : "";

    const city =
      typeof customer.city === "string"
        ? customer.city.trim()
        : "";

    const address =
      typeof customer.address === "string"
        ? customer.address.trim()
        : "";

    const notes =
      typeof customer.notes === "string"
        ? customer.notes.trim()
        : "";

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم العميل مطلوب",
        },
        {
          status: 400,
        }
      );
    }

    if (!customerPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف مطلوب",
        },
        {
          status: 400,
        }
      );
    }

    if (!whatsappPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الواتساب مطلوب",
        },
        {
          status: 400,
        }
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          message: "المدينة مطلوبة",
        },
        {
          status: 400,
        }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "العنوان مطلوب",
        },
        {
          status: 400,
        }
      );
    }

    /* =========================
       إعدادات المتجر من Neon
    ========================= */

    const storeSettings =
      await prisma.storeSettings.findUnique({
        where: {
          id: 1,
        },
      });

    const settings = {
      shippingCost:
        Number(
          storeSettings?.shippingCost ??
            DEFAULT_SHIPPING_COST
        ),

      freeShippingMinimum:
        Number(
          storeSettings?.freeShippingMinimum ??
            DEFAULT_FREE_SHIPPING_MINIMUM
        ),

      acceptOrders:
        storeSettings?.acceptOrders ?? true,

      currency:
        storeSettings?.currency || "جنيه",

      storeName:
        storeSettings?.storeName ||
        "COMFORT KEEPERS",
    };

    /* =========================
       إيقاف استقبال الطلبات
    ========================= */

    if (!settings.acceptOrders) {
      return NextResponse.json(
        {
          success: false,
          message:
            "عذراً، استقبال الطلبات متوقف حالياً",
        },
        {
          status: 403,
        }
      );
    }

    /* =========================
       تنظيف المنتجات
    ========================= */

    const cleanedItems = items.map(
      (item: any) => ({
        id: item.id
          ? String(item.id)
          : undefined,

        name:
          typeof item.name === "string"
            ? item.name.trim()
            : "",

        price: Number(item.price),

        quantity: Number(item.quantity),

        image:
          typeof item.image === "string"
            ? item.image
            : null,
      })
    );

    /* =========================
       التحقق من المنتجات
    ========================= */

    for (const item of cleanedItems) {
      if (!item.name) {
        return NextResponse.json(
          {
            success: false,
            message: "اسم أحد المنتجات غير صحيح",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !Number.isFinite(item.price) ||
        item.price < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `سعر المنتج "${item.name}" غير صحيح`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `كمية المنتج "${item.name}" غير صحيحة`,
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =========================
       حساب المنتجات
    ========================= */

    const subtotal = cleanedItems.reduce(
      (sum: number, item: any) => {
        return (
          sum +
          item.price * item.quantity
        );
      },
      0
    );

    /* =========================
       حساب الشحن من Neon
    ========================= */

    const shipping =
      subtotal >=
      settings.freeShippingMinimum
        ? 0
        : settings.shippingCost;

    /* =========================
       الإجمالي النهائي
    ========================= */

    const total = subtotal + shipping;

    /* =========================
       إنشاء رقم الطلب
    ========================= */

    const orderNumber = `CK-${Date.now()
      .toString()
      .slice(-6)}`;

    /* =========================
       إنشاء الطلب في Neon
    ========================= */

    const order = await prisma.order.create({
      data: {
        orderNumber,

        customerName,

        customerPhone:
          cleanPhone(customerPhone),

        whatsappCountryCode,

        whatsappPhone:
          cleanPhone(whatsappPhone),

        city,

        address,

        notes: notes || null,

        total,

        status: "جديد",

        items: {
          create: cleanedItems.map(
            (item: any) => ({
              productId: item.id || null,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })
          ),
        },
      },

      include: {
        items: true,
      },
    });

    /* =========================
       تجهيز رسالة الواتساب
    ========================= */

    const productsMessage =
      order.items
        .map(
          (item) =>
            `• ${item.name} × ${item.quantity} — ${(
              item.price * item.quantity
            ).toLocaleString("ar-EG")} ${settings.currency}`
        )
        .join("\n");

    const shippingMessage =
      shipping === 0
        ? "مجاني"
        : `${shipping.toLocaleString(
            "ar-EG"
          )} ${settings.currency}`;

    const whatsappMessage = `
طلب جديد من ${settings.storeName}

━━━━━━━━━━━━━━
رقم الطلب: ${orderNumber}
━━━━━━━━━━━━━━

👤 العميل:
${customerName}

📞 الهاتف:
${customerPhone}

💬 واتساب:
${whatsappCountryCode} ${whatsappPhone}

📍 المدينة:
${city}

🏠 العنوان:
${address}

━━━━━━━━━━━━━━
🛍️ المنتجات:
${productsMessage}

━━━━━━━━━━━━━━
💰 المنتجات:
${subtotal.toLocaleString(
      "ar-EG"
    )} ${settings.currency}

🚚 الشحن:
${shippingMessage}

💵 الإجمالي:
${total.toLocaleString(
      "ar-EG"
    )} ${settings.currency}

💳 طريقة الدفع:
الدفع عند الاستلام

${
  notes
    ? `📝 ملاحظات:\n${notes}`
    : ""
}

━━━━━━━━━━━━━━
`;

    const whatsappUrl =
      createWhatsAppUrl(
        whatsappMessage
      );

    return NextResponse.json({
      success: true,

      message: "تم إنشاء الطلب بنجاح",

      orderId: order.id,

      orderNumber: order.orderNumber,

      whatsappNumber: STORE_WHATSAPP,

      whatsappUrl,

      subtotal,

      shipping,

      total,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إنشاء الطلب",
      },
      {
        status: 500,
      }
    );
  }
}