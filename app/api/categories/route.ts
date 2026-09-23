import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    const productCounts = await prisma.product.groupBy({
      by: ["category"],
      _count: {
        _all: true,
      },
    });

    const countMap = new Map(
      productCounts.map((item) => [
        item.category,
        item._count._all,
      ])
    );

    const categoriesWithCount = categories.map(
      (category) => ({
        ...category,
        productsCount: countMap.get(category.name) || 0,
      })
    );

    return NextResponse.json(
      {
        success: true,
        categories: categoriesWithCount,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GET categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب التصنيفات",
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

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم التصنيف مطلوب",
        },
        {
          status: 400,
        }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "الرابط المختصر مطلوب",
        },
        {
          status: 400,
        }
      );
    }

    const existingName =
      await prisma.category.findFirst({
        where: {
          name,
        },
      });

    if (existingName) {
      return NextResponse.json(
        {
          success: false,
          message: "يوجد تصنيف بنفس الاسم بالفعل",
        },
        {
          status: 409,
        }
      );
    }

    const existingSlug =
      await prisma.category.findUnique({
        where: {
          slug,
        },
      });

    if (existingSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "الرابط المختصر مستخدم بالفعل",
        },
        {
          status: 409,
        }
      );
    }

    const category =
      await prisma.category.create({
        data: {
          name,
          slug,
          description: description || null,
          image: image || null,
          isActive,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "تمت إضافة التصنيف بنجاح",
        category: {
          ...category,
          productsCount: 0,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إضافة التصنيف",
      },
      {
        status: 500,
      }
    );
  }
}