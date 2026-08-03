import React from 'react';
import { Check, AlertCircle, RotateCcw, Undo2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PROGRESS_STAGES_LIST, getStatusConfig } from '../utils/orderStatusConfig';

interface OrderStatusTrackerProps {
  currentStatus: string;
  currentStageStep?: number;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  currentStatus,
  currentStageStep,
}) => {
  const { lang, t } = useLanguage();
  const activeConfig = getStatusConfig(currentStatus);

  // If order is in an exceptional state
  if (currentStatus === 'cancelled') {
    return (
      <div className="p-4 md:p-5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-4 text-red-400 animate-in fade-in">
        <div className="p-3 bg-red-500/20 rounded-xl shrink-0">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-base text-red-300">
            {t('تم إلغاء هذا الطلب', 'This Order Was Cancelled')}
          </h4>
          <p className="text-xs text-red-400/80 mt-0.5">
            {t('لأي استفسار بخصوص استرداد المبالغ أو التفاصيل، يرجى التواصل مع فريق خدمة العملاء.', 'For refunds or inquiries, please contact our customer support team.')}
          </p>
        </div>
      </div>
    );
  }

  if (currentStatus === 'refunded') {
    return (
      <div className="p-4 md:p-5 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center gap-4 text-purple-300 animate-in fade-in">
        <div className="p-3 bg-purple-500/20 rounded-xl shrink-0">
          <RotateCcw className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-base text-purple-300">
            {t('تم استرجاع مبلغ الطلب', 'Order Amount Refunded')}
          </h4>
          <p className="text-xs text-purple-300/80 mt-0.5">
            {t('تمت معالجة استرداد الأموال بنجاح وإعادتها لوسيلة الدفع المستخدمة.', 'The refund has been successfully processed back to your payment method.')}
          </p>
        </div>
      </div>
    );
  }

  if (currentStatus === 'returned') {
    return (
      <div className="p-4 md:p-5 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center gap-4 text-orange-400 animate-in fade-in">
        <div className="p-3 bg-orange-500/20 rounded-xl shrink-0">
          <Undo2 className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-base text-orange-300">
            {t('تم إرجاع الطلب للمتجر', 'Order Returned')}
          </h4>
          <p className="text-xs text-orange-400/80 mt-0.5">
            {t('تم استلام المنتجات المُعادة ومراجعتها بنجاح.', 'Returned products have been received and verified.')}
          </p>
        </div>
      </div>
    );
  }

  // Determine active numeric step (1 through 4)
  const activeStep = currentStageStep || activeConfig.step || 1;

  return (
    <div className="w-full space-y-4">
      {/* Header bar showing current status */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">
          {t('حالة وتطور الطلب:', 'Order Progress Status:')}
        </span>
        <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${activeConfig.color.badge}`}>
          {lang === 'ar' ? activeConfig.nameAr : activeConfig.nameEn}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative overflow-x-auto pb-4 pt-2 no-scrollbar">
        <div className="min-w-[480px] sm:min-w-0 px-2 sm:px-4">
          <div className="relative flex items-center justify-between">
            {/* Background Connector Line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-outline-variant/20 rounded-full -z-0" />

            {/* Active Filled Progress Line */}
            <div
              className="absolute top-5 left-8 h-1 bg-gradient-to-r from-primary to-amber-300 rounded-full transition-all duration-700 ease-out -z-0 rtl:right-8 rtl:left-auto"
              style={{
                width: `${Math.max(0, Math.min(100, ((activeStep - 1) / (PROGRESS_STAGES_LIST.length - 1)) * 100))}%`,
              }}
            />

            {/* 4 Primary Stages */}
            {PROGRESS_STAGES_LIST.map((stage) => {
              const isCompleted = stage.step < activeStep;
              const isCurrent = stage.step === activeStep;

              const stageConfig = getStatusConfig(stage.key);
              const StageIcon = stageConfig.icon;

              return (
                <div
                  key={stage.key}
                  className="flex flex-col items-center relative group z-10"
                >
                  {/* Step Node Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary text-on-primary shadow-gold-glow scale-100'
                        : isCurrent
                        ? 'bg-background border-2 border-primary text-primary shadow-[0_0_15px_rgba(212,175,55,0.5)] scale-110'
                        : 'bg-secondary-bg border border-outline-variant/30 text-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <StageIcon className="w-5 h-5 text-primary animate-pulse" />
                        <span className="absolute -inset-1 rounded-full bg-primary/20 animate-ping" />
                      </div>
                    ) : (
                      <StageIcon className="w-4 h-4 text-muted/60" />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-3 text-center max-w-[90px]">
                    <span
                      className={`block text-[11px] sm:text-xs leading-tight font-medium transition-colors ${
                        isCompleted
                          ? 'text-primary font-bold'
                          : isCurrent
                          ? 'text-on-surface font-extrabold font-serif'
                          : 'text-muted/70'
                      }`}
                    >
                      {lang === 'ar' ? stage.nameAr : stage.nameEn}
                    </span>
                    {isCurrent && (
                      <span className="inline-block mt-1 w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
