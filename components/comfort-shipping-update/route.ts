import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const STORE_WHATSAPP = "201157499163";
const STORE_LATITUDE = 29.952070485013405;
const STORE_LONGITUDE = 30.960877742832103;

function cleanPhone(value: string) {
  return value.replace(/\D/g, "");
}

function createWhatsAppUrl(message: string) {
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function distanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateShipping(distanceKm: number) {
  if (distanceKm <= 5) return 30;
  if (distanceKm <= 10) return 40;
  if (distanceKm <= 15) return 50;
  if (distanceKm <= 20) return 60;
  if (distanceKm <= 25) return 70;
  if (distanceKm <= 30) return 80;
  return 90;
}

export async function GET() {
  try {
    await requireAdmin();

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, message: "غير مصرح لك بالوصول إلى الطلبات" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = body.customer;
    const items = body.items;

    if (!customer) {
      return NextResponse.json({ success: false, message: "بيانات العميل مطلوبة" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "السلة فارغة" }, { status: 400 });
    }

    const customerName = typeof customer.name === "string" ? customer.name.trim() : "";
    const customerPhone = typeof customer.phone === "string" ? customer.phone.trim() : "";
    const whatsappCountryCode = typeof customer.whatsappCountryCode === "string" ? customer.whatsappCountryCode.trim() : "";
    const whatsappPhone = typeof customer.whatsappPhone === "string" ? customer.whatsappPhone.trim() : "";
    const city = typeof customer.city === "string" ? customer.city.trim() : "";
    const area = typeof customer.area === "string" ? customer.area.trim() : "";
    const address = typeof customer.address === "string" ? customer.address.trim() : "";
    const notes = typeof customer.notes === "string" ? customer.notes.trim() : "";
    const latitude = Number(customer.latitude);
    const longitude = Number(customer.longitude);

    if (!customerName) return NextResponse.json({ success: false, message: "اسم العميل مطلوب" }, { status: 400 });
    if (!customerPhone) return NextResponse.json({ success: false, message: "رقم الهاتف مطلوب" }, { status: 400 });
    if (!whatsappPhone) return NextResponse.json({ success: false, message: "رقم الواتساب مطلوب" }, { status: 400 });
    if (!city) return NextResponse.json({ success: false, message: "المدينة مطلوبة" }, { status: 400 });
    if (!area) return NextResponse.json({ success: false, message: "المنطقة مطلوبة" }, { status: 400 });
    if (!address) return NextResponse.json({ success: false, message: "العنوان مطلوب" }, { status: 400 });

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return NextResponse.json({ success: false, message: "موقع العميل غير صحيح" }, { status: 400 });
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return NextResponse.json({ success: false, message: "موقع العميل غير صحيح" }, { status: 400 });
    }

    const storeSettings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    const settings = {
      acceptOrders: storeSettings?.acceptOrders ?? true,
      currency: storeSettings?.currency || "جنيه",
      storeName: storeSettings?.storeName || "COMFORT KEEPERS",
    };

    if (!settings.acceptOrders) {
      return NextResponse.json({ success: false, message: "عذراً، استقبال الطلبات متوقف حالياً" }, { status: 403 });
    }

    const cleanedItems = items.map((item: any) => ({
      id: item.id ? String(item.id) : undefined,
      name: typeof item.name === "string" ? item.name.trim() : "",
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: typeof item.image === "string" ? item.image : null,
    }));

    for (const item of cleanedItems) {
      if (!item.name) return NextResponse.json({ success: false, message: "اسم أحد المنتجات غير صحيح" }, { status: 400 });
      if (!Number.isFinite(item.price) || item.price < 0) {
        return NextResponse.json({ success: false, message: `سعر المنتج "${item.name}" غير صحيح` }, { status: 400 });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ success: false, message: `كمية المنتج "${item.name}" غير صحيحة` }, { status: 400 });
      }
    }

    const subtotal = cleanedItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
    const distanceKm = distanceInKm(STORE_LATITUDE, STORE_LONGITUDE, latitude, longitude);
    const shipping = calculateShipping(distanceKm);
    const total = subtotal + shipping;
    const orderNumber = `CK-${Date.now().toString().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone: cleanPhone(customerPhone),
        whatsappCountryCode,
        whatsappPhone: cleanPhone(whatsappPhone),
        city,
        area,
        address,
        notes: notes || null,
        latitude,
        longitude,
        distanceKm,
        subtotal,
        shipping,
        total,
        status: "جديد",
        items: {
          create: cleanedItems.map((item: any) => ({
            productId: item.id || null,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      },
      include: { items: true },
    });

    const productsMessage = order.items
      .map((item) => `• ${item.name} × ${item.quantity} — ${(item.price * item.quantity).toLocaleString("ar-EG")} ${settings.currency}`)
      .join("\n");

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

📌 المنطقة:
${area}

🏠 العنوان:
${address}

📏 المسافة من المتجر:
${distanceKm.toFixed(1)} كم

${notes ? `📝 ملاحظات:\n${notes}\n` : ""}
━━━━━━━━━━━━━━
🛍️ المنتجات:
${productsMessage}

━━━━━━━━━━━━━━
💰 المنتجات:
${subtotal.toLocaleString("ar-EG")} ${settings.currency}

🚚 الشحن (${distanceKm.toFixed(1)} كم):
${shipping.toLocaleString("ar-EG")} ${settings.currency}

💵 الإجمالي:
${total.toLocaleString("ar-EG")} ${settings.currency}

💳 طريقة الدفع:
الدفع عند الاستلام

━━━━━━━━━━━━━━
`;

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الطلب بنجاح",
      orderId: order.id,
      orderNumber: order.orderNumber,
      whatsappNumber: STORE_WHATSAPP,
      whatsappUrl: createWhatsAppUrl(whatsappMessage),
      subtotal,
      shipping,
      total,
      distanceKm,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء الطلب" },
      { status: 500 }
    );
  }
}
