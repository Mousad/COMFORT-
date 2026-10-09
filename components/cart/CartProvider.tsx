
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { Product } from "@/types/product";

type CartItem = Product & {
  quantity: number;
  image?: string;
  images?: string[];
  imageUrl?: string;
  thumbnail?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "comfort-keepers-cart";

/**
 * توحيد رابط صورة المنتج في الحقل image.
 * يحتفظ ببقية بيانات المنتج كما هي.
 */
function normalizeCartProduct(product: any): CartItem {
  const candidates = [
    product?.image,
    product?.images?.[0],
    product?.imageUrl,
    product?.thumbnail,
    product?.images?.[0]?.url,
    product?.images?.[0]?.src,
  ];

  const image = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );

  return {
    ...product,
    image: image || undefined,
    quantity: Math.max(1, Number(product?.quantity) || 1),
  } as CartItem;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // تحميل السلة المحفوظة محلياً.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart.map(normalizeCartProduct));
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setMounted(true);
    }
  }, []);

  // حفظ السلة بعد تحميل بياناتها.
  useEffect(() => {
    if (!mounted) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [items, mounted]);

  // إضافة المنتج أو زيادة كميته.
  const addToCart = (product: Product) => {
    const normalizedProduct = normalizeCartProduct(product);

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => String(item.id) === String(normalizedProduct.id)
      );

      if (existingItem) {
        return currentItems.map((item) =>
          String(item.id) === String(normalizedProduct.id)
            ? {
                ...item,
                ...normalizedProduct,
                // الاحتفاظ بالصورة القديمة إذا لم تصل صورة جديدة.
                image:
                  normalizedProduct.image ||
                  item.image ||
                  item.images?.[0] ||
                  item.imageUrl ||
                  item.thumbnail,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...normalizedProduct,
          quantity: 1,
        },
      ];
    });
  };

  // حذف منتج.
  const removeFromCart = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  };

  // زيادة الكمية.
  const increaseQuantity = (productId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        String(item.id) === String(productId)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // تقليل الكمية وحذف المنتج إذا وصلت إلى صفر.
  const decreaseQuantity = (productId: string) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          String(item.id) === String(productId)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // تفريغ السلة.
  const clearCart = () => {
    setItems([]);
  };

  // إجمالي عدد القطع.
  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // إجمالي الأسعار.
  const cartTotal = items.reduce(
    (total, item) => total + Number(item.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

