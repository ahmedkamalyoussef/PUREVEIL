import React from 'react';
import { Sparkles, Heart, Anchor } from 'lucide-react';
import { OlfactoryNotes } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

export const OlfactoryPyramid: React.FC<{ notes: OlfactoryNotes }> = ({ notes }) => {
  const { lang, t } = useLanguage();

  const getNotesList = (ar?: string[], en?: string[]) => {
    if (lang === 'en' && en && en.length > 0) return en;
    return ar || [];
  };

  const topList = getNotesList(notes.top, notes.topEn);
  const heartList = getNotesList(notes.heart, notes.heartEn);
  const baseList = getNotesList(notes.base, notes.baseEn);

  return (
    <div className="space-y-6 bg-secondary-bg/30 border border-outline-variant/15 rounded-3xl p-6 md:p-8 backdrop-blur-md">
      <div className="text-center space-y-1">
        <span className="text-xs uppercase tracking-widest text-primary font-bold">
          {t('الهرم العطري الملكي', 'ROYAL OLFACTORY PYRAMID')}
        </span>
        <h3 className="font-serif text-2xl font-bold text-on-surface">
          {t('تدرج النوتات العطرية', 'Fragrance Notes Architecture')}
        </h3>
      </div>

      <div className="space-y-4 max-w-xl mx-auto">
        
        {/* Top Notes */}
        {topList.length > 0 && (
          <div className="glass-panel-gold rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                {t('النوتات العليا (الافتتاحية)', 'Top Notes')}
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-on-surface font-semibold">
                {topList.map((note, i) => (
                  <span key={i} className="px-2.5 py-1 bg-secondary-bg/80 rounded-lg border border-outline-variant/20">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Heart Notes */}
        {heartList.length > 0 && (
          <div className="glass-panel-gold rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                {t('قلب العطر (الجوهر)', 'Heart Notes')}
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-on-surface font-semibold">
                {heartList.map((note, i) => (
                  <span key={i} className="px-2.5 py-1 bg-secondary-bg/80 rounded-lg border border-outline-variant/20">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Base Notes */}
        {baseList.length > 0 && (
          <div className="glass-panel-gold rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                {t('قاعدة العطر (الخاتمة)', 'Base Notes')}
              </span>
              <div className="flex flex-wrap gap-2 text-xs text-on-surface font-semibold">
                {baseList.map((note, i) => (
                  <span key={i} className="px-2.5 py-1 bg-secondary-bg/80 rounded-lg border border-outline-variant/20">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
