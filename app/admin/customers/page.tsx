"use client";

import {
  ChevronLeft,
  Clock,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  Users,
  Wallet,
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

type Customer = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  lastOrderNumber: string;
  lastStatus: string;
};

const statusStyles: Record<string, string> = {
  جديد: "bg-blue-50 text-blue-700",
  "جاري التنفيذ": "bg-amber-50 text-amber-700",
  "جاهز للشحن": "bg-purple-50 text-purple-700",
  "تم الشحن": "bg-indigo-50 text-indigo-700",
  "تم التسليم": "bg-emerald-50 text-emerald-700",
  ملغي: "bg-red-50 text-red-700",
};

function formatMoney(value: number) {
  return `${Number(value || 0).toLocaleString("ar-EG")} جنيه`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizePhone(phone: string) {
  return String(phone || "").replace(/\D/g, "");
}

function buildCustomers(orders: Order[]) {
  const customersMap = new Map<string, Customer>();

  for (const order of orders) {
    const phone =
      order.whatsappPhone ||
      order.customerPhone ||
      "";

    const normalizedPhone = normalizePhone(phone);

    const customerKey =
      normalizedPhone ||
      `${order.customerName}-${order.city}`.toLowerCase();

    const existing = customersMap.get(customerKey);

    if (!existing) {
      customersMap.set(customerKey, {
        id: customerKey,
        name: order.customerName || "عميل بدون اسم",
        phone: order.customerPhone || "",
        whatsapp: `${order.whatsappCountryCode || ""}${
          order.whatsappPhone || ""
        }`,
        city: order.city || "غير محدد",
        address: order.address || "غير محدد",
        ordersCount: 1,
        totalSpent: Number(order.total || 0),
        lastOrderDate: order.createdAt,
        lastOrderNumber: order.orderNumber,
        lastStatus: order.status,
      });

      continue;
    }

    existing.ordersCount += 1;
    existing.totalSpent += Number(order.total || 0);

    const currentDate = new Date(existing.lastOrderDate).getTime();
    const newDate = new Date(order.createdAt).getTime();

    if (newDate > currentDate) {
      existing.lastOrderDate = order.createdAt;
      existing.lastOrderNumber = order.orderNumber;
      existing.lastStatus = order.status;
      existing.city = order.city || existing.city;
      existing.address = order.address || existing.address;
    }

    if (!existing.phone && order.customerPhone) {
      existing.phone = order.customerPhone;
    }

    if (!existing.whatsapp) {
      existing.whatsapp = `${order.whatsappCountryCode || ""}${
        order.whatsappPhone || ""
      }`;
    }
  }

  return Array.from(customersMap.values());
}

export default function CustomersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "فشل تحميل الطلبات");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      console.error("Customers fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    const handleFocus = () => {
      fetchOrders();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchOrders]);

  const customers = useMemo(() => {
    return buildCustomers(orders);
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(value) ||
        customer.phone.toLowerCase().includes(value) ||
        customer.whatsapp.toLowerCase().includes(value) ||
        customer.city.toLowerCase().includes(value) ||
        customer.lastOrderNumber.toLowerCase().includes(value)
      );
    });
  }, [customers, search]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;

    const totalOrders = customers.reduce(
      (sum, customer) => sum + customer.ordersCount,
      0
    );

    const totalSales = customers.reduce(
      (sum, customer) => sum + customer.totalSpent,
      0
    );

    const repeatCustomers = customers.filter(
      (customer) => customer.ordersCount > 1
    ).length;

    return {
      totalCustomers,
      totalOrders,
      totalSales,
      repeatCustomers,
    };
  }, [customers]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f0ede8] text-[#171717]"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f0ede8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-black/50">
              <Link
                href="/admin"
                className="transition hover:text-[#b89b72]"
              >
                لوحة التحكم
              </Link>

              <ChevronLeft size={15} />

              <span>العملاء</span>
            </div>

            <h1 className="text-2xl font-black sm:text-3xl">
              العملاء
            </h1>

            <p className="mt-1 text-sm text-black/50">
              متابعة العملاء والطلبات والمشتريات
            </p>
          </div>

          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold transition hover:border-[#b89b72] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />

            <span className="hidden sm:inline">
              تحديث
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="إجمالي العملاء"
            value={stats.totalCustomers.toLocaleString("ar-EG")}
            icon={<Users size={20} />}
          />

          <StatCard
            title="إجمالي الطلبات"
            value={stats.totalOrders.toLocaleString("ar-EG")}
            icon={<Package size={20} />}
          />

          <StatCard
            title="إجمالي المبيعات"
            value={formatMoney(stats.totalSales)}
            icon={<Wallet size={20} />}
          />

          <StatCard
            title="عملاء متكررون"
            value={stats.repeatCustomers.toLocaleString("ar-EG")}
            icon={<ShoppingBag size={20} />}
          />
        </div>

        {/* Search */}
        <div className="mt-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم العميل أو الهاتف أو المدينة أو رقم الطلب..."
              className="h-12 w-full rounded-xl border border-black/10 bg-[#faf9f7] pr-12 pl-4 text-sm outline-none transition placeholder:text-black/35 focus:border-[#b89b72]"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-12 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-[#b89b72]"
            />

            <p className="mt-3 text-sm text-black/50">
              جاري تحميل العملاء...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-12 text-center">
            <Users
              size={42}
              className="mx-auto text-black/20"
            />

            <h2 className="mt-4 text-lg font-black">
              {search
                ? "لم يتم العثور على عميل"
                : "لا يوجد عملاء حتى الآن"}
            </h2>

            <p className="mt-2 text-sm text-black/45">
              {search
                ? "جرّب البحث باسم مختلف أو رقم هاتف آخر."
                : "سيظهر العملاء هنا تلقائيًا بعد وصول الطلبات."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-black/5 bg-[#faf9f7] text-right text-xs text-black/45">
                      <th className="px-5 py-4 font-bold">
                        العميل
                      </th>

                      <th className="px-5 py-4 font-bold">
                        التواصل
                      </th>

                      <th className="px-5 py-4 font-bold">
                        الموقع
                      </th>

                      <th className="px-5 py-4 font-bold">
                        الطلبات
                      </th>

                      <th className="px-5 py-4 font-bold">
                        إجمالي المشتريات
                      </th>

                      <th className="px-5 py-4 font-bold">
                        آخر طلب
                      </th>

                      <th className="px-5 py-4 font-bold">
                        الحالة
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-black/5 last:border-0 transition hover:bg-[#faf9f7]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0ede8] text-[#8d7557]">
                              <User size={19} />
                            </div>

                            <div>
                              <p className="font-black">
                                {customer.name}
                              </p>

                              <p className="mt-1 text-xs text-black/40">
                                عميل مسجل من الطلبات
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone
                                size={15}
                                className="text-black/35"
                              />

                              <span dir="ltr">
                                {customer.phone || "غير متوفر"}
                              </span>
                            </div>

                            {customer.whatsapp && (
                              <div className="text-xs text-black/40">
                                WhatsApp:{" "}
                                <span dir="ltr">
                                  {customer.whatsapp}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0 text-black/35"
                            />

                            <div>
                              <p className="font-bold">
                                {customer.city}
                              </p>

                              <p className="mt-1 max-w-[180px] truncate text-xs text-black/40">
                                {customer.address}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="inline-flex items-center gap-2 rounded-lg bg-[#f0ede8] px-3 py-2 text-sm font-black">
                            <Package size={15} />

                            {customer.ordersCount}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-black">
                            {formatMoney(customer.totalSpent)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-bold">
                            {customer.lastOrderNumber}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-xs text-black/40">
                            <Clock size={13} />
                            {formatDate(customer.lastOrderDate)}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-lg px-3 py-2 text-xs font-bold ${
                              statusStyles[
                                customer.lastStatus
                              ] || "bg-black/5 text-black/60"
                            }`}
                          >
                            {customer.lastStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile */}
            <div className="mt-6 space-y-3 lg:hidden">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0ede8] text-[#8d7557]">
                        <User size={19} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-black">
                          {customer.name}
                        </h3>

                        <p
                          dir="ltr"
                          className="mt-1 text-left text-xs text-black/45"
                        >
                          {customer.phone || "لا يوجد رقم"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${
                        statusStyles[customer.lastStatus] ||
                        "bg-black/5 text-black/60"
                      }`}
                    >
                      {customer.lastStatus}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <InfoBox
                      icon={<Package size={15} />}
                      label="الطلبات"
                      value={customer.ordersCount.toString()}
                    />

                    <InfoBox
                      icon={<Wallet size={15} />}
                      label="المشتريات"
                      value={formatMoney(customer.totalSpent)}
                    />

                    <InfoBox
                      icon={<MapPin size={15} />}
                      label="المدينة"
                      value={customer.city}
                    />

                    <InfoBox
                      icon={<Clock size={15} />}
                      label="آخر طلب"
                      value={formatDate(customer.lastOrderDate)}
                    />
                  </div>

                  <div className="mt-3 rounded-xl bg-[#faf9f7] p-3">
                    <p className="text-xs text-black/40">
                      آخر طلب
                    </p>

                    <p className="mt-1 text-sm font-black">
                      {customer.lastOrderNumber}
                    </p>

                    <p className="mt-1 truncate text-xs text-black/45">
                      {customer.address}
                    </p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {customer.phone && (
                      <a
                        href={`tel:${customer.phone}`}
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 text-xs font-bold transition hover:border-[#b89b72]"
                      >
                        <Phone size={15} />
                        اتصال
                      </a>
                    )}

                    {customer.whatsapp && (
                      <a
                        href={`https://wa.me/${normalizePhone(
                          customer.whatsapp
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#171717] text-xs font-bold text-white transition hover:bg-[#2b2b2b]"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Result count */}
        {!loading && filteredCustomers.length > 0 && (
          <p className="mt-5 text-center text-xs text-black/40">
            عرض {filteredCustomers.length.toLocaleString("ar-EG")} من{" "}
            {customers.length.toLocaleString("ar-EG")} عميل
          </p>
        )}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-black/45">
            {title}
          </p>

          <p className="mt-2 text-lg font-black sm:text-2xl">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede8] text-[#8d7557]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#faf9f7] p-3">
      <div className="flex items-center gap-1.5 text-black/40">
        {icon}

        <span className="text-[11px]">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-xs font-black">
        {value}
      </p>
    </div>
  );
}