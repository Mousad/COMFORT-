
"use client";

import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Trash2,
  ShoppingBag,
} from "lucide-react";

import Header, { Footer } from "@/components/layout/Header";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { useCart } from "@/components/cart/CartProvider";

export default function WishlistPage() {
  const {
    items,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  return (
    <>
      <Header />

      <main
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] text-[#171717]"
      >
        <section className="mx-auto max-w-[1400px] px-5 py-10 md:px-8 md:py-16">

          {/* Page Header */}
          <div className="mb-10 border-b border-black/10 pb-7">
            <Link
              href="/products"
              className="mb-5 inline-flex items-center gap-2 text-xs text-black/50 transition hover:text-black"
            >
              <ArrowRight size={15} />
              متابعة التسوق
            </Link>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-black/40">
                  YOUR WISHLIST
                </p>

                <h1 className="font-serif text-4xl md:text-5xl">
                  المفضلة
                </h1>

                <p className="mt-3 text-sm text-black/50">
                  {items.length === 0
                    ? "لا توجد منتجات في المفضلة"
                    : `${items.length} منتجات محفوظة`}
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="text-xs text-black/45 underline underline-offset-4 transition hover:text-red-600"
                >
                  حذف الكل
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {items.length === 0 ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <Heart
                  size={30}
                  strokeWidth={1.2}
                  className="text-black/60"
                />
              </div>

              <h2 className="font-serif text-3xl">
                المفضلة فارغة
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-7 text-black/50">
                احفظ المنتجات التي تعجبك هنا لتجدها
                بسهولة في أي وقت.
              </p>

              <Link
                href="/products"
                className="mt-7 bg-[#feffff] px-8 py-4 text-xs text-white "
              >
                اكتشف المنتجات
              </Link>
            </div>
          ) : (
            /* Products */
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {items.map((product) => (
                <article
                  key={product.id}
                  className="group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#e3dfda]">
                    <Link
                      href={`/products/${product.slug}`}
                      className="block h-full"
                    >
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </Link>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() =>
                        removeFromWishlist(product.id)
                      }
                      aria-label={`حذف ${product.name} من المفضلة`}
                      className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center bg-[#f0ede8]/90 transition hover:bg-white hover:text-red-600"
                    >
                      <Trash2
                        size={15}
                        strokeWidth={1.4}
                      />
                    </button>

                    {/* Add To Cart */}
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="absolute bottom-3 left-3 right-3 flex h-11 items-center justify-center gap-2 bg-[#171717] text-xs text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <ShoppingBag
                        size={15}
                        strokeWidth={1.5}
                      />
                      إضافة للسلة
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="pt-4">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm transition hover:opacity-60"
                    >
                      {product.name}
                    </Link>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {product.price} ج.م
                      </span>

                      {product.compareAtPrice && (
                        <span className="text-xs text-black/40 line-through">
                          {product.compareAtPrice} ج.م
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
