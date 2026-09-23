"use client";

import { useMemo, useState } from "react";
import { Product, Category } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";

type HomeProductsProps = {
  products: Product[];
  categories: Category[];
};

const PRODUCTS_PER_PAGE = 6;

const FILTERS = [
  {
    key: "all",
    label: "الكل",
  },
  {
    key: "women-perfume",
    label: "نسائي",
  },
  {
    key: "men-perfume",
    label: "رجالي",
  },
  {
    key: "skin-care",
    label: "Skin Care",
  },
  {
    key: "perfume-50ml",
    label: "50 ml",
  },
];

export default function HomeProducts({
  products,
  categories,
}: HomeProductsProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return products;
    }

    const category = categories.find(
      (item) => item.slug === activeFilter
    );

    if (!category) {
      return [];
    }

    return products.filter(
      (product) => product.category === category.name
    );
  }, [products, categories, activeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  function handleFilterChange(filter: string) {
    setActiveFilter(filter);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);

    document
      .getElementById("home-products")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <section
      id="home-products"
      dir="rtl"
      className="mx-auto max-w-[1400px] px-4 py-14 md:px-8 md:py-20"
    >
      {/* HEADER */}
      <div className="mb-8 text-center">
        <p className="text-[10px] tracking-[0.3em] text-black/40">
          SHOP COLLECTION
        </p>

        <h2 className="mt-3 font-serif text-3xl md:text-4xl">
          اكتشفي منتجاتنا
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/50">
          اختاري المجموعة التي تناسبك واكتشفي منتجاتك المفضلة.
        </p>
      </div>

      {/* FILTERS */}
      <div className="mb-10 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max justify-center gap-2 px-1">
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => handleFilterChange(filter.key)}
                className={`
                  whitespace-nowrap
                  border
                  px-5
                  py-3
                  text-xs
                  transition
                  ${
                    active
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-black/15 bg-transparent text-[#171717] hover:border-black/40"
                  }
                `}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCTS */}
      {visibleProducts.length > 0 ? (
<div className="grid grid-cols-2 gap-x-2 gap-y-8 px-3 sm:gap-x-4 sm:px-0 md:grid-cols-3 md:gap-6 lg:grid-cols-4">          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[280px] items-center justify-center text-center">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-black/35">
              NO PRODUCTS
            </p>

            <h3 className="mt-3 font-serif text-2xl">
              لا توجد منتجات في هذه المجموعة
            </h3>

            <p className="mt-3 text-sm text-black/50">
              جرّبي مجموعة أخرى.
            </p>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => {
            const active = safePage === page;

            return (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  border
                  text-xs
                  transition
                  ${
                    active
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-black/15 text-[#171717] hover:border-black/40"
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}