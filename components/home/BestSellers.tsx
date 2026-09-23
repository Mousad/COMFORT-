"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";

type BestSellersProps = {
  products: Product[];
};

export default function BestSellers({
  products,
}: BestSellersProps) {
  /*
   * ترتيب المنتجات حسب الأكثر مبيعاً
   */
  const sortedProducts = [...products].sort(
    (a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0)
  );

  /*
   * تقسيم المنتجات حسب النوع
   */
  const women = sortedProducts.filter(
    (product) =>
      product.category === "برفيوم حريمي" ||
      product.category === "women-perfume"
  );

  const men = sortedProducts.filter(
    (product) =>
      product.category === "برفيوم رجالي" ||
      product.category === "men-perfume"
  );

  const skinCare = sortedProducts.filter(
    (product) =>
      product.category === "Skin Care" ||
      product.category === "skin-care"
  );

  const perfume50 = sortedProducts.filter(
    (product) =>
      product.category === "برفيوم 50 ml" ||
      product.category === "perfume-50ml"
  );

  /*
   * مكس بين التصنيفات
   */
  const mixedProducts: Product[] = [];

  const groups = [
    women,
    men,
    skinCare,
    perfume50,
  ];

  let index = 0;

  while (
    mixedProducts.length < 8 &&
    index < 20
  ) {
    for (const group of groups) {
      const product = group[index];

      if (
        product &&
        !mixedProducts.some(
          (item) => item.id === product.id
        )
      ) {
        mixedProducts.push(product);
      }

      if (mixedProducts.length >= 8) {
        break;
      }
    }

    index++;
  }

  /*
   * لو بعض التصنيفات فاضية
   * نكمل من باقي المنتجات
   */
  if (mixedProducts.length < 8) {
    for (const product of sortedProducts) {
      if (
        !mixedProducts.some(
          (item) => item.id === product.id
        )
      ) {
        mixedProducts.push(product);
      }

      if (mixedProducts.length >= 8) {
        break;
      }
    }
  }

  /*
   * لو مافي منتجات
   */
  if (mixedProducts.length === 0) {
    return null;
  }

  return (
    <section
      dir="rtl"
      className="mx-auto max-w-[1400px] px-4 py-14 md:px-8 md:py-20"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
            

          <h2 className="mt-2 font-serif text-3xl md:text-4xl">
            الأكثر مبيعًا
          </h2>

          <p className="mt-2 max-w-md text-xs leading-6 text-black/45 md:text-sm md:leading-7">
            اختيارات حازت على حب عميلاتنا وعملائنا
          </p>
        </div>

        {/* Desktop */}
        <Link
          href="/products"
          className="hidden shrink-0 items-center gap-2 border-b border-black/30 pb-2 text-xs transition hover:border-black md:flex"
        >
          اكتشفي الكل
          <ArrowLeft size={14} />
        </Link>
      </div>

      {/* =====================================================
          MOBILE CAROUSEL
      ===================================================== */}

      <div className="relative md:hidden">

        <div
          className="
            -mx-4
            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto
            px-4
            pb-3
            scrollbar-hide
          "
        >
          {mixedProducts.map((product) => (
            <div
              key={product.id}
              className="
                w-[calc(50vw-22px)]
                min-w-[calc(50vw-22px)]
                shrink-0
                snap-start
              "
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* =================================================
            INDICATOR + ALL PRODUCTS
        ================================================= */}

        <div className="mt-5 flex items-center justify-between">

          {/* Indicator */}
          <div className="flex items-center gap-1.5">
            {mixedProducts.slice(0, 5).map((_, index) => (
              <span
                key={index}
                className={`
                  block h-1.5 rounded-full transition-all
                  ${
                    index === 0
                      ? "w-5 bg-[#171717]"
                      : "w-1.5 bg-black/20"
                  }
                `}
              />
            ))}
          </div>

          {/* Products Button */}
          <Link
            href="/products"
            className="
              flex
              items-center
              gap-2
              text-xs
              text-[#171717]
            "
          >
            <span>كل المنتجات</span>

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-black/15
              "
            >
              <ChevronLeft size={15} />
            </span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          DESKTOP GRID
      ===================================================== */}

      <div className="hidden md:grid md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {mixedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* =====================================================
          DESKTOP ALL PRODUCTS
      ===================================================== */}

      <div className="mt-10 hidden justify-center md:flex">
        <Link
          href="/products"
          className="
            inline-flex
            items-center
            gap-2
            border-b
            border-black/30
            pb-2
            text-xs
            transition
            hover:border-black
          "
        >
          اكتشفي جميع المنتجات
          <ArrowLeft size={14} />
        </Link>
      </div>
    </section>
  );
}