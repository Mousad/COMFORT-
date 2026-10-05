import Header, { Footer } from "@/components/layout/Header";

import {
  AnnouncementBar,
  BrandStory,
  CategoriesSection,
  ContactSection,
  EditorialBanner,
  Hero,
  HomeProductSections,
  InstagramReviews,
} from "@/components/home/HomeSections";

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
        {/* Hero */}
        <Hero />

        {/* Announcement */}
        <AnnouncementBar />

        {/* Categories */}
        <CategoriesSection categories={categories} />

        {/* Products */}
        <HomeProductSections
          best={[]}
          products={products}
          categories={categories}
        />

        {/* Best Sellers */}
        <BestSellers products={products} />

        {/* Editorial Banner */}
        <EditorialBanner />

        {/* Brand Story */}
        <BrandStory />

        {/* Instagram Reviews */}
        <InstagramReviews />

        {/* Contact */}
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}