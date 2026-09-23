"use client";

import {
  Check,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Settings,
  ShoppingBag,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type StoreSettings = {
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

const defaultSettings: StoreSettings = {
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

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<StoreSettings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // =========================================
  // جلب الإعدادات من قاعدة البيانات
  // =========================================

  async function loadSettings() {
    try {
      setLoading(true);

      const response = await fetch("/api/settings", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "فشل تحميل الإعدادات"
        );
      }

      setSettings({
        ...defaultSettings,
        ...data.settings,
      });
    } catch (error) {
      console.error(
        "Failed to load store settings:",
        error
      );

      alert(
        "حدث خطأ أثناء تحميل إعدادات المتجر"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  // =========================================
  // تحديث قيمة
  // =========================================

  function updateSetting<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  }

  // =========================================
  // حفظ الإعدادات في قاعدة البيانات
  // =========================================

  async function handleSave() {
    try {
      setSaving(true);
      setSaved(false);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "فشل حفظ الإعدادات"
        );
      }

      setSettings({
        ...defaultSettings,
        ...data.settings,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Failed to save store settings:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حفظ الإعدادات"
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // استعادة الإعدادات الافتراضية
  // =========================================

  async function handleReset() {
    const confirmed = window.confirm(
      "هل أنت متأكد من استعادة الإعدادات الافتراضية؟"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setSaved(false);

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(defaultSettings),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "فشل استعادة الإعدادات الافتراضية"
        );
      }

      setSettings({
        ...defaultSettings,
        ...data.settings,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Failed to reset store settings:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء استعادة الإعدادات"
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // Loading
  // =========================================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] p-6"
      >
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw
              size={28}
              className="animate-spin text-[#b89b72]"
            />

            <p className="text-sm font-bold text-black/45">
              جاري تحميل إعدادات المتجر...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f0ede8] text-[#171717]"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f0ede8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-black/45">
              <Link
                href="/admin"
                className="transition hover:text-[#b89b72]"
              >
                لوحة التحكم
              </Link>

              <span>/</span>

              <span>الإعدادات</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b89b72]/15 text-[#8b6f47]">
                <Settings size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-black sm:text-3xl">
                  إعدادات المتجر
                </h1>

                <p className="mt-1 text-sm text-black/45">
                  إدارة بيانات المتجر والشحن والتواصل
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold transition hover:border-[#b89b72] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  saving ? "animate-spin" : ""
                }
              />

              <span>استعادة الافتراضي</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-bold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw
                  size={17}
                  className="animate-spin"
                />
              ) : saved ? (
                <Check size={17} />
              ) : (
                <Save size={17} />
              )}

              <span>
                {saving
                  ? "جاري الحفظ..."
                  : saved
                  ? "تم الحفظ"
                  : "حفظ التغييرات"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Store Information */}
          <SettingsCard
            icon={<Store size={20} />}
            title="بيانات المتجر"
            description="المعلومات الأساسية التي تظهر للعملاء"
          >
            <div className="space-y-5">
              <InputField
                label="اسم المتجر"
                value={settings.storeName}
                onChange={(value) =>
                  updateSetting(
                    "storeName",
                    value
                  )
                }
                placeholder="مثال: COMFORT KEEPERS"
              />

              <TextAreaField
                label="وصف المتجر"
                value={settings.storeDescription}
                onChange={(value) =>
                  updateSetting(
                    "storeDescription",
                    value
                  )
                }
                placeholder="اكتب وصفًا قصيرًا للمتجر..."
              />
            </div>
          </SettingsCard>

          {/* Contact */}
          <SettingsCard
            icon={<Phone size={20} />}
            title="بيانات التواصل"
            description="أرقام التواصل مع العملاء"
          >
            <div className="space-y-5">
              <InputField
                label="رقم الهاتف"
                value={settings.phone}
                onChange={(value) =>
                  updateSetting("phone", value)
                }
                placeholder="01xxxxxxxxx"
                dir="ltr"
              />

              <InputField
                label="رقم WhatsApp"
                value={settings.whatsapp}
                onChange={(value) =>
                  updateSetting(
                    "whatsapp",
                    value
                  )
                }
                placeholder="201xxxxxxxxx"
                dir="ltr"
              />

              <div className="rounded-xl bg-[#faf9f7] p-4">
                <div className="flex items-center gap-2">
                  <MessageCircle
                    size={17}
                    className="text-[#8b6f47]"
                  />

                  <p className="text-sm font-bold">
                    رقم WhatsApp
                  </p>
                </div>

                <p className="mt-2 text-xs leading-6 text-black/45">
                  استخدم الرقم بالصيغة الدولية بدون علامة +
                  عند استخدام WhatsApp.
                  <br />
                  مثال: 201xxxxxxxxx
                </p>
              </div>
            </div>
          </SettingsCard>

          {/* Location */}
          <SettingsCard
            icon={<MapPin size={20} />}
            title="موقع المتجر"
            description="العنوان المستخدم في بيانات المتجر"
          >
            <TextAreaField
              label="العنوان"
              value={settings.address}
              onChange={(value) =>
                updateSetting(
                  "address",
                  value
                )
              }
              placeholder="مثال: القاهرة، مصر"
              rows={4}
            />
          </SettingsCard>

          {/* Shipping */}
          <SettingsCard
            icon={<ShoppingBag size={20} />}
            title="إعدادات الشحن"
            description="تحديد تكلفة الشحن والشحن المجاني"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="تكلفة الشحن"
                value={settings.shippingCost}
                onChange={(value) =>
                  updateSetting(
                    "shippingCost",
                    value
                  )
                }
                suffix={settings.currency}
              />

              <NumberField
                label="الشحن المجاني يبدأ من"
                value={
                  settings.freeShippingMinimum
                }
                onChange={(value) =>
                  updateSetting(
                    "freeShippingMinimum",
                    value
                  )
                }
                suffix={settings.currency}
              />
            </div>

            <div className="mt-5 rounded-xl border border-[#b89b72]/20 bg-[#b89b72]/10 p-4">
              <p className="text-sm font-bold text-[#8b6f47]">
                إعداد الشحن الحالي
              </p>

              <p className="mt-2 text-sm leading-7 text-black/55">
                الشحن بقيمة{" "}
                <strong>
                  {settings.shippingCost.toLocaleString(
                    "ar-EG"
                  )}{" "}
                  {settings.currency}
                </strong>{" "}
                للطلبات الأقل من{" "}
                <strong>
                  {settings.freeShippingMinimum.toLocaleString(
                    "ar-EG"
                  )}{" "}
                  {settings.currency}
                </strong>
                ، وبعدها يصبح الشحن مجانيًا.
              </p>
            </div>
          </SettingsCard>

          {/* Currency */}
          <SettingsCard
            icon={
              <span className="text-lg font-black">
                ج
              </span>
            }
            title="العملة"
            description="العملة المستخدمة في عرض الأسعار"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-bold">
                العملة
              </span>

              <select
                value={settings.currency}
                onChange={(e) =>
                  updateSetting(
                    "currency",
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 text-sm outline-none transition focus:border-[#b89b72]"
              >
                <option value="جنيه">
                  جنيه مصري
                </option>

                <option value="دولار">
                  دولار أمريكي
                </option>

                <option value="ريال">
                  ريال سعودي
                </option>

                <option value="درهم">
                  درهم إماراتي
                </option>
              </select>
            </label>
          </SettingsCard>

          {/* Social */}
          <SettingsCard
            icon={<Store size={20} />}
            title="حسابات التواصل الاجتماعي"
            description="روابط صفحات المتجر"
          >
            <div className="space-y-5">
              <InputField
                label="Instagram"
                value={settings.instagram}
                onChange={(value) =>
                  updateSetting(
                    "instagram",
                    value
                  )
                }
                placeholder="https://instagram.com/..."
                dir="ltr"
              />

              <InputField
                label="Facebook"
                value={settings.facebook}
                onChange={(value) =>
                  updateSetting(
                    "facebook",
                    value
                  )
                }
                placeholder="https://facebook.com/..."
                dir="ltr"
              />
            </div>
          </SettingsCard>

          {/* Orders */}
          <SettingsCard
            icon={<ShoppingBag size={20} />}
            title="إعدادات الطلبات"
            description="التحكم في استقبال الطلبات"
          >
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf9f7] p-4">
              <div>
                <p className="font-bold">
                  استقبال الطلبات
                </p>

                <p className="mt-1 text-xs leading-5 text-black/45">
                  عند إيقاف هذا الخيار لن يستطيع العملاء
                  إنشاء طلبات جديدة.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateSetting(
                    "acceptOrders",
                    !settings.acceptOrders
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  settings.acceptOrders
                    ? "bg-[#b89b72]"
                    : "bg-black/15"
                }`}
                aria-label="تفعيل أو إيقاف استقبال الطلبات"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    settings.acceptOrders
                      ? "right-1"
                      : "right-6"
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  settings.acceptOrders
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <span className="text-black/55">
                {settings.acceptOrders
                  ? "المتجر يستقبل الطلبات"
                  : "استقبال الطلبات متوقف"}
              </span>
            </div>
          </SettingsCard>
        </div>

        {/* Mobile actions */}
        <div className="mt-6 flex gap-3 sm:hidden">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white text-sm font-bold disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                saving ? "animate-spin" : ""
              }
            />

            الافتراضي
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#171717] text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw
                size={17}
                className="animate-spin"
              />
            ) : saved ? (
              <Check size={17} />
            ) : (
              <Save size={17} />
            )}

            {saved ? "تم الحفظ" : "حفظ"}
          </button>
        </div>

        {/* Current settings preview */}
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede8] text-[#8b6f47]">
              <Settings size={18} />
            </div>

            <div>
              <h2 className="font-black">
                ملخص الإعدادات
              </h2>

              <p className="mt-1 text-xs text-black/40">
                يتم حفظ الإعدادات الآن في قاعدة بيانات
                المتجر.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryItem
              label="اسم المتجر"
              value={
                settings.storeName ||
                "غير محدد"
              }
            />

            <SummaryItem
              label="الشحن"
              value={`${settings.shippingCost.toLocaleString(
                "ar-EG"
              )} ${settings.currency}`}
            />

            <SummaryItem
              label="الشحن المجاني"
              value={`${settings.freeShippingMinimum.toLocaleString(
                "ar-EG"
              )} ${settings.currency}`}
            />

            <SummaryItem
              label="الطلبات"
              value={
                settings.acceptOrders
                  ? "مفتوحة"
                  : "متوقفة"
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================
   Settings Card
========================================= */

function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ede8] text-[#8b6f47]">
          {icon}
        </div>

        <div>
          <h2 className="font-black">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-black/40">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================
   Input
========================================= */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        dir={dir}
        className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 text-sm outline-none transition focus:border-[#b89b72]"
      />
    </label>
  );
}

/* =========================================
   Textarea
========================================= */

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#b89b72]"
      />
    </label>
  );
}

/* =========================================
   Number
========================================= */

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) =>
            onChange(
              Number(e.target.value) || 0
            )
          }
          className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 pl-16 text-sm outline-none transition focus:border-[#b89b72]"
        />

        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-black/40">
          {suffix}
        </span>
      </div>
    </label>
  );
}

/* =========================================
   Summary
========================================= */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#faf9f7] p-3">
      <p className="text-[11px] text-black/40">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black">
        {value}
      </p>
    </div>
  );
}