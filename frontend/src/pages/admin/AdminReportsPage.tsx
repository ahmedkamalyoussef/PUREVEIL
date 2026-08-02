import React from 'react';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdminReportsPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">
            {t('تقارير أداء ومبيعات PURE VEIL', 'PURE VEIL Reports & Analytics')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('تحليلات المبيعات ونمو الإيرادات بالدينار الكويتي (KWD)', 'Sales analytics and revenue growth metrics in Kuwaiti Dinar (KWD)')}
          </p>
        </div>

        <button className="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl flex items-center gap-2 shadow-gold-glow">
          <Download className="w-4 h-4" />
          <span>{t('تصدير التقرير (PDF)', 'Export Report')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel-gold rounded-3xl p-6 space-y-3">
          <div className="text-xs text-muted font-semibold">{t('متوسط قيمة الطلب', 'Average Order Value')}</div>
          <div className="font-serif text-3xl font-bold text-primary">85.500 KWD</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        <div className="glass-panel-gold rounded-3xl p-6 space-y-3">
          <div className="text-xs text-muted font-semibold">{t('التصنيف الأكثر مبيعاً', 'Top Selling Category')}</div>
          <div className="font-serif text-3xl font-bold text-on-surface">{t('العطور الشرقية والعود', 'Oriental & Oud')}</div>
          <div className="text-[11px] text-on-surface-variant">58% of total sales volume</div>
        </div>

        <div className="glass-panel-gold rounded-3xl p-6 space-y-3">
          <div className="text-xs text-muted font-semibold">{t('معدل رضا العملاء', 'Customer Satisfaction')}</div>
          <div className="font-serif text-3xl font-bold text-emerald-400">4.95 / 5.0</div>
          <div className="text-[11px] text-muted">Based on verified customer reviews</div>
        </div>
      </div>

      <div className="glass-panel-gold rounded-3xl p-8 text-center space-y-4">
        <BarChart3 className="w-12 h-12 text-primary mx-auto" />
        <h2 className="font-serif text-xl font-bold text-on-surface">
          {t('مؤشرات أداء المبيعات بالدينار الكويتي', 'Kuwaiti Dinar Sales Analytics')}
        </h2>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          {t('تحدث تقارير مبيعات متجر PURE VEIL تلقائياً فور اعتماد الطلبات.', 'PURE VEIL store analytics update in real-time as orders are placed.')}
        </p>
      </div>
    </div>
  );
};
