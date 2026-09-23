"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type AdminThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const AdminThemeContext =
  createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");

    setDarkMode(savedTheme === "dark");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      "admin-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode, mounted]);

  return (
    <AdminThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode: () => {
          setDarkMode((current) => !current);
        },
      }}
    >
      <div
        className={
          darkMode
            ? "admin-theme admin-theme-dark"
            : "admin-theme"
        }
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);

  if (!context) {
    throw new Error(
      "useAdminTheme must be used inside AdminThemeProvider"
    );
  }

  return context;
}