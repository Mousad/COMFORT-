"use client";

import Link from "next/link";

import {
  Heart,
  ShoppingBag,
} from "lucide-react";

import {
  useCart,
} from "@/components/cart/CartProvider";

import {
  useWishlist,
} from "@/components/wishlist/WishlistProvider";

import {
  ProductCard,
} from "@/components/products/ProductCard";

import type {
  Product,
} from "@/types/product";

type ProductDetailsProps = {
  product: Product;
  related: Product[];
};

export default function ProductDetails({
  product,
  related,
}: ProductDetailsProps) {
  const {
    addToCart,
  } = useCart();

  const {
    toggleWishlist,
    isInWishlist,
  } = useWishlist();

  const favorite = isInWishlist(product.id);

  const image =
    product.images?.[0] || "";

  return (
    <main
      dir="rtl"
      className="mx-auto min-h-screen max-w-[1300px] overflow-x-hidden bg-[#f0ede8] px-4 py-10 text-[#171717] md:px-8 md:py-16"
    >
      <div className="grid gap-10 md:grid-cols-2">
        {/* PRODUCT IMAGE */}
        <div className="relative min-w-0 overflow-hidden">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#e3dfda]">
            {image ? (
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-black/35">
                لا توجد صورة
              </div>
            )}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="flex flex-col justify-center text-right md:pr-10">
          <p className="text-[10px] tracking-[0.25em] text-black/45">
            {product.category}
          </p>

          <h1 className="mt-2 font-serif text-4xl md:text-6xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <p className="text-lg font-medium">
              {product.price.toLocaleString("ar-EG")} ج.م
            </p>
          </div>

          <p className="mt-6 text-sm leading-8 text-black/60">
            {product.description ||
              "تركيبة عطرية مميزة بتفاصيل راقية تناسب ذوقك."}
          </p>

          <div className="mt-6 border-y border-black/15 py-5 text-sm leading-8">
            <p>
              الحالة:{" "}
              {product.isAvailable
                ? "متوفر"
                : "غير متوفر"}
            </p>

            <p>
              المتوفر: {product.stock}
            </p>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              disabled={!product.isAvailable}
              onClick={() => addToCart(product)}
              className="flex h-14 flex-1 items-center justify-center gap-2 bg-[#171717] text-sm text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag
                size={18}
                strokeWidth={1.5}
              />

              {product.isAvailable
                ? "أضيفي إلى السلة"
                : "غير متوفر"}
            </button>

            <button
              type="button"
              onClick={() =>
                toggleWishlist(product)
              }
              aria-label={
                favorite
                  ? "إزالة من المفضلة"
                  : "إضافة إلى المفضلة"
              }
              className="flex h-14 w-14 shrink-0 items-center justify-center border border-black/70 bg-transparent transition hover:bg-white"
            >
              <Heart
                size={19}
                strokeWidth={1.5}
                fill={
                  favorite
                    ? "#171717"
                    : "none"
                }
              />
            </button>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="mt-24">
          <div className="mb-7 flex items-end justify-between">
            <h2 className="font-serif text-3xl">
              قد يعجبكِ أيضًا
            </h2>

            <Link
              href="/products"
              className="text-xs underline underline-offset-4"
            >
              عرض الكل
            </Link>
          </div>

          <div
            dir="rtl"
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scrollbar-hide"
          >
            {related.map((item) => (
              <div
                key={item.id}
                className="w-[140px] shrink-0 snap-start sm:w-[160px] md:w-[190px]"
              >
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}