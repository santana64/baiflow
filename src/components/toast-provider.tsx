"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-[300] flex flex-col items-end gap-2"
      >
        {toasts.map((t) => (
          <ToastBubble key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const toastConfig: Record<
  ToastType,
  { Icon: React.ElementType; bar: string; icon: string }
> = {
  success: { Icon: CheckCircle2, bar: "bg-sage", icon: "text-sage" },
  error:   { Icon: AlertCircle,  bar: "bg-danger", icon: "text-danger" },
  info:    { Icon: Info,         bar: "bg-blue",   icon: "text-blue" },
  warning: { Icon: AlertCircle,  bar: "bg-warning", icon: "text-warning" }
};

function ToastBubble({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { Icon, bar, icon } = toastConfig[item.type];
  return (
    <div
      className={cn(
        "animate-toast-in pointer-events-auto flex min-w-[280px] max-w-sm items-start gap-3",
        "rounded-xl border border-line bg-white shadow-soft px-4 py-3.5"
      )}
    >
      {/* Left accent bar */}
      <span className={cn("mt-0.5 h-4 w-1 shrink-0 rounded-full", bar)} />
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", icon)} />
      <p className="flex-1 text-sm font-medium leading-snug text-ink">{item.message}</p>
      <button
        onClick={onClose}
        className="ml-1 shrink-0 rounded-md p-0.5 text-ink/25 transition-colors hover:bg-paper hover:text-ink/60"
        aria-label="Fermer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
