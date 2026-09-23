
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { Product } from "@/types/product";

type WishlistContextType = {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  wishlistCount: number;
};

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(
        "comfort-keepers-wishlist"
      );

      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem(
        "comfort-keepers-wishlist",
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("Failed to save wishlist:", error);
    }
  }, [items, mounted]);

  const toggleWishlist = (product: Product) => {
    setItems((currentItems) => {
      const exists = currentItems.some(
        (item) => item.id === product.id
      );

      if (exists) {
        return currentItems.filter(
          (item) => item.id !== product.id
        );
      }

      return [...currentItems, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return items.some(
      (item) => item.id === productId
    );
  };

  const removeFromWishlist = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== productId
      )
    );
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const wishlistCount = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used within WishlistProvider"
    );
  }

  return context;
}

