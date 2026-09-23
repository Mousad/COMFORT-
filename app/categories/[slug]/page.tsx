import { notFound } from "next/navigation";
import Header, { Footer } from "@/components/layout/Header";
import { ProductCard } from "@/components/products/ProductCard";
import { mockCategories as categories } from "@/data/categories";
import { mockProducts as products } from "@/data/products";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const filtered = products.filter(
    (product) =>
      product.category === slug ||
      (slug === "men-perfume" && product.category === "men-perfume") ||
      (slug === "women-perfume" && product.category === "women-perfume") ||
      (slug === "skincare" && product.category === "skincare"),
  );
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-20">
        <div className="border-b border-black/15 pb-8">
          <p className="text-[10px] tracking-[0.3em] text-black/45">
            COLLECTION
          </p>
          <h1 className="mt-3 font-serif text-5xl">{category.name}</h1>
          <p className="mt-3 text-sm text-black/55">{category.description}</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-6">
          {filtered.length
            ? filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            : products
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
