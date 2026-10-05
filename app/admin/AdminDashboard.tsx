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

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-900">
          لوحة تحكم COMFORT KEEPERS
        </h1>

        <p className="mt-2 text-gray-500">
          مرحبًا بك في لوحة التحكم
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <ShoppingBag className="mb-4" />
            <h2 className="font-semibold">الطلبات</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <Package className="mb-4" />
            <h2 className="font-semibold">المنتجات</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <Box className="mb-4" />
            <h2 className="font-semibold">التصنيفات</h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <TrendingUp className="mb-4" />
            <h2 className="font-semibold">المبيعات</h2>
          </div>
        </div>
      </div>
    </main>
  );
}