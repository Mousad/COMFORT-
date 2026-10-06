import Header, { Footer } from "@/components/layout/Header";

import {
  AnnouncementBar,
  BrandStory,
  CategoriesSection,
  ContactSection,
  EditorialBanner,
  Hero,
  HomeProductSections,
} from "@/components/home/HomeSections";

import InstagramReviews from "@/components/home/InstagramReviews";

import BestSellers from "@/components/home/BestSellers";

import {
  getCategories,
  getProducts,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories = [];
  let products = [];

  try {
    [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);
  } catch (error) {
    console.error("HOME DATA ERROR:", error);
  }

  return (
    <>
      <Header />

      <main>
        <Hero />
        <AnnouncementBar />
        <CategoriesSection categories={categories} />

        <HomeProductSections
          best={[]}
          products={products}
          categories={categories}
        />

        <BestSellers products={products} />

        <EditorialBanner />
        <BrandStory />

        <InstagramReviews />

        <ContactSection />
      </main>

      <Footer />
    </>
  );
}