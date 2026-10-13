"use client";

import {
  ClipboardList,
  LayoutDashboard,
  Moon,
  Package,
  Settings,
  ShoppingBag,
  Sun,
  Tags,
  Users,
  MoreHorizontal,
  X,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminThemeProvider, useAdminTheme } from "./AdminThemeProvider";

const menuItems = [
  {
    name: "لوحة التحكم",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "المنتجات",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "الطلبات",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    name: "التصنيفات",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    name: "العملاء",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
  },
];

function isActivePath(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== "/admin" && pathname.startsWith(href))
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useAdminTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const primaryItems = menuItems.slice(0, 4);
  const moreItems = menuItems.slice(4);

  return (
    <div
      dir="rtl"
     className={`min-h-screen transition-colors duration-300 ${
  darkMode
    ? "bg-[#151412] text-white"
    : "bg-[#f7f5f1] text-[#211e1a]"
}`}
    >
      {/* القائمة الجانبية للكمبيوتر */}
      <aside
        className={`fixed right-0 top-0 z-40 hidden h-screen w-64 border-l transition-colors duration-300 lg:block ${
          darkMode
            ? "border-white/10 bg-[#201e1b]"
            : "border-black/10 bg-white"
        }`}
      >
        <div className="flex h-full flex-col">
          <div
            className={`border-b p-6 ${
              darkMode ? "border-white/10" : "border-black/10"
            }`}
          >
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-[60px] w-11 items-center justify-center overflow-hidden rounded-xl bg-[#b89b72]">
                <img
                  src="/loog.jpeg"
                  alt="ME Store"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h1 className="font-bold">ME Store</h1>
                <p
                  className={`text-xs ${
                    darkMode ? "text-white/50" : "text-black/40"
                  }`}
                >
                  لوحة الإدارة
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#b89b72]/15 text-[#b89b72]"
                      : darkMode
                        ? "text-white/65 hover:bg-white/5 hover:text-white"
                        : "text-black/60 hover:bg-black/[0.04] hover:text-black"
                  }`}
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div
            className={`border-t p-4 ${
              darkMode ? "border-white/10" : "border-black/10"
            }`}
          >
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`mb-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                darkMode
                  ? "text-white/70 hover:bg-white/5"
                  : "text-black/60 hover:bg-black/[0.04]"
              }`}
            >
              <span className="flex items-center gap-3">
                {darkMode ? <Sun size={19} /> : <Moon size={19} />}
                {darkMode ? "الوضع النهاري" : "الوضع الليلي"}
              </span>

              <span
                className={`relative h-6 w-11 rounded-full transition ${
                  darkMode ? "bg-[#b89b72]" : "bg-black/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    darkMode ? "right-1" : "right-6"
                  }`}
                />
              </span>
            </button>

            <Link
              href="/"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                darkMode
                  ? "text-white/70 hover:bg-white/5"
                  : "text-black/60 hover:bg-black/[0.04]"
              }`}
            >
              <ShoppingBag size={19} />
              <span>العودة للمتجر</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="min-w-0 pb-24 lg:mr-64 lg:pb-0">
        {children}
      </main>

      {/* القائمة السفلية للموبايل */}
      <nav
        aria-label="التنقل في لوحة الإدارة"
        className={`fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-xl transition-colors duration-300 lg:hidden ${
          darkMode
            ? "border-white/10 bg-[#201e1b]/95"
            : "border-[#e8e1d7] bg-white/95"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* قائمة المزيد */}
        {moreOpen && (
          <>
            <button
              type="button"
              aria-label="إغلاق قائمة المزيد"
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 bottom-16 z-[-1] bg-black/20"
            />

            <div
              className={`absolute bottom-full left-3 right-3 mb-3 rounded-2xl border p-2 shadow-2xl ${
                darkMode
                  ? "border-white/10 bg-[#292622]"
                  : "border-[#e8e1d7] bg-white"
              }`}
            >
              <p
                className={`px-3 py-2 text-xs font-semibold ${
                  darkMode ? "text-white/45" : "text-black/40"
                }`}
              >
                المزيد من الخيارات
              </p>

              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                      active
                        ? "bg-[#b89b72]/15 text-[#b89b72]"
                        : darkMode
                          ? "text-white/75 hover:bg-white/5"
                          : "text-[#45403a] hover:bg-[#f7f5f1]"
                    }`}
                  >
                    <Icon size={19} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={toggleDarkMode}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  darkMode
                    ? "text-white/75 hover:bg-white/5"
                    : "text-[#45403a] hover:bg-[#f7f5f1]"
                }`}
              >
                {darkMode ? <Sun size={19} /> : <Moon size={19} />}
                <span>
                  {darkMode ? "الوضع النهاري" : "الوضع الليلي"}
                </span>
              </button>

              <Link
                href="/"
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                  darkMode ? "text-white/75" : "text-[#45403a]"
                }`}
              >
                <Store size={19} />
                <span>العودة للمتجر</span>
              </Link>
            </div>
          </>
        )}

        <div className="grid grid-cols-5 px-1 pb-1 pt-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors ${
                  active
                    ? "text-[#b89b72]"
                    : darkMode
                      ? "text-white/50"
                      : "text-[#8b857d]"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-[3px] w-7 rounded-full bg-[#b89b72]" />
                )}

                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.8}
                />

                <span
                  className={`max-w-full truncate px-0.5 text-[10px] ${
                    active ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-label="المزيد من الخيارات"
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 transition-colors ${
              moreOpen ||
              moreItems.some((item) =>
                isActivePath(pathname, item.href)
              )
                ? "text-[#b89b72]"
                : darkMode
                  ? "text-white/50"
                  : "text-[#8b857d]"
            }`}
          >
            {moreOpen ? (
              <X size={21} />
            ) : (
              <MoreHorizontal size={21} />
            )}

            <span className="text-[10px] font-medium">
              المزيد
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
