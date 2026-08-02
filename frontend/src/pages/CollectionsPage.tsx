import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, FolderTree } from 'lucide-react';
import { Category } from '../types';
import { fetchCollections } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';

import { SafeImage } from '../components/SafeImage';

export const CollectionsPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCollections();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to load collections:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-gutter pt-24 sm:pt-32 pb-16 sm:pb-24 space-y-10 sm:space-y-16">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('المجموعات العطرية الملكية', 'ROYAL COLLECTIONS')}</span>
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold gold-gradient-text">
          {t('مجموعات بيور فيل الحصرية', 'PURE VEIL Private Collections')}
        </h1>
        <p className="text-on-surface-variant font-sans text-base leading-relaxed">
          {t(
            'تصفح مجموعاتنا العطرية المصممة بعناية فائقة لتناسب أرقى الأذواق الشرقية والعالمية.',
            'Discover our masterfully curated fragrance collections tailored for ultimate royal luxury.'
          )}
        </p>
      </div>

      {/* Admin Collections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel rounded-3xl h-80 animate-pulse bg-secondary-bg/30" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-panel-gold rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
          <FolderTree className="w-12 h-12 text-primary mx-auto opacity-60" />
          <h3 className="font-serif text-2xl font-bold text-on-surface">
            {t('لا توجد مجموعات حالياً', 'No Collections Available')}
          </h3>
          <p className="text-xs text-on-surface-variant">
            {t('سيتم إضافة مجموعات جديدة قريباً من قبل إدارة المتجر.', 'New collections will be added soon by store admins.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-56 sm:h-96 rounded-2xl sm:rounded-3xl overflow-hidden glass-panel-gold border border-outline-variant/20 hover:border-primary/60 transition-all duration-500 flex flex-col justify-end p-4 sm:p-8 shadow-xl"
            >
              {cat.image ? (
                <SafeImage
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover brightness-60 group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-bg to-background flex items-center justify-center">
                  <FolderTree className="w-16 h-16 text-primary/30" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-mono tracking-widest uppercase font-bold bg-primary/10 border border-primary/30 px-3 py-1 rounded-full backdrop-blur-md">
                    {cat.count !== undefined ? `${cat.count} ${t('إصدار عتِيق', 'Editions')}` : t('مجموعة ملكية', 'Royal Line')}
                  </span>
                </div>

                <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface group-hover:text-primary transition-colors">
                  {lang === 'ar' ? cat.name : (cat.nameEn || cat.name_en || cat.name)}
                </h2>

                {(cat.description || cat.descriptionEn) && (
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed font-sans">
                    {lang === 'ar' ? cat.description : (cat.descriptionEn || cat.description_en || cat.description)}
                  </p>
                )}

                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-primary group-hover/link:underline">
                  <span>{t('تصفح العطور', 'Explore Collection')}</span>
                  {lang === 'ar' ? (
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};
