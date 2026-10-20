
"use client";

import {
  ArrowRight,
  Image as ImageIcon,
  Package,
  Save,
  X,
  Upload,
  Link as LinkIcon,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

const categories = [
  "عطور نسائية",
  "عطور رجالي",
  "عطور رجالية 50 مل",
  "عطور نسائية 50 مل",
  "Skin Care",
  "ماستر بوكس حريمي",
  "ماستر بوكس رجالي",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type ImageMode = "url" | "file";

type ApiResponse = {
  success?: boolean;
  image?: string;
  message?: string;
  error?: string;
};

async function readApiResponse(response: Response): Promise<ApiResponse> {
  const responseText = await response.text();

  if (!responseText.trim()) {
    throw new Error(
      `السيرفر رجّع استجابة فارغة (HTTP ${response.status}).`
    );
  }

  try {
    const data: unknown = JSON.parse(responseText);

    if (typeof data !== "object" || data === null) {
      throw new Error("صيغة الاستجابة غير صحيحة.");
    }

    return data as ApiResponse;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message !== "صيغة الاستجابة غير صحيحة."
    ) {
      console.error("Non-JSON API response:", {
        status: response.status,
        url: response.url,
        body: responseText.slice(0, 1500),
      });

      if (responseText.includes("Server action")) {
        throw new Error(
          "حدث خطأ في Next.js أثناء معالجة الطلب. أعد تحميل الصفحة، وإذا استمر الخطأ راجع سجل السيرفر."
        );
      }

      throw new Error(
        `السيرفر رجّع استجابة غير متوقعة (HTTP ${response.status}). راجع Console لمعرفة التفاصيل.`
      );
    }

    throw error;
  }
}

export default function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrl = useRef<string | null>(null);

  const requestedCategory = searchParams.get("category");

  const lockedCategory = categories.find(
    (category) => category.trim() === requestedCategory?.trim()
  );

  const isCategoryLocked = Boolean(lockedCategory);

  const [form, setForm] = useState({
    name: "",
    category: lockedCategory ?? categories[0],
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const [imageMode, setImageMode] = useState<ImageMode>("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (lockedCategory) {
      setForm((current) => ({
        ...current,
        category: lockedCategory,
      }));
    }
  }, [lockedCategory]);

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) {
        URL.revokeObjectURL(previewObjectUrl.current);
      }
    };
  }, []);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) setError("");
    if (field === "image") setImageError(false);
  }

  function clearSelectedFile() {
    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = null;
    }

    setSelectedFile(null);
    setLocalPreview("");
    setImageError(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("اختر صورة بصيغة JPG أو PNG أو WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("حجم الصورة يجب ألا يتجاوز 5 ميجابايت.");
      event.target.value = "";
      return;
    }

    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current);
    }

    const objectUrl = URL.createObjectURL(file);
    previewObjectUrl.current = objectUrl;

    setSelectedFile(file);
    setLocalPreview(objectUrl);
    setImageError(false);
    setError("");
  }

  async function uploadSelectedImage(): Promise<string> {
    if (!selectedFile) return form.image.trim();

    setUploading(true);

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", selectedFile);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: uploadForm,
      });

      const data = await readApiResponse(response);

      if (!response.ok || !data.success || typeof data.image !== "string") {
        throw new Error(
          data.message ||
            data.error ||
            `تعذر رفع الصورة (HTTP ${response.status}).`
        );
      }

      return data.image;
    } catch (err) {
      console.error("Upload image error:", err);

      throw err instanceof Error
        ? err
        : new Error("حدث خطأ أثناء رفع الصورة.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusyRef.current) return;

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
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError("من فضلك أدخل سعر صحيح.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isFinite(stock) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("من فضلك أدخل كمية المخزون بشكل صحيح.");
      return;
    }

    if (imageMode === "url" && form.image.trim()) {
      try {
        const url = new URL(form.image.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        setError("رابط الصورة غير صحيح. أدخل رابطاً يبدأ بـ https://");
        return;
      }
    }

    isBusyRef.current = true;
    setSaving(true);

    try {
      const image =
  imageMode === "file"
    ? await uploadSelectedImage()
    : form.image.trim();

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category: form.category.trim(),
          price,
          stock,
          image,
          description: form.description.trim(),
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            `حدث خطأ أثناء حفظ المنتج (HTTP ${response.status}).`
        );
      }

      const destination = lockedCategory
        ? `/admin/products?category=${encodeURIComponent(
            lockedCategory.trim()
          )}`
        : "/admin/products";

      router.push(destination);
      router.refresh();
    } catch (err) {
      console.error("Create product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "حصل خطأ أثناء حفظ المنتج. حاول مرة أخرى."
      );
    } finally {
      isBusyRef.current = false;
      setSaving(false);
    }
  }

  const isBusyRef = useRef(false);

  const previewImage =
    imageMode === "file" ? localPreview : form.image.trim();

  const productsUrl = lockedCategory
    ? `/admin/products?category=${encodeURIComponent(
        lockedCategory.trim()
      )}`
    : "/admin/products";

  const isBusy = saving || uploading;

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-[#f0ede8] text-[#171717]"
    >
      <header className="w-full min-w-0 max-w-full border-b border-black/10 bg-white">
        <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-3 px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href={productsUrl}
              aria-label="العودة للمنتجات"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 transition hover:bg-black/5 sm:h-11 sm:w-11"
            >
              <ArrowRight size={20} />
            </Link>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b89b72] text-white sm:h-11 sm:w-11">
              <Package size={22} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">
                إضافة منتج
              </h1>
              <p className="truncate text-xs text-black/50 sm:text-sm">
                أضف منتج جديد إلى المتجر
              </p>
            </div>
          </div>

          <Link
            href={productsUrl}
            className="hidden shrink-0 items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold transition hover:bg-black/5 sm:flex"
          >
            <X size={18} />
            إلغاء
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-5xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="w-full min-w-0 max-w-full space-y-5 sm:space-y-6"
        >
          {error && (
            <div
              role="alert"
              className="flex min-w-0 items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-4 text-sm text-red-700 sm:px-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                !
              </span>
              <p className="min-w-0 flex-1 break-words">{error}</p>
            </div>
          )}

          <div className="grid w-full min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="w-full min-w-0 max-w-full rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold">بيانات المنتج</h2>
                <p className="mt-1 text-sm text-black/50">
                  أدخل المعلومات الأساسية الخاصة بالمنتج
                </p>
              </div>

              <div className="w-full min-w-0 space-y-5">
                <div className="min-w-0">
                  <label
                    htmlFor="product-name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    اسم المنتج
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="مثال: Dior Sauvage"
                    className="block h-12 w-full min-w-0 max-w-full rounded-xl border border-black/10 bg-[#faf9f7] px-4 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="product-category"
                    className="mb-2 block text-sm font-semibold"
                  >
                    القسم
                  </label>

                  {isCategoryLocked && lockedCategory ? (
                    <div className="flex min-h-12 min-w-0 items-center justify-between gap-2 rounded-xl border border-[#b89b72]/40 bg-[#b89b72]/10 px-3 py-3 sm:px-4">
                      <span className="min-w-0 break-words text-sm font-semibold">
                        {lockedCategory}
                      </span>
                      <span className="shrink-0 rounded-full bg-[#b89b72]/20 px-2 py-1 text-xs font-medium text-[#765d3d]">
                        قسم محدد
                      </span>
                    </div>
                  ) : (
                    <select
                      id="product-category"
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="block h-12 w-full min-w-0 max-w-full rounded-xl border border-black/10 bg-[#faf9f7] px-3 text-sm outline-none transition focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15 sm:px-4"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label
                      htmlFor="product-price"
                      className="mb-2 block text-sm font-semibold"
                    >
                      السعر
                    </label>
                    <div className="relative min-w-0">
                      <input
                        id="product-price"
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={form.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        placeholder="2500"
                        className="block h-12 w-full min-w-0 rounded-xl border border-black/10 bg-[#faf9f7] px-4 pl-14 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                      />
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-black/40">
                        جنيه
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label
                      htmlFor="product-stock"
                      className="mb-2 block text-sm font-semibold"
                    >
                      المخزون
                    </label>
                    <input
                      id="product-stock"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={form.stock}
                      onChange={(e) => handleChange("stock", e.target.value)}
                      placeholder="15"
                      className="block h-12 w-full min-w-0 rounded-xl border border-black/10 bg-[#faf9f7] px-4 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                    />
                    <p className="mt-2 break-words text-xs leading-5 text-black/40">
                      0 = غير متوفر، من 1 إلى 5 = مخزون منخفض
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold">صورة المنتج</h3>
                    <p className="mt-1 text-xs leading-5 text-black/45">
                      أضف الصورة من جهازك أو استخدم رابط صورة موجود.
                    </p>
                  </div>

                  <div className="grid min-w-0 grid-cols-2 gap-2 rounded-xl bg-[#f0ede8] p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setImageMode("url");
                        clearSelectedFile();
                        setImageError(false);
                        setError("");
                      }}
                      className={`flex min-w-0 min-h-11 items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                        imageMode === "url"
                          ? "bg-white text-[#765d3d] shadow-sm"
                          : "text-black/55 hover:text-black"
                      }`}
                    >
                      <LinkIcon size={16} className="shrink-0" />
                      <span className="min-w-0">رابط صورة</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setImageMode("file");
                        setImageError(false);
                        setError("");
                      }}
                      className={`flex min-w-0 min-h-11 items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold transition sm:gap-2 sm:px-3 sm:text-sm ${
                        imageMode === "file"
                          ? "bg-white text-[#765d3d] shadow-sm"
                          : "text-black/55 hover:text-black"
                      }`}
                    >
                      <Upload size={16} className="shrink-0" />
                      <span className="min-w-0">من الجهاز</span>
                    </button>
                  </div>

                  {imageMode === "url" ? (
                    <div className="mt-4 min-w-0">
                      <label
                        htmlFor="product-image"
                        className="mb-2 block text-sm font-medium"
                      >
                        رابط الصورة
                      </label>
                      <input
                        id="product-image"
                        type="url"
                        value={form.image}
                        onChange={(e) => handleChange("image", e.target.value)}
                        placeholder="https://example.com/product.jpg"
                        dir="ltr"
                        className="block h-12 w-full min-w-0 max-w-full rounded-xl border border-black/10 bg-[#faf9f7] px-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15 sm:px-4"
                      />
                      <p className="mt-2 break-words text-xs leading-5 text-black/40">
                        استخدم رابط الصورة المباشر، وليس رابط صفحة Pinterest.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 min-w-0">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="sr-only"
                        id="product-image-file"
                      />

                      {!selectedFile ? (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex min-h-40 w-full min-w-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#b89b72]/50 bg-[#faf9f7] p-4 text-center transition hover:border-[#b89b72] hover:bg-[#b89b72]/5 sm:p-5"
                        >
                          <span className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#b89b72]/15 text-[#8b6f47]">
                            <Upload size={23} />
                          </span>
                          <span className="text-sm font-semibold">
                            اضغط لاختيار صورة
                          </span>
                          <span className="mt-2 text-xs leading-5 text-black/45">
                            JPG أو PNG أو WebP · حتى 5 ميجابايت
                          </span>
                        </button>
                      ) : (
                        <div className="flex min-w-0 items-center gap-2 rounded-xl border border-black/10 bg-[#faf9f7] p-2 sm:gap-3 sm:p-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f0ede8] sm:h-16 sm:w-16">
                            <img
                              src={localPreview}
                              alt="معاينة الصورة المختارة"
                              className="block h-full w-full object-contain"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {selectedFile.name}
                            </p>
                            <p className="mt-1 text-xs text-black/45">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                              ميجابايت
                            </p>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-2 text-xs font-semibold text-[#8b6f47] hover:underline"
                            >
                              اختيار صورة أخرى
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={clearSelectedFile}
                            aria-label="إزالة الصورة المختارة"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      )}

                      <p className="mt-2 break-words text-xs leading-5 text-black/45">
                        ستُرفع الصورة عند حفظ المنتج، ويجب أن تكون خدمة رفع الصور مفعّلة.
                      </p>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="product-description"
                    className="mb-2 block text-sm font-semibold"
                  >
                    وصف المنتج
                  </label>
                  <textarea
                    id="product-description"
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="اكتب وصفاً مختصراً للمنتج..."
                    rows={6}
                    className="block w-full min-w-0 max-w-full resize-y rounded-xl border border-black/10 bg-[#faf9f7] px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/15"
                  />
                </div>
              </div>
            </section>

            <aside className="flex w-full min-w-0 flex-col gap-5 sm:gap-6">
              <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                <div className="border-b border-black/10 px-4 py-4 sm:px-5">
                  <h2 className="font-bold">معاينة المنتج</h2>
                </div>

                <div className="min-w-0 p-4 sm:p-5">
                  <div className="relative aspect-square w-full min-w-0 max-w-full overflow-hidden rounded-2xl bg-[#f0ede8]">
                    {previewImage && !imageError ? (
                      <img
                        key={previewImage}
                        src={previewImage}
                        alt={form.name || "صورة المنتج"}
                        className="absolute inset-0 block h-full w-full object-contain"
                        onError={() => setImageError(true)}
                        onLoad={() => setImageError(false)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center text-black/30">
                        <ImageIcon size={42} strokeWidth={1.5} />
                        <span className="text-sm">
                          {imageError ? "تعذر تحميل الصورة" : "صورة المنتج"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 min-w-0">
                    <p className="break-words text-xs text-black/40">
                      {form.category}
                    </p>
                    <h3 className="mt-1 break-words text-lg font-bold">
                      {form.name || "اسم المنتج"}
                    </h3>

                    <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
                      <span className="break-words font-bold text-[#b89b72]">
                        {form.price !== ""
                          ? `${Number(form.price).toLocaleString("ar-EG")} جنيه`
                          : "السعر"}
                      </span>
                      <span className="max-w-full rounded-full bg-black/5 px-3 py-1 text-xs text-black/50">
                        المخزون: {form.stock || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="w-full min-w-0 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="font-bold">حالة المنتج</h2>

                <div className="mt-4 min-w-0 rounded-xl bg-[#f0ede8] p-3 sm:p-4">
                  {form.stock === "" ? (
                    <p className="break-words text-sm leading-6 text-black/50">
                      أدخل كمية المخزون لمعرفة الحالة
                    </p>
                  ) : Number(form.stock) <= 0 ? (
                    <>
                      <span className="inline-flex max-w-full rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                        غير متوفر
                      </span>
                      <p className="mt-2 text-xs leading-5 text-black/40">
                        المخزون يساوي صفر.
                      </p>
                    </>
                  ) : Number(form.stock) <= 5 ? (
                    <>
                      <span className="inline-flex max-w-full rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700">
                        مخزون منخفض
                      </span>
                      <p className="mt-2 text-xs leading-5 text-black/40">
                        يفضل إعادة تخزين المنتج قريباً.
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex max-w-full rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                        متوفر
                      </span>
                      <p className="mt-2 text-xs leading-5 text-black/40">
                        المنتج متوفر في المخزون.
                      </p>
                    </>
                  )}
                </div>
              </section>
            </aside>
          </div>

          <div className="flex w-full min-w-0 flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={productsUrl}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 text-sm font-semibold transition hover:bg-black/5 sm:w-auto"
            >
              <X size={18} />
              إلغاء
            </Link>

            <button
              type="submit"
              disabled={isBusy}
              className="flex h-12 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-7"
            >
              {isBusy ? (
                <LoaderCircle size={18} className="shrink-0 animate-spin" />
              ) : (
                <Save size={18} className="shrink-0" />
              )}

              <span className="truncate">
                {uploading
                  ? "جاري رفع الصورة..."
                  : saving
                    ? "جاري الحفظ..."
                    : "حفظ المنتج"}
              </span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
