"use client";

import { FormEvent, useState } from "react";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#f5f3ef] px-4"
    >
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white">
              <ShieldCheck size={30} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              لوحة التحكم
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              سجّل الدخول لإدارة متجر COMFORT KEEPERS
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@comfortkeepers.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-black focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                كلمة المرور
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-4 text-sm outline-none transition focus:border-black focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          COMFORT KEEPERS • Admin
        </p>
      </div>
    </main>
  );
}