import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import { requireAdmin } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ==========================================
// GET - جلب منتج واحد
// ==========================================
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "المنتج غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("GET product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء جلب المنتج",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// PATCH - تعديل المنتج
// ==========================================
export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "المنتج غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    const data: Record<string, any> = {};

    // ==========================================
    // الاسم
    // ==========================================
    if (body.name !== undefined) {
      if (typeof body.name !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "اسم المنتج غير صحيح",
          },
          {
            status: 400,
          }
        );
      }

      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "اسم المنتج مطلوب",
          },
          {
            status: 400,
          }
        );
      }

      data.name = name;
    }

    // ==========================================
    // التصنيف
    // ==========================================
    if (body.category !== undefined) {
      if (typeof body.category !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "تصنيف المنتج غير صحيح",
          },
          {
            status: 400,
          }
        );
      }

      const category = body.category.trim();

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: "تصنيف المنتج مطلوب",
          },
          {
            status: 400,
          }
        );
      }

      data.category = category;
    }

    // ==========================================
    // السعر
    // ==========================================
    if (body.price !== undefined) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "السعر غير صحيح",
          },
          {
            status: 400,
          }
        );
      }

      data.price = price;
    }

    // ==========================================
    // المخزون
    // ==========================================
    if (body.stock !== undefined) {
      const stock = Number(body.stock);

      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "الكمية غير صحيحة",
          },
          {
            status: 400,
          }
        );
      }

      data.stock = stock;

      // تحديث حالة المخزون تلقائيًا
      data.status =
        stock === 0
          ? "out"
          : stock <= 5
          ? "low"
          : "available";

      data.isAvailable = stock > 0;
    }

    // ==========================================
    // الصورة
    // ==========================================
    if (body.image !== undefined) {
      data.image =
        typeof body.image === "string" && body.image.trim()
          ? body.image.trim()
          : null;
    }

    // ==========================================
    // الوصف
    // ==========================================
    if (body.description !== undefined) {
      data.description =
        typeof body.description === "string" &&
        body.description.trim()
          ? body.description.trim()
          : null;
    }

    // ==========================================
    // Slug
    // ==========================================
    if (body.slug !== undefined) {
      if (typeof body.slug !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "رابط المنتج غير صحيح",
          },
          {
            status: 400,
          }
        );
      }

      const slug = body.slug.trim();

      if (!slug) {
        return NextResponse.json(
          {
            success: false,
            message: "رابط المنتج مطلوب",
          },
          {
            status: 400,
          }
        );
      }

      const existingSlug = await prisma.product.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          {
            success: false,
            message: "رابط المنتج مستخدم بالفعل",
          },
          {
            status: 400,
          }
        );
      }

      data.slug = slug;
    } else if (
      typeof body.name === "string" &&
      body.name.trim() &&
      !existingProduct.slug
    ) {
      data.slug = createSlug(body.name.trim());
    }

    // ==========================================
    // 👁️ إخفاء / إظهار المنتج
    // ==========================================
    if (typeof body.isVisible === "boolean") {
      data.isVisible = body.isVisible;
    }

    // ==========================================
    // ⭐ أفضل المبيعات
    // ==========================================
    if (typeof body.isBestSeller === "boolean") {
      data.isBestSeller = body.isBestSeller;
    }

    // ==========================================
    // 🔥 ترند
    // ==========================================
    if (typeof body.isTrending === "boolean") {
      data.isTrending = body.isTrending;
    }

    // ==========================================
    // 🆕 جديد
    // ==========================================
    if (typeof body.isNew === "boolean") {
      data.isNew = body.isNew;
    }

    // ==========================================
    // لا توجد بيانات للتعديل
    // ==========================================
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "لم يتم إرسال أي بيانات للتعديل",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // تحديث المنتج
    // ==========================================
    const product = await prisma.product.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "تم تعديل المنتج بنجاح",
      product,
    });
  } catch (error) {
    console.error("PATCH product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تعديل المنتج",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE - حذف المنتج نهائيًا
// ==========================================
export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "المنتج غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    // نحافظ على الطلبات القديمة
    // ونزيل فقط ارتباط المنتج بها.
    await prisma.$transaction(async (tx) => {
      await tx.orderItem.updateMany({
        where: {
          productId: id,
        },
        data: {
          productId: null,
        },
      });

      await tx.product.delete({
        where: {
          id,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج نهائيًا",
    });
  } catch (error) {
    console.error("DELETE product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء حذف المنتج",
      },
      {
        status: 500,
      }
    );
  }
}