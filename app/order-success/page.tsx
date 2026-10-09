"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  AlertCircle,
  Sparkles,
} from "lucide-react";

type Invoice = {
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  city?: string;
  area?: string;
  address?: string;
  notes?: string;
  items?: {
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
  }[];
  subtotal?: number;
  shipping?: number;
  total?: number;
  currency?: string;
  paymentMethod?: string;
  distanceKm?: number;
  createdAt?: string;
};

export default function OrderSuccessPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("comfortKeepersInvoice");

      if (saved) {
        const parsed = JSON.parse(saved);
        setInvoice(parsed.invoice ?? parsed);
      }
    } catch (error) {
      console.error("Could not load invoice:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  const currency = invoice?.currency || "جنيه";

  const money = (value: number | undefined) =>
    `${Number(value || 0).toLocaleString("ar-EG")} ${currency}`;

  if (!loaded) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f0ede8]"
      >
        <p className="text-sm text-neutral-600">جاري تجهيز الفاتورة...</p>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f0ede8] px-2 py-2"
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-600" />

          <h1 className="mb-3 text-xl font-bold text-neutral-900">
            الفاتورة غير متاحة
          </h1>

          <p className="mb-6 text-sm leading-7 text-neutral-600">
            لم نعثر على بيانات الفاتورة في هذه الجلسة. إذا كنت قد أرسلت
            طلبك بالفعل، تواصل مع المتجر للتأكد من تسجيله قبل إعادة الطلب.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            العودة للمتجر
          </Link>
        </div>
      </main>
    );
  }

  const items = invoice.items ?? [];

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#f0ede8] px-1 py-1 text-neutral-900 sm:px-6 sm:py-10"
    >
      <div className="mx-auto max-w-3xl">
        {/* رسالة نجاح الطلب */}
        <div className="no-print mb-7 text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-100 bg-white shadow-sm">
            <CheckCircle2 className="h-8 w-8 text-green-700" />
          </div>

          <h1 className="text-xl font-bold sm:text-3xl">
            تم استلام طلبك بنجاح
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-xs text-neutral-600 sm:text-sm">
            شكرًا لثقتك في Comfort Keepers. فاتورتك جاهزة للمراجعة.
          </p>
        </div>

        {/* مشهد الطابعة والورقة */}
        <div className="printer-scene mx-auto mb-3 w-full max-w-lg">
          <div className="printer-stage relative mx-auto h-[650px] w-full overflow-hidden sm:h-[720px]">
            {/* الورقة: مرفوعة لتظل بمحاذاة فتحة الطابعة */}
            <div className="paper-track absolute left-1/2 top-[106px] z-10 w-[340px] max-w-[calc(100%-20px)]">
              <section
                id="invoice"
                className="receipt-paper relative overflow-hidden border-x border-neutral-200 bg-white px-4 pb-4 pt-3 text-neutral-900 shadow-lg sm:px-5"
              >
                <div className="receipt-top-decoration absolute left-0 top-0 h-[3px] w-full bg-neutral-900" />

                {/* بيانات المتجر ورقم الطلب */}
                <div className="mb-3 border-b border-dashed border-neutral-300 pb-3 text-center">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <p className="mt-0.5 text-[10px] text-neutral-500">
                    فاتورة تأكيد الطلب
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-neutral-50 px-2.5 py-2 text-[11px]">
                    <span className="shrink-0 text-neutral-500">
                      رقم الطلب
                    </span>
                    <span className="break-all font-bold">
                      {invoice.orderNumber || "—"}
                    </span>
                  </div>

                  {invoice.createdAt && (
                    <p className="mt-1.5 text-[10px] text-neutral-500">
                      {new Date(invoice.createdAt).toLocaleString("ar-EG")}
                    </p>
                  )}
                </div>

                {/* بيانات العميل */}
                <div className="mb-3">
                  <h3 className="mb-1.5 border-r-[3px] border-neutral-900 pr-2 text-xs font-bold">
                    بيانات العميل
                  </h3>

                  <div className="space-y-1 text-[11px] leading-[1.65]">
                    <p className="flex items-start justify-between gap-3">
                      <span className="shrink-0 text-neutral-500">الاسم</span>
                      <span className="break-words text-left font-semibold">
                        {invoice.customerName || "—"}
                      </span>
                    </p>

                    <p className="flex items-start justify-between gap-3">
                      <span className="shrink-0 text-neutral-500">الهاتف</span>
                      <span
                        dir="ltr"
                        className="break-words text-left font-semibold"
                      >
                        {invoice.customerPhone || "—"}
                      </span>
                    </p>

                    <p className="flex items-start justify-between gap-3">
                      <span className="shrink-0 text-neutral-500">العنوان</span>
                      <span className="max-w-[76%] break-words text-left font-semibold">
                        {[invoice.city, invoice.area, invoice.address]
                          .filter(Boolean)
                          .join(" - ") || "—"}
                      </span>
                    </p>

                    {invoice.notes && (
                      <p className="border-r-2 border-neutral-200 pr-2 text-neutral-600">
                        <span className="font-semibold">ملاحظات: </span>
                        {invoice.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* المنتجات */}
                <div className="mb-3 border-y border-dashed border-neutral-300 py-2.5">
                  <h3 className="mb-2 border-r-[3px] border-neutral-900 pr-2 text-xs font-bold">
                    تفاصيل الطلب ({items.length})
                  </h3>

                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="flex items-start justify-between gap-3 text-[11px] leading-[1.6]"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="break-words font-semibold">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              {Number(item.quantity || 0)} ×{" "}
                              {money(item.price)}
                            </p>
                          </div>

                          <p className="shrink-0 text-left font-bold">
                            {money(
                              Number(item.price || 0) *
                                Number(item.quantity || 0)
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-neutral-500">
                      لا توجد تفاصيل منتجات متاحة.
                    </p>
                  )}
                </div>

                {/* المبالغ */}
                <div className="mb-3 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-neutral-500">المجموع الفرعي</span>
                    <span className="font-semibold">
                      {money(invoice.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-neutral-500">الشحن</span>
                    <span className="font-semibold">
                      {money(invoice.shipping)}
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg bg-neutral-900 px-3 py-2.5 text-white">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">
                        الإجمالي النهائي
                      </span>
                      <span className="text-sm font-extrabold">
                        {money(invoice.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-1">
                    <span className="text-neutral-500">طريقة الدفع</span>
                    <span className="max-w-[70%] break-words text-left font-semibold">
                      {invoice.paymentMethod || "—"}
                    </span>
                  </div>
                </div>

                {/* نهاية الفاتورة */}
                <div className="border-t border-dashed border-neutral-300 pt-2.5 text-center">
                  <div className="mb-2 flex h-5 items-center justify-center gap-[2px]">
                    {[...Array(35)].map((_, index) => (
                      <span
                        key={index}
                        className={`h-5 ${
                          index % 4 === 0
                            ? "w-[2px]"
                            : index % 3 === 0
                              ? "w-[1.5px]"
                              : "w-px"
                        } bg-neutral-900`}
                      />
                    ))}
                  </div>

                  <p className="text-[11px] font-bold">
                    شكرًا لاختيارك Comfort Keepers
                  </p>

                  <p className="mt-1 text-[9px] text-neutral-500">
                    نتمنى لك تجربة تسوق مميزة
                  </p>

                  <p className="mt-1.5 text-[8px] tracking-[0.14em] text-neutral-400">
                    COMFORT KEEPERS
                  </p>
                </div>

                <div className="receipt-edge mt-2" />
              </section>
            </div>

            {/* جسم الطابعة: مرفوع 25px إضافية */}
            <div className="printer-body no-print absolute left-1/2 top-[10px] z-20 w-[360px] max-w-[calc(100%-8px)] -translate-x-1/2">
              {/* الغطاء الخلفي */}
              <div className="relative h-[76px] rounded-t-[25px] border border-neutral-600 bg-gradient-to-b from-[#535353] via-[#292929] to-[#171717] shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                <div className="absolute inset-x-5 top-3 h-px bg-white/20" />

                <div className="absolute left-5 top-5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.65)]" />
                  <span className="text-[9px] font-semibold tracking-widest text-neutral-300">
                    READY
                  </span>
                </div>

                <div className="absolute right-5 top-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-neutral-400" />
                  <span className="text-[10px] font-bold text-neutral-200">
                    CK
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-3 text-center">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-white/90">
                    COMFORT KEEPERS
                  </span>
                </div>
              </div>

              {/* الواجهة الأمامية وفتحة إخراج الورق */}
<div className="relative -mt-8 h-[76px] rounded-b-[23px] border-x border-b border-neutral-600 bg-gradient-to-b from-[#363636] via-[#222222] to-[#111111] shadow-[0_18px_25px_rgba(0,0,0,0.2)]">                <div className="absolute inset-x-4 top-0 h-px bg-white/15" />

                <div className="paper-slot absolute left-1/2 top-[10px] z-30 h-[19px] w-[80%] -translate-x-1/2 rounded-md border border-black bg-[#050505] shadow-[inset_0_4px_7px_rgba(0,0,0,0.95)]">
                  <div className="absolute inset-x-2 top-[4px] h-[2px] rounded-full bg-neutral-600/80" />
                  <div className="absolute inset-x-5 top-[10px] h-px bg-white/10" />
                </div>

                <div className="absolute inset-x-6 bottom-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                    <span className="text-[9px] tracking-widest text-neutral-400">
                      PRINTING
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full border border-neutral-500 bg-neutral-700" />
                    <span className="h-2 w-2 rounded-full border border-neutral-500 bg-neutral-700" />
                    <span className="h-3 w-3 rounded-full border border-neutral-400 bg-neutral-500 shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="mx-4 h-2 rounded-b-lg bg-gradient-to-b from-neutral-700 to-neutral-500 shadow-md" />
            </div>
          </div>

          <div className="no-print mt-2 text-center">
            <p className="text-xs font-semibold text-neutral-700">
              فاتورتك جاهزة للطباعة
            </p>
            <p className="mt-1 text-[10px] text-neutral-500">
              يمكنك طباعة الفاتورة أو حفظها بصيغة PDF
            </p>
          </div>
        </div>

        {/* الأزرار */}
     <div className="no-print mt-5 mb-8 flex flex-row gap-2 sm:gap-3">
  <button
    type="button"
    onClick={() => window.print()}
    className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#211f1b] px-2 py-3 text-xs font-semibold text-white transition hover:bg-black sm:px-5 sm:text-sm"
  >
    <Printer className="h-4 w-4 shrink-0" />
    <span>طباعة / PDF</span>
  </button>

  <Link
    href="/products"
    className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-2 py-3 text-xs font-semibold transition hover:bg-neutral-50 sm:px-5 sm:text-sm"
  >
    <ShoppingBag className="h-4 w-4 shrink-0" />
    <span>التسوق</span>
  </Link>
</div>
      </div>

      <style jsx global>{`
        .paper-track {
          left: 50%;
          opacity: 1;
          transform: translate(-50%, -100%);
          transform-origin: top center;
          animation: paper-emerge 3.5s
            cubic-bezier(0.22, 0.61, 0.36, 1) 0.8s both;
          will-change: transform;
        }

        .receipt-paper {
          direction: rtl;
          width: 100%;
          min-height: 0;
          border-radius: 2px;
          background: #fff;
        }

        .receipt-edge {
          height: 6px;
          background-image:
            linear-gradient(135deg, white 50%, transparent 50%),
            linear-gradient(45deg, transparent 50%, white 50%);
          background-size: 10px 10px;
          background-position: 0 0, 0 0;
          background-repeat: repeat-x;
        }

        @keyframes paper-emerge {
          0% {
            transform: translate(-50%, -100%);
          }

          65% {
            transform: translate(-50%, 0);
          }

          82% {
            transform: translate(-50%, 5px);
          }

          100% {
            transform: translate(-50%, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .paper-track {
            animation: none;
            transform: translate(-50%, 0);
          }
        }

        @media print {
          @page {
            size: auto;
            margin: 8mm;
          }

          body * {
            visibility: hidden !important;
          }

          #invoice,
          #invoice * {
            visibility: visible !important;
          }

          #invoice {
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            left: auto !important;
            width: 100% !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 5mm !important;
            overflow: visible !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            transform: none !important;
            animation: none !important;
          }

          .no-print,
          .printer-body {
            display: none !important;
          }

          .paper-track {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: none !important;
            transform: none !important;
            animation: none !important;
          }

          .receipt-top-decoration {
            display: none !important;
          }

          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  );
}
