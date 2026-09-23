
"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Header, { Footer } from "@/components/layout/Header";
import { useCart } from "@/components/cart/CartProvider";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartTotal,
  } = useCart();

  return (
    <>
      <Header />

      <main
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] text-[#171717]"
      >
        <section className="mx-auto max-w-[1400px] px-5 py-10 md:px-8 md:py-16">
          {/* Header */}
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
                  YOUR BAG
                </p>

                <h1 className="font-serif text-4xl md:text-5xl">
                  سلة التسوق
                </h1>

                <p className="mt-3 text-sm text-black/50">
                  {items.length === 0
                    ? "السلة فارغة حالياً"
                    : `${items.length} منتجات في السلة`}
                </p>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-black/45 underline underline-offset-4 transition hover:text-red-600"
                >
                  إفراغ السلة
                </button>
              )}
            </div>
          </div>

          {/* Empty */}
          {items.length === 0 ? (
            <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <ShoppingBag
                  size={30}
                  strokeWidth={1.2}
                  className="text-black/60"
                />
              </div>

              <h2 className="font-serif text-3xl">
                سلتك فارغة
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-7 text-black/50">
                يبدو أنك لم تضف أي منتج إلى السلة بعد.
                اكتشف مجموعتنا واختر ما يناسبك.
              </p>

              <Link
                href="/products"
                className="mt-7 bg-[#b89b72] px-8 py-4 text-xs text-[#f0ede8] transition"
              >
                اكتشف المنتجات
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
              {/* Products */}
              <div className="space-y-5">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex gap-4 border-b border-black/10 pb-5 md:gap-6"
                  >
                    {/* Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="block h-[150px] w-[120px] shrink-0 overflow-hidden bg-[#e3dfda] md:h-[190px] md:w-[155px]"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={`/products/${item.slug}`}
                              className="text-sm transition hover:opacity-60 md:text-base"
                            >
                              {item.name}
                            </Link>

                            <p className="mt-2 text-xs text-black/45">
                              {item.category === "women-perfume"
                                ? "عطور نسائية"
                                : item.category === "men-perfume"
                                  ? "عطور رجالية"
                                  : item.category === "skincare"
                                    ? "العناية بالبشرة"
                                    : "مجموعة فاخرة"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`حذف ${item.name}`}
                            className="text-black/35 transition hover:text-red-600"
                          >
                            <Trash2 size={17} strokeWidth={1.4} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        {/* Quantity */}
                        <div className="flex h-9 items-center border border-black/15 bg-white">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            className="flex h-full w-9 items-center justify-center transition hover:bg-black/5"
                            aria-label="تقليل الكمية"
                          >
                            <Minus size={13} strokeWidth={1.5} />
                          </button>

                          <span className="flex w-8 justify-center text-xs">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            className="flex h-full w-9 items-center justify-center transition hover:bg-black/5"
                            aria-label="زيادة الكمية"
                          >
                            <Plus size={13} strokeWidth={1.5} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-left">
                          <p className="text-sm font-medium">
                            {item.price * item.quantity} ج.م
                          </p>

                          {item.quantity > 1 && (
                            <p className="mt-1 text-[10px] text-black/40">
                              {item.price} ج.م × {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Summary */}
              <aside className="h-fit bg-white p-6 md:p-7 lg:sticky lg:top-28">
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
                  ORDER SUMMARY
                </p>

                <h2 className="mt-3 font-serif text-2xl">
                  ملخص الطلب
                </h2>

                <div className="mt-7 space-y-4 border-b border-black/10 pb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/50">
                      المنتجات
                    </span>

                    <span>
                      {cartTotal} ج.م
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black/50">
                      الشحن
                    </span>

                    <span className="text-xs text-black/45">
                      يحسب عند الدفع
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm">
                    الإجمالي
                  </span>

                  <span className="font-serif text-2xl">
                    {cartTotal} ج.م
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="mt-7 flex h-14 w-full items-center justify-center bg-[#f0ede8] text-xs text-white transition hover:bg-black/80"
                >
                  إتمام الطلب
                </Link>

                <p className="mt-4 text-center text-[10px] leading-5 text-black/40">
                  سيتم تأكيد تفاصيل الشحن والدفع في الخطوة التالية.
                </p>
              </aside>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
