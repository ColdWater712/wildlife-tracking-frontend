"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { DEFAULT_LOCALE, MESSAGES, type AppLocale, type MessageKey } from "@/lib/i18n";
import type { TYPE_USER_ROLE } from "@/types/auth.type";

const LOCALE_STORAGE_KEY = "app-locale";
const LOCALE_EVENT = "app-locale-change";

type PreferencesContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  toggleLocale: () => void;
  t: (key: MessageKey) => string;
};

const PreferencesContext = createContext<PreferencesContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  toggleLocale: () => undefined,
  t: (key) => MESSAGES[DEFAULT_LOCALE][key],
});

const readStoredLocale = (): AppLocale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY) === "en" ? "en" : "id";
  } catch {
    return DEFAULT_LOCALE;
  }
};

const subscribeLocale = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCALE_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(LOCALE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(LOCALE_EVENT, onStoreChange);
  };
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    readStoredLocale,
    () => DEFAULT_LOCALE,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    document.documentElement.lang = next;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Abaikan jika penyimpanan browser diblokir.
    }
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "id" ? "en" : "id");
  }, [locale, setLocale]);

  const t = useCallback((key: MessageKey) => MESSAGES[locale][key], [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => useContext(PreferencesContext);

const UserRoleContext = createContext<TYPE_USER_ROLE | null>(null);

export function UserRoleProvider({ role, children }: { role: TYPE_USER_ROLE; children: ReactNode }) {
  return <UserRoleContext.Provider value={role}>{children}</UserRoleContext.Provider>;
}

export const useUserRole = () => useContext(UserRoleContext);
