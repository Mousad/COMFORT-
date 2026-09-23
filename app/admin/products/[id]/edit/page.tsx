
"use client";

import {
  ArrowRight,
  ImagePlus,
  Package,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const categories = [
  "برفيوم حريمي",
  "برفيوم رجالي",
  "برفيوم 50 ml",
  "Skin Care",
  "ماستر بوكس حريمي",
  "ماستر بوكس رجالي",
];

type ProductStatus = "available" | "low" | "out";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image?: string | null;
  description?: string | null;
};

function getStatus(stock: number): ProductStatus {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "available";
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) {
      setError("معرف المنتج غير صحيح.");
      setLoading(false);
      return;
    }

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/products/${productId}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await response.text();

          console.error(
            "Get product returned non-JSON:",
            {
              status: response.status,
              contentType,
              preview: text.slice(0, 500),
            }
          );

          throw new Error(
            `حدث خطأ في API جلب المنتج (${response.status})`
          );
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "حدث خطأ أثناء جلب المنتج"
          );
        }

        const product: Product = data.product;

        setName(product.name || "");
        setCategory(
          product.category || categories[0]
        );
        setPrice(
          String(product.price ?? "")
        );
        setStock(
          String(product.stock ?? "")
        );
        setImage(product.image || "");
        setDescription(
          product.description || ""
        );
      } catch (error) {
        console.error(
          "Load product error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "حصل خطأ أثناء تحميل المنتج."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "من فضلك أدخل اسم المنتج."
      );
      return;
    }

    if (!category.trim()) {
      setError(
        "من فضلك اختر تصنيف المنتج."
      );
      return;
    }

    if (
      price === "" ||
      Number(price) < 0 ||
      !Number.isFinite(Number(price))
    ) {
      setError(
        "من فضلك أدخل سعر صحيح."
      );
      return;
    }

    if (
      stock === "" ||
      Number(stock) < 0 ||
      !Number.isInteger(Number(stock))
    ) {
      setError(
        "من فضلك أدخل كمية صحيحة."
      );
      return;
    }

    if (!productId) {
      setError(
        "معرف المنتج غير صحيح."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/products/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            category,
            price: Number(price),
            stock: Number(stock),
            image: image.trim(),
            description: description.trim(),
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Update product returned non-JSON:",
          {
            status: response.status,
            contentType,
            preview: text.slice(0, 500),
          }
        );

        throw new Error(
          `حدث خطأ في API التعديل (${response.status})`
        );
      }

      const data = await response.json();

      console.log(
        "Update product response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء حفظ التعديلات."
        );
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء حفظ التعديلات."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f0ede8]"
      >
        <div className="rounded-2xl bg-white px-8 py-6 text-sm text-black/60 shadow-sm">
          جاري تحميل المنتج...
        </div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#f0ede8] text-[#171717]"
      >
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              !
            </div>

            <h1 className="text-xl font-bold">
              المنتج غير موجود
            </h1>

            <p className="mt-2 text-sm text-black/50">
              {error}
            </p>

            <Link
              href="/admin/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-semibold text-white"
            >
              <ArrowRight size={18} />
              العودة للمنتجات
            </Link>
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
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b89b72] text-white">
              <Package size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                تعديل المنتج
              </h1>

              <p className="text-sm text-black/50">
                تعديل بيانات المنتج
              </p>
            </div>
          </div>

          <Link
            href="/admin/products"
            className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-black/[0.03]"
          >
            <ArrowRight size={18} />
            العودة للمنتجات
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main */}
            <div className="space-y-6 lg:col-span-2">
              {/* Product Information */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-bold">
                  معلومات المنتج
                </h2>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      اسم المنتج
                    </label>

                    <input
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="مثال: Dior Sauvage"
                      className="w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 outline-none transition focus:border-[#b89b72]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      التصنيف
                    </label>

                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      className="w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 outline-none focus:border-[#b89b72]"
                    >
                      {categories.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      وصف المنتج
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value
                        )
                      }
                      placeholder="اكتب وصف المنتج..."
                      rows={5}
                      className="w-full resize-none rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 outline-none transition focus:border-[#b89b72]"
                    />
                  </div>
                </div>
              </div>

              {/* Price / Stock */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-bold">
                  السعر والمخزون
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Price */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      السعر بالجنيه
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value)
                      }
                      placeholder="مثال: 1500"
                      className="w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 outline-none focus:border-[#b89b72]"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      الكمية المتوفرة
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) =>
                        setStock(e.target.value)
                      }
                      placeholder="مثال: 20"
                      className="w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 outline-none focus:border-[#b89b72]"
                    />

                    <p className="mt-2 text-xs text-black/40">
                      الحالة تتغير تلقائياً حسب الكمية.
                    </p>
                  </div>
                </div>

                {/* Current Status */}
                {stock !== "" && (
                  <div className="mt-5 rounded-xl bg-[#f0ede8] p-4">
                    <p className="mb-2 text-sm font-medium">
                      حالة المنتج الحالية
                    </p>

                    {Number(stock) === 0 ? (
                      <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                        غير متوفر
                      </span>
                    ) : Number(stock) <= 5 ? (
                      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                        مخزون منخفض
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                        متوفر
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Side */}
            <div className="space-y-6">
              {/* Image */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-bold">
                  صورة المنتج
                </h2>

                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-[#fafafa]">
                  {image ? (
                    <img
                      src={image}
                      alt={name || "Product"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="text-center text-black/40">
                      <ImagePlus
                        size={40}
                        className="mx-auto mb-3"
                      />

                      <p className="text-sm">
                        لا توجد صورة
                      </p>
                    </div>
                  )}
                </div>

                <input
                  value={image}
                  onChange={(e) =>
                    setImage(e.target.value)
                  }
                  placeholder="https://..."
                  className="mt-4 w-full rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 text-left outline-none focus:border-[#b89b72]"
                  dir="ltr"
                />
              </div>

              {/* Save */}
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-3.5 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />

                  {saving
                    ? "جاري حفظ التعديلات..."
                    : "حفظ التعديلات"}
                </button>

                <Link
                  href="/admin/products"
                  className="mt-3 flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm text-black/60 transition hover:bg-black/[0.04]"
                >
                  إلغاء
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
