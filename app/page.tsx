import Header, { Footer } from "@/components/layout/Header";

import {
  AnnouncementBar,
  BrandStory,
  CategoriesSection,
  EditorialBanner,
  Hero,
  HomeProductSections,
} from "@/components/home/HomeSections";

import BestSellers from "@/components/home/BestSellers";

import {
  getCategories,
  getProducts,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header />

      <main>

        {/* ===================================================
            HERO
        =================================================== */}

        <Hero />

        {/* ===================================================
            ANNOUNCEMENT BAR
        =================================================== */}

        <AnnouncementBar />

        {/* ===================================================
            CATEGORIES
        =================================================== */}

        <CategoriesSection
          categories={categories}
        />

       

        {/* ===================================================
            ALL PRODUCTS
            - جميع المنتجات
            - الفلاتر
            - الترقيم
        =================================================== */}

        <HomeProductSections
          best={[]}
          products={products}
          categories={categories}
        />


         {/* ===================================================
            BEST SELLERS
            - منتجات مختلطة
            - نسائي
            - رجالي
            - Skin Care
            - 50 ml
            - مرتبة حسب المبيعات
        =================================================== */}

        <BestSellers
          products={products}
        />

        {/* ===================================================
            EDITORIAL BANNER
        =================================================== */}

        <EditorialBanner />

        {/* ===================================================
            BRAND STORY
        =================================================== */}

        <BrandStory />

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />
    </>
  );
} 