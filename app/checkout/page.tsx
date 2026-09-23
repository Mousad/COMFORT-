"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";

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

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();

  const [storeSettings, setStoreSettings] =
    useState<StoreSettings>(defaultStoreSettings);

  const [settingsLoading, setSettingsLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const [whatsappCountryCode, setWhatsappCountryCode] =
    useState("+20");

  const [whatsappPhone, setWhatsappPhone] = useState("");

  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [orderNumber, setOrderNumber] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  /**
   * تحميل إعدادات المتجر من قاعدة البيانات
   */
  useEffect(() => {
    async function loadSettings() {
      try {
        setSettingsLoading(true);

        const response = await fetch("/api/settings", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "تعذر تحميل إعدادات المتجر"
          );
        }

        setStoreSettings({
          ...defaultStoreSettings,
          ...data.settings,
        });
      } catch (error) {
        console.error("Checkout settings error:", error);

        // نستخدم الإعدادات الافتراضية في حالة فشل الاتصال
        setStoreSettings(defaultStoreSettings);
      } finally {
        setSettingsLoading(false);
      }
    }

    loadSettings();
  }, []);

  /**
   * حساب تكلفة الشحن
   */
  const shipping = useMemo(() => {
    if (
      cartTotal >=
      Number(storeSettings.freeShippingMinimum)
    ) {
      return 0;
    }

    return Number(storeSettings.shippingCost);
  }, [
    cartTotal,
    storeSettings.freeShippingMinimum,
    storeSettings.shippingCost,
  ]);

  /**
   * الإجمالي النهائي
   */
  const finalTotal = useMemo(() => {
    return cartTotal + shipping;
  }, [cartTotal, shipping]);

  /**
   * المبلغ المتبقي للحصول على الشحن المجاني
   */
  const remainingForFreeShipping = useMemo(() => {
    const minimum = Number(
      storeSettings.freeShippingMinimum
    );

    return Math.max(0, minimum - cartTotal);
  }, [cartTotal, storeSettings.freeShippingMinimum]);

  /**
   * إرسال الطلب
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (settingsLoading) {
      setError("جاري تحميل إعدادات المتجر، حاول مرة أخرى.");
      return;
    }

    if (!storeSettings.acceptOrders) {
      setError(
        "عذراً، استقبال الطلبات متوقف حالياً. حاول مرة أخرى لاحقاً."
      );
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

    if (!whatsappPhone.trim()) {
      setError("من فضلك أدخل رقم الواتساب.");
      return;
    }

    if (!city.trim()) {
      setError("من فضلك أدخل المدينة.");
      return;
    }

    if (!address.trim()) {
      setError("من فضلك أدخل العنوان.");
      return;
    }

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
            whatsappPhone: whatsappPhone.trim(),
            city: city.trim(),
            address: address.trim(),
            notes: notes.trim(),
          },

          items: items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image || null,
          })),

          subtotal: cartTotal,
          shipping,
          total: finalTotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "حدث خطأ أثناء إنشاء الطلب"
        );
      }

      setOrderNumber(data.orderNumber || "");
      setOrderSuccess(true);

      clearCart();

      /**
       * لو الـ API رجّع رابط واتساب
       * نفتح الواتساب مباشرة
       */
      if (data.whatsappUrl) {
        window.location.href = data.whatsappUrl;
        return;
      }
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

  /**
   * حالة نجاح الطلب
   */
  if (orderSuccess) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] px-4 py-10 text-[#171717]"
      >
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[28px] bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Check className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="mb-3 text-2xl font-bold md:text-3xl">
              تم استلام طلبك بنجاح
            </h1>

            <p className="mb-6 text-gray-600">
              شكراً لك، تم تسجيل طلبك في متجر{" "}
              {storeSettings.storeName}.
            </p>

            {orderNumber && (
              <div className="mb-8 rounded-2xl bg-[#f0ede8] p-5">
                <p className="mb-2 text-sm text-gray-500">
                  رقم الطلب
                </p>

                <p className="text-xl font-bold tracking-wide">
                  {orderNumber}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#171717] px-5 font-medium text-white transition hover:opacity-90"
              >
                العودة للمتجر
              </Link>

              <Link
                href="/products"
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 font-medium transition hover:bg-gray-50"
              >
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /**
   * السلة فارغة
   */
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

            <h1 className="mb-3 text-2xl font-bold">
              السلة فارغة
            </h1>

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
    <main
      dir="rtl"
      className="min-h-screen bg-[#f0ede8] text-[#171717]"
    >
      {/* Header */}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-wide"
          >
            {storeSettings.storeName}
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للسلة
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm text-[#b89b72]">
            إتمام الطلب
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            بيانات الطلب
          </h1>
        </div>

        {!storeSettings.acceptOrders && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">
              استقبال الطلبات متوقف حالياً
            </p>

            <p className="mt-1 text-sm">
              لا يمكن إنشاء طلب جديد في الوقت الحالي.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_400px]"
        >
          {/* Customer Form */}
          <div className="space-y-6">
            <section className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0ede8]">
                  <User className="h-5 w-5 text-[#b89b72]" />
                </div>

                <div>
                  <h2 className="font-bold">
                    بيانات العميل
                  </h2>

                  <p className="text-sm text-gray-500">
                    أدخل بياناتك لاستلام الطلب
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="الاسم بالكامل"
                  required
                  value={customerName}
                  onChange={setCustomerName}
                  placeholder="اكتب اسمك"
                  icon={<User className="h-4 w-4" />}
                />

                <Input
                  label="رقم الهاتف"
                  required
                  value={phone}
                  onChange={setPhone}
                  placeholder="01xxxxxxxxx"
                  type="tel"
                  icon={<Phone className="h-4 w-4" />}
                />
              </div>
            </section>

            {/* WhatsApp */}
            <section className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>

                <div>
                  <h2 className="font-bold">
                    رقم الواتساب
                  </h2>

                  <p className="text-sm text-gray-500">
                    سنرسل تفاصيل الطلب على الواتساب
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    الدولة
                  </label>

                  <select
                    value={whatsappCountryCode}
                    onChange={(e) =>
                      setWhatsappCountryCode(e.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none transition focus:border-[#b89b72]"
                  >
                    {countries.map((country) => (
                      <option
                        key={country.code}
                        value={country.code}
                      >
                        {country.name} {country.code}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="رقم الواتساب"
                  required
                  value={whatsappPhone}
                  onChange={setWhatsappPhone}
                  placeholder="01xxxxxxxxx"
                  type="tel"
                />
              </div>
            </section>

            {/* Address */}
            <section className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0ede8]">
                  <MapPin className="h-5 w-5 text-[#b89b72]" />
                </div>

                <div>
                  <h2 className="font-bold">
                    عنوان التوصيل
                  </h2>

                  <p className="text-sm text-gray-500">
                    أين تريد استلام طلبك؟
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <Input
                  label="المدينة"
                  required
                  value={city}
                  onChange={setCity}
                  placeholder="مثال: القاهرة"
                />

                <TextArea
                  label="العنوان بالتفصيل"
                  required
                  value={address}
                  onChange={setAddress}
                  placeholder="المنطقة، الشارع، رقم المبنى، الشقة..."
                />

                <TextArea
                  label="ملاحظات الطلب"
                  value={notes}
                  onChange={setNotes}
                  placeholder="أي ملاحظات إضافية؟"
                />
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-[24px] bg-white p-5 shadow-sm md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0ede8]">
                  <Package className="h-5 w-5 text-[#b89b72]" />
                </div>

                <div>
                  <h2 className="font-bold">
                    ملخص الطلب
                  </h2>

                  <p className="text-sm text-gray-500">
                    {items.length} منتج
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="mb-6 space-y-4">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f0ede8]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        الكمية: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toLocaleString("ar-EG")}{" "}
                        {storeSettings.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-500">
                    المنتجات
                  </span>

                  <span className="font-medium">
                    {cartTotal.toLocaleString("ar-EG")}{" "}
                    {storeSettings.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-500">
                    الشحن
                  </span>

                  <span
                    className={
                      shipping === 0
                        ? "font-semibold text-green-600"
                        : "font-medium"
                    }
                  >
                    {shipping === 0
                      ? "مجاني"
                      : `${shipping.toLocaleString(
                          "ar-EG"
                        )} ${storeSettings.currency}`}
                  </span>
                </div>

                {remainingForFreeShipping > 0 &&
                  storeSettings.freeShippingMinimum > 0 && (
                    <div className="my-3 rounded-xl bg-[#f0ede8] p-3 text-center text-xs text-gray-600">
                      أضف{" "}
                      <span className="font-bold text-[#171717]">
                        {remainingForFreeShipping.toLocaleString(
                          "ar-EG"
                        )}{" "}
                        {storeSettings.currency}
                      </span>{" "}
                      للحصول على شحن مجاني
                    </div>
                  )}

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-5">
                  <span className="text-lg font-bold">
                    الإجمالي
                  </span>

                  <span className="text-xl font-bold">
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
                  !storeSettings.acceptOrders
                }
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري إرسال الطلب...
                  </>
                ) : settingsLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري التحميل...
                  </>
                ) : !storeSettings.acceptOrders ? (
                  "استقبال الطلبات متوقف"
                ) : (
                  <>
                    تأكيد الطلب
                    <Check className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-6 text-gray-500">
                عند تأكيد الطلب سيتم تسجيله في المتجر
                وإرسال تفاصيله للواتساب.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

/* =========================
   Input
========================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && (
          <span className="mr-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border border-gray-200 bg-white outline-none transition focus:border-[#b89b72] ${
            icon ? "pr-11 pl-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

/* =========================
   Textarea
========================= */

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && (
          <span className="mr-1 text-red-500">*</span>
        )}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 outline-none transition focus:border-[#b89b72]"
      />
    </div>
  );
}