import React from 'react';
import { TimelineEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getStatusConfig } from '../utils/orderStatusConfig';
import { CheckCircle2, Clock } from 'lucide-react';

interface OrderStatusTimelineProps {
  timeline?: TimelineEvent[];
  currentStatus: string;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  timeline,
  currentStatus,
}) => {
  const { lang, t } = useLanguage();

  if (!timeline || timeline.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-4 border-t border-outline-variant/15">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-sm font-bold text-on-surface flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>{t('السجل والجدول الزمني للطلب', 'Status Timeline')}</span>
        </h4>
        <span className="text-[11px] text-muted font-sans">
          {t('الأحدث أولاً', 'Newest Event First')}
        </span>
      </div>

      <div className="relative pl-6 rtl:pl-0 rtl:pr-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-2 rtl:before:left-auto rtl:before:right-2 before:w-0.5 before:bg-outline-variant/20">
        {timeline.map((event, index) => {
          const config = getStatusConfig(event.status);
          const EventIcon = config.icon || CheckCircle2;
          const isLatest = index === 0;

          const dateObj = new Date(event.createdAt);
          const formattedDate = dateObj.toLocaleDateString(
            lang === 'ar' ? 'ar-KW' : 'en-US',
            { year: 'numeric', month: 'short', day: 'numeric' }
          );
          const formattedTime = dateObj.toLocaleTimeString(
            lang === 'ar' ? 'ar-KW' : 'en-US',
            { hour: '2-digit', minute: '2-digit' }
          );

          const eventTitle = lang === 'ar' ? config.nameAr : config.nameEn;
          const eventNote =
            lang === 'ar'
              ? event.note || config.defaultNoteAr
              : event.noteEn || event.note || config.defaultNoteEn;

          return (
            <div key={event.id || index} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-6 rtl:-left-auto rtl:-right-6 top-1.5 -translate-x-1/2 rtl:translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                  isLatest
                    ? 'bg-primary border-primary text-on-primary ring-4 ring-primary/20 scale-110'
                    : 'bg-secondary-bg border-outline-variant/40 text-muted'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLatest ? 'bg-on-primary' : 'bg-muted/60'
                  }`}
                />
              </div>

              {/* Event Content Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isLatest
                    ? 'bg-secondary-bg/80 border-primary/30 shadow-sm'
                    : 'bg-background/40 border-outline-variant/15 hover:bg-secondary-bg/40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/10 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <EventIcon
                      className={`w-4 h-4 ${
                        isLatest ? config.color.text : 'text-muted'
                      }`}
                    />
                    <span
                      className={`font-serif text-xs font-bold ${
                        isLatest ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {eventTitle}
                    </span>
                  </div>

                  <div className="text-[10px] text-muted font-mono flex items-center gap-1">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{formattedTime}</span>
                  </div>
                </div>

                {eventNote && (
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {eventNote}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
