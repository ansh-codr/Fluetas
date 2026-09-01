'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: ToastType;
}

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  success: () => {},
  info: () => {},
  warning: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev.slice(-3), { id, title, message, type }]); // Keep maximum 4 visible

    // Auto dismiss after 3.8s
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => showToast(title, message, 'success'), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast(title, message, 'info'), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast(title, message, 'warning'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, info, warning }}>
      {children}

      {/* Fixed Toast Stack */}
      <div
        className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map(t => {
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';
          const Icon = isSuccess ? CheckCircle2 : isWarning ? AlertCircle : Info;
          const iconColor = isSuccess ? '#10B981' : isWarning ? '#FBBF24' : '#38BDF8';
          const borderColor = isSuccess ? 'rgba(16,185,129,0.3)' : isWarning ? 'rgba(251,191,36,0.3)' : 'rgba(56,189,248,0.3)';

          return (
            <div
              key={t.id}
              className="pointer-events-auto bg-[#13161F]/95 backdrop-blur-md border rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 animate-slide-in-right transition-all"
              style={{ borderColor }}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
              >
                <Icon size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-['Outfit'] text-xs font-bold text-[#E8EAF6] m-0 leading-snug">
                  {t.title}
                </h4>
                {t.message && (
                  <p className="text-[0.7rem] text-[#8B91B0] m-0 mt-0.5 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-[#8B91B0] hover:text-white p-0.5 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
