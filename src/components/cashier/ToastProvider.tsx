"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "info", duration = 3000) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      timers.current.set(id, setTimeout(() => removeToast(id), duration));
    }
  }, [removeToast]);

  useEffect(() => {
    return () => { timers.current.forEach((t) => clearTimeout(t)); };
  }, []);

  const typeStyles: Record<string, string> = {
    success: "bg-forest-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-savanna-500 text-white",
    info: "bg-terracotta-500 text-white",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
    error: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    warning: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    info: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg pointer-events-auto min-w-[240px] max-w-[360px] ${typeStyles[toast.type]}`}>
              {typeIcons[toast.type]}
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
