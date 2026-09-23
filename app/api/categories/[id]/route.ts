import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/categories/[id]
export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "التصنيف غير موجود",
        },
        { status: 404 }
      );
    }

    const productsCount = await prisma.product.count({
      where: {
        category: category.name,
      },
    });

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        productsCount,
      },
    });
  } catch (error) {
    console.error("GET category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب التصنيف",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/categories/[id]
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "التصنيف غير موجود",
        },
        { status: 404 }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existingCategory.name;

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim()
        : existingCategory.slug;

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : existingCategory.description;

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : existingCategory.image;

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : existingCategory.isActive;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم التصنيف مطلوب",
        },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "الرابط المختصر مطلوب",
        },
        { status: 400 }
      );
    }

    // منع تكرار الاسم
    const duplicateName =
      await prisma.category.findFirst({
        where: {
          name,
          NOT: {
            id,
          },
        },
      });

    if (duplicateName) {
      return NextResponse.json(
        {
          success: false,
          message: "يوجد تصنيف آخر بنفس الاسم",
        },
        { status: 409 }
      );
    }

    // منع تكرار slug
    const duplicateSlug =
      await prisma.category.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
      });

    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "يوجد تصنيف آخر بنفس الرابط المختصر",
        },
        { status: 409 }
      );
    }

    /*
     * إذا تغير اسم التصنيف:
     * حدث جميع المنتجات المرتبطة بالاسم القديم
     */
    const nameChanged =
      existingCategory.name !== name;

    const [category] = await prisma.$transaction(
      async (tx) => {
        const updatedCategory =
          await tx.category.update({
            where: {
              id,
            },
            data: {
              name,
              slug,
              description: description || null,
              image: image || null,
              isActive,
            },
          });

        if (nameChanged) {
          await tx.product.updateMany({
            where: {
              category: existingCategory.name,
            },
            data: {
              category: name,
            },
          });
        }

        return [updatedCategory];
      }
    );

    const productsCount =
      await prisma.product.count({
        where: {
          category: category.name,
        },
      });

    return NextResponse.json({
      success: true,
      message: nameChanged
        ? "تم تحديث التصنيف ونقل المنتجات التابعة له بنجاح"
        : "تم تحديث التصنيف بنجاح",
      category: {
        ...category,
        productsCount,
      },
    });
  } catch (error) {
    console.error("PATCH category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تحديث التصنيف",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "التصنيف غير موجود",
        },
        { status: 404 }
      );
    }

    const productsCount =
      await prisma.product.count({
        where: {
          category: category.name,
        },
      });

    // منع حذف تصنيف يحتوي على منتجات
    if (productsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `لا يمكن حذف التصنيف لأنه يحتوي على ${productsCount} منتج`,
          productsCount,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف التصنيف بنجاح",
    });
  } catch (error) {
    console.error("DELETE category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حذف التصنيف",
      },
      { status: 500 }
    );
  }
}