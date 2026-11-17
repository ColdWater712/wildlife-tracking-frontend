
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      nextId.current += 1;

      setToast({
        id: nextId.current,
        message,
        type,
      });
    },
    [],
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          className="fixed right-4 top-4 z-[2000] w-[calc(100%-2rem)] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div
            className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${
              toast.type === "success"
                ? "border-emerald-200"
                : "border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2
                className="mt-0.5 shrink-0 text-emerald-600"
                size={21}
              />
            ) : (
              <XCircle
                className="mt-0.5 shrink-0 text-red-600"
                size={21}
              />
            )}

            <p
              className={`flex-1 text-sm font-medium ${
                toast.type === "success"
                  ? "text-emerald-800"
                  : "text-red-800"
              }`}
            >
              {toast.message}
            </p>

            <button
              type="button"
              onClick={dismissToast}
              aria-label="Tutup notifikasi"
              className="text-zinc-400 transition hover:text-zinc-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider.");
  }

  return context;
}
