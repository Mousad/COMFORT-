"use client";

import {
  ArrowRight,
  Image as ImageIcon,
  Package,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const categories = [
  "برفيوم حريمي",
  "برفيوم رجالي",
  "برفيوم 50 ml",
  "Skin Care",
  "ماستر بوكس حريمي",
  "ماستر بوكس رجالي",
];

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "برفيوم حريمي",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name) {
      setError("من فضلك اكتب اسم المنتج.");
      return;
    }

    if (!form.category) {
      setError("من فضلك اختر القسم.");
      return;
    }

    if (
      form.price === "" ||
      Number.isNaN(price) ||
      price < 0
    ) {
      setError("من فضلك أدخل سعر صحيح.");
      return;
    }

    if (
      form.stock === "" ||
      Number.isNaN(stock) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("من فضلك أدخل كمية المخزون بشكل صحيح.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category: form.category,
          price,
          stock,
          image: form.image.trim(),
          description: form.description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "حدث خطأ أثناء حفظ المنتج."
        );
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Create product error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء حفظ المنتج. حاول مرة أخرى."
      );

      setSaving(false);
    }
  }

  const previewImage = form.image.trim();

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f0ede8] text-[#171717]"
    >
      {/* Header */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white transition hover:bg-black/5"
              aria-label="العودة للمنتجات"
            >
              <ArrowRight size={20} />
            </Link>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b89b72] text-white">
              <Package size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                إضافة منتج
              </h1>

              <p className="text-sm text-black/50">
                أضف منتج جديد إلى المتجر
              </p>
            </div>
          </div>

          <Link
            href="/admin/products"
            className="hidden items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-black/5 sm:flex"
          >
            <X size={18} />
            إلغاء
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                !
              </div>

              <p>{error}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Product Information */}
            <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold">
                  بيانات المنتج
                </h2>

                <p className="mt-1 text-sm text-black/50">
                  أدخل المعلومات الأساسية الخاصة بالمنتج
                </p>
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    اسم المنتج
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      handleChange(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="مثال: Dior Sauvage"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    القسم
                  </label>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      handleChange(
                        "category",
                        e.target.value
                      )
                    }
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 text-sm outline-none transition focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price + Stock */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      السعر
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.price}
                        onChange={(e) =>
                          handleChange(
                            "price",
                            e.target.value
                          )
                        }
                        placeholder="2500"
                        className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 pl-16 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                      />

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/40">
                        جنيه
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      المخزون
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) =>
                        handleChange(
                          "stock",
                          e.target.value
                        )
                      }
                      placeholder="15"
                      className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                    />

                    <p className="mt-2 text-xs text-black/40">
                      0 = غير متوفر، من 1 إلى 5 = مخزون منخفض
                    </p>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    رابط صورة المنتج
                  </label>

                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) =>
                      handleChange(
                        "image",
                        e.target.value
                      )
                    }
                    placeholder="https://example.com/product.jpg"
                    dir="ltr"
                    className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                  />

                  <p className="mt-2 text-xs text-black/40">
                    استخدم رابط مباشر للصورة، وليس رابط صفحة Pinterest.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    وصف المنتج
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleChange(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="اكتب وصف مختصر للمنتج..."
                    rows={6}
                    className="w-full resize-none rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                  />
                </div>
              </div>
            </section>

            {/* Preview */}
            <aside className="space-y-6">
              <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                <div className="border-b border-black/10 px-5 py-4">
                  <h2 className="font-bold">
                    معاينة المنتج
                  </h2>
                </div>

                <div className="p-5">
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#f0ede8]">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={form.name || "صورة المنتج"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 text-black/30">
                        <ImageIcon
                          size={42}
                          strokeWidth={1.5}
                        />

                        <span className="text-sm">
                          صورة المنتج
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-xs text-black/40">
                      {form.category}
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                      {form.name || "اسم المنتج"}
                    </h3>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-bold text-[#b89b72]">
                        {form.price
                          ? `${Number(
                              form.price
                            ).toLocaleString(
                              "ar-EG"
                            )} جنيه`
                          : "السعر"}
                      </span>

                      <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/50">
                        المخزون:{" "}
                        {form.stock || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Status */}
              <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <h2 className="font-bold">
                  حالة المنتج
                </h2>

                <div className="mt-4 rounded-xl bg-[#f0ede8] p-4">
                  {form.stock === "" ? (
                    <p className="text-sm text-black/50">
                      أدخل كمية المخزون لمعرفة الحالة
                    </p>
                  ) : Number(form.stock) <= 0 ? (
                    <div>
                      <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                        غير متوفر
                      </span>

                      <p className="mt-2 text-xs text-black/40">
                        المخزون يساوي صفر.
                      </p>
                    </div>
                  ) : Number(form.stock) <= 5 ? (
                    <div>
                      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                        مخزون منخفض
                      </span>

                      <p className="mt-2 text-xs text-black/40">
                        يفضل إعادة تخزين المنتج قريباً.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                        متوفر
                      </span>

                      <p className="mt-2 text-xs text-black/40">
                        المنتج متوفر في المخزون.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 text-sm font-semibold transition hover:bg-black/5"
            >
              <X size={18} />
              إلغاء
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#171717] px-7 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />

              {saving
                ? "جاري الحفظ..."
                : "حفظ المنتج"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}