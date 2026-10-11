
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
    documentId: product.id,
    name: product.name,
    slug: product.slug || product.id,
    description: product.description || "",
    price: product.price,
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
    ...(limit ? { take: limit } : {}),
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
  const value = slug.trim();

  if (!value) {
    return null;
  }

  // البحث عن المنتج باستخدام slug أولاً
  const productBySlug = await prisma.product.findFirst({
    where: {
      slug: value,
      isAvailable: true,
    },
  });

  if (productBySlug) {
    return mapProduct(productBySlug as DbProduct);
  }

  // إذا لم يوجد، نبحث باستخدام id
  const productById = await prisma.product.findFirst({
    where: {
      id: value,
      isAvailable: true,
    },
  });

  if (!productById) {
    return null;
  }

  return mapProduct(productById as DbProduct);
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
   LEGACY CATEGORY NAMES
========================================================= */

const legacyCategoryNames: Record<string, string[]> = {
  "women-perfume": [
    "برفيوم حريمي",
    "عطر نسائي",
  ],

  "men-perfume": [
    "برفيوم رجالي",
    "عطر رجالي",
  ],

  "perfume-50ml": [
    "برفيوم 50 ml",
    "برفيوم رجالي 50 ml",
  ],

  "skin-care": [
    "Skin Care",
    "Skincare",
  ],

  "perfume-wemn-50ml": [
    "برفيوم حريمي 50 ml",
    "برفيوم نسائي 50 ml",
  ],

  "master-box-women": [
    "ماستر بوكس حريمي",
    "بوكسات نسائية",
  ],

  "master-box-men": [
    "ماستر بوكس رجالي",
    "بوكسات رجالية",
  ],
};

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

  const categoryNames = [
    category.name,
    ...(legacyCategoryNames[categorySlug] || []),
  ];

  const products = await prisma.product.findMany({
    where: {
      category: {
        in: [...new Set(categoryNames)],
      },
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
  const markedProducts = await prisma.product.findMany({
    where: {
      isAvailable: true,
      isBestSeller: true,
    },
    orderBy: [
      { salesCount: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });

  const products =
    markedProducts.length > 0
      ? markedProducts
      : await prisma.product.findMany({
          where: {
            isAvailable: true,
          },
          orderBy: [
            { salesCount: "desc" },
            { createdAt: "desc" },
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