import Link from "next/link";
import { ArrowUpLeft, Sparkles, Heart, ShieldCheck } from "lucide-react";
import Header, { Footer } from "@/components/layout/Header";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] text-[#171717]"
      >
        {/* Hero */}
        <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-28">
          <div className="max-w-4xl">
            <p className="mb-5 text-[10px] tracking-[0.35em] text-black/45">
              ABOUT US
            </p>

            <h1 className="font-serif text-5xl leading-[1.15] md:text-7xl">
              العطر ليس مجرد
              <br />
              <span className="text-black/45">رائحة.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-8 text-black/60 md:text-base">
              نحن نؤمن أن لكل شخص رائحة تحكي جزءًا من قصته.
              لذلك اخترنا أن نقدم لك مجموعة من العطور والمنتجات
              بعناية، لتكون كل تجربة أكثر تميزًا وأناقة.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="border-y border-black/10">
          <div className="mx-auto grid max-w-[1400px] md:grid-cols-2">
            <div className="min-h-[420px] bg-[#ddd8d1]">
              <img
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85"
                alt="عطر فاخر"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center px-6 py-14 md:px-14 lg:px-20">
              <div className="max-w-xl">
                <p className="text-[10px] tracking-[0.3em] text-black/45">
                  OUR STORY
                </p>

                <h2 className="mt-4 font-serif text-3xl md:text-4xl">
                  بدأت الفكرة من شغف بالتفاصيل
                </h2>

                <div className="mt-6 space-y-4 text-sm leading-8 text-black/60">
                  <p>
                    بدأنا برؤية بسيطة: أن نجعل اختيار العطر تجربة
                    ممتعة وراقية، وليس مجرد عملية شراء.
                  </p>

                  <p>
                    نختار منتجاتنا بعناية ونركز على الجودة،
                    التفاصيل، والتجربة التي يحصل عليها العميل من
                    اللحظة الأولى وحتى وصول المنتج إليه.
                  </p>

                  <p>
                    هدفنا هو أن تجد العطر الذي يشبهك، سواء كنت
                    تبحث عن عطر يومي، مناسبة خاصة، أو هدية لشخص
                    مميز.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
          <div className="mb-12 text-center">
            <p className="text-[10px] tracking-[0.3em] text-black/45">
              WHAT WE BELIEVE
            </p>

            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              ما الذي يميزنا؟
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-3">
            <div className="bg-[#f0ede8] p-8 md:p-10">
              <Sparkles
                size={24}
                strokeWidth={1.3}
                className="mb-7"
              />

              <h3 className="font-serif text-xl">
                اختيار بعناية
              </h3>

              <p className="mt-4 text-sm leading-7 text-black/55">
                نهتم بالتفاصيل ونختار المنتجات التي تتناسب مع
                ذوق عملائنا وتوقعاتهم.
              </p>
            </div>

            <div className="bg-[#f0ede8] p-8 md:p-10">
              <Heart
                size={24}
                strokeWidth={1.3}
                className="mb-7"
              />

              <h3 className="font-serif text-xl">
                تجربة مختلفة
              </h3>

              <p className="mt-4 text-sm leading-7 text-black/55">
                نريد أن تكون تجربة التسوق بسيطة، راقية ومريحة
                من أول زيارة وحتى استلام طلبك.
              </p>
            </div>

            <div className="bg-[#f0ede8] p-8 md:p-10">
              <ShieldCheck
                size={24}
                strokeWidth={1.3}
                className="mb-7"
              />

              <h3 className="font-serif text-xl">
                ثقة وجودة
              </h3>

              <p className="mt-4 text-sm leading-7 text-black/55">
                نبني علاقتنا مع عملائنا على الوضوح والاهتمام
                وجودة المنتجات والخدمة.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-black/10">
          <div className="mx-auto max-w-[1400px] px-5 py-20 text-center md:px-8 md:py-28">
            <p className="text-[10px] tracking-[0.3em] text-black/45">
              FIND YOUR SIGNATURE
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
              اكتشف العطر الذي
              <br />
              يشبهك
            </h2>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-3 bg-[#171717] px-7 py-4 text-xs text-white transition hover:bg-black/80"
            >
              اكتشف المنتجات
              <ArrowUpLeft size={15} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}