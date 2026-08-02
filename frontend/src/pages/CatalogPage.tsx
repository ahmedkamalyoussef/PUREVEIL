import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid } from 'lucide-react';
import { Product, Category } from '../types';
import { fetchProducts, fetchCollections } from '../services/apiService';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../contexts/LanguageContext';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang, t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(searchParams.get('featured') === 'true');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadCatalogData = async () => {
      setLoading(true);
      try {
        const [prodsData, collectionsData] = await Promise.all([
          fetchProducts({
            category: selectedCategory || undefined,
            search: searchQuery || undefined,
            maxPrice: maxPrice < 200 ? maxPrice : undefined,
            featured: featuredOnly ? 'true' : undefined,
          }),
          fetchCollections(),
        ]);
        setProducts(prodsData);
        setCategories(collectionsData.categories || []);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCatalogData();
  }, [selectedCategory, searchQuery, maxPrice, featuredOnly]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMaxPrice(200);
    setFeaturedOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-gutter pt-32 pb-24 space-y-8">
      
      {/* Catalog Header */}
      <div className="border-b border-outline-variant/20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            {t('المجموعة الملكية الكاملة', 'ROYAL FRAGRANCE COLLECTION')}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-on-surface mt-2">
            {t('كتالوج العطور الفاخرة', 'Luxury Fragrance Catalog')}
          </h1>
        </div>

        <p className="text-sm text-on-surface-variant">
          {t(`عرض (${products.length}) عطر فاخر بالدينار الكويتي`, `Showing (${products.length}) luxury perfumes in KWD`)}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 glass-panel-gold rounded-3xl p-6 space-y-6 shrink-0 sticky top-28">
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
            <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>{t('تصفية العطور', 'Filter Perfumes')}</span>
            </h3>
            {(selectedCategory || searchQuery || maxPrice < 200 || featuredOnly) && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary font-bold hover:underline"
              >
                {t('مسح الفلاتر', 'Clear')}
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
              {t('البحث باسم العطر:', 'Search by Fragrance:')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('اسم العطر أو الـ SKU...', 'Perfume name or SKU...')}
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-9 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Dynamic Admin Categories Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
              {t('المجموعة العطرية:', 'Fragrance Collection:')}
            </label>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-right px-3 py-2 rounded-xl transition-all ${
                  !selectedCategory ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-secondary-bg'
                }`}
              >
                {t('جميع المجموعات', 'All Collections')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-right px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                    selectedCategory === cat.name || selectedCategory === cat.nameEn || selectedCategory === cat.name_en
                      ? 'bg-primary text-on-primary font-bold'
                      : 'text-on-surface-variant hover:bg-secondary-bg'
                  }`}
                >
                  <span className="truncate">{lang === 'ar' ? cat.name : (cat.nameEn || cat.name_en || cat.name)}</span>
                  {cat.count !== undefined && (
                    <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter (KWD) */}
          <div className="space-y-3 border-t border-outline-variant/15 pt-4 text-xs">
            <div className="flex justify-between items-center font-bold">
              <span className="text-on-surface uppercase tracking-wider">{t('الحد الأقصى للسعر:', 'Max Price:')}</span>
              <span className="text-primary font-mono">{maxPrice} KWD</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-secondary-bg h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted font-mono">
              <span>10 KWD</span>
              <span>200 KWD</span>
            </div>
          </div>

        </aside>

        {/* Mobile Filter Button */}
        <div className="lg:hidden w-full flex justify-between items-center">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="px-4 py-2.5 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl text-xs flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('تصفية النتائج', 'Filter Products')}</span>
          </button>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="lg:hidden w-full glass-panel-gold rounded-3xl p-6 space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-on-surface">{t('خيارات التصفية', 'Filter Options')}</span>
              <button onClick={clearFilters} className="text-xs text-primary font-bold">{t('إعادة ضبط', 'Reset')}</button>
            </div>
            <div className="space-y-2 text-xs">
              <span className="font-bold text-muted block">{t('المجموعة:', 'Collection:')}</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${!selectedCategory ? 'bg-primary text-on-primary' : 'bg-secondary-bg text-on-surface'}`}
                >
                  {t('الكل', 'All')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedCategory === cat.name ? 'bg-primary text-on-primary' : 'bg-secondary-bg text-on-surface'}`}
                  >
                    {lang === 'ar' ? cat.name : (cat.nameEn || cat.name_en || cat.name)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <main className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-panel rounded-2xl h-[420px] animate-pulse bg-secondary-bg/30" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel-gold rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
              <Grid className="w-12 h-12 text-primary mx-auto opacity-60" />
              <h3 className="font-serif text-2xl font-bold text-on-surface">
                {t('لا توجد عطور مطابقة للفلاتر', 'No Fragrances Found')}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {t('جرب ضبط خيارات التصفية أو البحث باسم عطر آخر.', 'Try adjusting your filter options or search terms.')}
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl text-xs shadow-gold-glow hover:brightness-110 transition-all"
              >
                {t('إعادة ضبط الفلاتر', 'Reset All Filters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
