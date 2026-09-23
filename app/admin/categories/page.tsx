
"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  FolderOpen,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  productsCount: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });

  // =========================
  // GET CATEGORIES
  // =========================
  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/categories", {
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
          "Categories API returned non-JSON:",
          {
            status: response.status,
            contentType,
            preview: text.slice(0, 500),
          }
        );

        throw new Error(
          `حدث خطأ في API التصنيفات (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء جلب التصنيفات"
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error(
        "Load categories error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء تحميل التصنيفات."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // =========================
  // ADD MODAL
  // =========================
  const openAddModal = () => {
    setEditingCategory(null);

    setForm({
      name: "",
      slug: "",
      description: "",
      image: "",
      isActive: true,
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // EDIT MODAL
  // =========================
  const openEditModal = (
    category: Category
  ) => {
    setEditingCategory(category);

    setForm({
      name: category.name,
      slug: category.slug,
      description:
        category.description || "",
      image: category.image || "",
      isActive: category.isActive,
    });

    setError("");
    setShowModal(true);
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("من فضلك أدخل اسم التصنيف.");
      return;
    }

    if (!form.slug.trim()) {
      setError(
        "من فضلك أدخل الرابط المختصر Slug."
      );
      return;
    }

    setSaving(true);

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";

      const method = editingCategory
        ? "PATCH"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description:
            form.description.trim(),
          image: form.image.trim(),
          isActive: form.isActive,
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Save category returned non-JSON:",
          {
            status: response.status,
            contentType,
            preview: text.slice(0, 500),
          }
        );

        throw new Error(
          `حدث خطأ في API التصنيف (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء حفظ التصنيف."
        );
      }

      setShowModal(false);
      setEditingCategory(null);

      await loadCategories();
    } catch (error) {
      console.error(
        "Save category error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء حفظ التصنيف."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteCategory = async (
    id: string
  ) => {
    const category = categories.find(
      (item) => item.id === id
    );

    if (!category) return;

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف "${category.name}"؟`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/categories/${id}`,
        {
          method: "DELETE",
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
          "Delete category returned non-JSON:",
          {
            status: response.status,
            contentType,
            preview: text.slice(0, 500),
          }
        );

        throw new Error(
          `حدث خطأ في حذف التصنيف (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء حذف التصنيف."
        );
      }

      await loadCategories();
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء حذف التصنيف."
      );
    }
  };

  // =========================
  // TOGGLE STATUS
  // =========================
  const toggleStatus = async (
    category: Category
  ) => {
    try {
      setError("");

      const response = await fetch(
        `/api/categories/${category.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            isActive: !category.isActive,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Toggle category returned non-JSON:",
          {
            status: response.status,
            contentType,
            preview: text.slice(0, 500),
          }
        );

        throw new Error(
          `حدث خطأ في تغيير حالة التصنيف (${response.status})`
        );
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء تغيير حالة التصنيف."
        );
      }

      await loadCategories();
    } catch (error) {
      console.error(
        "Toggle category error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حصل خطأ أثناء تغيير حالة التصنيف."
      );
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredCategories =
    categories.filter((category) => {
      const value =
        search.toLowerCase();

      return (
        category.name
          .toLowerCase()
          .includes(value) ||
        category.slug
          .toLowerCase()
          .includes(value)
      );
    });

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f5f3ef]"
      >
        <div className="rounded-2xl bg-white px-8 py-6 text-sm text-gray-500 shadow-sm">
          جاري تحميل التصنيفات...
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f5f3ef] p-4 md:p-8"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#171717]">
            التصنيفات
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            إدارة أقسام ومنتجات المتجر
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 text-sm font-medium text-white transition hover:bg-black"
        >
          <Plus size={18} />
          إضافة تصنيف
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede8]">
            <FolderOpen size={20} />
          </div>

          <p className="text-sm text-gray-500">
            إجمالي التصنيفات
          </p>

          <p className="mt-1 text-2xl font-bold">
            {categories.length}
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <Check
              size={20}
              className="text-green-600"
            />
          </div>

          <p className="text-sm text-gray-500">
            التصنيفات النشطة
          </p>

          <p className="mt-1 text-2xl font-bold">
            {
              categories.filter(
                (item) => item.isActive
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede8]">
            <FolderOpen size={20} />
          </div>

          <p className="text-sm text-gray-500">
            إجمالي المنتجات
          </p>

          <p className="mt-1 text-2xl font-bold">
            {categories.reduce(
              (total, category) =>
                total +
                category.productsCount,
              0
            )}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="ابحث عن تصنيف..."
            className="h-12 w-full rounded-xl border border-gray-200 bg-[#fafafa] pr-11 pl-4 text-sm outline-none transition focus:border-[#171717]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-black/5 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-[#171717]">
            قائمة التصنيفات
          </h2>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="px-5 py-4 font-medium">
                  التصنيف
                </th>

                <th className="px-5 py-4 font-medium">
                  Slug
                </th>

                <th className="px-5 py-4 font-medium">
                  المنتجات
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
              {filteredCategories.map(
                (category) => (
                  <tr
                    key={category.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0ede8]">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={
                                category.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FolderOpen
                              size={20}
                              className="text-gray-500"
                            />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-[#171717]">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {category.description ||
                              "بدون وصف"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm text-gray-500">
                      {category.slug}
                    </td>

                    <td className="px-5 py-5 text-sm font-medium">
                      {category.productsCount}
                    </td>

                    <td className="px-5 py-5">
                      <button
                        onClick={() =>
                          toggleStatus(
                            category
                          )
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          category.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {category.isActive
                          ? "نشط"
                          : "مخفي"}
                      </button>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            openEditModal(
                              category
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition hover:bg-gray-200"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() =>
                            deleteCategory(
                              category.id
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="space-y-3 p-4 md:hidden">
          {filteredCategories.map(
            (category) => (
              <div
                key={category.id}
                className="rounded-xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0ede8]">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={
                            category.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FolderOpen
                          size={20}
                          className="text-gray-500"
                        />
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-400">
                        {category.description ||
                          "بدون وصف"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      toggleStatus(category)
                    }
                    className={`rounded-full px-2.5 py-1 text-[11px] ${
                      category.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {category.isActive
                      ? "نشط"
                      : "مخفي"}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      المنتجات
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {
                        category.productsCount
                      }
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        openEditModal(
                          category
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() =>
                        deleteCategory(
                          category.id
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {filteredCategories.length ===
          0 && (
            <div className="py-16 text-center">
              <FolderOpen
                size={35}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm text-gray-500">
                لا توجد تصنيفات
              </p>
            </div>
          )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {editingCategory
                    ? "تعديل التصنيف"
                    : "إضافة تصنيف جديد"}
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  أدخل بيانات التصنيف
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  اسم التصنيف
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="مثال: برفيوم حريمي"
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#171717]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Slug
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                    })
                  }
                  placeholder="women-perfume"
                  dir="ltr"
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-left text-sm outline-none focus:border-[#171717]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  الوصف
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value,
                    })
                  }
                  placeholder="وصف بسيط للتصنيف..."
                  className="min-h-[90px] w-full resize-none rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  رابط صورة التصنيف
                </label>

                <input
                  type="url"
                  value={form.image}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image: e.target.value,
                    })
                  }
                  placeholder="https://..."
                  dir="ltr"
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-left text-sm outline-none focus:border-[#171717]"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl bg-[#f8f7f5] p-4">
                <div>
                  <p className="text-sm font-medium">
                    التصنيف نشط
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    سيظهر التصنيف للعملاء
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isActive:
                        e.target.checked,
                    })
                  }
                  className="h-5 w-5 accent-[#171717]"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-[#171717] text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "جاري الحفظ..."
                    : editingCategory
                    ? "حفظ التعديلات"
                    : "إضافة التصنيف"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  disabled={saving}
                  className="h-11 rounded-xl border border-gray-200 px-6 text-sm font-medium disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

