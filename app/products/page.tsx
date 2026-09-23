import Header, { Footer } from "@/components/layout/Header";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts, searchProducts } from "@/lib/api";
import Link from "next/link";
import { Search } from "lucide-react";

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    searchOpen?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const searchQuery = params.search?.trim() || "";
  const searchOpen = params.searchOpen === "true";

  const products = searchQuery
    ? await searchProducts(searchQuery)
    : await getProducts();

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
        <section className="mx-auto max-w-[1400px] px-1 pt-6 md:px-8 md:pt-10">
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
          className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20"
        >
          {/* =======================================================
              STICKY SEARCH
          ======================================================= */}
          {searchOpen && (
            <form
              action="/products"
              method="GET"
              className="sticky top-0 z-40 -mx-5 mt-8 flex items-center gap-4 border-b border-black/20 bg-[#f0ede8]/95 px-5 py-4 backdrop-blur-md md:-mx-8 md:px-8"
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

              <button
                type="submit"
                className="shrink-0 text-xs underline underline-offset-4"
              >
                بحث
              </button>
            </form>
          )}

          {/* =======================================================
              SEARCH RESULT INFO
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
              PRODUCTS GRID
          ======================================================= */}
          {products.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
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

                <p className="mt-3 text-sm text-black/50">
                  جرّب البحث باسم عطر أو منتج آخر.
                </p>

                <Link
                  href="/products"
                  className="mt-6 inline-block bg-[#171717] px-6 py-3 text-xs text-white"
                >
                  عرض كل المنتجات
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}