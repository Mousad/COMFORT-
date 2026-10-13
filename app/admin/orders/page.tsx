
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
  X,
  XCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  area: string;
  address: string;
  notes: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

type OrdersResponse = {
  orders?: Order[];
  message?: string;
  error?: string;
};

type UpdateOrderResponse = {
  order?: Order;
  message?: string;
  error?: string;
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

/* إنشاء نغمة تنبيه من المتصفح، دون ملف صوت خارجي. */
function playNotificationSound(context: AudioContext) {
  if (context.state !== "running") return;

  const now = context.currentTime;

  [880, 1174].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = now + index * 0.22;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.22, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(start);
    oscillator.stop(start + 0.19);
  });
}

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
    case "ملغى":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "جديد":
      return <Clock size={14} />;
    case "جاري التنفيذ":
    case "جاهز للشحن":
      return <Package size={14} />;
    case "تم الشحن":
      return <Truck size={14} />;
    case "تم التسليم":
      return <CheckCircle size={14} />;
    case "ملغي":
    case "ملغى":
      return <XCircle size={14} />;
    default:
      return <Package size={14} />;
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
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "تاريخ غير متاح";
  }

  return parsedDate.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();

  if (!responseText.trim()) {
    if (!response.ok) {
      throw new Error(`فشل الاتصال بالسيرفر (HTTP ${response.status}).`);
    }

    return {} as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(
      `السيرفر رجّع استجابة غير صالحة (HTTP ${response.status}).`
    );
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null
  );

  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [latestNewOrderNumber, setLatestNewOrderNumber] = useState("");

  const knownOrderIdsRef = useRef<Set<string> | null>(null);
  const soundEnabledRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  /*
   * تفعيل الصوت أو إيقافه.
   * المتصفح يحتاج إلى تفاعل المستخدم للسماح بتشغيل الصوت.
   */
  const toggleSound = async () => {
    if (soundEnabledRef.current) {
      soundEnabledRef.current = false;
      setSoundEnabled(false);
      return;
    }

    try {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextConstructor) {
        throw new Error("المتصفح لا يدعم التنبيه الصوتي.");
      }

      const context =
        audioContextRef.current ?? new AudioContextConstructor();

      audioContextRef.current = context;

      await context.resume();

      soundEnabledRef.current = true;
      setSoundEnabled(true);

      // نغمة تجريبية عند تفعيل الصوت.
      playNotificationSound(context);
      setError("");
    } catch (error) {
      console.error("Enable notification sound error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "تعذر تفعيل الصوت. حاول مرة أخرى."
      );
    }
  };

  /*
   * جلب الطلبات واكتشاف الطلبات الجديدة.
   */
  const fetchOrders = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      }

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await readApiResponse<OrdersResponse>(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `حدث خطأ أثناء جلب الطلبات (HTTP ${response.status})`
        );
      }

      if (!Array.isArray(data.orders)) {
        throw new Error(
          "استجابة الطلبات غير صحيحة. تحقق من API الطلبات."
        );
      }

      const incomingOrders = data.orders;
      const knownIds = knownOrderIdsRef.current;

      if (knownIds === null) {
        // أول تحميل: تسجيل الطلبات الحالية دون إصدار صوت.
        knownOrderIdsRef.current = new Set(
          incomingOrders.map((order) => order.id)
        );
      } else {
        const arrivedOrders = incomingOrders.filter(
          (order) => !knownIds.has(order.id)
        );

        // نسجل الطلبات الجديدة قبل تشغيل الصوت لمنع التكرار.
        arrivedOrders.forEach((order) => knownIds.add(order.id));

        if (arrivedOrders.length > 0) {
          const latestOrder = arrivedOrders[0];

          setLatestNewOrderNumber(latestOrder.orderNumber);
          setNewOrderAlert(true);

          if (
            soundEnabledRef.current &&
            audioContextRef.current
          ) {
            try {
              playNotificationSound(audioContextRef.current);
            } catch (soundError) {
              console.error("Notification sound error:", soundError);
            }
          }
        }

        // حفظ جميع المعرّفات التي ظهرت.
        incomingOrders.forEach((order) => knownIds.add(order.id));
      }

      setOrders(incomingOrders);
      setError("");
    } catch (error) {
      console.error("Fetch orders error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء جلب الطلبات."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // أول تحميل.
  useEffect(() => {
    void fetchOrders();

    return () => {
      // تنظيف الصوت عند مغادرة الصفحة.
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [fetchOrders]);

  // فحص الطلبات كل 10 ثوانٍ.
  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchOrders();
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [fetchOrders]);

  // تحديث القائمة عند الرجوع إلى التبويب.
  useEffect(() => {
    const handleFocus = () => {
      void fetchOrders();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchOrders]);

  /*
   * تحديث حالة الطلب.
   */
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
          cache: "no-store",
        }
      );

      const data = await readApiResponse<UpdateOrderResponse>(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `فشل تحديث حالة الطلب (HTTP ${response.status})`
        );
      }

      if (!data.order) {
        throw new Error(
          "السيرفر لم يُرجع بيانات الطلب المحدّثة. تحقق من API تحديث الطلب."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? data.order! : order
        )
      );
    } catch (error) {
      console.error("Update order status error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء تحديث حالة الطلب."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // إحصائيات الطلبات.
  const counts = useMemo(
    () => ({
      all: orders.length,
      new: orders.filter((order) => order.status === "جديد").length,
      processing: orders.filter(
        (order) => order.status === "جاري التنفيذ"
      ).length,
      ready: orders.filter(
        (order) => order.status === "جاهز للشحن"
      ).length,
      shipped: orders.filter(
        (order) => order.status === "تم الشحن"
      ).length,
      delivered: orders.filter(
        (order) => order.status === "تم التسليم"
      ).length,
      cancelled: orders.filter(
        (order) =>
          order.status === "ملغي" || order.status === "ملغى"
      ).length,
    }),
    [orders]
  );

  // البحث والفلترة.
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "all" ||
        order.status === activeFilter ||
        (activeFilter === "ملغي" && order.status === "ملغى");

      if (!matchesFilter) return false;
      if (!query) return true;

      return (
        (order.orderNumber || "").toLowerCase().includes(query) ||
        (order.customerName || "").toLowerCase().includes(query) ||
        (order.customerPhone || "").toLowerCase().includes(query) ||
        (order.city || "").toLowerCase().includes(query) ||
        (order.area || "").toLowerCase().includes(query) ||
        (order.address || "").toLowerCase().includes(query)
      );
    });
  }, [orders, activeFilter, search]);

  // الأحدث أولًا.
  const sortedOrders = useMemo(
    () =>
      [...filteredOrders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      ),
    [filteredOrders]
  );

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f0ede8] px-4"
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
      className="min-h-screen overflow-x-hidden bg-[#f0ede8] text-[#171717]"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f0ede8]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center justify-between gap-2 px-3 py-3 sm:min-h-[76px] sm:gap-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-[10px] tracking-wide text-black/40 sm:text-xs">
              COMFORT KEEPERS
            </p>
            <h1 className="mt-1 text-lg font-semibold sm:text-2xl">
              إدارة الطلبات
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleSound()}
              aria-pressed={soundEnabled}
              title={
                soundEnabled
                  ? "إيقاف صوت التنبيه"
                  : "تفعيل صوت التنبيه"
              }
              className={`flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium transition sm:px-4 sm:text-sm ${
                soundEnabled
                  ? "bg-green-100 text-green-800"
                  : "bg-white text-black/70 shadow-sm hover:shadow-md"
              }`}
            >
              {soundEnabled ? (
                <Volume2 size={17} />
              ) : (
                <VolumeX size={17} />
              )}
              <span className="hidden sm:inline">
                {soundEnabled ? "الصوت مفعّل" : "تفعيل الصوت"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => void fetchOrders(true)}
              disabled={refreshing}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-medium shadow-sm transition hover:shadow-md disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] p-3 sm:p-6 lg:p-8">
        {/* تنبيه وصول طلب جديد */}
        {newOrderAlert && (
          <div
            role="status"
            className="mb-5 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
                <Package size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-blue-900 sm:text-base">
                  {latestNewOrderNumber
                    ? `وصل طلب جديد رقم ${latestNewOrderNumber}`
                    : "وصل طلب جديد"}
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-700">
                  يوجد {counts.new} طلب لم يتم تجهيزه بعد.
                  {soundEnabled
                    ? " التنبيه الصوتي مفعّل."
                    : " فعّل الصوت لسماع النغمة عند وصول طلب جديد."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNewOrderAlert(false)}
                aria-label="إغلاق التنبيه"
                className="rounded-lg p-1 text-blue-700 hover:bg-blue-100"
              >
                <X size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveFilter("جديد");
                setNewOrderAlert(false);
              }}
              className="w-full shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
            >
              عرض الطلبات الجديدة
            </button>
          </div>
        )}

        {/* الأخطاء */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-600 sm:flex-row sm:items-center sm:justify-between sm:px-4"
          >
            <span className="break-words">{error}</span>
            <button
              type="button"
              onClick={() => void fetchOrders(true)}
              className="shrink-0 self-start font-medium underline sm:self-auto"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* الإحصائيات */}
        <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-7">
          <StatCard
            label="كل الطلبات"
            value={counts.all}
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <StatCard
            label="لم تُجهّز"
            value={counts.new}
            active={activeFilter === "جديد"}
            onClick={() => setActiveFilter("جديد")}
          />
          <StatCard
            label="جاري التنفيذ"
            value={counts.processing}
            active={activeFilter === "جاري التنفيذ"}
            onClick={() => setActiveFilter("جاري التنفيذ")}
          />
          <StatCard
            label="جاهزة للشحن"
            value={counts.ready}
            active={activeFilter === "جاهز للشحن"}
            onClick={() => setActiveFilter("جاهز للشحن")}
          />
          <StatCard
            label="تم الشحن"
            value={counts.shipped}
            active={activeFilter === "تم الشحن"}
            onClick={() => setActiveFilter("تم الشحن")}
          />
          <StatCard
            label="تم التسليم"
            value={counts.delivered}
            active={activeFilter === "تم التسليم"}
            onClick={() => setActiveFilter("تم التسليم")}
          />
          <StatCard
            label="ملغية"
            value={counts.cancelled}
            active={activeFilter === "ملغي"}
            onClick={() => setActiveFilter("ملغي")}
          />
        </div>

        {/* البحث والفلاتر */}
        <section className="mb-5 rounded-2xl border border-black/5 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/35 sm:right-4"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف..."
                className="h-11 w-full rounded-xl border border-black/10 bg-[#faf9f7] py-2 pr-10 pl-3 text-sm outline-none transition focus:border-[#b89b72] focus:ring-2 focus:ring-[#b89b72]/10 sm:h-12 sm:pr-11 sm:pl-4"
              />
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`shrink-0 rounded-xl px-3 py-2.5 text-xs font-medium transition sm:px-4 ${
                    activeFilter === filter.key
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

        {/* عنوان النتائج */}
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold sm:text-lg">
              {filters.find((filter) => filter.key === activeFilter)?.label ||
                "جميع الطلبات"}
            </h2>
            <p className="mt-1 text-xs text-black/40">
              عرض {sortedOrders.length} من {orders.length} طلب
            </p>
          </div>
        </div>

        {/* قائمة الطلبات */}
        {sortedOrders.length === 0 ? (
          <div className="rounded-2xl border border-black/5 bg-white px-4 py-12 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ede8] text-black/25">
              <Package size={28} />
            </div>
            <h3 className="mt-5 text-lg font-semibold">لا توجد طلبات</h3>
            <p className="mt-2 text-sm text-black/40">
              {search
                ? "لم نجد طلبات تطابق البحث."
                : "لا توجد طلبات في هذه الحالة حاليًا."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const actionText = getActionText(order.status);
              const updating = updatingOrderId === order.id;
              const totalQuantity = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-3 sm:p-5">
                    {/* رقم الطلب والحالة */}
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0ede8] text-[#b89b72] sm:h-12 sm:w-12">
                        <Package size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="break-all text-sm font-semibold hover:underline sm:text-base"
                          >
                            {order.orderNumber}
                          </Link>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium sm:text-[11px] ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>

                        <p className="mt-1.5 text-[11px] text-black/40 sm:text-xs">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* معلومات العميل */}
                    <div className="mt-4 rounded-xl bg-[#faf9f7] p-3 sm:mt-5 sm:p-4">
                      <div className="flex items-start gap-2">
                        <User
                          size={16}
                          className="mt-0.5 shrink-0 text-black/35"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-medium">
                            {order.customerName}
                          </p>
                          <p className="mt-1 break-words text-xs text-black/50">
                            {order.customerPhone}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 border-t border-black/5 pt-3">
                        <p className="text-xs leading-6 text-black/60">
                          <span className="font-medium text-black/75">
                            العنوان:
                          </span>{" "}
                          {[order.city, order.area, order.address]
                            .filter(Boolean)
                            .join(" — ") || "لم يُحدد العنوان"}
                        </p>

                        {order.notes && (
                          <p className="mt-2 break-words text-xs leading-6 text-black/50">
                            <span className="font-medium text-black/70">
                              ملاحظات:
                            </span>{" "}
                            {order.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ملخص الطلب */}
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
                      <div className="rounded-xl border border-black/5 p-3">
                        <p className="text-[11px] text-black/40 sm:text-xs">
                          عدد المنتجات
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {order.items.length} منتج
                        </p>
                        <p className="mt-1 text-[11px] text-black/40">
                          إجمالي الكمية: {totalQuantity}
                        </p>
                      </div>

                      <div className="rounded-xl border border-black/5 p-3">
                        <p className="text-[11px] text-black/40 sm:text-xs">
                          إجمالي الطلب
                        </p>
                        <p className="mt-1 break-words text-base font-semibold sm:text-lg">
                          {Number(order.total).toLocaleString("ar-EG")} جنيه
                        </p>
                      </div>
                    </div>

                    {/* الإجراءات */}
                    <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f0ede8] px-4 py-2.5 text-sm font-medium transition hover:bg-black/10 sm:w-auto"
                      >
                        التفاصيل
                        <ChevronLeft size={16} />
                      </Link>

                      {nextStatus && actionText && (
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            void updateOrderStatus(order.id, nextStatus)
                          }
                          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:flex-1"
                        >
                          {updating ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              جاري تحديث الطلب...
                            </span>
                          ) : (
                            actionText
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* مؤشر الطلب الجديد */}
                  {order.status === "جديد" && (
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

/* بطاقة الإحصائيات */
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
      className={`min-w-0 rounded-xl border p-3 text-right shadow-sm transition sm:rounded-2xl sm:p-4 ${
        active
          ? "border-[#b89b72] bg-white ring-2 ring-[#b89b72]/10"
          : "border-black/5 bg-white hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <p className="break-words text-[11px] leading-5 text-black/45 sm:text-xs">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold sm:mt-2 sm:text-2xl">
        {value}
      </p>
    </button>
  );
}
