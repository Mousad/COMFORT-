"use client";

import {
  AlertCircle,
  Check,
  Edit3,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
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
  "الكل",
  "برفيوم حريمي",
  "برفيوم رجالي",
  "برفيوم 50 ml",
  "Skin Care",
  "ماستر بوكس حريمي",
  "ماستر بوكس رجالي",
];

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");

  const [deleteProduct, setDeleteProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  // =========================
  // تحميل المنتجات
  // =========================

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
        const text = await response.text();

        console.error(
          "Products API returned non-JSON:",
          {
            status: response.status,
            contentType,
            preview: text.slice(0, 500),
          }
        );

        throw new Error(
          `API المنتجات رجّع استجابة غير صحيحة (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء جلب المنتجات"
        );
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );
    } catch (error) {
      console.error(
        "Load products error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء جلب المنتجات"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // =========================
  // البحث والفلاتر
  // =========================

  const filteredProducts = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name
          .toLowerCase()
          .includes(searchValue) ||
        product.category
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        category === "الكل" ||
        product.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [products, search, category]);

  // =========================
  // حذف المنتج
  // =========================

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
        const text = await response.text();

        console.error(
          "Delete API returned non-JSON:",
          {
            status: response.status,
            contentType,
            preview: text.slice(0, 500),
          }
        );

        throw new Error(
          `حدث خطأ في API الحذف (${response.status})`
        );
      }

      const data = await response.json();

      console.log(
        "Delete product response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "لم يتم حذف المنتج"
        );
      }

      // إغلاق نافذة الحذف
      setDeleteProduct(null);

      // إعادة تحميل المنتجات من قاعدة البيانات
      await loadProducts();
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء حذف المنتج"
      );
    } finally {
      setActionLoading(null);
    }
  }

  // =========================
  // تغيير توفر المنتج
  // =========================

  async function toggleAvailability(
    product: Product
  ) {
    try {
      setActionLoading(product.id);
      setError("");

      const newStock =
        product.stock > 0 ? 0 : 10;

      const response = await fetch(
        `/api/products/${product.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
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
        const text = await response.text();

        console.error(
          "Toggle API returned non-JSON:",
          {
            status: response.status,
            contentType,
            preview: text.slice(0, 500),
          }
        );

        throw new Error(
          `API تحديث المنتج رجّع استجابة غير صحيحة (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء تحديث حالة المنتج"
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                stock: newStock,
                status:
                  getStatus(newStock),
                isAvailable:
                  newStock > 0,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Toggle product availability error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث المنتج"
      );
    } finally {
      setActionLoading(null);
    }
  }

  // =========================
  // الإحصائيات
  // =========================

  const totalProducts =
    products.length;

  const availableProducts =
    products.filter(
      (product) => product.stock > 0
    ).length;

  const lowProducts =
    products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 5
    ).length;

  const outProducts =
    products.filter(
      (product) => product.stock === 0
    ).length;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f0ede8] text-[#171717]"
    >
      {/* =========================
          Header
      ========================= */}

      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b89b72] text-white">
              <Package size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                المنتجات
              </h1>

              <p className="text-sm text-black/50">
                إدارة منتجات المتجر
              </p>
            </div>
          </div>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-xl bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            <Plus size={18} />

            إضافة منتج
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* =========================
            Error
        ========================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                !
              </div>

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-2 transition hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =========================
            Stats
        ========================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">
              إجمالي المنتجات
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">
              متوفر
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {availableProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">
              مخزون منخفض
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {lowProducts}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">
              غير متوفر
            </p>

            <p className="mt-2 text-3xl font-bold text-red-500">
              {outProducts}
            </p>
          </div>
        </div>

        {/* =========================
            Filters
        ========================= */}

        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="ابحث عن منتج..."
                className="w-full rounded-xl border border-black/10 bg-[#fafafa] py-3 pr-11 pl-4 outline-none transition focus:border-[#b89b72]"
              />
            </div>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-xl border border-black/10 bg-[#fafafa] px-4 py-3 outline-none focus:border-[#b89b72]"
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
        </div>

        {/* =========================
            Products Table
        ========================= */}

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-black/10 bg-[#fafafa]">
                <tr className="text-right text-sm text-black/50">
                  <th className="px-5 py-4 font-medium">
                    المنتج
                  </th>

                  <th className="px-5 py-4 font-medium">
                    التصنيف
                  </th>

                  <th className="px-5 py-4 font-medium">
                    السعر
                  </th>

                  <th className="px-5 py-4 font-medium">
                    المخزون
                  </th>

                  <th className="px-5 py-4 font-medium">
                    الحالة
                  </th>

                  <th className="px-5 py-4 font-medium">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-black/10 border-t-[#b89b72]" />

                      <p className="font-medium">
                        جاري تحميل المنتجات...
                      </p>

                      <p className="mt-1 text-sm text-black/40">
                        يتم جلب البيانات من قاعدة البيانات
                      </p>
                    </td>
                  </tr>
                ) : filteredProducts.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <Package
                        size={40}
                        className="mx-auto mb-3 text-black/20"
                      />

                      <p className="font-medium">
                        لا توجد منتجات
                      </p>

                      <p className="mt-1 text-sm text-black/40">
                        جرّب تغيير البحث أو إضافة منتج جديد
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(
                    (product) => {
                      const status =
                        getStatus(
                          product.stock
                        );

                      const isActionLoading =
                        actionLoading ===
                        product.id;

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-black/5 last:border-0 hover:bg-black/[0.015]"
                        >
                          {/* Product */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0ede8]">
                                {product.image ? (
                                  <img
                                    src={
                                      product.image
                                    }
                                    alt={
                                      product.name
                                    }
                                    className="h-full w-full object-cover"
                                    onError={(
                                      e
                                    ) => {
                                      e.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  <Package
                                    size={22}
                                    className="text-black/30"
                                  />
                                )}
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {product.name}
                                </p>

                                <p className="mt-1 text-xs text-black/40">
                                  #
                                  {
                                    product.id
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}

                          <td className="px-5 py-4 text-sm">
                            {
                              product.category
                            }
                          </td>

                          {/* Price */}

                          <td className="px-5 py-4 font-semibold">
                            {product.price.toLocaleString(
                              "ar-EG"
                            )}{" "}
                            جنيه
                          </td>

                          {/* Stock */}

                          <td className="px-5 py-4">
                            <span className="font-medium">
                              {
                                product.stock
                              }
                            </span>
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                                status ===
                                "available"
                                  ? "bg-green-100 text-green-700"
                                  : status ===
                                    "low"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {status ===
                                "available" && (
                                <Check
                                  size={14}
                                />
                              )}

                              {status ===
                                "low" && (
                                <AlertCircle
                                  size={14}
                                />
                              )}

                              {status ===
                                "out" && (
                                <X
                                  size={14}
                                />
                              )}

                              {statusText(
                                status
                              )}
                            </span>
                          </td>

                          {/* Actions */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {/* View */}

                              <button
                                type="button"
                                title="عرض"
                                onClick={() =>
                                  alert(
                                    `المنتج: ${product.name}\nالسعر: ${product.price} جنيه\nالمخزون: ${product.stock}`
                                  )
                                }
                                className="rounded-lg p-2 text-black/50 transition hover:bg-black/5 hover:text-black"
                              >
                                <Eye
                                  size={18}
                                />
                              </button>

                              {/* Edit */}

                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                title="تعديل"
                                className="rounded-lg p-2 text-black/50 transition hover:bg-black/5 hover:text-black"
                              >
                                <Edit3
                                  size={18}
                                />
                              </Link>

                              {/* Toggle */}

                              <button
                                type="button"
                                title={
                                  product.stock >
                                  0
                                    ? "جعل المنتج غير متوفر"
                                    : "جعل المنتج متوفر"
                                }
                                disabled={
                                  isActionLoading
                                }
                                onClick={() =>
                                  toggleAvailability(
                                    product
                                  )
                                }
                                className="rounded-lg p-2 text-black/50 transition hover:bg-black/5 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {isActionLoading ? (
                                  <span className="block h-[18px] w-[18px] animate-spin rounded-full border-2 border-black/20 border-t-black" />
                                ) : product.stock >
                                  0 ? (
                                  <X
                                    size={18}
                                  />
                                ) : (
                                  <Check
                                    size={18}
                                  />
                                )}
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                title="حذف"
                                disabled={
                                  isActionLoading
                                }
                                onClick={() =>
                                  setDeleteProduct(
                                    product
                                  )
                                }
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Trash2
                                  size={18}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* =========================
          Delete Modal
      ========================= */}

      {deleteProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="text-xl font-bold">
              حذف المنتج؟
            </h2>

            <p className="mt-2 text-sm leading-6 text-black/50">
              هل أنت متأكد من حذف{" "}
              <span className="font-semibold text-black">
                {deleteProduct.name}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteProduct(null)
                }
                disabled={
                  actionLoading !== null
                }
                className="flex-1 rounded-xl border border-black/10 px-4 py-3 font-medium transition hover:bg-black/5 disabled:opacity-50"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  actionLoading !== null
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ===
                deleteProduct.id
                  ? "جاري الحذف..."
                  : "حذف المنتج"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}