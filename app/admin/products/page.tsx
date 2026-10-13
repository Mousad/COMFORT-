
"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  Folder,
  FolderOpen,
  Layers3,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
  Edit3,
  Eye,
} from "lucide-react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  isAvailable?: boolean;
};


const categories = [
  "عطور نسائية",
  "عطور رجالية",
  "عطور رجالية 50 مل",
  "Skin Care",
  "عطور نسائية 50 مل",
  
  
];


const normalizeCategory = (value: string) =>
  value.trim().replace(/\s+/g, " ");

function getStatus(stock: number): ProductStatus {
  if (stock <= 0) return "out";
  if (stock <= 5) return "low";
  return "available";
}

function statusText(status: ProductStatus) {
  if (status === "available") return "متوفر";
  if (status === "low") return "مخزون منخفض";
  return "غير متوفر";
}

function categoryHref(category: string) {
  return `/admin/products?category=${encodeURIComponent(
    normalizeCategory(category)
  )}`;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [deleteProduct, setDeleteProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  // استعادة القسم المحدد من الرابط بعد تحديث الصفحة.
  useEffect(() => {
    const requestedCategory = searchParams.get("category");

    if (!requestedCategory) {
      setSelectedCategory(null);
      return;
    }

    if (requestedCategory === "الكل") {
      setSelectedCategory("الكل");
      return;
    }

    const matchedCategory = categories.find(
      (item) =>
        normalizeCategory(item) ===
        normalizeCategory(requestedCategory)
    );

    if (matchedCategory) {
      setSelectedCategory(normalizeCategory(matchedCategory));
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams]);

  // تحميل المنتجات من قاعدة البيانات.
  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error("Products API returned non-JSON:", {
          status: response.status,
          contentType,
          preview: responseText.slice(0, 500),
        });

        throw new Error(
          `API المنتجات رجّع استجابة غير صحيحة (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "حدث خطأ أثناء جلب المنتجات"
        );
      }

      setProducts(
        Array.isArray(data.products) ? data.products : []
      );
    } catch (err) {
      console.error("Load products error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء جلب المنتجات"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // عرض الأقسام المعروفة، مع الاحتفاظ بأي أقسام موجودة
  // فعلياً في قاعدة البيانات وغير مضافة إلى القائمة الثابتة.
  const folderCategories = useMemo(() => {
    const uniqueCategories = new Map<string, string>();

    categories.forEach((item) => {
      const normalized = normalizeCategory(item);

      if (normalized && !uniqueCategories.has(normalized)) {
        uniqueCategories.set(normalized, normalized);
      }
    });

    products.forEach((product) => {
      const normalized = normalizeCategory(product.category || "");

      if (normalized && !uniqueCategories.has(normalized)) {
        uniqueCategories.set(normalized, normalized);
      }
    });

    return Array.from(uniqueCategories.values());
  }, [products]);

  // حساب عدد المنتجات داخل كل فولدر.
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    folderCategories.forEach((folder) => {
      counts[folder] = products.filter(
        (product) =>
          normalizeCategory(product.category || "") === folder
      ).length;
    });

    return counts;
  }, [products, folderCategories]);

  // البحث داخل القسم المحدد، أو داخل كل المنتجات.
  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "الكل" ||
        (selectedCategory !== null &&
          normalizeCategory(product.category || "") ===
            selectedCategory);

      const matchesSearch =
        !searchValue ||
        (product.name || "").toLowerCase().includes(searchValue) ||
        normalizeCategory(product.category || "")
          .toLowerCase()
          .includes(searchValue);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  // فتح فولدر القسم.
  function openCategory(category: string) {
    setSearch("");
    setSelectedCategory(category);
    router.push(categoryHref(category));
  }

  // الرجوع إلى صفحة الفولدرات.
  function backToFolders() {
    setSearch("");
    setSelectedCategory(null);
    router.push("/admin/products");
  }

  // رابط إضافة منتج يحدد القسم الحالي تلقائياً.
  const newProductHref =
    selectedCategory && selectedCategory !== "الكل"
      ? `/admin/products/new?category=${encodeURIComponent(
          selectedCategory
        )}`
      : "/admin/products/new";

  // حذف المنتج.
  async function handleDelete() {
    if (!deleteProduct) return;

    const productId = deleteProduct.id;

    try {
      setActionLoading(productId);
      setError("");

      const response = await fetch(
        `/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error("Delete API returned non-JSON:", {
          status: response.status,
          contentType,
          preview: responseText.slice(0, 500),
        });

        throw new Error(
          `حدث خطأ في API الحذف (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "لم يتم حذف المنتج");
      }

      setProducts((current) =>
        current.filter((item) => item.id !== productId)
      );

      setDeleteProduct(null);
    } catch (err) {
      console.error("Delete product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء حذف المنتج"
      );
    } finally {
      setActionLoading(null);
    }
  }

  // تغيير حالة توفر المنتج.
  async function toggleAvailability(product: Product) {
    try {
      setActionLoading(product.id);
      setError("");

      const newStock = product.stock > 0 ? 0 : 10;

      const response = await fetch(
        `/api/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            stock: newStock,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error("Toggle API returned non-JSON:", {
          status: response.status,
          contentType,
          preview: responseText.slice(0, 500),
        });

        throw new Error(
          `API تحديث المنتج رجّع استجابة غير صحيحة (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "حدث خطأ أثناء تحديث حالة المنتج"
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                stock: newStock,
                status: getStatus(newStock),
                isAvailable: newStock > 0,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Toggle availability error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء تحديث المنتج"
      );
    } finally {
      setActionLoading(null);
    }
  }

  const availableProducts = filteredProducts.filter(
    (product) => product.stock > 0
  ).length;

  const lowProducts = filteredProducts.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outProducts = filteredProducts.filter(
    (product) => product.stock <= 0
  ).length;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F0EDE8] text-[#29251F]"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E7E0D5] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
           <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
  <img
    src="https://i.pinimg.com/736x/67/19/bf/6719bf1f956e3f0d2400c5e679ddabe2.jpg"
    alt="Comfort Keepers"
    className="h-full w-full object-contain"
  />
</div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold sm:text-xl">
                إدارة المنتجات
              </h1>

             
            </div>
          </div>

          <Link
            href={newProductHref}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl  px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8B6F47] sm:px-5"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">إضافة منتج</span>
            <span className="sm:hidden">إضافة</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-2 transition hover:bg-red-100"
              aria-label="إغلاق التنبيه"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Folders landing page */}
        {selectedCategory === null ? (
          <section>
            <div className="mb-7 overflow-hidden rounded-3xl bg-[#29251F] p-6 text-white sm:p-9">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm text-[#D9C4A4]">
                    <Sparkles size={17} />
                    <span>مساحة تنظيم المنتجات</span>
                  </div>

                  <h2 className="text-2xl font-bold sm:text-3xl">
                    أقسام متجرك
                  </h2>

                  <p className="mt-3 max-w-lg text-sm leading-7 text-white/65">
                    اختار المجلد المناسب للوصول إلى منتجات القسم
                    وإدارتها بسهولة.
                  </p>
                </div>

                <div className="flex h-16 w-16 shrink-0 items-center justify-center self-start rounded-2xl border border-white/10 bg-white/5 sm:h-20 sm:w-20">
                  <Layers3
                    size={38}
                    strokeWidth={1.4}
                    className="text-[#D9C4A4]"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-sm">
                <span className="rounded-full bg-white/10 px-4 py-2 text-white/90">
                  {folderCategories.length} قسم
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-white/90">
                  {loading
                    ? "جاري تحميل المنتجات..."
                    : `${products.length} منتج في المتجر`}
                </span>
              </div>
            </div>

            {/* All products folder */}
            <button
              type="button"
              onClick={() => openCategory("الكل")}
              className="group mb-5 flex w-full items-center gap-4 rounded-2xl border border-[#E5D8C5] bg-white p-4 text-right shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#B89B72] hover:shadow-md sm:p-5"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#29251F] text-[#E7D5B7] transition group-hover:bg-[#8B6F47]">
                <Layers3 size={27} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[#29251F]">
                  كل المنتجات
                </h3>

                <p className="mt-1 text-sm text-[#8A8175]">
                  عرض وإدارة جميع منتجات المتجر
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-[#F0EDE8] px-3 py-1.5 text-xs font-semibold text-[#765D3D]">
                  {loading ? "..." : products.length}
                </span>

                <ChevronLeft
                  size={20}
                  className="text-[#A79B89] transition group-hover:-translate-x-1 group-hover:text-[#8B6F47]"
                />
              </div>
            </button>

            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  مجلدات الأقسام
                </h2>

                <p className="mt-1 text-sm text-[#8A8175]">
                  افتح أي مجلد لعرض منتجاته فقط
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#8B6F47] shadow-sm">
                <Folder size={21} />
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-[#E7E0D5] bg-white px-5 py-16 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E7E0D5] border-t-[#8B6F47]" />

                <p className="font-semibold">
                  جاري تجهيز المجلدات...
                </p>

                <p className="mt-2 text-sm text-[#8A8175]">
                  يتم تحميل بيانات المنتجات
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-4">
                {folderCategories.map((folder, index) => {
                  const count = folderCounts[folder] || 0;

                  return (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => openCategory(folder)}
                      className="group relative overflow-hidden rounded-2xl border border-[#E7E0D5] bg-white p-4 text-right shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#B89B72] hover:shadow-lg sm:rounded-3xl sm:p-5"
                    >
                      <div className="absolute left-0 top-0 h-20 w-20 rounded-full bg-[#F0EDE8] opacity-70 transition duration-300 group-hover:scale-150" />

                      <div className="relative flex items-start justify-between gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0E8DC] text-[#8B6F47] transition duration-200 group-hover:bg-[#8B6F47] group-hover:text-white sm:h-14 sm:w-14">
                          <Folder
                            size={28}
                            strokeWidth={1.7}
                            className="transition group-hover:hidden"
                          />

                          <FolderOpen
                            size={28}
                            strokeWidth={1.7}
                            className="hidden group-hover:block"
                          />
                        </div>

                        <ChevronLeft
                          size={19}
                          className="mt-1 text-[#C0B4A3] transition group-hover:-translate-x-1 group-hover:text-[#8B6F47]"
                        />
                      </div>

                      <div className="relative mt-5 min-h-[64px]">
                        <h3 className="break-words text-sm font-bold leading-6 text-[#29251F] sm:text-base">
                          {folder}
                        </h3>

                        <p className="mt-1.5 text-xs text-[#8A8175]">
                          {count} منتج
                        </p>
                      </div>

                      <div className="relative mt-4 flex items-center justify-between border-t border-[#F0EDE8] pt-3">
                        <span className="text-xs font-medium text-[#8B6F47]">
                          فتح المجلد
                        </span>

                        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#F0EDE8] px-2 text-xs font-bold text-[#765D3D]">
                          {count}
                        </span>
                      </div>

                      {index === 0 && (
                        <span className="absolute right-0 top-0 h-1 w-full bg-[#B89B72] opacity-0 transition group-hover:opacity-100" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && folderCategories.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#D8CDBD] bg-white p-10 text-center">
                <Folder
                  size={38}
                  className="mx-auto mb-3 text-[#B89B72]"
                />

                <h3 className="font-bold">
                  لا توجد أقسام حالياً
                </h3>

                <p className="mt-2 text-sm text-[#8A8175]">
                  يمكنك البدء بإضافة منتج جديد إلى المتجر.
                </p>

                <Link
                  href="/admin/products/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#29251F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]"
                >
                  <Plus size={17} />
                  إضافة منتج
                </Link>
              </div>
            )}
          </section>
        ) : (
          /* Products inside a folder */
          <section>
            {/* Breadcrumb and folder heading */}
            <div className="mb-6">
              <button
                type="button"
                onClick={backToFolders}
                className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#E1D7C8] bg-white px-4 py-2.5 text-sm font-semibold text-[#6F6251] transition hover:border-[#B89B72] hover:text-[#8B6F47]"
              >
                <ArrowRight size={17} />
                الرجوع إلى الأقسام
              </button>

              <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#E7E0D5] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F0E8DC] text-[#8B6F47] sm:h-16 sm:w-16">
                    {selectedCategory === "الكل" ? (
                      <Layers3 size={31} />
                    ) : (
                      <FolderOpen size={31} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="mb-1 text-xs text-[#9B8C78]">
                      المنتجات /{" "}
                      {selectedCategory === "الكل"
                        ? "جميع الأقسام"
                        : "مجلد القسم"}
                    </div>

                    <h2 className="break-words text-xl font-bold sm:text-2xl">
                      {selectedCategory}
                    </h2>

                    <p className="mt-1 text-sm text-[#8A8175]">
                      {loading
                        ? "جاري تحميل المنتجات..."
                        : `${filteredProducts.length} منتج`}
                    </p>
                  </div>
                </div>

                <Link
                  href={newProductHref}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#29251F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]"
                >
                  <Plus size={18} />
                  إضافة منتج
                </Link>
              </div>
            </div>

            {/* Stock summary */}
            {!loading && (
              <div className="mb-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[#DCE9DF] bg-white p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-xs text-[#62816A] sm:text-sm">
                    <span className="h-2 w-2 rounded-full bg-[#4D9665]" />
                    متوفر
                  </div>

                  <p className="mt-2 text-2xl font-bold text-[#39784F] sm:text-3xl">
                    {availableProducts}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#F0E1C8] bg-white p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-xs text-[#A0783D] sm:text-sm">
                    <span className="h-2 w-2 rounded-full bg-[#D99A37]" />
                    مخزون منخفض
                  </div>

                  <p className="mt-2 text-2xl font-bold text-[#B57A24] sm:text-3xl">
                    {lowProducts}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#F0DADA] bg-white p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-xs text-[#A75C5C] sm:text-sm">
                    <span className="h-2 w-2 rounded-full bg-[#D45B5B]" />
                    غير متوفر
                  </div>

                  <p className="mt-2 text-2xl font-bold text-[#C24141] sm:text-3xl">
                    {outProducts}
                  </p>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="mb-5 rounded-2xl border border-[#E7E0D5] bg-white p-3 sm:p-4">
              <div className="relative">
                <Search
                  size={19}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A79B89]"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="ابحث عن منتج داخل هذا القسم..."
                  className="h-12 w-full rounded-xl border border-[#E7E0D5] bg-[#FAF9F7] pr-11 pl-4 text-sm outline-none transition placeholder:text-[#AAA093] focus:border-[#B89B72] focus:ring-2 focus:ring-[#B89B72]/15"
                />
              </div>
            </div>

            {/* Products table */}
            <div className="overflow-hidden rounded-2xl border border-[#E7E0D5] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="border-b border-[#E7E0D5] bg-[#F8F6F2]">
                    <tr className="text-right text-sm text-[#817667]">
                      <th className="px-5 py-4 font-semibold">المنتج</th>
                      <th className="px-5 py-4 font-semibold">التصنيف</th>
                      <th className="px-5 py-4 font-semibold">السعر</th>
                      <th className="px-5 py-4 font-semibold">المخزون</th>
                      <th className="px-5 py-4 font-semibold">الحالة</th>
                      <th className="px-5 py-4 font-semibold">الإجراءات</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#E7E0D5] border-t-[#8B6F47]" />

                          <p className="font-semibold">
                            جاري تحميل المنتجات...
                          </p>

                          <p className="mt-1 text-sm text-[#8A8175]">
                            يتم جلب البيانات من قاعدة البيانات
                          </p>
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <Package
                            size={42}
                            className="mx-auto mb-3 text-[#C7BBA9]"
                          />

                          <p className="font-semibold">
                            لا توجد منتجات في هذا القسم
                          </p>

                          <p className="mt-2 text-sm text-[#8A8175]">
                            يمكنك إضافة منتج جديد لهذا القسم.
                          </p>

                          <Link
                            href={newProductHref}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#29251F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]"
                          >
                            <Plus size={17} />
                            إضافة منتج
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const status = getStatus(product.stock);
                        const isActionLoading =
                          actionLoading === product.id;

                        return (
                          <tr
                            key={product.id}
                            className="border-b border-[#F0EDE8] transition last:border-0 hover:bg-[#FCFBF9]"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7E0D5] bg-[#F0EDE8]">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                      onError={(event) => {
                                        event.currentTarget.style.display =
                                          "none";
                                      }}
                                    />
                                  ) : (
                                    <Package
                                      size={23}
                                      className="text-[#A79B89]"
                                    />
                                  )}
                                </div>

                                <div>
                                  <p className="font-semibold text-[#29251F]">
                                    {product.name}
                                  </p>

                                  <p className="mt-1 text-xs text-[#A79B89]">
                                    #{product.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-[#716758]">
                              {normalizeCategory(product.category || "")}
                            </td>

                            <td className="px-5 py-4 font-bold text-[#765D3D]">
                              {Number(product.price).toLocaleString("ar-EG")} جنيه
                            </td>

                            <td className="px-5 py-4">
                              <span className="font-semibold">
                                {product.stock}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                  status === "available"
                                    ? "bg-[#E7F3E9] text-[#39784F]"
                                    : status === "low"
                                      ? "bg-[#FFF0D9] text-[#A66A18]"
                                      : "bg-[#FCE8E8] text-[#B33C3C]"
                                }`}
                              >
                                {status === "available" && <Check size={14} />}
                                {status === "low" && <AlertCircle size={14} />}
                                {status === "out" && <X size={14} />}
                                {statusText(status)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  title="عرض"
                                  onClick={() =>
                                    window.alert(
                                      `المنتج: ${product.name}\nالسعر: ${product.price} جنيه\nالمخزون: ${product.stock}`
                                    )
                                  }
                                  className="rounded-lg p-2 text-[#8A8175] transition hover:bg-[#F0EDE8] hover:text-[#29251F]"
                                >
                                  <Eye size={18} />
                                </button>

                                <Link
                                  href={`/admin/products/${product.id}/edit`}
                                  title="تعديل"
                                  className="rounded-lg p-2 text-[#8A8175] transition hover:bg-[#F0EDE8] hover:text-[#29251F]"
                                >
                                  <Edit3 size={18} />
                                </Link>

                                <button
                                  type="button"
                                  title={
                                    product.stock > 0
                                      ? "جعل المنتج غير متوفر"
                                      : "جعل المنتج متوفر"
                                  }
                                  disabled={isActionLoading}
                                  onClick={() =>
                                    toggleAvailability(product)
                                  }
                                  className="rounded-lg p-2 text-[#8A8175] transition hover:bg-[#F0EDE8] hover:text-[#29251F] disabled:opacity-40"
                                >
                                  {isActionLoading ? (
                                    <span className="block h-[18px] w-[18px] animate-spin rounded-full border-2 border-[#D8CDBD] border-t-[#8B6F47]" />
                                  ) : product.stock > 0 ? (
                                    <X size={18} />
                                  ) : (
                                    <Check size={18} />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  title="حذف"
                                  disabled={isActionLoading}
                                  onClick={() =>
                                    setDeleteProduct(product)
                                  }
                                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!loading && filteredProducts.length > 0 && (
              <p className="mt-4 text-center text-xs text-[#958979]">
                عرض {filteredProducts.length} منتج
                {selectedCategory !== "الكل" &&
                  ` في قسم ${selectedCategory}`}
              </p>
            )}
          </section>
        )}
      </main>

      {/* Delete confirmation */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211D18]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#E7E0D5] bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={25} />
            </div>

            <h2 className="text-xl font-bold text-[#29251F]">
              حذف المنتج؟
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#8A8175]">
              هل أنت متأكد من حذف{" "}
              <span className="font-bold text-[#29251F]">
                {deleteProduct.name}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setDeleteProduct(null)}
                disabled={actionLoading !== null}
                className="flex-1 rounded-xl border border-[#E7E0D5] px-4 py-3 font-semibold text-[#62594D] transition hover:bg-[#F8F6F2] disabled:opacity-50"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading !== null}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === deleteProduct.id
                  ? "جاري الحذف..."
                  : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// الإصلاح الأساسي: وضع المكوّن الذي يستخدم useSearchParams
// داخل Suspense حتى يستطيع Next.js إكمال عملية البناء.
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div
          dir="rtl"
          className="flex min-h-screen items-center justify-center bg-[#F0EDE8] text-[#29251F]"
        >
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E7E0D5] border-t-[#8B6F47]" />
            <p className="font-semibold">جاري تحميل المنتجات...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
