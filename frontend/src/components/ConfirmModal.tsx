import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface ConfirmOptions {
  title: string;
  titleEn?: string;
  message: string;
  messageEn?: string;
  confirmText?: string;
  confirmTextEn?: string;
  cancelText?: string;
  cancelTextEn?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmModalProps {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  options,
  onConfirm,
  onCancel,
}) => {
  const { lang, t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onConfirm, onCancel]);

  const displayTitle = lang === 'en' && options.titleEn ? options.titleEn : options.title;
  const displayMessage = lang === 'en' && options.messageEn ? options.messageEn : options.message;
  const displayConfirm = lang === 'en' && options.confirmTextEn ? options.confirmTextEn : (options.confirmText || t('تأكيد', 'Confirm'));
  const displayCancel = lang === 'en' && options.cancelTextEn ? options.cancelTextEn : (options.cancelText || t('إلغاء', 'Cancel'));

  const typeConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-red-500/20 border-red-500/40 text-red-500',
      buttonBg: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:brightness-110 shadow-red-500/20',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
      buttonBg: 'bg-amber-500 text-background font-bold hover:brightness-110',
    },
    info: {
      icon: HelpCircle,
      iconBg: 'bg-primary/20 border-primary/40 text-primary',
      buttonBg: 'bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold shadow-gold-glow',
    },
  };

  const config = typeConfig[options.type || 'danger'];
  const Icon = config.icon;

  return (
    <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 z-40 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-panel-gold rounded-3xl p-6 md:p-8 w-full max-w-md space-y-6 relative border border-primary/40 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85dvh] overflow-y-auto my-auto">


        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-muted hover:text-on-surface rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl border ${config.iconBg} shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-on-surface">
              {displayTitle}
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-sans">
              {displayMessage}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {displayCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${config.buttonBg}`}
          >
            {displayConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};
