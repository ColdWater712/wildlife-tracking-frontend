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
import { CircleAlert, CircleCheck, X } from "lucide-react";

type ToastType = "success" | "error";
type ToastPosition = "center" | "bottom-right";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  position: ToastPosition;
};

type ToastOptions = {
  position?: ToastPosition;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const CONTAINER_CLASS: Record<ToastPosition, string> = {
  center:
    "pointer-events-none fixed left-1/2 top-4 z-[200] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-2",
  "bottom-right":
    "pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", options: ToastOptions = {}) => {
      nextId.current += 1;

      setToasts((current) =>
        [
          ...current,
          {
            id: nextId.current,
            message,
            type,
            position: options.position ?? "center",
          },
        ].slice(-3),
      );
    },
    [],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 3800),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts, dismissToast]);

  const renderToasts = (position: ToastPosition) =>
    toasts
      .filter((toast) => toast.position === position)
      .map((toast) => (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface p-4 shadow-xl ${
            toast.type === "success" ? "border-primary/25" : "border-danger/25"
          }`}
        >
          {toast.type === "success" ? (
            <CircleCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-primary"
            />
          ) : (
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-danger"
            />
          )}
          <p
            className={`flex-1 text-sm font-medium ${
              toast.type === "success" ? "text-primary-dark" : "text-danger"
            }`}
          >
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Tutup notifikasi"
            className="rounded text-muted transition hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      ));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className={CONTAINER_CLASS.center}>{renderToasts("center")}</div>
      <div className={CONTAINER_CLASS["bottom-right"]}>
        {renderToasts("bottom-right")}
      </div>
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
