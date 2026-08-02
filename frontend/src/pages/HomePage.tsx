import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Sparkles, Shield, Award, FolderTree } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { fetchProducts, fetchCollections } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { SafeImage } from '../components/SafeImage';
import heroImg from '../assets/hero.jpeg';

export const HomePage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const prods = await fetchProducts({ featured: 'true' });
        const colls = await fetchCollections();
        setFeaturedProducts(prods);
        setCategories(colls.categories || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-24 pb-20">

      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[700px] max-h-[1000px] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="PURE VEIL Luxury Scent"
            className="w-full h-full object-cover brightness-40 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-radial from-primary/20 via-transparent to-background/90 pointer-events-none" />
        </div>

        <div className="relative z-10 text-center px-4 md:px-gutter max-w-4xl mx-auto space-y-8">
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            {t('دار العطور والعود الفاخرة', 'HOUSE OF LUXURY FRAGRANCES & OUD')}
          </span>

          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight gold-gradient-text tracking-wide drop-shadow-2xl">
            {t('سر الجمال والرفاهية في كل قطرة', 'The Secret of Royalty in Every Drop')}
          </h1>

          <p className="text-on-surface-variant font-sans text-base md:text-xl max-w-2xl mx-auto leading-relaxed text-shadow">
            {t(
              'نجمع لك في بيور فيل أرقى العطور الفرنسية والشرقية المصممة خصيصاً لذوقك الرفيع بأسعار الدينار الكويتي.',
              'Discover PURE VEIL finest oriental and French fragrances tailored for your exquisite taste in KWD.'
            )}
          </p>

          <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto relative group">
            <div className="relative flex items-center glass-panel-gold rounded-full p-2 border border-primary/30 shadow-2xl focus-within:border-primary transition-all">
              <Search className="w-5 h-5 text-primary ml-3 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('ابحث عن عطرك المفضل أو النوتات العطرية...', 'Search by perfume or notes...')}
                className="w-full bg-transparent text-sm text-on-surface placeholder:text-muted focus:outline-none px-2"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-full text-xs shadow-gold-glow hover:brightness-110 transition-all shrink-0"
              >
                {t('بحث العطر', 'Search')}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Brand Value Banners */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-gutter">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel-gold rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-on-surface">{t('عطور ملكية أصيلة 100%', '100% Authentic Perfumes')}</h4>
              <p className="text-xs text-muted mt-1">{t('مكفولة ومصممة بأعلى معايير الجودة العالمية', 'Guaranteed authentic with luxury international standards')}</p>
            </div>
          </div>

          <div className="glass-panel-gold rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-on-surface">{t('دفع آمن بالدينار الكويتي', 'Secure KWD Payment')}</h4>
              <p className="text-xs text-muted mt-1">{t('دعم بطاقات KNET وفيزا والدفع عند الاستلام', 'KNET, Visa, & Cash on Delivery supported')}</p>
            </div>
          </div>

          <div className="glass-panel-gold rounded-2xl p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-on-surface">{t('تغليف هدايا فاخر', 'Luxury Gift Packaging')}</h4>
              <p className="text-xs text-muted mt-1">{t('تقديم ملكي يليق بأجمل الهدايا والمناسبات', 'Royal presentation for your special occasions')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Admin Collections Grid */}
      {categories.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 md:px-gutter space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-bold">
                {t('تصفح حسب المجموعة', 'EXPLORE COLLECTIONS')}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface mt-1">
                {t('مجموعات بيور فيل العطرية', 'PURE VEIL Collections')}
              </h2>
            </div>
            <Link to="/collections" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <span>{t('عرض جميع المجموعات', 'View All Collections')}</span>
              {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                className="group relative h-72 rounded-3xl overflow-hidden glass-panel-gold flex items-end p-6 border border-outline-variant/15 hover:border-primary/50 transition-all duration-500"
              >
                {cat.image ? (
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-secondary-bg flex items-center justify-center">
                    <FolderTree className="w-12 h-12 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="relative z-10 space-y-1">
                  <h3 className="font-serif text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                    {lang === 'ar' ? cat.name : (cat.nameEn || cat.name_en || cat.name)}
                  </h3>
                  <span className="text-xs text-muted block font-sans">
                    {cat.count !== undefined ? `${cat.count} ${t('إصدار', 'Editions')}` : t('استكشف المجموعة', 'Explore Collection')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-gutter space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              {t('العطور الأكثر طلباً', 'MOST POPULAR')}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface mt-1">
              {t('عطور حصرية نوصي بها', 'Recommended Fragrances')}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel rounded-2xl h-[420px] animate-pulse bg-secondary-bg/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
