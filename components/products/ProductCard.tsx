"use client";

import Link from "next/link";
import {
  ArrowUpLeft,
  Heart,
  ShoppingBag,
} from "lucide-react";
import type { MouseEvent } from "react";

import { Product } from "@/types/product";
import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

function getProductType(product: Product) {
  const category = String(product.category || "").toLowerCase();

  if (
    category.includes("women") ||
    category.includes("حريمي") ||
    category.includes("women")
  ) {
    return "women";
  }

  if (
    category.includes("men") ||
    category.includes("رجالي")
  ) {
    return "men";
  }

  if (
    category.includes("50") ||
    category.includes("50ml") ||
    category.includes("50 ml")
  ) {
    return "50 ml";
  }

  if (
    category.includes("skin") ||
    category.includes("عناية")
  ) {
    return " skin";
  }

  if (
    category.includes("master") ||
    category.includes("ماستر")
  ) {
    if (
      category.includes("women") ||
      category.includes("حريمي") ||
      category.includes("نسائي")
    ) {
      return "ماستر بوكس نسائي";
    }

    return "ماستر بوكس رجالي";
  }

  return product.category || "منتج";
}

export function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const article = e.currentTarget.closest("article");

    const image = article?.querySelector(
      "[data-product-image]"
    ) as HTMLImageElement | null;

    addToCart(product);

    if (!image) return;

    /*
     * نحدد السلة الظاهرة:
     * على الموبايل نستخدم Bottom Navbar
     * وعلى الديسكتوب نستخدم سلة الـHeader
     */
    const cartTargets = Array.from(
      document.querySelectorAll(
        "[data-cart-target]"
      )
    ) as HTMLElement[];

    const visibleCart = cartTargets.find(
      (element) => {
        const rect = element.getBoundingClientRect();

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          getComputedStyle(element).visibility !==
            "hidden"
        );
      }
    );

    if (!visibleCart) return;

    const imageRect =
      image.getBoundingClientRect();

    const cartRect =
      visibleCart.getBoundingClientRect();

    /*
     * نقطة البداية
     */
    const startX =
      imageRect.left +
      imageRect.width / 2;

    const startY =
      imageRect.top +
      imageRect.height / 2;

    /*
     * نقطة النهاية
     */
    const endX =
      cartRect.left +
      cartRect.width / 2;

    const endY =
      cartRect.top +
      cartRect.height / 2;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    /*
     * معرفة هل الجهاز موبايل
     */
    const isMobile =
      window.innerWidth < 640;

    /*
     * نسخة من نفس صورة المنتج
     */
    const flyingImage = image.cloneNode(
      true
    ) as HTMLImageElement;

    /*
     * نحذف الـattribute من النسخة
     */
    flyingImage.removeAttribute(
      "data-product-image"
    );

    /*
     * حجم صورة الحركة
     */
    const flyingSize = Math.min(
      imageRect.width * 1.4,
      isMobile ? 115 : 105
    );

    Object.assign(
      flyingImage.style,
      {
        position: "fixed",
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${flyingSize}px`,
        height: `${flyingSize}px`,
        objectFit: "contain",
        pointerEvents: "none",
        zIndex: "99999",
        transform:
          "translate(-50%, -50%) scale(1)",
        transformOrigin: "center",
        borderRadius: "12px",
        filter:
          "drop-shadow(0 22px 22px rgba(0,0,0,0.18))",
        willChange:
          "transform, opacity",
      }
    );

    document.body.appendChild(
      flyingImage
    );

    /*
     * حركة المنتج
     *
     * الموبايل: 1800ms
     * الكمبيوتر: 1100ms
     */
    const animation =
      flyingImage.animate(
        [
          {
            transform:
              "translate(-50%, -50%) translate(0px, 0px) scale(1) rotate(0deg)",
            opacity: 1,
            offset: 0,
          },

          {
            transform:
              `translate(-50%, -50%) translate(${deltaX * 0.18}px, ${deltaY * 0.05 - 90}px) scale(0.95) rotate(-5deg)`,
            opacity: 1,
            offset: 0.22,
          },

          {
            transform:
              `translate(-50%, -50%) translate(${deltaX * 0.42}px, ${deltaY * 0.18 - 70}px) scale(0.78) rotate(-9deg)`,
            opacity: 0.98,
            offset: 0.45,
          },

          {
            transform:
              `translate(-50%, -50%) translate(${deltaX * 0.72}px, ${deltaY * 0.58}px) scale(0.5) rotate(5deg)`,
            opacity: 0.9,
            offset: 0.72,
          },

          {
            transform:
              `translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px) scale(0.08) rotate(12deg)`,
            opacity: 0,
            offset: 1,
          },
        ],
        {
          duration: isMobile ? 2200 : 1100,
          easing:
            "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        }
      );

    animation.finished
      .then(() => {
        flyingImage.remove();

        /*
         * Bounce للسلة بعد وصول المنتج
         */
        visibleCart.animate(
          [
            {
              transform:
                "scale(1)",
            },
            {
              transform:
                "scale(1.14)",
            },
            {
              transform:
                "scale(0.94)",
            },
            {
              transform:
                "scale(1.06)",
            },
            {
              transform:
                "scale(1)",
            },
          ],
          {
            duration: 480,
            easing: "ease-out",
          }
        );
      })
      .catch(() => {
        flyingImage.remove();
      });
  };

  const handleWishlist = (
    e: MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist(product);
  };

  return (
    <article className="min-w-[180px] flex-1 sm:min-w-[200px]">
      <Link
        href={`/products/${product.slug}`}
        className="
          group
          block
          overflow-hidden
          bg-white
        "
      >
        {/* Image */}
        <div
          className="
            relative
            h-[220px]
            w-full
            overflow-hidden
            bg-[#fefefe]
            sm:h-[250px]
          "
        >
          <img
            data-product-image
            src={
              product.images?.[0] ||
              "/placeholder.png"
            }
            alt={product.name}
            className="
              mx-auto
              h-full
              w-full
              object-contain
              p-2
              transition-transform
              duration-500
              group-hover:scale-[1.04]
              sm:p-4
            "
          />

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlist}
            className="
              absolute
              right-1
              top-1
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-white
              text-[#171717]
              shadow-sm
              transition
              hover:bg-[#f0ede8]
              sm:right-3
              sm:top-3
              sm:h-9
              sm:w-9
            "
            aria-label={
              isFavorite
                ? `إزالة ${product.name} من المفضلة`
                : `إضافة ${product.name} للمفضلة`
            }
          >
            <Heart
              size={15}
              strokeWidth={1.6}
              fill={
                isFavorite
                  ? "#fe0e0e"
                  : "none"
              }
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-1 pb-1 pt-1 sm:px-3 sm:pb-4 sm:pt-4">
          {/* Type + Name */}
          <div className="flex items-center justify-between gap-3">
            <span className="shrink-0 text-[10px] text-black/45 sm:text-xs">
              {getProductType(product)}
            </span>

            <h3
              className="
                min-w-0
                truncate
                text-right
                text-xs
                font-medium
                text-[#171717]
                sm:text-sm
              "
            >
              {product.name}
            </h3>
          </div>

          {/* Size */}
          {product.size && (
            <p className="mt-1 text-[10px] text-black/40 sm:text-xs">
              {product.size}
            </p>
          )}

          {/* Price + Cart */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="whitespace-nowrap text-sm font-medium text-[#171717] sm:text-base">
                {Number(
                  product.price
                ).toLocaleString(
                  "ar-EG"
                )}{" "}
                ج.م
              </span>

              {product.compareAtPrice && (
                <span className="whitespace-nowrap text-[10px] text-black/30 line-through sm:text-xs">
                  {Number(
                    product.compareAtPrice
                  ).toLocaleString(
                    "ar-EG"
                  )}{" "}
                  ج.م
                </span>
              )}
            </div>

            {/* Cart */}
            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                product.isAvailable ===
                false
              }
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-[5px]
                bg-[#171717]
                text-white
                transition
                hover:bg-[#b89b72]
                disabled:cursor-not-allowed
                disabled:opacity-40
                sm:h-10
                sm:w-10
              "
              aria-label={`إضافة ${product.name} للسلة`}
            >
              <ShoppingBag
                size={15}
                strokeWidth={1.7}
              />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}

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
      className="
        mx-auto
        max-w-[1400px]
        px-5
        py-12
        md:px-8
        md:py-20
      "
    >
      {/* Section Header */}
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
          className="
            flex
            items-center
            gap-2
            border-b
            border-black
            pb-1
            text-xs
          "
        >
          عرض الكل
          <ArrowUpLeft size={13} />
        </Link>
      </div>

      {/* Products */}
      <div
        className="
          flex
          gap-3
          overflow-x-auto
          pb-3
          scrollbar-hide
          sm:gap-4
          md:grid
          md:grid-cols-4
          md:overflow-visible
          md:pb-0
        "
      >
        {products.map(
          (product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          )
        )}
      </div>
    </section>
  );
}
