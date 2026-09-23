"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

const links = [
  ["الرئيسية", "/"],
  ["المنتجات", "/products"],
  ["برفيوم حريمي", "/categories/women-perfume"],
  ["برفيوم رجالي", "/categories/men-perfume"],
  ["العناية بالبشرة", "/categories/skincare"],
  ["من نحن", "/about"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [hideBottomNav, setHideBottomNav] = useState(false);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    const footer = document.querySelector("footer");

    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHideBottomNav(entry.isIntersecting);
      },
      {
        threshold: 0.05,
      }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* =========================
          HEADER
      ========================== */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f0ede8]/95 backdrop-blur-sm">
        {/* =========================
            DESKTOP SHIPPING BAR
        ========================== */}
        

        {/* =========================
            DESKTOP NAVBAR
        ========================== */}
        <div className="mx-auto hidden max-w-[1400px] items-center justify-between px-5 py-4 md:flex md:px-8 lg:py-5">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 text-sm md:flex">
            <Link
              href="/products"
              className="transition-opacity hover:opacity-50"
            >
              المنتجات
            </Link>

            <Link
              href="/categories/women-perfume"
              className="transition-opacity hover:opacity-50"
            >
              نسائي
            </Link>

            <Link
              href="/categories/men-perfume"
              className="transition-opacity hover:opacity-50"
            >
              رجالي
            </Link>

            <Link
              href="/about"
              className="transition-opacity hover:opacity-50"
            >
              قصتنا
            </Link>
          </nav>

          {/* Desktop Logo */}
          <Link
            href="/"
            className="text-center leading-none"
          >
            <span className="block font-serif text-2xl tracking-[0.22em]">
              COMFORT
            </span>
          </Link>

          {/* Desktop Icons */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <Link
              href="/search"
              aria-label="بحث"
              className="hidden transition-opacity hover:opacity-50 md:block"
            >
              <Search
                size={20}
                strokeWidth={1.4}
              />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="المفضلة"
              className="relative transition-opacity hover:opacity-50"
            >
              <Heart
                size={20}
                strokeWidth={1.4}
              />

              {wishlistCount > 0 && (
                <span className="absolute -left-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#171717] text-[9px] text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="السلة"
              className="relative transition-opacity hover:opacity-50"
            >
              <ShoppingBag
                size={20}
                strokeWidth={1.4}
              />

              {cartCount > 0 && (
                <span className="absolute -left-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#171717] text-[9px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* =========================
            MOBILE TOP NAVBAR
            LOGO ONLY
        ========================== */}
        <div className="md:hidden">
          <div className="flex h-[62px] items-center justify-center">
            <Link
              href="/"
              className="text-center leading-none"
            >
              <span className="block font-serif text-[20px] tracking-[0.12em]">
                COMF
                <span className="text-[#b89b72]">
                  ORT
                </span>
              </span>
            </Link>
          </div>
        </div>

        {/* =========================
            MOBILE MENU
        ========================== */}
        {open && (
          <div
            className="fixed inset-0 z-[9999] h-screen w-screen bg-white text-[#171717]"
            style={{ opacity: 1 }}
          >
            {/* Menu Header */}
            <div className="flex h-20 items-center justify-between border-b border-black/10 px-6">
              <span className="text-xs tracking-[0.2em]">
                MENU
              </span>

              <button
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="flex h-10 w-10 items-center justify-center"
              >
                <X
                  size={24}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {/* Menu Links */}
            <nav className="px-6 pt-10">
              <div className="flex flex-col">
                {links.map(
                  ([label, href], index) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-black/10 py-5 text-xl font-serif transition-opacity hover:opacity-50"
                    >
                      <span>{label}</span>

                      <span className="text-sm text-black/30">
                        0{index + 1}
                      </span>
                    </Link>
                  )
                )}
              </div>
            </nav>

            {/* Menu Footer */}
            <div className="absolute bottom-8 left-6 right-6 border-t border-black/10 pt-5">
              <p className="text-sm">
                تجربة عطرية مختارة بعناية
              </p>

              <p className="mt-1 text-xs text-black/40">
                تابعينا على Instagram
              </p>
            </div>
          </div>
        )}
      </header>

      {/* =========================
          MOBILE BOTTOM NAVIGATION
      ========================== */}
      <nav
        className={`fixed bottom-6 left-6 right-6 z-50 rounded-[16px] border-t border-black/10 bg-white/85 backdrop-blur-md transition-all duration-300 md:hidden ${
          hideBottomNav
            ? "pointer-events-none translate-y-60 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="flex h-[50px] items-center rounded-full bg-white">
          {/* CART */}
          <Link
            href="/cart"
            aria-label="السلة"
            className="relative flex h-full w-full items-center justify-center"
          >
            <ShoppingBag
              size={21}
              strokeWidth={1.5}
            />

            {cartCount > 0 && (
              <span className="absolute right-[22%] top-[14px] flex h-4 w-4 items-center justify-center rounded-full bg-[#171717] text-[9px] text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* WISHLIST */}
          <Link
            href="/wishlist"
            aria-label="المفضلة"
            className="relative flex h-full w-full items-center justify-center"
          >
            <Heart
              size={21}
              strokeWidth={1.5}
            />

            {wishlistCount > 0 && (
              <span className="absolute right-[22%] top-[14px] flex h-4 w-4 items-center justify-center rounded-full bg-[#171717] text-[9px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* SEARCH - CENTER */}
          <Link
            href="/products?searchOpen=true"
            aria-label="البحث"
            className="flex h-full w-full items-center justify-center"
          >
            <span className="relative flex h-[50px] w-[50px] -translate-y-4 items-center justify-center rounded-full bg-[#4956ed] text-white shadow-md">
              <Search
                size={26}
                strokeWidth={2}
              />
            </span>
          </Link>

          {/* ACCOUNT */}
          <Link
            href="/about"
            aria-label="الحساب"
            className="flex h-full w-full items-center justify-center"
          >
            <User
              size={21}
              strokeWidth={2.5}
            />
          </Link>

          {/* MENU */}
          <button
            onClick={() =>
              setOpen((prev) => !prev)
            }
            aria-label={
              open
                ? "إغلاق القائمة"
                : "فتح القائمة"
            }
            className="flex h-full w-full items-center justify-center"
          >
            {open ? (
              <X
                size={21}
                strokeWidth={2.5}
              />
            ) : (
              <Menu
                size={21}
                strokeWidth={2.5}
              />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#171717] px-5 py-12 text-[#f0ede8] md:px-10 md:py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="text-center">
            <div className="font-serif text-[20px] tracking-[0.2em]">
              COMFORT KEEPERS 
            </div>

            <p className="mt-4  text-sm leading-7 text-white/60">
              عطور ومنتجات عناية مختارة لتحتفي بجمالك كل يوم.
            </p>
          </div>
        <div className="text-center grid grid-cols-2">
          {/* Explore */}
          <div>
            <h3 className="mb-4 text-sm text-white/50">
              استكشفي
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <Link href="/products">
                كل المنتجات
              </Link>

              <Link href="/categories/women-perfume">
                العطور النسائية
              </Link>

              <Link href="/categories/men-perfume">
                العطور الرجالية
              </Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 text-sm text-white/50">
              مساعدتك
            </h3>

            <div className="flex flex-col gap-3 text-sm">
              <Link href="/about">
                من نحن
              </Link>

              <Link href="/cart">
                سلة التسوق
              </Link>

              <Link href="/wishlist">
                المفضلة
              </Link>
            </div>
          </div>

          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm text-white/50">
              تواصلي معنا
            </h3>

            <p className="text-sm leading-7 text-white/75">
              واتساب: 01000000000
              <br />
              Instagram: @comfortkeepers08
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t text-center border-white/15 pt-5 text-xs text-white/40">
         © 2024 Comfort Keepers. جميع الحقوق محفوظة
  <span className="mx-2">|</span>
 {" "}
  <a
    href="https://uniguided.com" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-[#171717] transition hover:text-[#b89b72]" 
  > 
    تم التطوير  
  </a> 
        </div> 
      </div> 
    </footer> 
  ); 
}   

export default Header;
