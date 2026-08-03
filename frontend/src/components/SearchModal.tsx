import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { fetchProducts } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';

import { SafeImage } from './SafeImage';

export const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({ search: query });
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 z-40 overflow-y-auto p-4 sm:p-6 md:p-10 bg-background/80 backdrop-blur-md flex justify-center items-start pt-6 sm:pt-10 animate-fade-in">
      <div className="w-full max-w-3xl glass-panel-gold rounded-2xl p-6 shadow-2xl relative border border-primary/40 max-h-[85dvh] overflow-y-auto">

        
        {/* Header & Input */}
        <div className="relative flex items-center border-b border-outline-variant/30 pb-4">
          <Search className="w-6 h-6 text-primary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ابحث عن اسم العطر، النوتات العطرية، أو المجموعة...', 'Search scent name, fragrance notes, or collection...')}
            className="w-full bg-transparent text-on-surface text-lg px-4 focus:outline-none placeholder:text-muted"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 py-4 flex-wrap text-xs text-on-surface-variant">
          <span className="text-muted">{t('الأكثر بحثاً:', 'Trending:')}</span>
          {['العود الملكي', 'ورد الفانيلا', 'عنبر التبغ', 'بخور الشيوخ', 'بيور فيل'].map(keyword => (
            <button
              key={keyword}
              onClick={() => setQuery(keyword)}
              className="px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 hover:border-primary hover:text-primary transition-all"
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pt-2">
          {loading ? (
            <div className="text-center py-12 text-muted animate-pulse">
              {t('جاري البحث في الأرشيف العطري...', 'Searching fragrance archives...')}
            </div>
          ) : results.length > 0 ? (
            results.map(prod => (
              <Link
                key={prod.id}
                to={`/product/${prod.id}`}
                onClick={onClose}
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container/30 border border-outline-variant/15 hover:border-primary/50 hover:bg-surface-container/60 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <SafeImage src={prod.image} alt={prod.name} className="w-14 h-14 object-cover rounded-lg bg-surface-container-high shrink-0" />
                  <div>
                    <span className="text-[11px] text-primary uppercase tracking-widest font-sans">
                      {lang === 'ar' ? prod.category : (prod.categoryEn || prod.category)}
                    </span>
                    <h4 className="font-serif font-bold text-on-surface group-hover:text-primary transition-colors">
                      {lang === 'ar' ? prod.name : (prod.nameEn || prod.name)}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-serif font-bold text-primary text-base">
                    {prod.price.toFixed(3)} {t('د.ك', 'KWD')}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))
          ) : query ? (
            <div className="text-center py-12 text-muted">
              {t('لم نجد نتائج مطابقة لمصطلح البحث.', 'No matching fragrances found.')}
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};
