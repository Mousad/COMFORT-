import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@/types/product";

type DbProduct = {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  price: number;
  stock: number;
  image: string | null;
  description: string | null;
  status: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isNew: boolean;
  salesCount: number;
  createdAt: Date;
};

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
};

/* =========================================================
   PRODUCT MAPPER
========================================================= */

function mapProduct(product: DbProduct): Product {
  return {
    id: product.id,

    // توافق مع الكود القديم
    documentId: product.id,

    name: product.name,

    // المنتجات القديمة التي لا تحتوي slug
    // نستخدم id كبديل مؤقت
    slug: product.slug || product.id,

    description: product.description || "",

    price: product.price,

    // قاعدة البيانات تحتوي على صورة واحدة
    // والواجهة تتوقع images[]
    images: product.image ? [product.image] : [],

    category: product.category,

    stock: product.stock,

    isAvailable: product.isAvailable,

    isBestSeller: product.isBestSeller,

    isTrending: product.isTrending,

    isNew: product.isNew,

    salesCount: product.salesCount,

    createdAt: product.createdAt.toISOString(),
  };
}

/* =========================================================
   CATEGORY MAPPER
========================================================= */

function mapCategory(category: DbCategory): Category {
  return {
    id: category.id,

    // توافق مع الكود القديم
    documentId: category.id,

    name: category.name,

    slug: category.slug,

    image: category.image || "",

    description: category.description || undefined,
  };
}

/* =========================================================
   ALL PRODUCTS
========================================================= */

export async function getProducts(
  limit?: number
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    ...(limit
      ? {
          take: limit,
        }
      : {}),
  });

  return products.map((product) =>
    mapProduct(product as DbProduct)
  );
}

/* =========================================================
   SINGLE PRODUCT
========================================================= */

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: {
      isAvailable: true,

      OR: [
        {
          slug,
        },
        {
          id: slug,
        },
      ],
    },
  });

  if (!product) {
    return null;
  }

  return mapProduct(product as DbProduct);
}

/* =========================================================
   ALL ACTIVE CATEGORIES
========================================================= */

export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  return categories.map((category) =>
    mapCategory(category as DbCategory)
  );
}

/* =========================================================
   SINGLE CATEGORY
========================================================= */

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const category = await prisma.category.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });

  if (!category) {
    return null;
  }

  return mapCategory(category as DbCategory);
}

/* =========================================================
   PRODUCTS BY CATEGORY
========================================================= */

export async function getProductsByCategory(
  categorySlug: string
): Promise<Product[]> {
  const category = await prisma.category.findFirst({
    where: {
      slug: categorySlug,
      isActive: true,
    },
  });

  if (!category) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      category: category.name,
      isAvailable: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) =>
    mapProduct(product as DbProduct)
  );
}

/* =========================================================
   BEST SELLERS
========================================================= */

export async function getBestSellers(
  limit: number = 8
): Promise<Product[]> {
  // أولاً نحاول جلب المنتجات التي تم تحديدها
  // من الأدمن كـ "الأكثر مبيعًا"
  const markedProducts = await prisma.product.findMany({
    where: {
      isAvailable: true,
      isBestSeller: true,
    },

    orderBy: [
      {
        salesCount: "desc",
      },
      {
        createdAt: "desc",
      },
    ],

    take: limit,
  });

  /*
   * لو ما في أي منتج محدد كـ "الأكثر مبيعًا"
   * نستخدم المنتجات المتاحة كبديل
   *
   * هذا يمنع الصفحة الرئيسية من الظهور فارغة.
   */
  const products =
    markedProducts.length > 0
      ? markedProducts
      : await prisma.product.findMany({
          where: {
            isAvailable: true,
          },

          orderBy: [
            {
              salesCount: "desc",
            },
            {
              createdAt: "desc",
            },
          ],

          take: limit,
        });

  return products.map((product) =>
    mapProduct(product as DbProduct)
  );
}

/* =========================================================
   TRENDING PRODUCTS
========================================================= */

export async function getTrendingProducts(
  limit: number = 8
): Promise<Product[]> {
  // المنتجات المحددة كـ "الأكثر رواجًا"
  const markedProducts = await prisma.product.findMany({
    where: {
      isAvailable: true,
      isTrending: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,
  });

  /*
   * إذا لا يوجد أي منتج عليه isTrending
   * نستخدم المنتجات المتاحة كبديل.
   */
  const products =
    markedProducts.length > 0
      ? markedProducts
      : await prisma.product.findMany({
          where: {
            isAvailable: true,
          },

          orderBy: {
            createdAt: "desc",
          },

          take: limit,
        });

  return products.map((product) =>
    mapProduct(product as DbProduct)
  );
}

/* =========================================================
   NEW ARRIVALS
========================================================= */

export async function getNewArrivals(
  limit: number = 8
): Promise<Product[]> {
  // المنتجات المحددة كـ "وصل حديثًا"
  const markedProducts = await prisma.product.findMany({
    where: {
      isAvailable: true,
      isNew: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,
  });

  /*
   * إذا لا يوجد أي منتج عليه isNew
   * نستخدم أحدث المنتجات كبديل.
   */
  const products =
    markedProducts.length > 0
      ? markedProducts
      : await prisma.product.findMany({
          where: {
            isAvailable: true,
          },

          orderBy: {
            createdAt: "desc",
          },

          take: limit,
        });

  return products.map((product) =>
    mapProduct(product as DbProduct)
  );
}

/* =========================================================
   RELATED PRODUCTS
========================================================= */

export async function getRelatedProducts(
  productId: string,
  category: string,
  limit: number = 4
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      category,

      isAvailable: true,

      id: {
        not: productId,
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,
  });

  return products.map((product) =>
    mapProduct(product as DbProduct)
  );
}

/* =========================================================
   SEARCH PRODUCTS
========================================================= */

export async function searchProducts(
  query: string
): Promise<Product[]> {
  const value = query.trim();

  if (!value) {
    return getProducts();
  }

  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,

      OR: [
        {
          name: {
            contains: value,
            mode: "insensitive",
          },
        },

        {
          description: {
            contains: value,
            mode: "insensitive",
          },
        },

        {
          category: {
            contains: value,
            mode: "insensitive",
          },
        },
      ],
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) =>
    mapProduct(product as DbProduct)
  );
}