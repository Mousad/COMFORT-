import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Category, Product } from "@/types/product";
import HomeProducts from "@/components/home/HomeProducts";
import { ProductSection } from "@/components/products/ProductCard";

import {
  Truck,
  Sparkles,
  Tag,
  ShieldCheck,
  Gift,
  Heart,
} from "lucide-react";

/* =========================================================
   HERO
========================================================= */

export function Hero() {
  return (
  <section className="relative mx-0 h-[66vh] min-h-[500px] overflow-hidden md:mx-5 md:h-[72vh]">

  {/* Hero Video */}
  <video
    className="absolute inset-0 h-full w-full object-cover object-center"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
  >
    <source src="/vdio.mp4" type="video/mp4" />
  </video>

  {/* Video Overlay */}
<div className="absolute inset-0 bg-black/45" />  {/* Content */}
  <div className="absolute right-7 top-1/2 max-w-sm -translate-y-1/2 text-right text-[#f0ede8] md:right-16">

 <p className="mb-5 text-[10px] tracking-[0.32em]">
  CURATED WITH LOVE
</p>

<h1 className="font-serif text-5xl leading-[1.1] md:text-7xl">
  شغفٌ <span className="text-[#b89b72]">بالجمال</span>
  <br />
  وعشقٌ للعطور
</h1>

<p className="mt-5 max-w-xs text-sm leading-7 text-white/80">
  من خبرة الصيدلة إلى شغف العناية بالبشرة،
  ومن عشق العطور الأصلية إلى اختيار كل منتج بعناية…
  كل شيء هنا صُمم ليليق بكِ.
</p>

    <Link
      href="/products"
      className="mt-8 inline-flex items-center gap-3 bg-[#b89b72] px-6 py-3 text-sm text-[#171717] transition "
    >
      اكتشفي 
      <ArrowLeft size={16} />
    </Link>

  </div>
</section>
  );
}

/* =========================================================
   ANNOUNCEMENT BAR
========================================================= */

export function AnnouncementBar() {
  return (
  <div className="overflow-hidden bg-[#b89b72] py-2 text-center text-[10px] tracking-[0.16em] text-[#171717]">
  <div className="animate-marquee flex w-max items-center whitespace-nowrap">

    {/* المجموعة الأولى */}
    <div className="flex items-center">

      <span className="mx-8 flex items-center gap-2">
        <Truck
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        توصيل سريع حتى بابك
      </span>

      <span className="mx-8 flex items-center gap-2">
        <Sparkles
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        عطور أصلية مختارة بعناية
      </span>

      <span className="mx-8 flex items-center gap-2">
        <Tag
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        عروض حصرية لفترة محدودة
      </span>

      <span className="mx-8 flex items-center gap-2">
        <ShieldCheck
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        جودة تستحق ثقتك
      </span>

      <span className="mx-8 flex items-center gap-2">
        <Gift
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        اختيارات مميزة لكل مناسبة
      </span>

      <span className="mx-8 flex items-center gap-2">
        <Heart
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        لأنك تستحقين الأفضل
      </span>

    </div>

    {/* المجموعة الثانية — للتكرار والحركة المستمرة */}
    <div className="flex items-center">

      <span className="mx-8 flex items-center gap-2">
        <Truck
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        توصيل سريع حتى بابك
      </span>

      <span className="mx-8 flex items-center gap-2">
        <Sparkles
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        عطور أصلية مختارة بعناية
      </span>

      <span className="mx-8 flex items-center gap-2">
        <Tag
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        عروض حصرية لفترة محدودة
      </span>

      <span className="mx-8 flex items-center gap-2">
        <ShieldCheck
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        جودة تستحق ثقتك
      </span>

      <span className="mx-8 flex items-center gap-2">
        <Gift
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        اختيارات مميزة لكل مناسبة
      </span>

      <span className="mx-8 flex items-center gap-2">
        <Heart
          size={13}
          strokeWidth={1.5}
          className="text-[#fefefe]"
        />
        لأنك تستحقين الأفضل
      </span>

    </div>

  </div>
</div>
  );
}

/* =========================================================
   CATEGORIES
========================================================= */

export function CategoriesSection({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-10 md:px-8 md:py-24">
      <div className="mb-4 text-center">
        <h2 className="font-serif text-3xl md:text-4xl">
          تسوقي حسب المجموعة
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-8">
        {categories.map((category) => (
          <Link
            href={`/categories/${category.slug}`}
            key={category.id}
            className="group text-center"
          >
            <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-[10px] bg-[#dfd9d2]">
              <img
                src={category.image || "/placeholder.jpg"}
                alt={category.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/20 transition duration-500 group-hover:bg-black/30" />

              <div className="absolute inset-0 flex items-center justify-center px-4">
                <p className="font-serif text-lg text-white md:text-xl">
                  {category.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   HOME PRODUCTS
========================================================= */

export function HomeProductSections({
  best,
  products,
  categories,
}: {
  best: Product[];
  products: Product[];
  categories: Category[];
}) {
  return (
    <>
      {/* =====================================================
          المنتجات + الفلتر + الترقيم
      ===================================================== */}

      <HomeProducts
        products={products}
        categories={categories}
      />
    </>
  );
}

/* =========================================================
   EDITORIAL BANNER
========================================================= */

export function EditorialBanner() {
  return (
    <section className="relative mx-3 my-8 min-h-[430px] overflow-hidden md:mx-5">
      <img
        src="https://i.pinimg.com/736x/90/92/05/9092054712e254d5d17d12e63569feeb.jpg"
        alt="منتجات العناية بالبشرة"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/25" />

      <div
        dir="rtl"
        className="relative z-10 flex min-h-[430px] items-center justify-center px-6 py-12 text-center text-white md:justify-start md:px-16 md:text-right"
      >
        <div>
          <p className="text-[10px] tracking-[0.3em] text-white/70">
            RITUALS OF CARE
          </p>

          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            جمالكِ
            <br />
            يستحق العناية
          </h2>

          <p className="mt-5 max-w-sm text-sm leading-7 text-white/80">
            اكتشفي مجموعة العناية بالبشرة المصممة لتضيف لمسة من الهدوء
            والانتعاش إلى روتينكِ اليومي.
          </p>

          <Link
            href="/categories/skin-care"
            className="mt-8 inline-flex items-center border-b border-white pb-2 text-sm text-white"
          >
            اكتشفي المجموعة
            <ArrowLeft className="mr-2" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   BRAND STORY
========================================================= */

export function BrandStory() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
      <p className="text-[10px] tracking-[0.3em] text-black/45">
        OUR PHILOSOPHY
      </p>

      <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
        الجمال في التفاصيل
      </h2>

      <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-black/60">
        نؤمن أن العطر أكثر من مجرد رائحة؛ إنه إحساس، وذكرى، وطريقة للتعبير عن
        نفسكِ. لذلك نختار كل منتج بعناية ليكون جزءاً من قصتكِ اليومية.
      </p>

      <Link
        href="/about"
        className="mt-8 inline-flex items-center border-b border-black pb-2 text-sm"
      >
        تعرفي علينا أكثر
        <ArrowLeft className="mr-2" size={15} />
      </Link>
    </section>
  );
}