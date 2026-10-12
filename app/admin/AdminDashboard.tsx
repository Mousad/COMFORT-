
"use client";

import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Tags,
  TrendingUp,
  Truck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  image: string | null;
  quantity: number;
  revenue: number;
};

type DashboardData = {
  period?: { year: number; month: number };
  summary: {
    totalOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
    sales: number;
    deliveredSales: number;
  };
  topProducts: Product[];
  daily: { day: number; orders: number }[];
  busiestDay: { day: number; orders: number };
  quietestDay?: { day: number; orders: number };
};

const monthNames = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const money = (value: number) =>
  new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 2,
  }).format(value) + " ج.م";

const navigation = [
  { label: "الرئيسية", href: "/admin", icon: LayoutDashboard },
  { label: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
  { label: "المنتجات", href: "/admin/products", icon: Package },
  { label: "الأقسام", href: "/admin/categories", icon: Tags },
  { label: "العملاء", href: "/admin/customers", icon: Users },
  { label: "الإعدادات", href: "/admin/settings", icon: Settings },
];

export default function AdminDashboard() {
  const pathname = usePathname();
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"quantity" | "revenue">("quantity");

  const loadDashboard = useCallback(
    async (signal?: AbortSignal, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch(
          `/api/admin/dashboard?month=${month}&year=${year}`,
          {
            cache: "no-store",
            signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.error ||
              `تعذر تحميل البيانات (رمز الخطأ ${response.status}).`
          );
        }

        if (!result?.summary || !Array.isArray(result.daily)) {
          throw new Error("استجابة الإحصائيات غير مكتملة. راجع ملف API.");
        }

        setData(result as DashboardData);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "حدث خطأ أثناء تحميل البيانات."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [month, year]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard]);

  useEffect(() => {
    setSelectedDay(null);
  }, [month, year]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("تعذر تسجيل الخروج. حاول مرة أخرى.");
      }

      window.location.replace("/admin/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "تعذر تسجيل الخروج."
      );
      setLoggingOut(false);
    }
  };

  const summary = data?.summary;

  const cards = [
    {
      title: "طلبات الشهر",
      value: summary?.totalOrders ?? 0,
      note: "جميع الطلبات المسجلة",
      icon: ShoppingBag,
      gradient: "from-blue-500 to-indigo-600",
      soft: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "إجمالي المبيعات",
      value: money(summary?.sales ?? 0),
      note: "الطلبات غير الملغاة",
      icon: CircleDollarSign,
      gradient: "from-emerald-500 to-teal-600",
      soft: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "تم تسليمها",
      value: summary?.deliveredOrders ?? 0,
      note: "طلبات وصلت للعملاء",
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-600",
      soft: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "طلبات ملغاة",
      value: summary?.cancelledOrders ?? 0,
      note: "الطلبات الملغاة خلال الشهر",
      icon: XCircle,
      gradient: "from-rose-500 to-red-600",
      soft: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      title: "قيد التنفيذ",
      value: summary?.pendingOrders ?? 0,
      note: "تحتاج إلى متابعة",
      icon: Truck,
      gradient: "from-amber-500 to-orange-600",
      soft: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "قيمة الطلبات المسلّمة",
      value: money(summary?.deliveredSales ?? 0),
      note: "إجمالي قيمة الطلبات المسلّمة",
      icon: TrendingUp,
      gradient: "from-violet-500 to-purple-600",
      soft: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  const maxDailyOrders = Math.max(
    1,
    ...(data?.daily.map((item) => item.orders) ?? [0])
  );

  const selectedDayData = data?.daily.find(
    (item) => item.day === selectedDay
  );

  const sortedProducts = useMemo(() => {
    return [...(data?.topProducts ?? [])].sort((a, b) => {
      if (sortBy === "revenue") {
        return b.revenue - a.revenue || b.quantity - a.quantity;
      }

      return b.quantity - a.quantity || b.revenue - a.revenue;
    });
  }, [data?.topProducts, sortBy]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f4f6fb] text-slate-800"
    >
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[270px] flex-col border-l border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <Package size={25} />
            </div>

            <div>
              <h2 className="text-sm font-black tracking-wide text-slate-900">
                COMFORT KEEPERS
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                إدارة المتجر
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-3 pt-6">
          <p className="px-3 text-[11px] font-bold tracking-widest text-slate-400">
            القائمة الرئيسية
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-l from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200"
                    : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <Icon size={19} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronLeft size={16} />}
              </a>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700">
                لوحة الإدارة
              </span>
            </div>
            <p className="text-xs leading-6 text-slate-500">
              تابع أداء متجرك وطلبات العملاء من مكان واحد.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm font-bold text-rose-600 transition hover:border-rose-200 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <LogOut size={19} />
            )}
            {loggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:mr-[270px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="فتح القائمة"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-xs font-semibold text-violet-600">
                  مرحباً بك في لوحة الإدارة
                </p>
                <h1 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
                  نظرة عامة على المتجر
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                متابعة البيانات الفعلية
              </div>

              <button
                type="button"
                onClick={() => void loadDashboard(undefined, true)}
                disabled={loading || refreshing}
                title="تحديث الإحصائيات"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-l from-[#4338ca] via-[#6d28d9] to-[#9333ea] p-5 text-white shadow-xl shadow-violet-200/60 sm:p-7 lg:p-8">
            <div className="pointer-events-none absolute -left-10 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-fuchsia-300/20 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                  <BarChart3 size={15} />
                  تقرير أداء المتجر
                </div>

                <h2 className="text-2xl font-black sm:text-3xl">
                  أرقام متجرك، بوضوح.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-violet-100">
                  راقب الطلبات والمبيعات والمنتجات الأكثر مبيعاً، وحدد
                  الفترة التي تريد مراجعتها. جميع الإحصائيات تأتي من
                  بيانات متجرك.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                <CalendarDays size={19} className="mr-1 text-violet-100" />

                <select
                  aria-label="اختيار الشهر"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  className="min-w-[115px] rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-white/50"
                >
                  {monthNames.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="اختيار السنة"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-white/50"
                >
                  {Array.from(
                    { length: 8 },
                    (_, index) => today.getFullYear() - index
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={20} />
              <div className="flex-1 leading-6">{error}</div>
              <button
                type="button"
                onClick={() => void loadDashboard()}
                className="shrink-0 rounded-lg bg-white px-3 py-1.5 font-bold text-rose-700 shadow-sm hover:bg-rose-100"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {loading && !data ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <LoaderCircle size={28} className="animate-spin" />
              </div>
              <h2 className="font-bold text-slate-800">
                جاري تحميل الإحصائيات
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                نجهّز بيانات الشهر المختار...
              </p>
            </div>
          ) : data ? (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article
                      key={card.title}
                      className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 sm:p-6"
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${card.gradient}`}
                      />

                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-500">
                            {card.title}
                          </p>
                          <p className="mt-4 break-words text-2xl font-black tracking-tight text-slate-900 sm:text-[27px]">
                            {card.value}
                          </p>
                          <p className="mt-3 text-xs leading-5 text-slate-400">
                            {card.note}
                          </p>
                        </div>

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.soft} ${card.iconColor} transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon size={23} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
                <article className="min-w-0 rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <BarChart3 size={22} />
                      </div>
                      <div>
                        <h2 className="font-black text-slate-900">
                          حركة الطلبات اليومية
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          اضغط على أي يوم لمعرفة عدد طلباته
                        </p>
                      </div>
                    </div>

                    <span className="w-fit rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
                      {monthNames[month - 1]} {year}
                    </span>
                  </div>

                  <div className="mt-7 overflow-x-auto pb-2">
                    <div className="flex h-[205px] min-w-[650px] items-end gap-1.5 border-b border-slate-100 px-1 sm:gap-2">
                      {data.daily.map((item) => {
                        const selected = selectedDay === item.day;
                        const barHeight =
                          item.orders === 0
                            ? 4
                            : Math.max(
                                8,
                                (item.orders / maxDailyOrders) * 142
                              );

                        return (
                          <button
                            key={item.day}
                            type="button"
                            aria-label={`اليوم ${item.day}: ${item.orders} طلب`}
                            aria-pressed={selected}
                            onClick={() =>
                              setSelectedDay(selected ? null : item.day)
                            }
                            title={`يوم ${item.day}: ${item.orders} طلب`}
                            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2 rounded-t-lg outline-none"
                          >
                            <span
                              className={`text-[10px] font-bold transition ${
                                selected
                                  ? "text-violet-700"
                                  : "text-slate-400 group-hover:text-violet-600"
                              }`}
                            >
                              {item.orders || ""}
                            </span>

                            <span
                              className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 group-hover:brightness-110 ${
                                selected
                                  ? "bg-gradient-to-t from-fuchsia-600 to-violet-500 shadow-lg shadow-violet-200"
                                  : item.orders > 0
                                    ? "bg-gradient-to-t from-indigo-600 to-violet-400"
                                    : "bg-slate-100 group-hover:bg-violet-100"
                              }`}
                              style={{ height: `${barHeight}px` }}
                            />

                            <span
                              className={`text-[10px] ${
                                selected
                                  ? "font-black text-violet-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {item.day}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                      عدد الطلبات غير الملغاة
                    </div>

                    {selectedDayData ? (
                      <div className="rounded-xl bg-violet-50 px-4 py-2 text-sm text-violet-800">
                        يوم{" "}
                        <strong>{selectedDayData.day}</strong>
                        <span className="mx-2 text-violet-300">|</span>
                        <strong>{selectedDayData.orders}</strong> طلب
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDay(data.busiestDay.day || null)
                        }
                        className="text-xs font-bold text-violet-700 hover:text-violet-900"
                      >
                        عرض أكثر الأيام نشاطاً
                      </button>
                    )}
                  </div>
                </article>

                <article className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900">
                        ملخص الفترة
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">
                        {monthNames[month - 1]} {year}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 p-5 text-white">
                    <p className="text-sm font-medium text-emerald-50">
                      إجمالي المبيعات
                    </p>
                    <p className="mt-3 break-words text-2xl font-black sm:text-3xl">
                      {money(summary?.sales ?? 0)}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-50">
                      <CircleDollarSign size={16} />
                      قيمة الطلبات غير الملغاة
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        الطلبات المسلّمة
                      </span>
                      <strong className="text-sm text-slate-900">
                        {summary?.deliveredOrders ?? 0}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        قيد التنفيذ
                      </span>
                      <strong className="text-sm text-slate-900">
                        {summary?.pendingOrders ?? 0}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                        الطلبات الملغاة
                      </span>
                      <strong className="text-sm text-slate-900">
                        {summary?.cancelledOrders ?? 0}
                      </strong>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs text-slate-400">
                        أكثر الأيام نشاطاً
                      </p>
                      <p className="mt-2 font-bold text-slate-800">
                        {data.busiestDay?.orders
                          ? `يوم ${data.busiestDay.day} — ${data.busiestDay.orders} طلب`
                          : "لا توجد طلبات غير ملغاة في هذه الفترة"}
                      </p>
                    </div>
                  </div>
                </article>
              </section>

              <section className="overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-600">
                      <Package size={22} />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900">
                        المنتجات الأكثر مبيعاً
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        أداء المنتجات خلال {monthNames[month - 1]} {year}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400">
                      ترتيب حسب:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSortBy("quantity")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                        sortBy === "quantity"
                          ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                          : "bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      الكمية المباعة
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy("revenue")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                        sortBy === "revenue"
                          ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                          : "bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      الإيرادات
                    </button>
                  </div>
                </div>

                {sortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                      <Package size={30} />
                    </div>
                    <h3 className="mt-4 font-bold text-slate-700">
                      لا توجد مبيعات مسجلة
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                      لا توجد منتجات مباعة في الطلبات غير الملغاة خلال
                      الفترة المختارة.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {sortedProducts.map((product, index) => {
                      const highestQuantity = Math.max(
                        1,
                        ...sortedProducts.map((item) => item.quantity)
                      );
                      const barWidth =
                        (product.quantity / highestQuantity) * 100;

                      return (
                        <div
                          key={product.id}
                          className="group flex min-w-0 items-center gap-3 px-4 py-4 transition hover:bg-slate-50/80 sm:gap-4 sm:px-6"
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                              index === 0
                                ? "bg-amber-100 text-amber-700"
                                : index === 1
                                  ? "bg-slate-200 text-slate-600"
                                  : index === 2
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 sm:h-[68px] sm:w-[68px]">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">
                                <Package size={24} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-bold leading-6 text-slate-800">
                              {product.name}
                            </h3>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 max-w-32 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-gradient-to-l from-violet-600 to-fuchsia-500 transition-all"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                              <span className="shrink-0 text-[11px] text-slate-400">
                                {product.quantity} قطعة
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-left">
                            <p className="text-sm font-black text-slate-800 sm:text-base">
                              {money(product.revenue)}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                              قيمة المبيعات
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs text-slate-400 sm:px-6">
                  <span>
                    عرض {sortedProducts.length} منتجات كحد أقصى من بيانات الفترة
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    بيانات من قاعدة المتجر
                  </span>
                </div>
              </section>

              <footer className="pb-2 text-center text-xs text-slate-400">
                COMFORT KEEPERS · لوحة إدارة المتجر
              </footer>
            </>
          ) : !error ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
              لا توجد بيانات لعرضها.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
