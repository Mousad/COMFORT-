import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const allowedStatuses = [
  "جديد",
  "جاري التنفيذ",
  "جاهز للشحن",
  "تم الشحن",
  "تم التسليم",
  "ملغي",
];

/**
 * GET
 * جلب تفاصيل طلب واحد - Admin فقط
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 حماية بيانات الطلب
    await requireAdmin();

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
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
    console.error("Get order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "غير مصرح لك بالوصول إلى هذا الطلب",
      },
      { status: 401 }
    );
  }
}

/**
 * PATCH
 * تغيير حالة الطلب - Admin فقط
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔐 حماية تغيير حالة الطلب
    await requireAdmin();

    const { id } = await params;

    const body = await request.json();

    const status = String(body.status || "").trim();

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "حالة الطلب غير صحيحة",
        },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id,
      },
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
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        items: true,
      },
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
        message: "غير مصرح لك بتعديل حالة الطلب",
      },
      { status: 401 }
    );
  }
}