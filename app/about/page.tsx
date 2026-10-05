import Link from "next/link";
import {
  ArrowUpLeft,
  Sparkles,
  Heart,
  ShieldCheck,
  Gem,
  PackageCheck,
  Search,
  Star,
} from "lucide-react";

import Header, { Footer } from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main dir="rtl" className="min-h-screen bg-[#e6e1da]">
        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative min-h-[330px] overflow-hidden border-b border-black/10">
          {/* Background Image */}
          <img
            src="https://i.pinimg.com/1200x/50/0b/a2/500ba23c5678a03a964485ae1f862f51.jpg"
            alt="Comfort Keepers"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/35" />

          {/* Content */}
          <div className="relative z-10 flex min-h-[380px] items-center justify-center px-6 text-center">
            <div className="max-w-xl text-white">
              <h1 className="font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
                من نحن؟
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/80">
                في Comfort Keepers نؤمن أن العطر ليس مجرد رائحة، بل جزء من
                شخصيتك وتفاصيلك اليومية. نختار لك منتجات أصلية بعناية، ونحرص
                على أن تكون كل تجربة معنا بسيطة، موثوقة ومميزة.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex items-center gap-3 bg-[#c0a682] px-7 py-3.5 text-xs text-[#000000] transition "
              >
                اكتشف 
                <ArrowUpLeft size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================
            INTRO / BRAND STATEMENT
        ====================================================== */}
        <section className="border-b border-black/10">
          <div className="mx-auto max-w-[1200px] px-6 py-20 text-center md:px-8 md:py-28">
            <p className="text-[10px] tracking-[0.35em] text-black/40">
              OUR PURPOSE
            </p>

            <h2 className="mx-auto mt-5 max-w-4xl font-serif text-3xl leading-[1.4] md:text-5xl">
              نختار التفاصيل التي تجعل
              <br className="hidden md:block" />
              <span className="text-[#c0a682]">
                كل رائحة تحمل معنى.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-black/55">
              لسنا هنا لنقدم لك مئات الخيارات فقط. نحن هنا لنساعدك
              على الوصول إلى الاختيار الذي يناسب ذوقك، شخصيتك،
              ومناسبتك. لأن العطر الجيد ليس الأكثر شهرة دائمًا،
              بل الأكثر شبهًا بك.
            </p>
          </div>
        </section>


   <section className="border-b border-black/10 bg-[#e6e1da]">
  <div className="mx-auto max-w-[1400px] px-4  py-10 md:px-8 md:py-20">
    <div className="grid grid-cols-4 border border-[#9f946e]">

      {/* 01 */}
      <div className="border-l border-[#9f946e] bg-[#ffffff] px-3 py-5 text-center sm:px-5 sm:py-7 md:p-10">
        <p className="font-serif text-2xl sm:text-3xl md:text-5xl">
          100%
        </p>

        <p className="mt-2 text-[9px] leading-4 text-black/50 sm:text-[10px] md:mt-3 md:text-xs">
          اهتمام بالتفاصيل
        </p>
      </div>

      {/* 02 */}
      <div className="border-l border-[#9f946e] bg-[#ffffff] px-3 py-5 text-center sm:px-5 sm:py-7 md:p-10">
        <p className="font-serif text-2xl sm:text-3xl md:text-5xl">
          01
        </p>

        <p className="mt-2 text-[9px] leading-4 text-black/50 sm:text-[10px] md:mt-3 md:text-xs">
          تجربة مختلفة
        </p>
      </div>

      {/* 03 */}
      <div className="border-l border-[#9f946e] bg-[#ffffff] px-3 py-5 text-center sm:px-5 sm:py-7 md:p-10">
        <p className="font-serif text-2xl sm:text-3xl md:text-5xl">
          ∞
        </p>

        <p className="mt-2 text-[9px] leading-4 text-black/50 sm:text-[10px] md:mt-3 md:text-xs">
          روائح لا تُنسى
        </p>
      </div>

      {/* 04 */}
      <div className="border-l border-[#9f946e] bg-[#ffffff] px-3 py-5 text-center sm:px-5 sm:py-7 md:p-10">
        <p className="font-serif text-2xl sm:text-3xl md:text-5xl">
          24/7
        </p>

        <p className="mt-2 text-[9px] leading-4 text-black/50 sm:text-[10px] md:mt-3 md:text-xs">
          العميل أولًا
        </p>
      </div>

    </div>
  </div>
</section>

        {/* =====================================================
            STORY
        ====================================================== */}
        <section className="border-b border-black/10 bg-[#e6e1da]">
          <div className="mx-auto grid max-w-[1500px] md:grid-cols-2">
            {/* Story Video */}
            <div className="relative min-h-[500px] overflow-hidden bg-[#d8d2ca]">
             <video
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  className="absolute inset-0 h-full w-full object-cover"
>
<source src="/vdio.mp4" type="video/mp4" />
</video>

              {/* Video Overlay */}
              <div className="absolute inset-0 bg-black/10" />

              {/* Video Label */}
              <div className="absolute bottom-6 left-6 border border-white/30 bg-black/20 px-5 py-4 text-white backdrop-blur-md md:bottom-8 md:left-8">
                <p className="text-[9px] tracking-[0.3em] text-white/60">
                  EST. WITH PASSION
                </p>

                <p className="mt-1 font-serif text-lg">
                  شغف بالتفاصيل
                </p>
              </div>
            </div>

            {/* Story */}
            <div className="flex items-center px-6 py-16 md:px-12 lg:px-20">
              <div className="max-w-xl">
                <p className="text-[10px] tracking-[0.35em] text-black/40">
                  OUR STORY
                </p>

                <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
                  بدأت القصة
                  <br />
                  من حب العطور.
                </h2>

                <div className="mt-8 space-y-5 text-sm leading-8 text-black/60">
                  <p>
                    بدأت Comfort Keepers بفكرة بسيطة: لماذا يكون
                    اختيار العطر مجرد عملية شراء؟
                  </p>

                  <p>
                    بالنسبة لنا، العطر تجربة. لحظة تختار فيها شيئًا
                    يعبر عنك، عن ذوقك، أو حتى عن الحالة التي تريد
                    أن تعيشها.
                  </p>

                  <p>
                    لذلك نهتم بكل تفصيلة؛ من المنتجات التي نختارها،
                    إلى طريقة عرضها، وحتى اللحظة التي يصل فيها طلبك
                    إلى يديك.
                  </p>

                  <p>
                    هدفنا أن نجعل تجربة اكتشاف العطر أكثر بساطة،
                    أناقة، وراحة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            VALUES
        ====================================================== */}
       {/* VALUES */}
<section className="border-b border-black/10 bg-[#e6e1da]">
  <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-8 md:py-28">

    {/* Section Header */}
    <div className="mb-12 max-w-2xl">
      <p className="text-[10px] tracking-[0.35em] text-black/40">
        WHAT WE STAND FOR
      </p>

      <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
        القيم التي نبني عليها
      </h2>

      <p className="mt-5 max-w-xl text-sm leading-8 text-black/55">
        لأن البراند الحقيقي لا يُبنى بالمنتجات فقط، بل بالطريقة
        التي نتعامل بها مع عملائنا والتفاصيل التي نحرص عليها.
      </p>
    </div>

    {/* Values Grid */}
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-4">

      {/* Value 01 */}
      <div className="group relative min-h-[280px] bg-[#f0ede8] p-6 transition-colors duration-300 hover:bg-[#e9e4dd] sm:p-8 md:min-h-[340px] md:p-10">

        <div className="flex items-start justify-between">
          <span className="text-[10px] tracking-[0.2em] text-black/35">
            01
          </span>

          <Sparkles
            size={22}
            strokeWidth={1.2}
            className="text-black/70 transition-transform duration-300 group-hover:rotate-12"
          />
        </div>

        <div className="mt-16 sm:mt-20 md:mt-24">
          <h3 className="font-serif text-xl sm:text-2xl">
            الاختيار بعناية
          </h3>

          <p className="mt-4 text-xs leading-7 text-black/50 sm:text-sm sm:leading-8">
            لا نريد أن نملأ متجرك بالمنتجات. نريد أن نقدم
            منتجات تستحق أن تكون ضمن مجموعتك.
          </p>
        </div>
      </div>

      {/* Value 02 */}
      <div className="group relative min-h-[280px] bg-[#f0ede8] p-6 transition-colors duration-300 hover:bg-[#e9e4dd] sm:p-8 md:min-h-[340px] md:p-10">

        <div className="flex items-start justify-between">
          <span className="text-[10px] tracking-[0.2em] text-black/35">
            02
          </span>

          <Gem
            size={22}
            strokeWidth={1.2}
            className="text-black/70 transition-transform duration-300 group-hover:rotate-12"
          />
        </div>

        <div className="mt-16 sm:mt-20 md:mt-24">
          <h3 className="font-serif text-xl sm:text-2xl">
            الجودة أولًا
          </h3>

          <p className="mt-4 text-xs leading-7 text-black/50 sm:text-sm sm:leading-8">
            نهتم بجودة المنتج والتفاصيل المحيطة به، لأن
            التجربة الراقية تبدأ من الأشياء الصغيرة.
          </p>
        </div>
      </div>

      {/* Value 03 */}
      <div className="group relative min-h-[280px] bg-[#f0ede8] p-6 transition-colors duration-300 hover:bg-[#e9e4dd] sm:p-8 md:min-h-[340px] md:p-10">

        <div className="flex items-start justify-between">
          <span className="text-[10px] tracking-[0.2em] text-black/35">
            03
          </span>

          <Heart
            size={22}
            strokeWidth={1.2}
            className="text-black/70 transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div className="mt-16 sm:mt-20 md:mt-24">
          <h3 className="font-serif text-xl sm:text-2xl">
            العميل أولًا
          </h3>

          <p className="mt-4 text-xs leading-7 text-black/50 sm:text-sm sm:leading-8">
            نريد أن تشعر أنك تتعامل مع شخص يهتم باختيارك،
            وليس مجرد متجر يستقبل طلبًا.
          </p>
        </div>
      </div>

      {/* Value 04 */}
      <div className="group relative min-h-[280px] bg-[#f0ede8] p-6 transition-colors duration-300 hover:bg-[#e9e4dd] sm:p-8 md:min-h-[340px] md:p-10">

        <div className="flex items-start justify-between">
          <span className="text-[10px] tracking-[0.2em] text-black/35">
            04
          </span>

          <ShieldCheck
            size={22}
            strokeWidth={1.2}
            className="text-black/70 transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div className="mt-16 sm:mt-20 md:mt-24">
          <h3 className="font-serif text-xl sm:text-2xl">
            الثقة والشفافية
          </h3>

          <p className="mt-4 text-xs leading-7 text-black/50 sm:text-sm sm:leading-8">
            نؤمن أن الثقة تُبنى من الوضوح، والاهتمام، وتقديم
            تجربة تستحق أن تعود إليها مرة أخرى.
          </p>
        </div>
      </div>

    </div>
  </div>
</section>

        {/* =====================================================
            EXPERIENCE
        ====================================================== */}
       {/* EXPERIENCE */}
<section className="border-y border-black/10 bg-[#e6e1da]">
  <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-8 md:py-28">
    
    <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start md:gap-16">

      {/* Heading */}
      <div className="md:sticky md:top-24">
        <p className="text-[10px] tracking-[0.35em] text-black/40">
          THE EXPERIENCE
        </p>

        <h2 className="mt-5 font-serif text-4xl leading-[1.25] md:text-5xl">
          تجربة تبدأ
          <br />
          قبل أن يصل الطلب.
        </h2>

        <p className="mt-6 max-w-md text-sm leading-8 text-black/55">
          من لحظة دخولك إلى المتجر وحتى استلام طلبك، نريد
          أن تكون كل خطوة واضحة، بسيطة ومريحة.
        </p>

        <div className="mt-8 h-px w-16 bg-black/20" />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 border border-black/10">

        {/* Step 01 */}
        <div className="group relative border-b border-l border-black/10 bg-[#f0ede8] p-5 transition-colors duration-300 hover:bg-[#ebe6df] sm:p-7 md:p-9">

          <div className="flex items-start justify-between">
            <span className="text-[10px] tracking-[0.2em] text-black/35">
              01
            </span>

            <Search
              size={21}
              strokeWidth={1.2}
              className="text-black/60 transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          <div className="mt-14 sm:mt-16 md:mt-20">
            <h3 className="font-serif text-xl md:text-2xl">
              اكتشف
            </h3>

            <p className="mt-3 text-xs leading-7 text-black/50 sm:text-sm sm:leading-8">
              تصفح مجموعة مختارة بعناية تناسب مختلف الأذواق
              والمناسبات.
            </p>
          </div>
        </div>

        {/* Step 02 */}
        <div className="group relative border-b border-black/10 bg-[#f0ede8] p-5 transition-colors duration-300 hover:bg-[#ebe6df] sm:p-7 md:p-9">

          <div className="flex items-start justify-between">
            <span className="text-[10px] tracking-[0.2em] text-black/35">
              02
            </span>

            <Star
              size={21}
              strokeWidth={1.2}
              className="text-black/60 transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          <div className="mt-14 sm:mt-16 md:mt-20">
            <h3 className="font-serif text-xl md:text-2xl">
              اختر
            </h3>

            <p className="mt-3 text-xs leading-7 text-black/50 sm:text-sm sm:leading-8">
              اختر العطر الذي يتناسب مع ذوقك وشخصيتك
              واللحظة التي تريدها.
            </p>
          </div>
        </div>

        {/* Step 03 */}
        <div className="group relative border-l border-black/10 bg-[#f0ede8] p-5 transition-colors duration-300 hover:bg-[#ebe6df] sm:p-7 md:p-9">

          <div className="flex items-start justify-between">
            <span className="text-[10px] tracking-[0.2em] text-black/35">
              03
            </span>

            <ShieldCheck
              size={21}
              strokeWidth={1.2}
              className="text-black/60 transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          <div className="mt-14 sm:mt-16 md:mt-20">
            <h3 className="font-serif text-xl md:text-2xl">
              اطلب بثقة
            </h3>

            <p className="mt-3 text-xs leading-7 text-black/50 sm:text-sm sm:leading-8">
              تجربة شراء واضحة وسهلة من اختيار المنتج
              حتى تأكيد طلبك.
            </p>
          </div>
        </div>

        {/* Step 04 */}
        <div className="group relative bg-[#f0ede8] p-5 transition-colors duration-300 hover:bg-[#ebe6df] sm:p-7 md:p-9">

          <div className="flex items-start justify-between">
            <span className="text-[10px] tracking-[0.2em] text-black/35">
              04
            </span>

            <PackageCheck
              size={21}
              strokeWidth={1.2}
              className="text-black/60 transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          <div className="mt-14 sm:mt-16 md:mt-20">
            <h3 className="font-serif text-xl md:text-2xl">
              استمتع
            </h3>

            <p className="mt-3 text-xs leading-7 text-black/50 sm:text-sm sm:leading-8">
              استلم طلبك واستمتع بتجربة صُممت لتكون
              مختلفة من البداية للنهاية.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

        {/* =====================================================
            QUALITY
        ====================================================== */}
      {/* QUALITY & TRUST */}
<section className="border-b border-black/10">
  <div className="mx-auto grid max-w-[1500px] md:grid-cols-2">

    {/* Text */}
    <div className="order-2 flex items-center px-6 py-16 md:order-1 md:px-12 lg:px-20">
      <div className="max-w-xl">

        <p className="text-[10px] tracking-[0.35em] text-black/40">
          QUALITY & TRUST
        </p>

        <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
          الجودة ليست
          <br />
          مجرد كلمة.
        </h2>

        <p className="mt-7 text-sm leading-8 text-black/55">
          عندما تختار عطرًا، فأنت تختار أكثر من رائحة.
          أنت تختار منتجًا سيصبح جزءًا من يومك وذكرياتك.
          لذلك نؤمن أن الثقة تبدأ من الوضوح والاهتمام
          بكل تفاصيل المنتج والتجربة.
        </p>

        <div className="mt-8 flex items-center gap-4 border-t border-black/10 pt-6">
          <ShieldCheck
            size={25}
            strokeWidth={1.2}
          />

          <div>
            <p className="font-serif text-lg">
              ثقة تبدأ من التفاصيل
            </p>

            <p className="mt-1 text-xs text-black/45">
              لأن تجربتك معنا تهمنا.
            </p>
          </div>
        </div>

      </div>
    </div>

    {/* Images */}
    <div className="order-1 bg-[#d8d2ca] p-5 md:order-2 md:p-0">

      {/* Mobile Editorial Gallery */}
      <div className="relative flex h-[430px] items-center justify-center md:hidden">

        {/* Small Image — Right */}
        <div className="absolute right-[0%] top-2 z-10 h-[205px] w-[40%] overflow-hidden">
          <img
            src="https://i.pinimg.com/1200x/ef/ba/eb/efbaeb8de91eac333bcf5fba026beb3e.jpg"
            alt="تفاصيل العطر"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Main Image */}
        <div className="absolute left-1/2 top-1/2 z-20 h-[330px] w-[52%] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
          <img
            src="https://i.pinimg.com/736x/8d/8b/a5/8d8ba530c7481489f4435e365aa9010c.jpg"
            alt="زجاجة عطر"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Small Image — Left */}
        <div className="absolute bottom-8 left-[3%] z-10 h-[175px] w-[30%] overflow-hidden">
          <img
            src="https://i.pinimg.com/736x/7b/21/96/7b2196c20880e09d67380595ea31a979.jpg"
            alt="تفاصيل العطور"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Tiny Detail Image */}
        <div className="absolute bottom-1 right-[4%] z-30 h-[170px] w-[40%] overflow-hidden border-4 border-[#d8d2ca]">
          <img
            src="https://i.pinimg.com/736x/a2/25/cf/a225cf8eed80e1beaaa98bc8a658b703.jpg"
            alt="تفاصيل المنتج"
            className="h-full w-full object-cover"
          />
        </div>

      </div>

      {/* Desktop Image */}
      <div className="hidden min-h-[500px] md:block">
        <img
          src="https://i.pinimg.com/736x/8d/8b/a5/8d8ba530c7481489f4435e365aa9010c.jpg"
          alt="زجاجة عطر"
          className="h-full w-full object-cover"
        />
      </div>

    </div>

  </div>
</section>

        {/* =====================================================
            FOUNDER MESSAGE
        ====================================================== */}
        <section className="mx-auto max-w-[1200px] px-6 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] tracking-[0.35em] text-black/40">
              A NOTE FROM US
            </p>

            <div className="mt-8 font-serif text-5xl text-black/15">
              “
            </div>

            <blockquote className="mt-1 font-serif text-2xl leading-[1.7] md:text-4xl">
              نريد أن يكون كل منتج تختاره من Comfort Keepers
              إضافة جميلة ليومك، وكل تجربة معنا سببًا يجعلك
              تعود مرة أخرى.
            </blockquote>

            <div className="mt-9">
              <div className="mx-auto h-px w-10 bg-black/25" />

              <p className="mt-4 text-xs text-black/50">
                فريق Comfort Keepers
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ====================================================== */}
        <section className="border-t border-black/10 bg-[#c0a682] text-white">
  <div className="flex items-center justify-center gap-4 px-6 py-10">

    {/* Instagram */}
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className="flex h-12 w-12 items-center justify-center border border-white/15 transition-all duration-300 "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-5 w-5"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="0.8"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    </a>

    {/* Facebook */}
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
      className="flex h-12 w-12 items-center justify-center border border-white/15 transition-all duration-300"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.7.3-1 1-1Z" />
      </svg>
    </a>

    {/* X / Twitter */}
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="X"
      className="flex h-12 w-12 items-center justify-center border border-white/15 transition-all duration-300 "
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5"
      >
        <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.3h1.73L8.25 4.58H6.39L17.8 19.3Z" />
      </svg>
    </a>

  </div>
</section>
      </main>

      <Footer />
    </>
  );
}