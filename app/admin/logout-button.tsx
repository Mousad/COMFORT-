"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      await fetch("/api/admin/logout", {
        method: "POST",
      });

      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-500 transition hover:bg-red-50 disabled:opacity-50"
    >
      <LogOut size={18} />

      {loading ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
    </button>
  );
}