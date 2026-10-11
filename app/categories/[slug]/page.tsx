import { notFound } from "next/navigation";
import Header, { Footer } from "@/components/layout/Header";
import { ProductCard } from "@/components/products/ProductCard";
import { mockCategories as categories } from "@/data/categories";
import { mockProducts as products } from "@/data/products";

const categoryAliases: Record<string, string[]> = {
  "perfume-wemn-50ml": [
    "perfume-wemn-50ml",
    "perfume-women-50ml",
    "women-perfume-50ml",
    "women-perfume",
  ],
  "perfume-women-50ml": [
    "perfume-wemn-50ml",
    "perfume-women-50ml",
    "women-perfume-50ml",
    "women-perfume",
  ],
  "men-perfume": ["men-perfume"],
  "women-perfume": ["women-perfume"],
  "skin-care": ["skin-care", "skincare"],
  skincare: ["skin-care", "skincare"],
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const acceptedSlugs = categoryAliases[slug] ?? [slug];

  const category = categories.find(
    (item) =>
      item.slug === slug ||
      acceptedSlugs.includes(item.slug),
  );

  if (!category) {
    notFound();
  }

  const filtered = products.filter(
    (product) =>
      acceptedSlugs.includes(product.category) ||
      product.category === category.slug,
  );

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-20">
        <div className="border-b border-black/15 pb-8">
          <p className="text-[10px] tracking-[0.3em] text-black/45">
            COLLECTION
          </p>

          <h1 className="mt-3 font-serif text-5xl">
            {category.name}
          </h1>

          <p className="mt-3 text-sm text-black/55">
            {category.description}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-black/60">
              لا توجد منتجات في هذا القسم حالياً.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
