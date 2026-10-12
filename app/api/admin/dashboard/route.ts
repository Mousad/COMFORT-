
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CANCELLED = ["ملغي", "ملغى", "cancelled", "canceled"];
const DELIVERED = ["تم التسليم", "delivered"];
const PENDING = ["جديد", "جاري التنفيذ", "جاهز للشحن", "تم الشحن"];

function normalizeStatus(status: string) {
  return status.trim().toLowerCase();
}

function isCancelled(status: string) {
  return CANCELLED.includes(normalizeStatus(status));
}

function isDelivered(status: string) {
  return DELIVERED.includes(normalizeStatus(status));
}

function isPending(status: string) {
  return PENDING.includes(normalizeStatus(status));
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    // التحقق من جلسة الأدمن دون redirect داخل API
    const session = await getAdminSession();

    if (!session) {
      return jsonError("انتهت جلسة الإدارة. سجّل الدخول مجدداً.", 401);
    }

    // التأكد من أن حساب الأدمن ما زال مفعلاً
    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      return jsonError("حساب الإدارة غير مفعّل أو غير موجود.", 403);
    }

    const params = request.nextUrl.searchParams;
    const now = new Date();

    const year = Number(params.get("year") || now.getFullYear());
    const month = Number(params.get("month") || now.getMonth() + 1);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      year < 2000 ||
      year > 2100
    ) {
      return jsonError("الشهر أو السنة غير صالحين.", 400);
    }

    // حدود الشهر بالتوقيت العالمي UTC
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const activeOrders = orders.filter(
      (order) => !isCancelled(order.status)
    );

    const deliveredOrders = orders.filter((order) =>
      isDelivered(order.status)
    );

    const cancelledOrders = orders.filter((order) =>
      isCancelled(order.status)
    );

    const pendingOrders = orders.filter((order) =>
      isPending(order.status)
    );

    const products = new Map<
      string,
      {
        id: string;
        name: string;
        image: string | null;
        quantity: number;
        revenue: number;
      }
    >();

    const daily = new Map<string, number>();

    for (const order of activeOrders) {
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      daily.set(dateKey, (daily.get(dateKey) || 0) + 1);

      for (const item of order.items) {
        const key = item.productId || `name:${item.name}`;
        const name = item.product?.name || item.name;
        const image = item.image || item.product?.image || null;
        const existing = products.get(key);

        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;

          if (!existing.image && image) {
            existing.image = image;
          }
        } else {
          products.set(key, {
            id: key,
            name,
            image,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      }
    }

    const daysInMonth = new Date(
      Date.UTC(year, month, 0)
    ).getUTCDate();

    const dailyEntries = Array.from(
      { length: daysInMonth },
      (_, index) => {
        const day = index + 1;
        const key = `${year}-${String(month).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

        return {
          day,
          orders: daily.get(key) || 0,
        };
      }
    );

    const busiestDay = dailyEntries.reduce(
      (best, current) =>
        current.orders > best.orders ? current : best,
      { day: 0, orders: 0 }
    );

    const quietestDay = dailyEntries.reduce(
      (quietest, current) =>
        current.orders < quietest.orders ? current : quietest,
      { day: 0, orders: 0 }
    );

    const topProducts = Array.from(products.values())
      .sort(
        (a, b) =>
          b.quantity - a.quantity || b.revenue - a.revenue
      )
      .slice(0, 10);

    const sales = activeOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    const deliveredSales = deliveredOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    return NextResponse.json(
      {
        period: { year, month },
        summary: {
          totalOrders: orders.length,
          activeOrders: activeOrders.length,
          cancelledOrders: cancelledOrders.length,
          deliveredOrders: deliveredOrders.length,
          pendingOrders: pendingOrders.length,
          sales,
          deliveredSales,
        },
        topProducts,
        daily: dailyEntries,
        busiestDay,
        quietestDay,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Admin dashboard API error:", error);

    return jsonError(
      "حدث خطأ أثناء تحميل الإحصائيات. راجع رسالة الخطأ في Terminal.",
      500
    );
  }
}