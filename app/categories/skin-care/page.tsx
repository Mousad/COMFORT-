
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Header, { Footer } from "@/components/layout/Header";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import SkinCareGallery from "@/components/products/SkinCareGallery";
export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 8;

type SkinCarePageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function SkinCarePage({
  searchParams,
}: SkinCarePageProps) {
  const products = await getProducts();

  // منتجات Skin Care فقط
  const skinCareProducts = products.filter(
    (product) =>
      product.category === "Skin Care" ||
      product.category === "skin-care"
  );

  const params = await searchParams;

  const currentPage = Math.max(
    1,
    Number(params.page) || 1
  );

  // عدد الصفحات
  const totalPages = Math.max(
    1,
    Math.ceil(
      skinCareProducts.length / PRODUCTS_PER_PAGE
    )
  );

  // منع الانتقال لصفحة غير موجودة
  const safePage = Math.min(
    currentPage,
    totalPages
  );

  // المنتجات الخاصة بالصفحة الحالية
  const startIndex =
    (safePage - 1) * PRODUCTS_PER_PAGE;

  const visibleProducts =
    skinCareProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE
    );

  return (
    <>
      {/* Navbar */}
      <Header />

      <main
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] "
      >
        {/* Page Header */}
      <section
  className="relative mx-auto mt-0 min-h-[250px] max-w-[1400px] overflow-hidden px-5 py-6 md:mt-5 md:min-h-[330px] md:px-8 md:py-10"
>
  {/* Background Image */}
  <img
    src="https://i.pinimg.com/736x/34/49/d6/3449d6aaee377fcee61302350a3bf8b8.jpg"
    alt="Skin Care"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/35" />

  {/* Content */}
  <div className="relative z-10 flex min-h-[170px] flex-col justify-between md:min-h-[250px]">
    {/* Back */}
    <div className="text-[#feffff]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs  transition "
      >
        <ArrowRight size={15} />
        العودة 
      </Link>
    </div>

    {/* Title */}
    <div className="text-center text-white">
      <p className="text-[10px] tracking-[0.3em] text-white/70">
        RITUALS OF CARE
      </p>

      <h1 className="mt-2 font-serif text-3xl md:text-5xl">
        Skin Care
      </h1>

      <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-white/80 md:text-sm md:leading-7">
        اكتشفي مجموعة العناية بالبشرة المختارة بعناية
        لتضيف لمسة من الانتعاش والانتعاش إلى روتينكِ اليومي.
      </p>
    </div>
  </div>
</section>
<section
  dir="rtl"
  className="overflow-hidden bg-[#171717] py-3 text-[#f0ede8]"
>
  <div className="flex w-max animate-[marquee_20s_linear_infinite] items-center whitespace-nowrap">
    <div className="flex items-center gap-8 px-4 text-xs md:text-sm">
      <span>خصم 20% على منتجات Skin Care</span>
      <span className="text-[#b89b72]">✦</span>

      <span>شحن مجاني للطلبات فوق 500 جنيه</span>
      <span className="text-[#b89b72]">✦</span>

      <span>عروض حصرية لفترة محدودة</span>
      <span className="text-[#b89b72]">✦</span>

      <span>اشتري أكثر ووفر أكثر</span>
      <span className="text-[#b89b72]">✦</span>

      <span>خصم 20% على منتجات Skin Care</span>
      <span className="text-[#b89b72]">✦</span>

      <span>شحن مجاني للطلبات فوق 500 جنيه</span>
      <span className="text-[#b89b72]">✦</span>

      <span>عروض حصرية لفترة محدودة</span>
      <span className="text-[#b89b72]">✦</span>

      <span>اشتري أكثر ووفر أكثر</span>
      <span className="text-[#b89b72]">✦</span>
    </div>
  </div>
</section>


        {/* Products */}
        <section className="mx-auto mt-10 max-w-[1400px] px-4 pb-20 md:px-8 md:pb-28">
          {/* Products Count */}
          {skinCareProducts.length > 0 && (
            <div className="mb-7 flex items-center justify-between border-b border-black/10 pb-4 text-xs text-black/45">
              <span>
                عرض{" "}
                {startIndex + 1}-
                {Math.min(
                  startIndex + PRODUCTS_PER_PAGE,
                  skinCareProducts.length
                )}{" "}
                من {skinCareProducts.length} منتج
              </span>

             
            </div>
          )}

          {/* Product Grid */}
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10  sm:gap-x-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex min-h-[350px] items-center justify-center text-center">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-black/35">
                  NO PRODUCTS
                </p>

                <h2 className="mt-3 font-serif text-2xl">
                  لا توجد منتجات للعناية بالبشرة
                </h2>

                <p className="mt-3 text-sm leading-7 text-black/50">
                  لم تتم إضافة منتجات في هذه المجموعة حتى الآن.
                </p>

                <Link
                  href="/products"
                  className="mt-7 inline-flex border-b border-black pb-2 text-sm"
                >
                  اكتشفي جميع المنتجات
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex flex-wrap items-center justify-center gap-2">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => {
                const active = safePage === page;

                return (
                  <Link
                    key={page}
                    href={`/categories/skin-care?page=${page}`}
                    className={`
                      flex h-10 w-10 items-center justify-center
                      border text-xs transition
                      ${
                        active
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-black/15 text-[#171717] hover:border-black/40"
                      }
                    `}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <SkinCareGallery products={skinCareProducts} />

      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
