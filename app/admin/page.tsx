"use client";

import {
  Bell,
  Box,
  ClipboardList,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const recentOrders = [
  {
    id: "#1024",
    customer: "محمد أحمد",
    product: "Dior Sauvage",
    total: "850 جنيه",
    status: "جديد",
  },
  {
    id: "#1023",
    customer: "أحمد محمد",
    product: "Versace Eros",
    total: "700 جنيه",
    status: "تم التأكيد",
  },
  {
    id: "#1022",
    customer: "سارة علي",
    product: "YSL Libre",
    total: "950 جنيه",
    status: "تم الشحن",
  },
  {
    id: "#1021",
    customer: "نور محمد",
    product: "Armani Code",
    total: "800 جنيه",
    status: "تم التسليم",
  },
];

const topProducts = [
  {
    name: "Dior Sauvage",
    category: "برفيوم رجالي",
    sales: 32,
    stock: 12,
  },
  {
    name: "YSL Libre",
    category: "برفيوم حريمي",
    sales: 27,
    stock: 8,
  },
  {
    name: "Versace Eros",
    category: "برفيوم رجالي",
    sales: 24,
    stock: 3,
  },
];

function getStatusClass(status: string) {
  switch (status) {
    case "جديد":
      return "bg-blue-50 text-blue-700";

    case "تم التأكيد":
      return "bg-amber-50 text-amber-700";

    case "تم الشحن":
      return "bg-purple-50 text-purple-700";

    case "تم التسليم":
      return "bg-green-50 text-green-700";

    default:
      return "bg-gray-50 text-gray-700";
  }
}

export default function AdminPage() {
  const [productCount, setProductCount] = useState(6);
  const [availableCount, setAvailableCount] = useState(5);
  const [outOfStockCount, setOutOfStockCount] = useState(1);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("admin-products");

      if (!savedProducts) return;

      const products = JSON.parse(savedProducts);

      if (!Array.isArray(products)) return;

      const available = products.filter(
        (product) => Number(product.stock) > 0
      );

      const outOfStock = products.filter(
        (product) => Number(product.stock) === 0
      );

      setProductCount(products.length);
      setAvailableCount(available.length);
      setOutOfStockCount(outOfStock.length);
    } catch (error) {
      console.error("Failed to load dashboard products:", error);
    }
  }, []);

  const stats = [
    {
      title: "إجمالي المنتجات",
      value: productCount,
      description: "جميع المنتجات",
      icon: Package,
    },
    {
      title: "المنتجات المتوفرة",
      value: availableCount,
      description: "متاحة للبيع",
      icon: Box,
    },
    {
      title: "منتجات منتهية",
      value: outOfStockCount,
      description: "تحتاج إلى تحديث",
      icon: ClipboardList,
    },
    {
      title: "الطلبات",
      value: 18,
      description: "إجمالي الطلبات",
      icon: ShoppingBag,
    },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f0ede8] text-[#171717]"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-black/5 bg-[#f0ede8]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div>
          <p className="text-xs text-black/45">
            لوحة التحكم
          </p>

          <h2 className="text-lg font-semibold">
            الرئيسية
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md"
          >
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b89b72]" />
          </button>

          <div className="hidden items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-sm font-semibold text-white">
              م
            </div>

            <div className="text-right">
              <p className="text-sm font-medium">
                Admin
              </p>

              <p className="text-[11px] text-black/40">
                مدير المتجر
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Welcome */}
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl">
                أهلاً بك 👋
              </h1>

              <p className="mt-2 text-sm text-black/50">
                إليك ملخص سريع عن أداء متجر العطور اليوم.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-fit items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              العودة للمتجر
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede8] text-[#b89b72]">
                    <Icon size={20} />
                  </div>

                  <span className="text-xs text-green-600">
                    +8%
                  </span>
                </div>

                <p className="mt-5 text-xs text-black/45">
                  {stat.title}
                </p>

                <h3 className="mt-1 text-2xl font-semibold">
                  {stat.value}
                </h3>

                <p className="mt-1 text-[11px] text-black/35">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Main Grid */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Orders */}
          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 p-5">
              <div>
                <h2 className="font-semibold">
                  آخر الطلبات
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  أحدث الطلبات من العملاء
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-medium text-[#a38358] transition hover:underline"
              >
                عرض الكل
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-right text-sm">
                <thead className="bg-[#faf9f7] text-xs text-black/40">
                  <tr>
                    <th className="px-5 py-4 font-medium">
                      رقم الطلب
                    </th>

                    <th className="px-5 py-4 font-medium">
                      العميل
                    </th>

                    <th className="px-5 py-4 font-medium">
                      المنتج
                    </th>

                    <th className="px-5 py-4 font-medium">
                      الإجمالي
                    </th>

                    <th className="px-5 py-4 font-medium">
                      الحالة
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-black/5 transition hover:bg-[#faf9f7]"
                    >
                      <td className="px-5 py-4 font-medium">
                        {order.id}
                      </td>

                      <td className="px-5 py-4 text-black/70">
                        {order.customer}
                      </td>

                      <td className="px-5 py-4 text-black/60">
                        {order.product}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {order.total}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 p-5">
              <div>
                <h2 className="font-semibold">
                  الأكثر مبيعاً
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  المنتجات التي تحقق أعلى مبيعات
                </p>
              </div>

              <TrendingUp
                size={20}
                className="text-[#b89b72]"
              />
            </div>

            <div className="divide-y divide-black/5">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-4 p-5 transition hover:bg-[#faf9f7]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ede8] text-sm font-semibold text-[#b89b72]">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-xs text-black/40">
                      {product.category}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-black/40">
                        المبيعات: {product.sales}
                      </span>

                      <span
                        className={
                          product.stock <= 3
                            ? "text-red-500"
                            : "text-green-600"
                        }
                      >
                        المخزون: {product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">
            إجراءات سريعة
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Add Product */}
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between rounded-xl bg-[#171717] px-4 py-4 text-right text-white transition hover:-translate-y-0.5 hover:bg-[#252525]"
            >
              <div>
                <p className="text-sm font-medium">
                  إضافة منتج
                </p>

                <p className="mt-1 text-[11px] text-white/50">
                  أضف عطراً جديداً
                </p>
              </div>

              <Package size={20} />
            </Link>

            {/* Orders */}
            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-xl bg-[#f0ede8] px-4 py-4 text-right transition hover:-translate-y-0.5 hover:bg-[#e7e2dc]"
            >
              <div>
                <p className="text-sm font-medium">
                  عرض الطلبات
                </p>

                <p className="mt-1 text-[11px] text-black/40">
                  راجع طلبات العملاء
                </p>
              </div>

              <ShoppingBag size={20} />
            </Link>

            {/* Inventory */}
            <Link
              href="/admin/products"
              className="flex items-center justify-between rounded-xl bg-[#f0ede8] px-4 py-4 text-right transition hover:-translate-y-0.5 hover:bg-[#e7e2dc]"
            >
              <div>
                <p className="text-sm font-medium">
                  المخزون
                </p>

                <p className="mt-1 text-[11px] text-black/40">
                  راجع المنتجات والمخزون
                </p>
              </div>

              <Box size={20} />
            </Link>

            {/* Settings */}
            <Link
              href="/admin/settings"
              className="flex items-center justify-between rounded-xl bg-[#f0ede8] px-4 py-4 text-right transition hover:-translate-y-0.5 hover:bg-[#e7e2dc]"
            >
              <div>
                <p className="text-sm font-medium">
                  الإعدادات
                </p>

                <p className="mt-1 text-[11px] text-black/40">
                  إعدادات المتجر
                </p>
              </div>

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.5 1.5-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2.12v-.4a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.5-1.5.06-.06A1.7 1.7 0 0 0 9.12 15a1.7 1.7 0 0 0-1.56-1.04H7.2v-2.12h.36A1.7 1.7 0 0 0 9.12 10.8a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.5-1.5.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56V5.8h2.12v.4a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.5 1.5-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.04h.4v2.12h-.4A1.7 1.7 0 0 0 19.4 15Z" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}