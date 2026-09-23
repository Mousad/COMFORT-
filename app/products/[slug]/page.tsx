import { notFound } from "next/navigation";

import Header, {
  Footer,
} from "@/components/layout/Header";

import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/api";

import ProductDetails from "@/components/products/ProductDetails";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(
    product.id,
    product.category,
    4
  );

  return (
    <>
      <Header />

      <ProductDetails
        product={product}
        related={related}
      />

      <Footer />
    </>
  );
}