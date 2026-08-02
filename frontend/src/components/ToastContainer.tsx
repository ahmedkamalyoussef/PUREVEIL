import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface ToastMessage {
  id: string;
  message: string;
  messageEn?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const { lang } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const displayMessage = lang === 'en' && toast.messageEn ? toast.messageEn : toast.message;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-primary/40 bg-surface-container-high/90 text-on-surface shadow-gold-glow',
      iconColor: 'text-primary',
      bar: 'bg-primary',
    },
    error: {
      icon: AlertCircle,
      border: 'border-red-500/40 bg-red-950/80 text-red-300',
      iconColor: 'text-red-400',
      bar: 'bg-red-400',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-500/40 bg-amber-950/80 text-amber-300',
      iconColor: 'text-amber-400',
      bar: 'bg-amber-400',
    },
    info: {
      icon: Info,
      border: 'border-primary/40 bg-background/90 text-on-surface',
      iconColor: 'text-primary',
      bar: 'bg-primary',
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div className={`relative overflow-hidden w-80 md:w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${config.border}`}>
      <div className="flex items-center gap-3 truncate">
        <Icon className={`w-5 h-5 shrink-0 ${config.iconColor}`} />
        <span className="text-xs font-sans font-semibold leading-relaxed truncate">
          {displayMessage}
        </span>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-muted hover:text-on-surface rounded-lg shrink-0 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-bg/50">
        <div className={`h-full ${config.bar} animate-toast-progress`} />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onDismiss: (id: string) => void }> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
