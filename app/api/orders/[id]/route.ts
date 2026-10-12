
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const VALID_STATUSES = [
  "جديد",
  "جاري التنفيذ",
  "جاهز للشحن",
  "تم الشحن",
  "تم التسليم",
  "ملغي",
] as const;

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function authorizeAdmin() {
  const session = await getAdminSession();

  if (!session) {
    return false;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true, isActive: true },
  });

  return Boolean(admin?.isActive);
}

// GET: جلب تفاصيل طلب محدد
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بالوصول إلى الطلبات",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير موجود",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب تفاصيل الطلب",
      },
      { status: 500 }
    );
  }
}

// PATCH: تحديث حالة الطلب
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    if (!(await authorizeAdmin())) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بتحديث الطلب",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    let body: { status?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "بيانات الطلب المرسلة غير صالحة",
        },
        { status: 400 }
      );
    }

    const status = body.status;

    if (
      typeof status !== "string" ||
      !VALID_STATUSES.includes(
        status as (typeof VALID_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "حالة الطلب غير صالحة",
        },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب غير موجود",
        },
        { status: 404 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحديث حالة الطلب",
      },
      { status: 500 }
    );
  }
}