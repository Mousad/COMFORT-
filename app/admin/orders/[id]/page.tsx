"use client";

import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  productId: string | null;
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

const statuses = [
  "جديد",
  "جاري التنفيذ",
  "جاهز للشحن",
  "تم الشحن",
  "تم التسليم",
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

export default function OrderDetailsPage() {
  const params = useParams();

  const orderId = String(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/orders/${orderId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "حدث خطأ أثناء جلب الطلب"
          );
        }

        setOrder(data.order);
      } catch (error) {
        console.error(
          "Fetch order error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء جلب الطلب"
        );
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const updateOrderStatus = async (
    status: string
  ) => {
    if (!order) return;

    try {
      setUpdatingStatus(true);
      setError("");

      const response = await fetch(
        `/api/orders/${order.id}`,
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

      setOrder(data.order);
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
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f0ede8]"
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#b89b72]" />

          <p className="mt-4 text-sm text-black/50">
            جاري تحميل الطلب...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f0ede8] p-6"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <Package
            size={45}
            className="mx-auto text-black/20"
          />

          <h1 className="mt-5 text-xl font-semibold">
            الطلب غير موجود
          </h1>

          <p className="mt-2 text-sm text-red-500">
            {error ||
              "لم نتمكن من العثور على هذا الطلب."}
          </p>

          <Link
            href="/admin/orders"
            className="mt-6 inline-flex rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white"
          >
            العودة للطلبات
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (total, product) =>
      total +
      Number(product.price) * product.quantity,
    0
  );

  const shipping = 0;

  const total = Number(order.total);

  const currentIndex = statuses.indexOf(
    order.status
  );

  const nextStatus = getNextStatus(
    order.status
  );

  const actionText = getActionText(
    order.status
  );

  const formattedDate = new Date(
    order.createdAt
  ).toLocaleString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  /*
   * تكوين رقم WhatsApp الدولي
   *
   * مثال:
   * countryCode = 20
   * whatsappPhone = 1157499163
   *
   * النتيجة:
   * 201157499163
   */
  const whatsappNumber =
    `${order.whatsappCountryCode}${order.whatsappPhone}`;

  const whatsappMessage = encodeURIComponent(
    `مرحباً ${order.customerName} 👋

بخصوص طلبك رقم ${order.orderNumber} من COMFORT KEEPERS.

حالة طلبك الحالية: ${order.status}

إذا كان لديك أي استفسار، نحن معك.`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f0ede8] text-[#171717]"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f0ede8]/95 backdrop-blur-md">
        <div className="flex h-[76px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/orders"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-[#171717] hover:text-white"
          >
            <ArrowRight size={19} />
          </Link>

          <div>
            <p className="text-xs text-black/40">
              الطلبات
            </p>

            <h1 className="text-lg font-semibold">
              تفاصيل الطلب {order.orderNumber}
            </h1>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Order title */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold">
              الطلب {order.orderNumber}
            </h2>

            <p className="mt-2 text-sm text-black/45">
              تم إنشاء الطلب بتاريخ{" "}
              {formattedDate}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-xs font-medium ${getStatusStyle(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede8] text-[#b89b72]">
                <User size={19} />
              </div>

              <div>
                <h3 className="font-semibold">
                  بيانات العميل
                </h3>

                <p className="text-xs text-black/40">
                  معلومات صاحب الطلب
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <p className="text-xs text-black/40">
                  الاسم
                </p>

                <p className="mt-1 text-sm font-medium">
                  {order.customerName}
                </p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-xs text-black/40">
                  رقم المكالمات
                </p>

                <a
                  href={`tel:${order.customerPhone}`}
                  className="mt-1 flex items-center gap-2 text-sm font-medium text-[#8b6f47]"
                >
                  <Phone size={15} />

                  {order.customerPhone}
                </a>
              </div>

              {/* WhatsApp */}
              <div>
                <p className="text-xs text-black/40">
                  رقم WhatsApp
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-2 text-sm font-medium text-[#20bd5a]"
                >
                  <MessageCircle size={16} />

                  +{whatsappNumber}
                </a>
              </div>

              {/* Address */}
              <div>
                <p className="text-xs text-black/40">
                  العنوان
                </p>

                <div className="mt-1 flex items-start gap-2 text-sm font-medium">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-[#b89b72]"
                  />

                  <span>
                    {order.city}
                    {order.address
                      ? `، ${order.address}`
                      : ""}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div>
                  <p className="text-xs text-black/40">
                    ملاحظات العميل
                  </p>

                  <p className="mt-1 text-sm leading-6">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order information */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede8] text-[#b89b72]">
                <CheckCircle size={19} />
              </div>

              <div>
                <h3 className="font-semibold">
                  معلومات الطلب
                </h3>

                <p className="text-xs text-black/40">
                  تفاصيل الطلب والدفع
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-black/40">
                  رقم الطلب
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {order.orderNumber}
                </p>
              </div>

              <div>
                <p className="text-xs text-black/40">
                  تاريخ الطلب
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formattedDate}
                </p>
              </div>

              <div>
                <p className="text-xs text-black/40">
                  طريقة الدفع
                </p>

                <p className="mt-1 text-sm font-medium">
                  الدفع عند الاستلام
                </p>
              </div>

              <div>
                <p className="text-xs text-black/40">
                  حالة الطلب
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede8] text-[#b89b72]">
                <Truck size={19} />
              </div>

              <div>
                <h3 className="font-semibold">
                  متابعة الطلب
                </h3>

                <p className="text-xs text-black/40">
                  مراحل تنفيذ الطلب
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {statuses.map(
                (status, index) => {
                  const completed =
                    currentIndex >= index;

                  const isCurrent =
                    order.status === status;

                  return (
                    <div
                      key={status}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          completed
                            ? "bg-[#b89b72] text-white"
                            : "bg-black/5 text-black/30"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle size={15} />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <div>
                        <span
                          className={
                            isCurrent
                              ? "text-sm font-semibold"
                              : completed
                              ? "text-sm font-medium"
                              : "text-sm text-black/30"
                          }
                        >
                          {status}
                        </span>

                        {isCurrent && (
                          <p className="mt-1 text-[11px] text-[#b89b72]">
                            الحالة الحالية
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Status action */}
        {nextStatus && actionText && (
          <section className="mt-6 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0ede8] text-[#b89b72]">
                  {order.status ===
                  "جديد" ? (
                    <Clock size={22} />
                  ) : order.status ===
                    "جاري التنفيذ" ? (
                    <Package size={22} />
                  ) : (
                    <Truck size={22} />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">
                    {order.status ===
                    "جديد"
                      ? "الطلب لم يتم تجهيزه بعد"
                      : order.status ===
                        "جاري التنفيذ"
                      ? "الطلب قيد التنفيذ"
                      : order.status ===
                        "جاهز للشحن"
                      ? "الطلب جاهز للشحن"
                      : "الطلب تم شحنه"}
                  </h3>

                  <p className="mt-1 text-sm text-black/45">
                    {order.status ===
                    "جديد"
                      ? "اضغط على تنفيذ الطلب لبدء تجهيز طلب العميل."
                      : order.status ===
                        "جاري التنفيذ"
                      ? "عند الانتهاء من تجهيز المنتجات اضغط على تم تجهيز الطلب."
                      : order.status ===
                        "جاهز للشحن"
                      ? "عند تسليم الطلب لشركة التوصيل اضغط على تم الشحن."
                      : "عند تأكيد وصول الطلب للعميل اضغط على تم التسليم."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={updatingStatus}
                onClick={() =>
                  updateOrderStatus(
                    nextStatus
                  )
                }
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#171717] px-7 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingStatus ? (
                  <>
                    <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    جاري التحديث...
                  </>
                ) : (
                  actionText
                )}
              </button>
            </div>
          </section>
        )}

        {/* Delivered */}
        {order.status ===
          "تم التسليم" && (
          <section className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-green-800">
                  تم تسليم الطلب
                </h3>

                <p className="mt-1 text-sm text-green-700/70">
                  تم إكمال دورة الطلب بنجاح.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Products */}
        <section className="mt-6 rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="border-b border-black/5 p-5">
            <h3 className="font-semibold">
              المنتجات
            </h3>

            <p className="mt-1 text-xs text-black/40">
              المنتجات الموجودة في هذا الطلب
            </p>
          </div>

          <div className="divide-y divide-black/5">
            {order.items.map(
              (product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0ede8]">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package
                        size={25}
                        className="text-[#b89b72]"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium">
                      {product.name}
                    </h4>

                    <p className="mt-1 text-xs text-black/40">
                      {product.productId
                        ? `رقم المنتج: ${product.productId}`
                        : "منتج"}
                    </p>
                  </div>

                  <div className="text-sm text-black/50">
                    الكمية:{" "}
                    {product.quantity}
                  </div>

                  <div className="font-semibold">
                    {Number(
                      product.price
                    ).toLocaleString(
                      "ar-EG"
                    )}{" "}
                    جنيه
                  </div>
                </div>
              )
            )}
          </div>

          <div className="border-t border-black/5 bg-[#faf9f7] p-5">
            <div className="ml-auto w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-black/50">
                  المجموع الفرعي
                </span>

                <span>
                  {subtotal.toLocaleString(
                    "ar-EG"
                  )}{" "}
                  جنيه
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-black/50">
                  الشحن
                </span>

                <span>
                  {shipping === 0
                    ? "مجاني"
                    : `${shipping.toLocaleString(
                        "ar-EG"
                      )} جنيه`}
                </span>
              </div>

              <div className="flex justify-between border-t border-black/10 pt-3 text-lg font-semibold">
                <span>الإجمالي</span>

                <span>
                  {total.toLocaleString(
                    "ar-EG"
                  )}{" "}
                  جنيه
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="التواصل مع العميل عبر WhatsApp"
            title="التواصل عبر WhatsApp"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-medium text-white transition hover:scale-[1.02] hover:bg-[#20bd5a]"
          >
            <MessageCircle size={19} />

            WhatsApp
          </a>

          {/* Call */}
          <a
            href={`tel:${order.customerPhone}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:shadow-md"
          >
            <Phone size={17} />

            الاتصال بالعميل
          </a>

          {/* Back */}
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:shadow-md"
          >
            العودة إلى الطلبات
          </Link>
        </div>
      </main>
    </div>
  );
}