"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import arData from "@/locales/ar.json";
import enData from "@/locales/en.json";

export type Locale = "ar" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  toggleLocale: () => void;
  dir: "rtl" | "ltr";
  t: (path: string, fallback?: string) => string;
}

const dictionaries: Record<Locale, Record<string, unknown>> = {
  ar: arData,
  en: enData,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    // Restore the saved locale from the external store on mount. This must run
    // after hydration, so the synchronous setState here is intentional.
    try {
      const saved = localStorage.getItem("ltb_locale") as Locale | null;
      if (saved === "ar" || saved === "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(saved);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const setLocale = (newLoc: Locale) => {
    setLocaleState(newLoc);
    try {
      localStorage.setItem("ltb_locale", newLoc);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLoc;
      document.documentElement.dir = newLoc === "ar" ? "rtl" : "ltr";
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "ar" ? "en" : "ar");
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
  }, [locale]);

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: unknown = dictionaries[locale];

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        // Fallback to Arabic or English
        let fallbackVal: unknown = dictionaries.ar;
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === "object" && fk in fallbackVal) {
            fallbackVal = (fallbackVal as Record<string, unknown>)[fk];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        return typeof fallbackVal === "string" ? fallbackVal : fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, dir, t }}>
      <div dir={dir} className={locale === "ar" ? "font-cairo" : "font-space"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
