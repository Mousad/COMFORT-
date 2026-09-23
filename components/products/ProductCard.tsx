"use client";

import Link from "next/link";
import { ShoppingBag, ArrowUpLeft } from "lucide-react";
import type { MouseEvent } from "react";

import { Product } from "@/types/product";
import { useCart } from "@/components/cart/CartProvider";

export function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();

  const handleAddToCart = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product);
  };

  return (
    <article className="min-w-[180px] flex-1 sm:min-w-[200px] ">
      <Link
        href={`/products/${product.slug}`}
        className="block"
      >
        {/* =====================================================
            PRODUCT IMAGE
        ===================================================== */}

        <div className="relative h-[170px] w-full overflow-hidden bg-[#fefefe] sm:h-[240px]">

          <img
            src={product.images[0]}
            alt={product.name}
            className="mx-auto h-full w-full object-contain p-3"
          />

          {/* =================================================
              ADD TO CART
          ================================================= */}

          <button
            type="button"
            onClick={handleAddToCart}
            className="
              absolute
              bottom-1
              left-1
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-[5px]
              bg-[#171717]
              text-white
              shadow-sm
              transition
              hover:bg-[#b89b72]
              sm:bottom-4
              sm:left-4
              sm:h-10
              sm:w-10
            "
            aria-label={`إضافة ${product.name} للسلة`}
          >
            <ShoppingBag
              size={13}
              strokeWidth={1.7}
            />
          </button>
        </div>

        {/* =====================================================
            PRODUCT INFO
        ===================================================== */}

        <div className="flex items-center justify-between gap-1 pt-2 sm:pt-4">

          {/* Product Name */}

          <h3 className="min-w-0 truncate text-xs font-medium text-[#171717] sm:text-sm">
            {product.name}
          </h3>

          {/* Price */}

          <div className="flex shrink-0 items-center gap-1">

            <span className="whitespace-nowrap text-xs font-medium text-[#171717] sm:text-sm">
              {product.price} ج.م
            </span>

            {product.compareAtPrice && (
              <span className="whitespace-nowrap text-[9px] text-black/35 line-through sm:text-xs">
                {product.compareAtPrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   PRODUCT SECTION
========================================================= */

export function ProductSection({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
}) {
  return (
    <section
      dir="rtl"
      className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-20"
    >
      <div className="mb-7 flex items-end justify-between">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-black/45">
            Curated for you
          </p>

          <h2 className="font-serif text-3xl md:text-4xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-black/55">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href="/products"
          className="flex items-center gap-2 border-b border-black pb-1 text-xs"
        >
          عرض الكل
          <ArrowUpLeft size={13} />
        </Link>
      </div>

      <div
        className="
          -mx-5
          flex
          gap-3
          overflow-x-auto
          px-5
          pb-2
          scrollbar-hide
          md:mx-0
          md:grid
          md:grid-cols-4
          md:gap-5
          md:overflow-visible
          md:px-0
        "
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}