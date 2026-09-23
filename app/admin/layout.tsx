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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
   <div
  dir="rtl"
  className="min-h-screen transition-colors duration-300"
>
      {/* Sidebar */}
      <aside className="fixed right-0 top-0 z-40 hidden h-screen w-64 border-l border-black/10 bg-white transition-colors duration-300 lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-black/10 p-6">
            <Link
              href="/admin"
              className="flex items-center gap-3"
            >
              <div className="flex h-15 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#b89b72]">
                <img
                  src="/loog.jpeg"
                  alt="Perfume Store"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h1 className="font-bold">
                  ME Store
                </h1>

                <p className="text-xs text-black/40">
                  لوحة الإدارة
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#b89b72]/15 text-[#8b6f47]"
                      : "text-black/60 hover:bg-black/[0.04] hover:text-black"
                  }`}
                >
                  <Icon size={19} />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-black/10 p-4">
            {/* Dark Mode */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="mb-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-black/60 transition hover:bg-black/[0.04] hover:text-black"
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Sun size={19} />
                ) : (
                  <Moon size={19} />
                )}

                <span>
                  {darkMode
                    ? "الوضع النهاري"
                    : "الوضع الليلي"}
                </span>
              </div>

              <div
                className={`relative h-6 w-11 rounded-full transition ${
                  darkMode
                    ? "bg-[#b89b72]"
                    : "bg-black/10"
                }`}
              >
                <div
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                    darkMode
                      ? "right-1"
                      : "right-6"
                  }`}
                />
              </div>
            </button>

            {/* Store */}
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-black/60 transition hover:bg-black/[0.04] hover:text-black"
            >
              <ShoppingBag size={19} />

              <span>العودة للمتجر</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:mr-64">
        {children}
      </main>
    </div>
  );
}