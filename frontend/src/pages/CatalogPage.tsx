import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, X, RotateCcw, DollarSign } from 'lucide-react';
import { Product, Category } from '../types';
import { fetchPaginatedProducts, fetchCollections, PaginationMeta } from '../services/apiService';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import { Pagination } from '../components/Pagination';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang, t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    pageSize: 9,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(searchParams.get('featured') === 'true');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadCatalogData = async () => {
      setLoading(true);
      try {
        const [prodsRes, collectionsData] = await Promise.all([
          fetchPaginatedProducts({
            page: currentPage,
            limit: pageSize,
            category: selectedCategory || undefined,
            search: searchQuery || undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            featured: featuredOnly ? 'true' : undefined,
          }),
          fetchCollections(),
        ]);
        
        let filteredData = prodsRes.data || [];
        
        // Client-side fallback filter if API returns un-filtered price range
        if (minPrice || maxPrice) {
          const min = minPrice ? Number(minPrice) : 0;
          const max = maxPrice ? Number(maxPrice) : Infinity;
          filteredData = filteredData.filter(p => p.price >= min && p.price <= max);
        }

        setProducts(filteredData);
        if (prodsRes.pagination) setPagination(prodsRes.pagination);
        setCategories(collectionsData.categories || []);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCatalogData();
  }, [selectedCategory, searchQuery, minPrice, maxPrice, featuredOnly, currentPage, pageSize]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setFeaturedOnly(false);
    setSearchParams({});
  };

  const applyPricePreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-gutter pt-20 sm:pt-28 pb-16 sm:pb-24 space-y-5 sm:space-y-8">
      
      {/* Catalog Header */}
      <div className="border-b border-outline-variant/20 pb-4 sm:pb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-primary font-bold">
            {t('المجموعة الملكية الكاملة', 'ROYAL FRAGRANCE COLLECTION')}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-on-surface mt-1 sm:mt-2">
            {t('كتالوج العطور الفاخرة', 'Luxury Fragrance Catalog')}
          </h1>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <p className="text-xs sm:text-sm text-on-surface-variant">
            {t(`عرض (${products.length}) عطر`, `Showing (${products.length}) perfumes`)}
          </p>

          {/* Mobile Filter Drawer Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden px-3.5 py-2 bg-primary/10 border border-primary/30 text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('الفلاتر والسعر', 'Filters & Price')}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 glass-panel-gold rounded-3xl p-6 space-y-6 shrink-0 sticky top-28">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
            <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>{t('تصفية العطور', 'Filter Perfumes')}</span>
            </h3>
            {(selectedCategory || searchQuery || minPrice || maxPrice || featuredOnly) && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('إلغاء', 'Reset')}</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted block">{t('البحث باسم العطر', 'Search Perfume')}</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('اسم العطر...', 'Perfume name...')}
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2 px-3 pl-9 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <Search className="w-4 h-4 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Price Range Filter (KWD) */}
          <div className="space-y-3 border-t border-outline-variant/15 pt-4">
            <label className="text-xs font-semibold text-muted flex items-center justify-between">
              <span>{t('نطاق السعر (د.ك)', 'Price Range (KWD)')}</span>
              {(minPrice || maxPrice) && (
                <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="text-[10px] text-primary hover:underline font-bold">
                  {t('مسح السعر', 'Clear Price')}
                </button>
              )}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted block mb-1">{t('الأدنى', 'Min')}</span>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-1.5 px-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <span className="text-[10px] text-muted block mb-1">{t('الأقصى', 'Max')}</span>
                <input
                  type="number"
                  placeholder="200"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-1.5 px-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Quick Price Range Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => applyPricePreset('0', '30')}
                className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                  minPrice === '0' && maxPrice === '30' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary-bg/50 border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                &lt; 30 د.ك
              </button>
              <button
                onClick={() => applyPricePreset('30', '60')}
                className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                  minPrice === '30' && maxPrice === '60' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary-bg/50 border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                30-60 د.ك
              </button>
              <button
                onClick={() => applyPricePreset('60', '')}
                className={`py-1 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                  minPrice === '60' && maxPrice === '' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary-bg/50 border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                }`}
              >
                60+ د.ك
              </button>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3 border-t border-outline-variant/15 pt-4">
            <label className="text-xs font-semibold text-muted block">{t('التصنيف أو المجموعة', 'Category')}</label>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 text-xs">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-right ltr:text-left px-3 py-2 rounded-xl transition-all font-semibold ${
                  selectedCategory === ''
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-secondary-bg hover:text-on-surface'
                }`}
              >
                {t('جميع التصنيفات', 'All Categories')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-right ltr:text-left px-3 py-2 rounded-xl transition-all font-semibold flex justify-between items-center ${
                    selectedCategory === cat.name
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:bg-secondary-bg hover:text-on-surface'
                  }`}
                >
                  <span className="truncate">{lang === 'ar' ? cat.name : (cat.nameEn || cat.name_en || cat.name)}</span>
                  {cat.count !== undefined && <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Filter Modal Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md lg:hidden flex justify-end">
            <div className="w-full max-w-xs bg-surface-container-lowest h-full p-5 space-y-5 overflow-y-auto border-l border-outline-variant/15">
              <div className="flex justify-between items-center border-b border-outline-variant/15 pb-3">
                <h3 className="font-serif text-base font-bold text-on-surface flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <span>{t('تصفية العطور والسعر', 'Filter Perfumes & Price')}</span>
                </h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-muted hover:text-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted block">{t('البحث باسم العطر', 'Search Perfume')}</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('اسم العطر...', 'Perfume name...')}
                  className="w-full bg-secondary-bg border border-outline-variant/30 rounded-xl py-2 px-3 text-xs text-on-surface"
                />
              </div>

              {/* Mobile Price Range Filter */}
              <div className="space-y-3 border-t border-outline-variant/15 pt-3">
                <label className="text-xs font-semibold text-muted flex items-center justify-between">
                  <span>{t('نطاق السعر (د.ك)', 'Price Range (KWD)')}</span>
                  {(minPrice || maxPrice) && (
                    <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="text-[10px] text-primary hover:underline font-bold">
                      {t('مسح السعر', 'Clear Price')}
                    </button>
                  )}
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-muted block mb-1">{t('الأدنى (د.ك)', 'Min (KWD)')}</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-secondary-bg border border-outline-variant/30 rounded-xl py-1.5 px-2.5 text-xs text-on-surface"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block mb-1">{t('الأقصى (د.ك)', 'Max (KWD)')}</span>
                    <input
                      type="number"
                      placeholder="200"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-secondary-bg border border-outline-variant/30 rounded-xl py-1.5 px-2.5 text-xs text-on-surface"
                    />
                  </div>
                </div>

                {/* Mobile Quick Price Range Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => applyPricePreset('0', '30')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                      minPrice === '0' && maxPrice === '30' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary-bg/60 border-outline-variant/20 text-on-surface-variant'
                    }`}
                  >
                    &lt; 30 د.ك
                  </button>
                  <button
                    onClick={() => applyPricePreset('30', '60')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                      minPrice === '30' && maxPrice === '60' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary-bg/60 border-outline-variant/20 text-on-surface-variant'
                    }`}
                  >
                    30-60 د.ك
                  </button>
                  <button
                    onClick={() => applyPricePreset('60', '')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                      minPrice === '60' && maxPrice === '' ? 'bg-primary text-on-primary border-primary' : 'bg-secondary-bg/60 border-outline-variant/20 text-on-surface-variant'
                    }`}
                  >
                    60+ د.ك
                  </button>
                </div>
              </div>

              {/* Mobile Categories */}
              <div className="space-y-2 border-t border-outline-variant/15 pt-3">
                <label className="text-xs font-semibold text-muted block">{t('التصنيف', 'Category')}</label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => { setSelectedCategory(''); }}
                    className={`w-full text-right px-3 py-2 rounded-xl font-semibold ${selectedCategory === '' ? 'bg-primary text-on-primary' : 'bg-secondary-bg/60 text-on-surface'}`}
                  >
                    {t('جميع التصنيفات', 'All Categories')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.name); }}
                      className={`w-full text-right px-3 py-2 rounded-xl font-semibold ${selectedCategory === cat.name ? 'bg-primary text-on-primary' : 'bg-secondary-bg/60 text-on-surface'}`}
                    >
                      {lang === 'ar' ? cat.name : (cat.nameEn || cat.name_en || cat.name)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-xs font-semibold text-muted"
                >
                  {t('إعادة ضبط', 'Reset')}
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-md"
                >
                  {t('تطبيق الفلاتر', 'Apply Filters')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Catalog Products Grid — 2 Columns per Row on Mobile */}
        <main className="flex-1 w-full space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-panel rounded-2xl h-[280px] sm:h-[420px] animate-pulse bg-secondary-bg/30" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel-gold rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <Grid className="w-12 h-12 text-primary mx-auto opacity-40" />
              <h3 className="font-serif text-xl font-bold text-on-surface">{t('لم نجد عطور مطابقة لتصفيتك', 'No perfumes matched your filters')}</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">{t('جرب تغيير خيارات البحث، السعر أو إلغاء فلاتر التصفية للمجموعات العطرية', 'Try altering your search text, price range or clear active filters')}</p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl shadow-gold-glow"
              >
                {t('إلغاء جميع الفلاتر', 'Clear All Filters')}
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid: 2 Columns on Mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Reusable Global Pagination */}
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalRecords={pagination.totalRecords}
                pageSize={pagination.pageSize}
                onPageChange={(page) => setCurrentPage(page)}
                onPageSizeChange={(size) => setPageSize(size)}
              />
            </>
          )}
        </main>
      </div>

    </div>
  );
};
