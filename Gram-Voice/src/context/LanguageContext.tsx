import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { translations } from "../translations/translations.ts";

type Language = "en" | "ta";

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [language, setLanguageState] =
    useState<Language>(() => {
      const savedLanguage =
        localStorage.getItem("gv_language");

      return savedLanguage === "ta" ? "ta" : "en";
    });

  useEffect(() => {
    localStorage.setItem(
      "gv_language",
      language
    );
  }, [language]);

  const setLanguage = (
    newLanguage: Language
  ) => {
    setLanguageState(newLanguage);
  };

  const toggleLanguage = () => {
    setLanguageState((current) =>
      current === "en" ? "ta" : "en"
    );
  };

  const t = (key: TranslationKey): string => {
    const currentTranslations =
      translations[language] as typeof translations.en;

    return currentTranslations[key];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(
    LanguageContext
  );

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
};