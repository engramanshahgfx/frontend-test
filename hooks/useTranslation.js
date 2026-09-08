import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import en from "@/public/locales/en/common.json";
import ar from "@/public/locales/ar/common.json";
import zh from "@/public/locales/zh/common.json";

const LOCALE_MAP = { en, ar, zh };

const getInitialLang = () => {
  if (typeof window !== "undefined") {
    const lang = window.location.pathname.split("/")[1];
    if (LOCALE_MAP[lang]) return lang;
  }
  return "en";
};

export function useTranslation() {
  const router = useRouter();
  const [language, setLanguage] = useState(getInitialLang);
  const [translations, setTranslations] = useState(() => LOCALE_MAP[getInitialLang()] || LOCALE_MAP.en);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTranslations = () => {
      try {
        const pathname = window.location.pathname;
        const lang = pathname.split("/")[1] || "en";
        setLanguage(lang);
        const loaded = LOCALE_MAP[lang] || LOCALE_MAP.en;
        setTranslations(loaded || {});
      } catch (error) {
        console.error("Failed to load translations:", error);
      }
    };

    loadTranslations();
  }, [router]);

  const t = (key, fallbackOrObj = {}) => {
    const fallback = typeof fallbackOrObj === "string" ? fallbackOrObj : null;
    const interpolationObj = typeof fallbackOrObj === "object" && fallbackOrObj !== null ? fallbackOrObj : {};

    const keys = key.split(".");
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return fallback !== null ? fallback : key;
      }
    }

    if (typeof value !== "string") {
      return fallback !== null ? fallback : key;
    }

    let result = value;
    for (const [placeholder, replacement] of Object.entries(interpolationObj)) {
      result = result.replace(new RegExp(`{${placeholder}}`, "g"), replacement);
    }

    return result;
  };

  return {
    t,
    language,
    isLoading,
    isRTL: language === "ar",
  };
}
