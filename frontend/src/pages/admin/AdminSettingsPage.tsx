import React, { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdminSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [storeName, setStoreName] = useState('PURE VEIL - بيور فيل');
  const [supportEmail, setSupportEmail] = useState('support@pureveil.com');
  const [taxRate, setTaxRate] = useState('0');
  const [currency, setCurrency] = useState('KWD');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          {t('إعدادات متجر PURE VEIL', 'PURE VEIL Store Settings')}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t('تخصيص الإعدادات العامة للمتجر، العملة، وبريد الدعم', 'Configure global store settings, currency, and support contact')}
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-6">
        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{t('تم حفظ إعدادات المتجر بنجاح', 'Settings saved successfully')}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">
              {t('اسم المتجر الرسمي', 'Official Store Name')}
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">
              {t('العملة الرسمية', 'Official Currency')}
            </label>
            <input
              type="text"
              value={currency}
              disabled
              className="w-full bg-secondary-bg/40 border border-outline-variant/10 rounded-xl px-4 py-3 text-xs text-muted font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2">
              {t('بريد الدعم والخدمة', 'Support Email Address')}
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3.5 bg-primary text-on-primary font-bold rounded-xl text-xs shadow-gold-glow hover:brightness-110 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{t('حفظ الإعدادات', 'Save Settings')}</span>
        </button>
      </form>
    </div>
  );
};
