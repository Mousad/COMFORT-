
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";

const LocationPicker = dynamic(
  () => import("@/components/comfort-shipping-update/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-[#f0ede8]">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          جاري تحميل الخريطة...
        </div>
      </div>
    ),
  }
);

type StoreSettings = {
  id?: number;
  storeName: string;
  storeDescription: string;
  phone: string;
  whatsapp: string;
  address: string;
  shippingCost: number;
  freeShippingMinimum: number;
  currency: string;
  instagram: string;
  facebook: string;
  acceptOrders: boolean;
};

const defaultStoreSettings: StoreSettings = {
  storeName: "COMFORT KEEPERS",
  storeDescription: "متجر العطور والجمال",
  phone: "",
  whatsapp: "",
  address: "",
  shippingCost: 50,
  freeShippingMinimum: 500,
  currency: "جنيه",
  instagram: "",
  facebook: "",
  acceptOrders: true,
};

const countries = [
  { code: "+20", name: "مصر" },
  { code: "+249", name: "السودان" },
  { code: "+966", name: "السعودية" },
  { code: "+971", name: "الإمارات" },
  { code: "+974", name: "قطر" },
  { code: "+965", name: "الكويت" },
  { code: "+968", name: "عُمان" },
  { code: "+973", name: "البحرين" },
  { code: "+962", name: "الأردن" },
  { code: "+964", name: "العراق" },
  { code: "+212", name: "المغرب" },
  { code: "+213", name: "الجزائر" },
  { code: "+216", name: "تونس" },
];

const STORE_LATITUDE = 29.952070485013405;
const STORE_LONGITUDE = 30.960877742832103;

function calculateShipping(distanceKm: number) {
  if (distanceKm <= 5) return 30;
  if (distanceKm <= 10) return 40;
  if (distanceKm <= 15) return 50;
  if (distanceKm <= 20) return 60;
  if (distanceKm <= 25) return 70;
  if (distanceKm <= 30) return 80;
  return 90;
}

function distanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();

  const [storeSettings, setStoreSettings] =
    useState<StoreSettings>(defaultStoreSettings);

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+20");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setSettingsLoading(true);

        const response = await fetch("/api/settings", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "تعذر تحميل إعدادات المتجر");
        }

        setStoreSettings({
          ...defaultStoreSettings,
          ...data.settings,
        });
      } catch (error) {
        console.error("Checkout settings error:", error);
        setStoreSettings(defaultStoreSettings);
      } finally {
        setSettingsLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleLocationChange(location: {
    latitude: number;
    longitude: number;
    distanceKm: number;
  }) {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setDistanceKm(location.distanceKm);
    setError("");
  }

  const finalWhatsappPhone = whatsappPhone.trim() || phone.trim();

  const shipping = useMemo(() => {
    if (distanceKm === null) return 0;
    return calculateShipping(distanceKm);
  }, [distanceKm]);

  const finalTotal = useMemo(
    () => cartTotal + shipping,
    [cartTotal, shipping]
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (submitting) return;

    if (settingsLoading) {
      setError("جاري تحميل إعدادات المتجر، حاول مرة أخرى.");
      return;
    }

    if (!storeSettings.acceptOrders) {
      setError("عذراً، استقبال الطلبات متوقف حالياً.");
      return;
    }

    if (!items || items.length === 0) {
      setError("السلة فارغة.");
      return;
    }

    if (!customerName.trim()) {
      setError("من فضلك أدخل الاسم.");
      return;
    }

    if (!phone.trim()) {
      setError("من فضلك أدخل رقم الهاتف.");
      return;
    }

    if (!finalWhatsappPhone.replace(/\D/g, "")) {
      setError("رقم الهاتف أو الواتساب غير صحيح.");
      return;
    }

    if (latitude === null || longitude === null) {
      setError("من فضلك حدد موقع التوصيل على الخريطة لحساب تكلفة الشحن.");
      return;
    }

    const calculatedDistance = distanceInKm(
      STORE_LATITUDE,
      STORE_LONGITUDE,
      latitude,
      longitude
    );

    const calculatedShipping = calculateShipping(calculatedDistance);
    const calculatedTotal = cartTotal + calculatedShipping;

    try {
      setSubmitting(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: customerName.trim(),
            phone: phone.trim(),
            whatsappCountryCode,
            whatsappPhone: finalWhatsappPhone,
            city: "",
            area: "",
            address: "",
            notes: notes.trim(),
            latitude,
            longitude,
          },
          items: items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image || null,
          })),
          subtotal: cartTotal,
          shipping: calculatedShipping,
          total: calculatedTotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "حدث خطأ أثناء إنشاء الطلب");
      }

      // تجهيز بيانات الفاتورة بعد تأكيد نجاح حفظ الطلب في قاعدة البيانات.
      const invoice = data.invoice || {
        orderNumber: data.orderNumber || "",
        customerName: customerName.trim(),
        customerPhone: phone.trim(),
        whatsappCountryCode,
        whatsappPhone: finalWhatsappPhone,
        city: "",
        area: "",
        address: "",
        notes: notes.trim(),
        items: items.map((item: any) => ({
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || null,
        })),
        subtotal: Number(data.subtotal ?? cartTotal),
        shipping: Number(data.shipping ?? calculatedShipping),
        total: Number(data.total ?? calculatedTotal),
        currency: storeSettings.currency,
        distanceKm: Number(data.distanceKm ?? calculatedDistance),
        paymentMethod: "الدفع عند الاستلام",
        createdAt: new Date().toISOString(),
      };

      // لا نضع بيانات العميل في رابط الصفحة.
      try {
        sessionStorage.setItem(
          "comfortKeepersInvoice",
          JSON.stringify({
            ...invoice,
            storeName: storeSettings.storeName,
          })
        );
      } catch (storageError) {
        console.error("Could not save invoice in session storage:", storageError);
        throw new Error(
          "تم تسجيل الطلب، لكن تعذر تجهيز الفاتورة على هذا المتصفح. تواصل مع المتجر برقم الطلب: " +
            (data.orderNumber || "")
        );
      }

      // تفريغ السلة والانتقال مباشرةً إلى الفاتورة، دون فتح واتساب.
      clearCart();
      router.replace("/order-success");
    } catch (error) {
      console.error("Create order error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!settingsLoading && items.length === 0) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] px-4 py-10 text-[#171717]"
      >
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[28px] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0ede8]">
              <ShoppingBag className="h-9 w-9 text-[#b89b72]" />
            </div>

            <h1 className="mb-3 text-2xl font-bold">السلة فارغة</h1>

            <p className="mb-7 text-gray-500">
              أضف بعض المنتجات إلى السلة أولاً.
            </p>

            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#171717] px-8 font-medium text-white"
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f0ede8] text-[#171717]">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-20 sm:px-4 md:px-6">
          <Link href="/" className="text-base font-bold tracking-wide sm:text-xl">
            {storeSettings.storeName}
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 transition hover:text-black sm:gap-2 sm:text-sm"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للسلة
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8 md:px-6 md:py-12">
        <div className="mb-5 sm:mb-8">
          <p className="mb-1.5 text-xs text-[#b89b72] sm:mb-2 sm:text-sm">
            إتمام الطلب
          </p>

          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            بيانات الطلب
          </h1>

          <p className="mt-2 text-xs text-gray-500 sm:mt-3 sm:text-sm">
            أدخل بياناتك وحدد موقع التوصيل، وسنتولى الباقي.
          </p>
        </div>

        {!storeSettings.acceptOrders && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">استقبال الطلبات متوقف حالياً</p>
            <p className="mt-1 text-sm">
              لا يمكن إنشاء طلب جديد في الوقت الحالي.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[1fr_400px]"
        >
          <div className="min-w-0 space-y-4 sm:space-y-6">
            {/* بيانات العميل */}
            <section className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-5 md:p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0ede8]">
                  <User className="h-4 w-4 text-[#b89b72]" />
                </div>
                <h2 className="text-sm font-bold">بيانات العميل</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="الاسم"
                  required
                  value={customerName}
                  onChange={setCustomerName}
                  placeholder="اكتب اسمك"
                />

                <Input
                  label="رقم الهاتف"
                  required
                  value={phone}
                  onChange={setPhone}
                  placeholder="01xxxxxxxxx"
                  type="tel"
                />

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-medium sm:text-sm">
                    رقم الواتساب
                    <span className="mr-1 text-red-500">*</span>
                  </label>

                  <div className="flex min-w-0 items-end gap-2">
                    <div className="w-[115px] shrink-0 sm:w-[145px]">
                      <select
                        value={whatsappCountryCode}
                        onChange={(e) =>
                          setWhatsappCountryCode(e.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-2 text-xs outline-none transition focus:border-[#b89b72] sm:h-12 sm:px-3 sm:text-sm"
                        required
                        aria-label="مفتاح دولة الواتساب"
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name} {country.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="min-w-0 flex-1">
                      <input
                        type="tel"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        placeholder="أدخل رقم الواتساب"
                        required
                        aria-label="رقم الواتساب"
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#b89b72] sm:h-12 sm:px-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* موقع التوصيل */}
            <section className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-5 md:p-7">
              <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0ede8] sm:h-10 sm:w-10">
                  <MapPin className="h-4 w-4 text-[#b89b72] sm:h-5 sm:w-5" />
                </div>

                <h2 className="text-sm font-bold sm:text-base">
                  موقع التوصيل
                </h2>
              </div>

              <div className="overflow-hidden rounded-xl">
                <LocationPicker
                  latitude={latitude}
                  longitude={longitude}
                  onLocationChange={handleLocationChange}
                />
              </div>

              {latitude !== null && longitude !== null && (
                <div className="mt-3 rounded-xl border border-gray-200 p-3">
                  <p className="text-xs text-gray-500">
                    إحداثيات موقع التوصيل
                  </p>

                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#8b6f47] underline underline-offset-4 sm:text-sm"
                  >
                    <MapPin className="h-4 w-4" />
                    معاينة الموقع
                  </a>
                </div>
              )}

              {distanceKm !== null && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                  <div className="min-w-0 rounded-[10px] bg-[#f0ede8] p-2 text-center sm:rounded-2xl sm:p-4">
                    <p className="text-[8px] text-gray-500 sm:text-sm">
                      المسافة من المتجر
                    </p>
                    <p className="mt-1 text-sm font-bold sm:text-lg">
                      {distanceKm.toFixed(2)} كم
                    </p>
                  </div>

                  <div className="min-w-0 rounded-[10px] bg-[#f0ede8] p-2 text-center sm:rounded-2xl sm:p-4">
                    <p className="text-[11px] text-gray-500 sm:text-sm">
                      تكلفة الشحن
                    </p>
                    <p className="mt-1 text-sm font-bold sm:text-lg">
                      {shipping.toLocaleString("ar-EG")}{" "}
                      {storeSettings.currency}
                    </p>
                  </div>
                </div>
              )}

              {distanceKm === null && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800 sm:mt-4 sm:rounded-2xl sm:p-4 sm:text-sm">
                  حدد موقع التوصيل على الخريطة حتى تظهر تكلفة الشحن.
                </div>
              )}
            </section>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4">
                {error}
              </div>
            )}
          </div>

          {/* ملخص الطلب */}
          <aside className="min-w-0 lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-5 md:p-7">
              <div className="mb-3 flex items-center gap-2 sm:mb-6 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0ede8] sm:h-10 sm:w-10">
                  <Package className="h-4 w-4 text-[#b89b72] sm:h-5 sm:w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-bold sm:text-base">
                    ملخص الطلب
                  </h2>
                  <p className="text-xs text-gray-500">
                    {items.length} منتج
                  </p>
                </div>
              </div>

              <div className="mb-3 space-y-3 sm:mb-6 sm:space-y-4">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center gap-3 rounded-xl bg-[#f0ede8]/60 p-2 sm:gap-4 sm:bg-transparent sm:p-0"
                  >
                    <div className="h-[76px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-[#f0ede8] sm:h-20 sm:w-20 sm:rounded-xl">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold leading-5 sm:text-sm">
                        {item.name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs text-gray-500">
                          الكمية: {item.quantity}
                        </span>

                        <span className="text-sm font-bold text-[#171717]">
                          {(
                            Number(item.price) * Number(item.quantity)
                          ).toLocaleString("ar-EG")}{" "}
                          <span className="text-xs font-medium">
                            {storeSettings.currency}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-2 sm:pt-4">
                <div className="flex items-center justify-between py-1.5 text-xs sm:py-2 sm:text-sm">
                  <span className="text-gray-500">المنتجات</span>
                  <span className="font-semibold">
                    {cartTotal.toLocaleString("ar-EG")}{" "}
                    {storeSettings.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 text-xs sm:py-2 sm:text-sm">
                  <span className="text-gray-500">الشحن</span>
                  <span
                    className={
                      distanceKm === null
                        ? "font-medium text-gray-400"
                        : "font-semibold"
                    }
                  >
                    {distanceKm === null
                      ? "حدد الموقع"
                      : `${shipping.toLocaleString("ar-EG")} ${storeSettings.currency}`}
                  </span>
                </div>

                {distanceKm !== null && (
                  <div className="mt-1 flex items-center justify-between rounded-lg bg-[#f0ede8] px-3 py-2 text-xs sm:mt-2 sm:rounded-xl sm:p-3">
                    <span className="text-gray-600">
                      <MapPin className="ml-1 inline h-3.5 w-3.5" />
                      المسافة من المتجر
                    </span>
                    <span className="font-bold text-[#171717]">
                      {distanceKm.toFixed(2)} كم
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3 sm:mt-4 sm:pt-5">
                  <span className="text-base font-bold sm:text-lg">
                    الإجمالي
                  </span>
                  <span className="text-lg font-bold sm:text-xl">
                    {finalTotal.toLocaleString("ar-EG")}{" "}
                    {storeSettings.currency}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  settingsLoading ||
                  !storeSettings.acceptOrders ||
                  latitude === null ||
                  longitude === null
                }
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6 sm:h-14 sm:text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                    جاري تسجيل الطلب...
                  </>
                ) : settingsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                    جاري التحميل...
                  </>
                ) : !storeSettings.acceptOrders ? (
                  "استقبال الطلبات متوقف"
                ) : latitude === null || longitude === null ? (
                  <>
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    حدد موقعك أولاً
                  </>
                ) : (
                  <>
                    تأكيد الطلب
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-[10px] leading-5 text-gray-500 sm:mt-4 sm:text-xs sm:leading-6">
                بعد تأكيد الطلب ستظهر فاتورتك وتفاصيل الطلب مباشرةً.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-medium sm:mb-2 sm:text-sm">
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#b89b72] sm:h-12 sm:px-4"
      />
    </div>
  );
}