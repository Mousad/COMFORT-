
"use client";

import { useMemo, useState, useEffect } from "react";
import { Product, Category } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";

type HomeProductsProps = {
  products: Product[];
  categories: Category[];
};

const PRODUCTS_PER_PAGE = 6;

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "women-perfume", label: "نسائية" },
  { key: "men-perfume", label: "رجالي" },
  { key: "perfume-50ml", label: "رجالي 50 مل" },
  { key: "skin-care", label: "Skin Care" },
  { key: "perfume-wemn-50ml", label: "نسائي 50 مل" },
  { key: "master-box-women", label: "بوكسات نسائية" },
  { key: "master-box-men", label: "بوكسات رجالية" },
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

    if (!category) return [];

    return products.filter(
      (product) => product.category === category.name
    );
  }, [products, categories, activeFilter]);

  // في عرض "الكل": وزّع المنتجات بين الأقسام بالتناوب
  const displayProducts = useMemo(() => {
    if (activeFilter !== "all") {
      return filteredProducts;
    }

    const groups = new Map<string, Product[]>();

    for (const product of filteredProducts) {
      const group = groups.get(product.category) ?? [];
      group.push(product);
      groups.set(product.category, group);
    }

    const result: Product[] = [];
    const groupLists = Array.from(groups.values());
    const maxLength = Math.max(
      0,
      ...groupLists.map((group) => group.length)
    );

    for (let index = 0; index < maxLength; index++) {
      for (const group of groupLists) {
        if (group[index]) {
          result.push(group[index]);
        }
      }
    }

    return result;
  }, [filteredProducts, activeFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(displayProducts.length / PRODUCTS_PER_PAGE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleProducts = displayProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleFilterChange(filter: string) {
    setActiveFilter(filter);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);

    document.getElementById("home-products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section
      id="home-products"
      dir="rtl"
      className="mx-auto max-w-[1400px] px-1 py-8 md:px-8 md:py-20"
    >
      <div className="mb-4 text-center">
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">
          اكتشفي منتجاتنا
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-black/50">
          اختاري المجموعة التي تناسبك واكتشفي منتجاتك المفضلة.
        </p>
      </div>

      {/* الفلاتر */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => handleFilterChange(filter.key)}
                className={`w-[calc((100%-32px)/5)] max-w-[140px] min-w-0 whitespace-nowrap border px-1 py-2.5 text-[10px] transition duration-200 sm:px-3 sm:py-3 sm:text-xs ${
                  active
                    ? "border-[#171717] bg-[#171717] text-white"
                    : "border-black/15 bg-transparent text-[#171717] hover:border-black/40"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* المنتجات */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-8 px-2 sm:gap-x-4 sm:px-0 md:grid-cols-3 md:gap-6 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
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

      {/* أرقام الصفحات */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => {
              const active = safePage === page;

              return (
                <button
                  key={page}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => handlePageChange(page)}
                  className={`flex h-10 w-10 items-center justify-center border text-xs transition ${
                    active
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-black/15 text-[#171717] hover:border-black/40"
                  }`}
                >
                  {page}
                </button>
              );
            }
          )}
        </div>
      )}

      <p className="mt-4 text-center text-[11px] text-black/40">
        عرض {visibleProducts.length} من {displayProducts.length} منتج
      </p>
    </section>
  );
}