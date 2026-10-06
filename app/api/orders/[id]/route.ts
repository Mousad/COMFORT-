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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      include: {
        items: true,
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

    /*
     * منع تنفيذ نفس الحالة مرة أخرى
     */
    if (existingOrder.status === status) {
      return NextResponse.json(
        {
          success: false,
          message: "الطلب بالفعل في هذه الحالة",
        },
        { status: 400 }
      );
    }

    /*
     * ==========================================
     * تنفيذ الطلب
     * جديد → جاري التنفيذ
     *
     * هنا فقط يتم خصم المخزون
     * ==========================================
     */

    if (
      existingOrder.status === "جديد" &&
      status === "جاري التنفيذ"
    ) {
      if (existingOrder.inventoryDeducted) {
        return NextResponse.json(
          {
            success: false,
            message: "تم خصم مخزون هذا الطلب مسبقاً",
          },
          { status: 400 }
        );
      }

      try {
        const order = await prisma.$transaction(
          async (tx) => {
            /*
             * نتحقق من كل المنتجات أولاً
             * قبل خصم أي كمية.
             */

            const products = [];

            for (const item of existingOrder.items) {
              if (!item.productId) {
                throw new Error(
                  `المنتج "${item.name}" غير مرتبط بمنتج في المخزون`
                );
              }

              const product = await tx.product.findUnique({
                where: {
                  id: item.productId,
                },
              });

              if (!product) {
                throw new Error(
                  `المنتج "${item.name}" غير موجود في المخزون`
                );
              }

              if (product.stock < item.quantity) {
                throw new Error(
                  `المنتج "${product.name}" لا يوجد منه كمية كافية. المتاح: ${product.stock}، المطلوب: ${item.quantity}`
                );
              }

              products.push({
                product,
                quantity: item.quantity,
              });
            }

            /*
             * بعد التأكد من جميع المنتجات،
             * نبدأ خصم المخزون.
             */

            for (const item of products) {
              const newStock =
                item.product.stock - item.quantity;

              const newStatus =
                newStock === 0
                  ? "out"
                  : newStock <= 5
                  ? "low"
                  : "available";

              await tx.product.update({
                where: {
                  id: item.product.id,
                },
                data: {
                  stock: newStock,

                  status: newStatus,

                  isAvailable: newStock > 0,

                  salesCount: {
                    increment: item.quantity,
                  },
                },
              });
            }

            /*
             * تحديث الطلب بعد نجاح خصم كل المنتجات
             */

            return await tx.order.update({
              where: {
                id: existingOrder.id,
              },
              data: {
                status: "جاري التنفيذ",
                inventoryDeducted: true,
              },
              include: {
                items: true,
              },
            });
          }
        );

        return NextResponse.json({
          success: true,
          message: "تم تنفيذ الطلب وخصم المخزون بنجاح",
          order,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "تعذر تنفيذ الطلب";

        return NextResponse.json(
          {
            success: false,
            message,
          },
          { status: 400 }
        );
      }
    }

    /*
     * ==========================================
     * إلغاء الطلب
     * ==========================================
     *
     * إذا كان المخزون قد خُصم سابقاً،
     * نعيد الكمية للمخزون.
     */

    if (
      status === "ملغي" &&
      existingOrder.status !== "ملغي"
    ) {
      /*
       * طلب جديد لم يُنفذ بعد:
       * لا يوجد شيء نرجعه للمخزون.
       */

      if (!existingOrder.inventoryDeducted) {
        const order = await prisma.order.update({
          where: {
            id: existingOrder.id,
          },
          data: {
            status: "ملغي",
          },
          include: {
            items: true,
          },
        });

        return NextResponse.json({
          success: true,
          message: "تم إلغاء الطلب",
          order,
        });
      }

      /*
       * الطلب كان منفذاً والمخزون مخصوماً،
       * لذلك نعيد الكميات.
       */

      try {
        const order = await prisma.$transaction(
          async (tx) => {
            for (const item of existingOrder.items) {
              if (!item.productId) {
                continue;
              }

              const product = await tx.product.findUnique({
                where: {
                  id: item.productId,
                },
              });

              if (!product) {
                continue;
              }

              const newStock =
                product.stock + item.quantity;

              const newStatus =
                newStock === 0
                  ? "out"
                  : newStock <= 5
                  ? "low"
                  : "available";

              await tx.product.update({
                where: {
                  id: product.id,
                },
                data: {
                  stock: newStock,

                  status: newStatus,

                  isAvailable: newStock > 0,

                  salesCount: {
                    decrement: Math.min(
                      item.quantity,
                      product.salesCount
                    ),
                  },
                },
              });
            }

            return await tx.order.update({
              where: {
                id: existingOrder.id,
              },
              data: {
                status: "ملغي",
                inventoryDeducted: false,
              },
              include: {
                items: true,
              },
            });
          }
        );

        return NextResponse.json({
          success: true,
          message:
            "تم إلغاء الطلب وإرجاع المنتجات إلى المخزون",
          order,
        });
      } catch (error) {
        console.error(
          "Restore inventory error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "حدث خطأ أثناء إرجاع المنتجات إلى المخزون",
          },
          { status: 500 }
        );
      }
    }

    /*
     * ==========================================
     * باقي انتقالات الطلب
     *
     * جاري التنفيذ → جاهز للشحن
     * جاهز للشحن → تم الشحن
     * تم الشحن → تم التسليم
     * ==========================================
     */

    const validTransition =
      (existingOrder.status === "جاري التنفيذ" &&
        status === "جاهز للشحن") ||
      (existingOrder.status === "جاهز للشحن" &&
        status === "تم الشحن") ||
      (existingOrder.status === "تم الشحن" &&
        status === "تم التسليم");

    if (!validTransition) {
      return NextResponse.json(
        {
          success: false,
          message: `لا يمكن تغيير حالة الطلب من "${existingOrder.status}" إلى "${status}"`,
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id: existingOrder.id,
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
    console.error(
      "Update order status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "غير مصرح لك بتعديل حالة الطلب",
      },
      { status: 401 }
    );
  }
}