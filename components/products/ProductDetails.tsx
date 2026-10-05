"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

import { ProductCard } from "@/components/products/ProductCard";

import type { Product } from "@/types/product";

type ProductDetailsProps = {
  product: Product;
  related: Product[];
};

export default function ProductDetails({
  product,
  related,
}: ProductDetailsProps) {
  const { addToCart } = useCart();

  const { toggleWishlist, isInWishlist } = useWishlist();

  const favorite = isInWishlist(product.id);

  /* =========================
     PRODUCT IMAGES
  ========================== */

  const images =
    product.images?.filter(Boolean) || [];

  const [activeImage, setActiveImage] = useState(0);

  const currentImage =
    images[activeImage] || "";

  /* =========================
     QUANTITY
  ========================== */

  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => {
    if (
      product.stock &&
      quantity >= product.stock
    ) {
      return;
    }

    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      prev > 1 ? prev - 1 : 1
    );
  };

  /* =========================
     ADD TO CART
  ========================== */

  const handleAddToCart = () => {
    if (!product.isAvailable) return;

    /*
      نحافظ على نفس نظام CartProvider الحالي.
      لو الـ provider عندك لا يدعم quantity،
      نضيف المنتج أكثر من مرة حسب الكمية.
    */

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  /* =========================
     IMAGE NAVIGATION
  ========================== */

  const nextImage = () => {
    if (images.length <= 1) return;

    setActiveImage((prev) =>
      prev === images.length - 1
        ? 0
        : prev + 1
    );
  };

  const previousImage = () => {
    if (images.length <= 1) return;

    setActiveImage((prev) =>
      prev === 0
        ? images.length - 1
        : prev - 1
    );
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f0ede8] text-[#171717]"
    >

      {/* =====================================================
          PRODUCT AREA
      ====================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-10 lg:px-10 lg:py-14">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-[11px] text-black/45 md:mb-8">
          <Link
            href="/"
            className="transition hover:text-black"
          >
            الرئيسية
          </Link>

          <span>/</span>

          <Link
            href="/products"
            className="transition hover:text-black"
          >
            المنتجات
          </Link>

          <span>/</span>

          <span className="max-w-[180px] truncate text-black/70">
            {product.name}
          </span>
        </div>

        {/* =====================================================
            MAIN PRODUCT GRID
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 xl:gap-20">

          {/* =================================================
              PRODUCT IMAGES
          ================================================== */}

          <div className="min-w-0">

            <div className="flex gap-3 md:gap-4">

              {/* Thumbnails - Desktop */}
              {images.length > 1 && (
                <div className="hidden w-[82px] shrink-0 flex-col gap-3 md:flex">
                  {images.map(
                    (image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setActiveImage(index)
                        }
                        className={`relative aspect-[4/5] w-full overflow-hidden bg-[#e5e1dc] transition ${
                          activeImage === index
                            ? "ring-1 ring-[#171717]"
                            : "opacity-65 hover:opacity-100"
                        }`}
                        aria-label={`الصورة ${
                          index + 1
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Main Image */}
              <div className="relative min-w-0 flex-1">

<div className="relative aspect-[1/1] w-full max-w-[380px] mx-auto overflow-hidden bg-[#e3dfda] sm:aspect-[4/5] sm:max-w-none lg:aspect-[4/5]">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-black/35">
                      لا توجد صورة
                    </div>
                  )}

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={previousImage}
                        aria-label="الصورة السابقة"
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white md:right-5"
                      >
                        <ChevronRight
                          size={17}
                          strokeWidth={1.5}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={nextImage}
                        aria-label="الصورة التالية"
                        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white md:left-5"
                      >
                        <ChevronLeft
                          size={17}
                          strokeWidth={1.5}
                        />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
                      {activeImage + 1} /{" "}
                      {images.length}
                    </div>
                  )}
                </div>

                {/* Mobile Thumbnails */}
                {images.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide md:hidden">
                    {images.map(
                      (image, index) => (
                        <button
                          key={`${image}-mobile-${index}`}
                          type="button"
                          onClick={() =>
                            setActiveImage(index)
                          }
                          className={`relative h-[76px] w-[60px] shrink-0 overflow-hidden bg-[#e5e1dc] ${
                            activeImage === index
                              ? "ring-1 ring-[#171717]"
                              : "opacity-65"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================== */}

          <div className="flex min-w-0 flex-col lg:justify-center">

            {/* Category */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
                {product.category}
              </p>

              {product.isNew && (
                <span className="text-[10px] tracking-[0.12em] text-black/50">
                  NEW
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="mt-3 max-w-[650px] font-serif text-[32px] leading-[1.15] sm:text-[38px] md:text-[46px] lg:text-[52px]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-5 flex items-center gap-3">
              <p className="text-[18px] font-medium md:text-[20px]">
                {product.price.toLocaleString(
                  "ar-EG"
                )}{" "}
                ج.م
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-black/10" />

            {/* Description */}
            <div>
              <h2 className="mb-2 text-sm font-medium">
                التفاصيل
              </h2>

              <p className="max-w-[620px] text-[13px] leading-7 text-black/60 md:text-sm md:leading-8">
                {product.description ||
                  "تركيبة عطرية مميزة بتفاصيل راقية تناسب ذوقك وتمنحك تجربة عطرية استثنائية كل يوم."}
              </p>
            </div>

            {/* Availability */}
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  product.isAvailable
                    ? "bg-green-600"
                    : "bg-red-500"
                }`}
              />

              <span
                className={
                  product.isAvailable
                    ? "text-black/65"
                    : "text-red-600"
                }
              >
                {product.isAvailable
                  ? product.stock > 0
                    ? `متوفر — ${product.stock} قطعة`
                    : "متوفر"
                  : "غير متوفر حاليًا"}
              </span>
            </div>

            {/* Quantity */}
            {product.isAvailable && (
              <div className="mt-7">

                <p className="mb-3 text-xs text-black/55">
                  الكمية
                </p>

                <div className="flex h-12 w-[128px] items-center border border-black/20 bg-white/40">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="flex h-full w-10 items-center justify-center text-lg transition hover:bg-white"
                    aria-label="تقليل الكمية"
                  >
                    −
                  </button>

                  <span className="flex flex-1 items-center justify-center text-sm">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      !!product.stock &&
                      quantity >= product.stock
                    }
                    className="flex h-full w-10 items-center justify-center text-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>

                </div>
              </div>
            )}

            {/* Purchase Actions */}
            <div className="mt-6 flex gap-3">

              <button
                type="button"
                disabled={!product.isAvailable}
                onClick={handleAddToCart}
                className="flex h-14 flex-1 items-center justify-center gap-2 bg-[#171717] px-5 text-sm text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="flex h-14 w-14 shrink-0 items-center justify-center border border-black/40 bg-transparent transition hover:bg-white"
              >
                <Heart
                  size={20}
                  strokeWidth={1.5}
                  fill={
                    favorite
                      ? "#171717"
                      : "none"
                  }
                />
              </button>

            </div>

            {/* Service Information */}
            <div className="mt-8 border-y border-black/10">

              <div className="flex items-center gap-4 border-b border-black/10 py-4">
                <Truck
                  size={19}
                  strokeWidth={1.3}
                />

                <div>
                  <p className="text-xs font-medium">
                    شحن سريع
                  </p>

                  <p className="mt-1 text-[11px] text-black/45">
                    يتم تجهيز طلبك بعناية للشحن.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-b border-black/10 py-4">
                <ShieldCheck
                  size={19}
                  strokeWidth={1.3}
                />

                <div>
                  <p className="text-xs font-medium">
                    منتجات أصلية
                  </p>

                  <p className="mt-1 text-[11px] text-black/45">
                    جودة مختارة بعناية.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4">
                <RotateCcw
                  size={19}
                  strokeWidth={1.3}
                />

                <div>
                  <p className="text-xs font-medium">
                    خدمة ما بعد البيع
                  </p>

                  <p className="mt-1 text-[11px] text-black/45">
                    تواصلي معنا لأي استفسار حول طلبك.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT INFORMATION
      ====================================================== */}

      <section className="border-t border-black/10 bg-[#eae6e1]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">

          <div className="grid gap-10 md:grid-cols-3 md:gap-14">

            <div>
              <p className="mb-3 text-[10px] tracking-[0.18em] text-black/40">
                PRODUCT
              </p>

              <h2 className="font-serif text-3xl md:text-4xl">
                تفاصيل المنتج
              </h2>
            </div>

            <div className="md:col-span-2">

              <p className="max-w-[720px] text-sm leading-8 text-black/60">
                {product.description ||
                  "منتج مختار بعناية ليمنحك تجربة مميزة تجمع بين الجودة والتفاصيل الراقية."}
              </p>

              <div className="mt-8 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">

                <div>
                  <p className="text-[11px] text-black/40">
                    القسم
                  </p>

                  <p className="mt-1 text-sm">
                    {product.category}
                  </p>
                </div>

                {product.size && (
                  <div>
                    <p className="text-[11px] text-black/40">
                      الحجم
                    </p>

                    <p className="mt-1 text-sm">
                      {product.size}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[11px] text-black/40">
                    التوفر
                  </p>

                  <p className="mt-1 text-sm">
                    {product.isAvailable
                      ? "متوفر"
                      : "غير متوفر"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-black/40">
                    الحالة
                  </p>

                  <p className="mt-1 text-sm">
                    {product.isNew
                      ? "منتج جديد"
                      : product.isBestSeller
                        ? "الأكثر مبيعًا"
                        : "منتج مختار"}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ====================================================== */}

      {related.length > 0 && (
        <section className="bg-[#f0ede8]">
          <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">

            <div className="mb-7 flex items-end justify-between">

              <div>
                <p className="mb-2 text-[10px] tracking-[0.18em] text-black/40">
                  YOU MAY ALSO LIKE
                </p>

                <h2 className="font-serif text-3xl md:text-4xl">
                  قد يعجبكِ أيضًا
                </h2>
              </div>

              <Link
                href="/products"
                className="text-xs underline underline-offset-4 transition hover:opacity-50"
              >
                عرض الكل
              </Link>

            </div>

            <div
              dir="rtl"
              className="flex snap-x snap-mandatory gap-10 overflow-x-auto overscroll-x-contain scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible"
            >

              {related.map((item) => (
                <div
                  key={item.id}
                  className="w-[150px] shrink-0 snap-start sm:w-[180px] md:w-auto"
                >
                  <ProductCard product={item} />
                </div>
              ))}

            </div>

          </div>
        </section>
      )}

    </main>
  );
}
