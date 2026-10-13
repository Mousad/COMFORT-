
import { Suspense } from "react";
import NewProductForm from "./NewProductForm";

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div
          dir="rtl"
          className="flex min-h-screen items-center justify-center bg-[#f0ede8] text-sm text-black/60"
        >
          جاري تحميل نموذج المنتج...
        </div>
      }
    >
      <NewProductForm />
    </Suspense>
  );
}
