import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = '',
}) => {
  const { lang, t } = useLanguage();

  if (totalRecords === 0) return null;

  const startRecord = Math.min((currentPage - 1) * pageSize + 1, totalRecords);
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || totalPages === 0;

  // Handles RTL icon inversion
  const PrevIcon = lang === 'ar' ? ChevronRight : ChevronLeft;
  const NextIcon = lang === 'ar' ? ChevronLeft : ChevronRight;
  const FirstIcon = lang === 'ar' ? ChevronsRight : ChevronsLeft;
  const LastIcon = lang === 'ar' ? ChevronsLeft : ChevronsRight;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-outline-variant/15 text-xs text-on-surface-variant font-sans ${className}`}
    >
      {/* Range Summary & Items Per Page */}
      <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
        <span>
          {t(
            `عرض ${startRecord}–${endRecord} من ${totalRecords} نتيجة`,
            `Showing ${startRecord}–${endRecord} of ${totalRecords} results`
          )}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-muted">{t('لكل صفحة:', 'Per page:')}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1); // Reset to page 1 on page size change
              }}
              className="bg-secondary-bg border border-outline-variant/30 text-on-surface rounded-lg px-2 py-1 focus:outline-none focus:border-primary text-xs font-mono"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Page Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          className="p-1.5 rounded-lg border border-outline-variant/20 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-outline-variant/20 disabled:hover:text-inherit transition-all"
          title={t('الصفحة الأولى', 'First Page')}
        >
          <FirstIcon className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="p-1.5 rounded-lg border border-outline-variant/20 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-outline-variant/20 disabled:hover:text-inherit transition-all flex items-center gap-1 px-2.5 font-semibold"
          title={t('الصفحة السابقة', 'Previous Page')}
        >
          <PrevIcon className="w-4 h-4" />
          <span className="hidden md:inline">{t('السابق', 'Prev')}</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 font-mono">
          {getPageNumbers().map((num, idx) =>
            typeof num === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(num)}
                className={`min-w-[32px] h-8 px-2 rounded-lg font-bold transition-all ${
                  currentPage === num
                    ? 'bg-primary text-on-primary shadow-gold-glow'
                    : 'bg-secondary-bg/60 text-on-surface hover:bg-secondary-bg border border-outline-variant/20'
                }`}
              >
                {num}
              </button>
            ) : (
              <span key={idx} className="px-1 text-muted">
                {num}
              </span>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className="p-1.5 rounded-lg border border-outline-variant/20 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-outline-variant/20 disabled:hover:text-inherit transition-all flex items-center gap-1 px-2.5 font-semibold"
          title={t('الصفحة التالية', 'Next Page')}
        >
          <span className="hidden md:inline">{t('التالي', 'Next')}</span>
          <NextIcon className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          className="p-1.5 rounded-lg border border-outline-variant/20 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-outline-variant/20 disabled:hover:text-inherit transition-all"
          title={t('الصفحة الأخيرة', 'Last Page')}
        >
          <LastIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
