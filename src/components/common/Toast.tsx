import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastCtx {
  showToast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export const useToast = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

const TOAST_STYLE: Record<ToastType, { bg: string; icon: typeof CheckCircle2; iconCls: string }> = {
  success: {
    bg: 'bg-mint-50 border-mint-200 text-mint-800',
    icon: CheckCircle2,
    iconCls: 'text-mint-500',
  },
  error: {
    bg: 'bg-rose-50 border-rose-200 text-rose-800',
    icon: AlertCircle,
    iconCls: 'text-rose-500',
  },
  info: {
    bg: 'bg-medical-50 border-medical-200 text-medical-800',
    icon: Info,
    iconCls: 'text-medical-500',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-6 right-6 z-[100] space-y-2 pointer-events-none">
        {toasts.map((t) => {
          const s = TOAST_STYLE[t.type];
          const Icon = s.icon;
          return (
            <div
              key={t.id}
              className={clsx(
                'pointer-events-auto min-w-[280px] max-w-sm px-4 py-3 rounded-xl border shadow-lg backdrop-blur flex items-start gap-3 animate-fade-in-up',
                s.bg
              )}
            >
              <Icon className={clsx('w-5 h-5 shrink-0 mt-0.5', s.iconCls)} strokeWidth={2} />
              <div className="flex-1 text-sm font-medium leading-relaxed pt-0.5">{t.message}</div>
              <button
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
