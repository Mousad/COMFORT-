import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Category, Product } from "@/types/product";
import HomeProducts from "@/components/home/HomeProducts";
import { ProductSection } from "@/components/products/ProductCard";
import InstagramReviews from "@/components/home/InstagramReviews";

import {
  Truck,
  Sparkles,
  Tag,
  ShieldCheck,
  RotateCcw,
  Gift,
  Heart,
  Play,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

import Image from "next/image";

/* =========================================================
   INSTAGRAM ICON
========================================================= */

const InstagramIcon = ({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
};

/* =========================================================
   INSTAGRAM REVIEWS DATA
   - بيانات تجريبية مؤقتة
========================================================= */
 


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
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="absolute right-7 top-1/2 max-w-sm -translate-y-1/2 text-right text-[#f0ede8] md:right-16">

        <p className="mb-5 text-[10px] tracking-[0.32em]">
          CURATED WITH LOVE
        </p>

        <h1 className="font-serif text-5xl leading-[1.1] md:text-7xl">
  أناقةٌ <span className="text-[#b89b72]">تُحسّ</span>
  <br />
  وجمالٌ يُعبّر عنك
</h1>

<p className="mt-5 max-w-xs text-sm leading-7 text-white/80">
  عطور أصلية للنساء والرجال، ومنتجات مختارة بعناية للعناية ببشرتك.
  لأن التفاصيل الصغيرة هي التي تصنع حضورك،
  اخترنا لك منتجات تليق بذوقك وتكمل أسلوبك.
</p>


        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-3 bg-[#b89b72] px-6 py-3 text-sm text-[#171717] transition"
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


/* =========================================================
   CATEGORIES
========================================================= */

export function CategoriesSection({
  categories,
}: {
  categories: Category[];
}) {
  if (!categories.length) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:px-8 md:py-16">
      <div className="mb-6 text-center md:mb-9">
        <h2 className="font-serif text-2xl text-[#211f1b] md:text-4xl">
          تسوقي حسب المجموعة
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-5">
        {categories.map((category, index) => {
          const isFeatured = index === 0;

          return (
            <Link
              href={`/categories/${category.slug}`}
              key={category.id}
              className={`group block min-w-0 ${
                isFeatured
                  ? "col-span-3 md:col-span-2"
                  : "col-span-1"
              }`}
            >
              <div
                className={`relative w-full overflow-hidden rounded-lg bg-[#e5ded4] ${
                  isFeatured
                    ? "aspect-[2.5/1] md:aspect-[1.8/1]"
                    : "aspect-[0.82/1] md:aspect-[0.9/1]"
                }`}
              >
                <img
                  src={category.image || "/placeholder.jpg"}
                  alt={category.name}
                  loading={index < 2 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay behind category name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Category name inside image */}
                <div className="absolute inset-x-1 bottom-2 flex justify-center px-1.5 sm:bottom-3 sm:px-2">
                  <h3
                    className={`text-center font-serif font-medium leading-tight text-white drop-shadow-md ${
                      isFeatured
                        ? "text-sm sm:text-base md:text-xl"
                        : "text-[10px] sm:text-xs md:text-sm"
                    }`}
                  >
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          );
        })}
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
      <HomeProducts
        products={products}
        categories={categories}
      />

      <StoreBenefits />
    </>
  );
}


function StoreBenefits() {
const benefits = [
{
title: "شحن سريع",
description: "يتم تجهيز طلبك بعناية للشحن.",
Icon: Truck,
},
{
title: "منتجات أصلية",
description: "جودة مختارة بعناية.",
Icon: ShieldCheck,
},
{
title: "خدمة ما بعد البيع",
description: "تواصلي معنا لأي استفسار حول طلبك.",
Icon: RotateCcw,
},
];

return ( <section
   dir="rtl"
   className="mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6 lg:px-10"
 > <div className="grid grid-cols-3 border-y border-black/10">
{benefits.map(({ title, description, Icon }, index) => (
<div
key={title}
className={`flex flex-col items-center px-2 py-5 text-center sm:flex-row sm:items-start sm:gap-3 sm:px-4 sm:text-right ${
              index !== 0 ? "border-r border-black/10" : ""
            }`}
> <Icon
           size={19}
           strokeWidth={1.3}
           className="shrink-0"
         />


        <div className="mt-2 sm:mt-0">
          <p className="text-xs font-medium">{title}</p>
          <p className="mt-1 text-[10px] leading-5 text-black/45 sm:text-[11px]">
            {description}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>


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

/* =========================================================
   INSTAGRAM REVIEWS
========================================================= */







export function ContactSection() {
  return (
    <section className="w-full bg-[#f0ede8] px-5 py-14 md:px-10 md:py-20">
  <div className="mx-auto max-w-6xl">

    {/* Title */}
    <div className="mb-8 text-center">
      <p className="mb-2 text-[10px] tracking-[0.3em] text-black/40">
        CONNECT WITH US
      </p>

      <h2 className="text-2xl font-light tracking-tight md:text-3xl">
        تواصل معنا
      </h2>
    </div>

    {/* Social Icons */}
    <div className="mb-8 flex items-center justify-center gap-3">

      {/* Instagram */}
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:bg-black hover:text-white"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="5"
          />

          <circle
            cx="12"
            cy="12"
            r="4"
          />

          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
          />
        </svg>
      </a>

      {/* Facebook */}
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:bg-black hover:text-white"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v3H6v4h3v8h4v-8h3l1-4h-4V9c0-.6.4-1 1-1z" />
        </svg>
      </a>

      {/* WhatsApp */}
      <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:bg-black hover:text-white"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />

          <path d="M8.5 8.5c.3-.5.6-.5.9-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.6.7c.7 1.3 1.7 2.2 3 2.8l.7-.7c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.6v.5c0 .3-.1.6-.5.9-.4.3-1 .4-1.6.2-2.2-.7-4.8-3.2-5.9-5.2-.3-.6-.2-1.2.1-1.8Z" />
        </svg>
      </a>

    </div>

    {/* Google Maps */}
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="aspect-[16/8] w-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d6913.558807694202!2d30.928350017334584!3d29.95702321852093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sar!2seg!4v1791157956957!5m2!1sar!2seg"
          className="h-full w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          title="Google Maps"
        />
      </div>
    </div>

  </div>
</section>
  );
}