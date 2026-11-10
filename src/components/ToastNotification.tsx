import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  durationMs?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, action?: ToastItem['action']) => void;
    error: (message: string, action?: ToastItem['action']) => void;
    info: (message: string, action?: ToastItem['action']) => void;
  };
  showToast: (item: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const duration = item.durationMs || (item.action ? 6000 : 3500);

    const newToast: ToastItem = { ...item, id };
    setToasts(prev => [...prev.slice(-3), newToast]); // Keep max 4 visible toasts

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toast = {
    success: (message: string, action?: ToastItem['action']) => showToast({ type: 'success', message, action }),
    error: (message: string, action?: ToastItem['action']) => showToast({ type: 'error', message, action }),
    info: (message: string, action?: ToastItem['action']) => showToast({ type: 'info', message, action }),
  };

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}

      {/* ARIA Live Region for High-Visibility System Status Feedback (Nielsen Heuristic #1) */}
      <div 
        role="region" 
        aria-label="Notifications" 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none max-w-md w-full px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#25231F]/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-white text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 w-full sm:w-auto"
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
              <span className="leading-tight break-words">{t.message}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-[11px] flex items-center gap-1 transition shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.action.label}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-white/50 hover:text-white transition cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside ToastProvider
    return {
      toast: {
        success: (msg: string) => console.log('[Toast Success]', msg),
        error: (msg: string) => console.error('[Toast Error]', msg),
        info: (msg: string) => console.info('[Toast Info]', msg),
      },
      showToast: () => {},
    };
  }
  return context;
}

