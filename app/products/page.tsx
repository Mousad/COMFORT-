import Header, { Footer } from "@/components/layout/Header";
import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types/product";
import { getProducts, searchProducts } from "@/lib/api";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  X,
  ArrowDownUp,
} from "lucide-react";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    searchOpen?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 8;

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const searchQuery = params.search?.trim() || "";
  const searchOpen = params.searchOpen === "true";
  const selectedCategory = params.category || "all";
  const selectedSort = params.sort || "default";

  const requestedPage = Number(params.page || "1");

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.floor(requestedPage)
      : 1;

  /* =========================================================
     GET PRODUCTS
  ========================================================= */

  const allProducts = searchQuery
    ? await searchProducts(searchQuery)
    : await getProducts();

  /* =========================================================
     CATEGORY FILTER
  ========================================================= */

  const categories = Array.from(
    new Set(
      allProducts
        .map((product) => product.category)
        .filter(Boolean)
    )
  );

  let filteredProducts = [...allProducts];

  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) =>
        String(product.category || "") === selectedCategory
    );
  }

  /* =========================================================
     SORT
  ========================================================= */

  if (selectedSort === "price-low") {
    filteredProducts.sort(
      (a, b) => Number(a.price) - Number(b.price)
    );
  }

  if (selectedSort === "price-high") {
    filteredProducts.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  }

  if (selectedSort === "best-selling") {
    filteredProducts.sort(
      (a, b) =>
        Number(b.salesCount || 0) -
        Number(a.salesCount || 0)
    );
  }

  if (selectedSort === "newest") {
    filteredProducts.sort((a, b) => {
      const aDate = new Date(
        String(a.createdAt || "")
      ).getTime();

      const bDate = new Date(
        String(b.createdAt || "")
      ).getTime();

      return bDate - aDate;
    });
  }

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalProducts = filteredProducts.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalProducts / PRODUCTS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) *
    PRODUCTS_PER_PAGE;

  const paginatedProducts =
    filteredProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE
    );

  /* =========================================================
     URL HELPER
  ========================================================= */

  function createPageUrl(page: number) {
    const query = new URLSearchParams();

    if (searchQuery) {
      query.set("search", searchQuery);
    }

    if (searchOpen) {
      query.set("searchOpen", "true");
    }

    if (selectedCategory !== "all") {
      query.set(
        "category",
        selectedCategory
      );
    }

    if (selectedSort !== "default") {
      query.set("sort", selectedSort);
    }

    if (page > 1) {
      query.set("page", String(page));
    }

    const queryString = query.toString();

    return queryString
      ? `/products?${queryString}`
      : "/products";
  }

  /* =========================================================
     PAGINATION NUMBERS
  ========================================================= */

  const pageNumbers: (
    number | "dots"
  )[] = [];

  if (totalPages <= 7) {
    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);

    if (safePage > 4) {
      pageNumbers.push("dots");
    }

    const start = Math.max(
      2,
      safePage - 1
    );

    const end = Math.min(
      totalPages - 1,
      safePage + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pageNumbers.push(i);
    }

    if (safePage < totalPages - 3) {
      pageNumbers.push("dots");
    }

    pageNumbers.push(totalPages);
  }

  /* =========================================================
     FILTER LABEL
  ========================================================= */

  const selectedCategoryLabel =
    selectedCategory === "all"
      ? "كل المنتجات"
      : selectedCategory;

  const selectedSortLabel =
    selectedSort === "default"
      ? "الأحدث والأهم"
      : selectedSort === "newest"
        ? "الأحدث"
        : selectedSort === "price-low"
          ? "السعر: من الأقل للأعلى"
          : selectedSort === "price-high"
            ? "السعر: من الأعلى للأقل"
            : "الأكثر مبيعًا";

  return (
    <>
      <Header />

      <main
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] text-[#171717]"
      >

        {/* =========================================================
            PRODUCTS HERO
        ========================================================= */}

        <section className="mx-auto max-w-[1400px] px-1 pt-4 md:px-8 md:pt-10">
          <div className="relative h-[230px] overflow-hidden md:h-[280px]">

            <img
              src="https://snif.co/cdn/shop/files/Homepage_Ulta_Block_CS-1_1500x.png?v=1776931099"
              alt="مجموعة عطور فاخرة"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 flex h-full items-center justify-center px-6 text-center text-white">

              <div>
                <p className="text-[9px] tracking-[0.4em] text-white/70">
                  THE COLLECTION
                </p>

                <h1 className="mt-3 font-serif text-3xl md:text-5xl">
                  عطور تشبهك
                </h1>

                <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-white/80 md:text-sm">
                  اكتشف مجموعتنا المختارة بعناية من العطور ومنتجات العناية.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            PRODUCTS SECTION
        ========================================================= */}

        <section
          id="products"
          className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-20"
        >

          {/* =======================================================
              SEARCH
          ======================================================= */}

          {searchOpen && (
            <form
              action="/products"
              method="GET"
              className="sticky top-0 z-40 -mx-5 mt-2 flex items-center gap-4 border-b border-black/20 bg-[#f0ede8]/95 px-5 py-4 backdrop-blur-md md:-mx-8 md:px-8"
            >
              <Search
                size={18}
                strokeWidth={1.5}
                className="shrink-0 text-black/45"
              />

              <input
                autoFocus
                type="search"
                name="search"
                defaultValue={searchQuery}
                placeholder="ابحث عن عطر أو منتج..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-black/35"
              />

              <input
                type="hidden"
                name="searchOpen"
                value="true"
              />

              {selectedCategory !== "all" && (
                <input
                  type="hidden"
                  name="category"
                  value={selectedCategory}
                />
              )}

              {selectedSort !== "default" && (
                <input
                  type="hidden"
                  name="sort"
                  value={selectedSort}
                />
              )}

              <button
                type="submit"
                className="shrink-0 text-xs underline underline-offset-4"
              >
                بحث
              </button>
            </form>
          )}

          {/* =======================================================
              SEARCH RESULT
          ======================================================= */}

          {searchQuery && (
            <div className="mt-6 flex items-center justify-between">

              <p className="text-xs text-black/50">
                نتائج البحث عن:{" "}
                <span className="text-black">
                  {searchQuery}
                </span>
              </p>

              <Link
                href="/products"
                className="text-xs underline underline-offset-4"
              >
                مسح البحث
              </Link>

            </div>
          )}

          {/* =======================================================
              NEW FILTER BAR
          ======================================================= */}

          <div className="mt-8 border-y border-black/10">

            <div className="flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between">

              {/* LEFT / TITLE */}

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171717] text-white">
                  <SlidersHorizontal
                    size={16}
                    strokeWidth={1.5}
                  />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    FILTER & SORT
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {selectedCategoryLabel}
                  </p>
                </div>

              </div>

              {/* CATEGORY CHIPS */}

              <div className="flex-1 overflow-x-auto scrollbar-hide">

                <div className="flex min-w-max items-center gap-2 lg:justify-center">

                  <Link
                    href={createPageUrl(1).replace(
                      selectedCategory !== "all"
                        ? `category=${encodeURIComponent(selectedCategory)}`
                        : "",
                      ""
                    )}
                    className={`rounded-[8px] border px-2 py-2 text-[11px] transition ${
                      selectedCategory === "all"
                        ? "border-[#171717] bg-[#c8a58b] text-white"
                        : "border-black/15 bg-white/50 text-black/60 hover:bg-white"
                    }`}
                  >
                    الكل
                  </Link>

                  {categories.map(
                    (category) => {

                      const query =
                        new URLSearchParams();

                      if (searchQuery) {
                        query.set(
                          "search",
                          searchQuery
                        );
                      }

                      if (searchOpen) {
                        query.set(
                          "searchOpen",
                          "true"
                        );
                      }

                      query.set(
                        "category",
                        String(category)
                      );

                      if (
                        selectedSort !==
                        "default"
                      ) {
                        query.set(
                          "sort",
                          selectedSort
                        );
                      }

                      return (
                        <Link
                          key={category}
                          href={`/products?${query.toString()}`}
                          className={`rounded-[10px] border px-3 py-2 text-[11px] whitespace-nowrap transition ${
                            selectedCategory ===
                            category
                              ? "border-[#171717] bg-[#c8a58b] text-white"
                              : "border-black/15 bg-white/50 text-black/60 hover:bg-white"
                          }`}
                        >
                          {category}
                        </Link>
                      );
                    }
                  )}

                </div>

              </div>

              {/* SORT */}

              <details className="relative shrink-0 lg:w-[210px]">

                <summary className="flex h-11 cursor-pointer list-none items-center justify-between border border-black/15 bg-white/60 px-4 text-xs transition hover:bg-white">

                  <span className="flex items-center gap-2">
                    <ArrowDownUp
                      size={14}
                      strokeWidth={1.5}
                    />

                    {selectedSortLabel}
                  </span>

                  <ChevronRight
                    size={14}
                    className="rotate-90"
                  />

                </summary>

                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden border border-black/10 bg-white p-1 shadow-xl">

                  {[
                    {
                      value: "default",
                      label: "الترتيب الافتراضي",
                    },
                    {
                      value: "newest",
                      label: "الأحدث",
                    },
                    {
                      value: "best-selling",
                      label: "الأكثر مبيعًا",
                    },
                    {
                      value: "price-low",
                      label: "السعر: من الأقل للأعلى",
                    },
                    {
                      value: "price-high",
                      label: "السعر: من الأعلى للأقل",
                    },
                  ].map((option) => {

                    const query =
                      new URLSearchParams();

                    if (searchQuery) {
                      query.set(
                        "search",
                        searchQuery
                      );
                    }

                    if (searchOpen) {
                      query.set(
                        "searchOpen",
                        "true"
                      );
                    }

                    if (
                      selectedCategory !==
                      "all"
                    ) {
                      query.set(
                        "category",
                        selectedCategory
                      );
                    }

                    if (
                      option.value !==
                      "default"
                    ) {
                      query.set(
                        "sort",
                        option.value
                      );
                    }

                    return (
                      <Link
                        key={option.value}
                        href={`/products?${query.toString()}`}
                        className={`block px-3 py-3 text-xs transition ${
                          selectedSort ===
                          option.value
                            ? "bg-[#f0ede8] font-medium"
                            : "hover:bg-[#f7f5f2]"
                        }`}
                      >
                        {option.label}
                      </Link>
                    );
                  })}

                </div>

              </details>

            </div>

            {/* ACTIVE FILTERS */}

            {(selectedCategory !== "all" ||
              selectedSort !== "default" ||
              searchQuery) && (

              <div className="flex flex-wrap items-center gap-2 border-t border-black/10 py-4">

                <span className="ml-1 text-[10px] text-black/40">
                  الفلاتر الحالية:
                </span>

                {searchQuery && (
                  <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px]">
                    البحث: {searchQuery}
                  </span>
                )}

                {selectedCategory !== "all" && (
                  <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px]">
                    {selectedCategory}
                  </span>
                )}

                {selectedSort !== "default" && (
                  <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px]">
                    {selectedSortLabel}
                  </span>
                )}

                <Link
                  href="/products"
                  className="mr-auto flex items-center gap-1 text-[10px] text-black/50 underline underline-offset-4 transition hover:text-black"
                >
                  <X size={12} />
                  مسح الكل
                </Link>

              </div>
            )}

          </div>

          {/* =======================================================
              PRODUCTS COUNT
          ======================================================= */}

    

          {/* =======================================================
              PRODUCTS GRID
          ======================================================= */}

          {paginatedProducts.length > 0 ? (

            <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-10 md:grid-cols-4 md:gap-6">

              {paginatedProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}

            </div>

          ) : (

            <div className="flex min-h-[350px] items-center justify-center text-center">

              <div>

                <p className="text-[10px] tracking-[0.25em] text-black/40">
                  NO RESULTS
                </p>

                <h2 className="mt-3 font-serif text-2xl">
                  لم نجد المنتج
                </h2>

                <Link
                  href="/products"
                  className="mt-6 inline-block bg-[#171717] px-6 py-3 text-xs text-white"
                >
                  عرض كل المنتجات
                </Link>

              </div>

            </div>
          )}

          {/* =======================================================
              PAGINATION
          ======================================================= */}

          {totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center">

              <div className="flex items-center gap-1">

                {/* Previous */}

                {safePage > 1 ? (
                  <Link
                    href={createPageUrl(
                      safePage - 1
                    )}
                    aria-label="الصفحة السابقة"
                    className="flex h-9 w-9 items-center justify-center border border-black/15 bg-white/50 transition hover:bg-white"
                  >
                    <ChevronRight
                      size={15}
                      strokeWidth={1.5}
                    />
                  </Link>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center border border-black/10 text-black/20">
                    <ChevronRight
                      size={15}
                      strokeWidth={1.5}
                    />
                  </span>
                )}

                {/* Numbers */}

                {pageNumbers.map(
                  (page, index) =>
                    page === "dots" ? (
                      <span
                        key={`dots-${index}`}
                        className="flex h-9 w-7 items-center justify-center text-xs text-black/40"
                      >
                        ...
                      </span>
                    ) : (
                      <Link
                        key={page}
                        href={createPageUrl(
                          page
                        )}
                        className={`flex h-9 min-w-9 items-center justify-center border px-2 text-xs transition ${
                          page === safePage
                            ? "border-[#171717] bg-[#171717] text-white"
                            : "border-black/15 bg-white/50 hover:bg-white"
                        }`}
                      >
                        {page}
                      </Link>
                    )
                )}

                {/* Next */}

                {safePage < totalPages ? (
                  <Link
                    href={createPageUrl(
                      safePage + 1
                    )}
                    aria-label="الصفحة التالية"
                    className="flex h-9 w-9 items-center justify-center border border-black/15 bg-white/50 transition hover:bg-white"
                  >
                    <ChevronLeft
                      size={15}
                      strokeWidth={1.5}
                    />
                  </Link>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center border border-black/10 text-black/20">
                    <ChevronLeft
                      size={15}
                      strokeWidth={1.5}
                    />
                  </span>
                )}

              </div>

            </div>
          )}

        </section>
      </main>

      <Footer />
    </>
  );
}