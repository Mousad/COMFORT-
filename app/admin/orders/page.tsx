"use client";

import {
  CheckCircle,
  ChevronLeft,
  Clock,
  Package,
  RefreshCw,
  Search,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

type Order = {
  id: string;
  orderNumber: string;

  customerName: string;
  customerPhone: string;

  whatsappCountryCode: string;
  whatsappPhone: string;

  city: string;
  address: string;
  notes: string | null;

  total: number;
  status: string;
  createdAt: string;

  items: OrderItem[];
};

const filters = [
  { key: "all", label: "كل الطلبات" },
  { key: "جديد", label: "لم تُجهّز" },
  { key: "جاري التنفيذ", label: "جاري التنفيذ" },
  { key: "جاهز للشحن", label: "جاهزة للشحن" },
  { key: "تم الشحن", label: "تم الشحن" },
  { key: "تم التسليم", label: "تم التسليم" },
  { key: "ملغي", label: "ملغية" },
];

function getStatusStyle(status: string) {
  switch (status) {
    case "جديد":
      return "bg-blue-50 text-blue-700";

    case "جاري التنفيذ":
      return "bg-amber-50 text-amber-700";

    case "جاهز للشحن":
      return "bg-orange-50 text-orange-700";

    case "تم الشحن":
      return "bg-purple-50 text-purple-700";

    case "تم التسليم":
      return "bg-green-50 text-green-700";

    case "ملغي":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "جديد":
      return <Clock size={15} />;

    case "جاري التنفيذ":
      return <Package size={15} />;

    case "جاهز للشحن":
      return <Package size={15} />;

    case "تم الشحن":
      return <Truck size={15} />;

    case "تم التسليم":
      return <CheckCircle size={15} />;

    case "ملغي":
      return <XCircle size={15} />;

    default:
      return <Package size={15} />;
  }
}

function getActionText(status: string) {
  switch (status) {
    case "جديد":
      return "تنفيذ الطلب";

    case "جاري التنفيذ":
      return "تم تجهيز الطلب";

    case "جاهز للشحن":
      return "تم الشحن";

    case "تم الشحن":
      return "تم التسليم";

    default:
      return null;
  }
}

function getNextStatus(status: string) {
  switch (status) {
    case "جديد":
      return "جاري التنفيذ";

    case "جاري التنفيذ":
      return "جاهز للشحن";

    case "جاهز للشحن":
      return "تم الشحن";

    case "تم الشحن":
      return "تم التسليم";

    default:
      return null;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  const [newOrderAlert, setNewOrderAlert] =
    useState(false);

  const fetchOrders = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setRefreshing(true);
        }

        setError("");

        const response = await fetch(
          "/api/orders",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "حدث خطأ أثناء جلب الطلبات"
          );
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error(
          "Fetch orders error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء جلب الطلبات"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /*
   * أول تحميل
   */
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /*
   * تحديث الطلبات كل 10 ثواني
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  /*
   * تحديث عند الرجوع للتبويب
   */
  useEffect(() => {
    const handleFocus = () => {
      fetchOrders();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [fetchOrders]);

  /*
   * الطلبات الجديدة
   */
  useEffect(() => {
    if (loading) return;

    const newOrders = orders.filter(
      (order) => order.status === "جديد"
    );

    if (newOrders.length > 0) {
      setNewOrderAlert(true);
    }
  }, [orders, loading]);

  /*
   * تحديث حالة طلب مباشرة
   */
  const updateOrderStatus = async (
    orderId: string,
    status: string
  ) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await fetch(
        `/api/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "حدث خطأ أثناء تحديث حالة الطلب"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? data.order
            : order
        )
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث حالة الطلب"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /*
   * الإحصائيات
   */
  const counts = useMemo(() => {
    return {
      all: orders.length,

      new: orders.filter(
        (order) => order.status === "جديد"
      ).length,

      processing: orders.filter(
        (order) =>
          order.status === "جاري التنفيذ"
      ).length,

      ready: orders.filter(
        (order) =>
          order.status === "جاهز للشحن"
      ).length,

      shipped: orders.filter(
        (order) =>
          order.status === "تم الشحن"
      ).length,

      delivered: orders.filter(
        (order) =>
          order.status === "تم التسليم"
      ).length,

      cancelled: orders.filter(
        (order) => order.status === "ملغي"
      ).length,
    };
  }, [orders]);

  /*
   * فلترة + بحث
   */
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "all" ||
        order.status === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        order.orderNumber
          .toLowerCase()
          .includes(query) ||
        order.customerName
          .toLowerCase()
          .includes(query) ||
        order.customerPhone
          .toLowerCase()
          .includes(query) ||
        order.city
          .toLowerCase()
          .includes(query)
      );
    });
  }, [orders, activeFilter, search]);

  /*
   * ترتيب: الأحدث أولًا
   */
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [filteredOrders]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f0ede8]"
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#b89b72]" />

          <p className="mt-4 text-sm text-black/50">
            جاري تحميل الطلبات...
          </p>
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
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f0ede8]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs text-black/40">
              COMFORT KEEPERS
            </p>

            <h1 className="mt-1 text-xl font-semibold sm:text-2xl">
              الطلبات
            </h1>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium shadow-sm transition hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              تحديث
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        {/* New order alert */}
        {newOrderAlert &&
          counts.new > 0 && (
            <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600">
                  <Package size={19} />
                </div>

                <div>
                  <p className="font-semibold text-blue-900">
                    لديك طلبات جديدة
                  </p>

                  <p className="mt-1 text-xs text-blue-700">
                    يوجد {counts.new} طلب لم يتم
                    تجهيزه بعد.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveFilter("جديد");
                  setNewOrderAlert(false);
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                عرض الطلبات الجديدة
              </button>
            </div>
          )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => fetchOrders(true)}
              className="shrink-0 font-medium underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <StatCard
            label="كل الطلبات"
            value={counts.all}
            active={activeFilter === "all"}
            onClick={() =>
              setActiveFilter("all")
            }
          />

          <StatCard
            label="لم تُجهّز"
            value={counts.new}
            active={activeFilter === "جديد"}
            onClick={() =>
              setActiveFilter("جديد")
            }
          />

          <StatCard
            label="جاري التنفيذ"
            value={counts.processing}
            active={
              activeFilter ===
              "جاري التنفيذ"
            }
            onClick={() =>
              setActiveFilter(
                "جاري التنفيذ"
              )
            }
          />

          <StatCard
            label="جاهزة للشحن"
            value={counts.ready}
            active={
              activeFilter ===
              "جاهز للشحن"
            }
            onClick={() =>
              setActiveFilter(
                "جاهز للشحن"
              )
            }
          />

          <StatCard
            label="تم الشحن"
            value={counts.shipped}
            active={
              activeFilter === "تم الشحن"
            }
            onClick={() =>
              setActiveFilter(
                "تم الشحن"
              )
            }
          />

          <StatCard
            label="تم التسليم"
            value={counts.delivered}
            active={
              activeFilter ===
              "تم التسليم"
            }
            onClick={() =>
              setActiveFilter(
                "تم التسليم"
              )
            }
          />

          <StatCard
            label="ملغية"
            value={counts.cancelled}
            active={
              activeFilter === "ملغي"
            }
            onClick={() =>
              setActiveFilter("ملغي")
            }
          />
        </div>

        {/* Search + filters */}
        <section className="mb-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/35"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف..."
                className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] pr-11 pl-4 text-sm outline-none transition focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter.key
                    )
                  }
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-medium transition ${
                    activeFilter ===
                    filter.key
                      ? "bg-[#171717] text-white"
                      : "bg-[#f0ede8] text-black/55 hover:bg-black/5"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {activeFilter === "all"
                ? "جميع الطلبات"
                : filters.find(
                    (filter) =>
                      filter.key ===
                      activeFilter
                  )?.label}
            </h2>

            <p className="mt-1 text-xs text-black/40">
              عرض {sortedOrders.length} من{" "}
              {orders.length} طلب
            </p>
          </div>
        </div>

        {/* Empty */}
        {sortedOrders.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ede8] text-black/25">
              <Package size={28} />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              لا توجد طلبات
            </h3>

            <p className="mt-2 text-sm text-black/40">
              {search
                ? "لم نجد طلبات تطابق البحث."
                : "لا توجد طلبات في هذه الحالة حاليًا."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedOrders.map((order) => {
              const nextStatus =
                getNextStatus(
                  order.status
                );

              const actionText =
                getActionText(
                  order.status
                );

              const updating =
                updatingOrderId ===
                order.id;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                      {/* Order info */}
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0ede8] text-[#b89b72]">
                          <Package size={21} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-semibold hover:underline"
                            >
                              {order.orderNumber}
                            </Link>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${getStatusStyle(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(
                                order.status
                              )}

                              {order.status}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-black/50">
                            {formatDate(
                              order.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <User
                            size={15}
                            className="text-black/30"
                          />

                          <span className="text-sm font-medium">
                            {order.customerName}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-black/40">
                          {order.customerPhone}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {order.city}
                        </p>
                      </div>

                      {/* Products */}
                      <div className="min-w-[180px]">
                        <p className="text-xs text-black/40">
                          المنتجات
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {order.items.length}{" "}
                          منتج
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          الكمية:{" "}
                          {order.items.reduce(
                            (sum, item) =>
                              sum +
                              item.quantity,
                            0
                          )}
                        </p>
                      </div>

                      {/* Total */}
                      <div className="min-w-[130px]">
                        <p className="text-xs text-black/40">
                          الإجمالي
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                          {Number(
                            order.total
                          ).toLocaleString(
                            "ar-EG"
                          )}{" "}
                          جنيه
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f0ede8] px-4 text-xs font-medium transition hover:bg-black/10"
                        >
                          التفاصيل
                          <ChevronLeft
                            size={15}
                          />
                        </Link>

                        {nextStatus &&
                          actionText && (
                            <button
                              type="button"
                              disabled={
                                updating
                              }
                              onClick={() =>
                                updateOrderStatus(
                                  order.id,
                                  nextStatus
                                )
                              }
                              className="inline-flex h-10 items-center justify-center rounded-xl bg-[#171717] px-4 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updating ? (
                                <span className="flex items-center gap-2">
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                  جاري...
                                </span>
                              ) : (
                                actionText
                              )}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* New order indicator */}
                  {order.status ===
                    "جديد" && (
                    <div className="h-1 bg-blue-500" />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/*
 * بطاقة الإحصائيات
 */
function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-right shadow-sm transition ${
        active
          ? "border-[#b89b72] bg-white ring-2 ring-[#b89b72]/10"
          : "border-black/5 bg-white hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <p className="text-xs text-black/40">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </button>
  );
}