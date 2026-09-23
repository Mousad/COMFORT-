export type StoreSettings = {
  storeName: string;
  storeDescription: string;
  phone: string;
  whatsapp: string;
  address: string;
  shippingCost: number;
  freeShippingMinimum: number;
  currency: string;
  instagram: string;
  facebook: string;
  acceptOrders: boolean;
};

export const defaultStoreSettings: StoreSettings = {
  storeName: "ME Store",
  storeDescription: "متجر العطور والجمال",
  phone: "",
  whatsapp: "",
  address: "",
  shippingCost: 50,
  freeShippingMinimum: 500,
  currency: "جنيه",
  instagram: "",
  facebook: "",
  acceptOrders: true,
};

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") {
    return defaultStoreSettings;
  }

  try {
    const saved = localStorage.getItem("store-settings");

    if (!saved) {
      return defaultStoreSettings;
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaultStoreSettings,
      ...parsed,
    };
  } catch (error) {
    console.error(
      "Failed to load store settings:",
      error
    );

    return defaultStoreSettings;
  }
}

export function calculateShipping(
  subtotal: number,
  settings?: StoreSettings
) {
  const storeSettings =
    settings || getStoreSettings();

  if (
    subtotal >=
    storeSettings.freeShippingMinimum
  ) {
    return 0;
  }

  return storeSettings.shippingCost;
}