"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Locale } from "@/types";

interface LocaleContextType {
  locale: Locale;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  toggleLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "sw" : "en"));
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
