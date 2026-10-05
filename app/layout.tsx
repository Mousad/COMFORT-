import type { Metadata } from "next";
import "./globals.css";

import { CartProvider } from "@/components/cart/CartProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import ScrollToTop from "@/components/ScrollToTop";
import NewsletterPopup from "@/components/newsletter/NewsletterPopup";

export const metadata: Metadata = {
  title: "Comfort Keepers | عطور ومنتجات عناية",
  description: "تجربة عطرية مختارة بعناية من Comfort Keepers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ScrollToTop />

        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>

        <NewsletterPopup />
      </body>
    </html>
  );
}