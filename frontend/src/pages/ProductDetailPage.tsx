import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, ArrowLeft, ArrowRight, Award, Shield, Sparkles, Heart, ShieldCheck, Clock } from 'lucide-react';
import { Product } from '../types';
import { fetchProductById, fetchProducts } from '../services/apiService';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { ProductCard } from '../components/ProductCard';
import { OlfactoryPyramid } from '../components/OlfactoryPyramid';
import { SafeImage } from '../components/SafeImage';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();
  const { showSuccess } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('100ml');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
        if (data?.volumeOptions && data.volumeOptions.length > 0) {
          setSelectedSize(data.volumeOptions[0].size);
        }
        const relData = await fetchProducts({ category: data?.category });
        setRelated(relData.filter(p => String(p.id) !== String(id)).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-gutter pt-32 pb-20 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-secondary-bg/50 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-48 bg-secondary-bg/50 rounded-xl" />
            <div className="h-12 w-96 bg-secondary-bg/50 rounded-xl" />
            <div className="h-24 w-full bg-secondary-bg/50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-gutter pt-32 pb-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-on-surface">{t('العطر غير موجود', 'Fragrance Not Found')}</h2>
        <Link to="/catalog" className="text-primary underline text-sm">{t('العودة للكتالوج', 'Back to Catalog')}</Link>
      </div>
    );
  }

  const currentVolume = product.volumeOptions?.find((v) => v.size === selectedSize);
  const currentPrice = currentVolume ? currentVolume.price : product.price;
  const currentStock = currentVolume?.stock !== undefined ? currentVolume.stock : product.stock;

  const displayName = lang === 'en' && product.nameEn ? product.nameEn : product.name;
  const displayCategory = lang === 'en' && product.categoryEn ? product.categoryEn : product.category;
  const displayShortDesc = lang === 'en' && product.shortDescriptionEn ? product.shortDescriptionEn : product.shortDescription;
  const displayDesc = lang === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const displayUsage = lang === 'en' && product.usageInstructionsEn ? product.usageInstructionsEn : product.usageInstructions;
  const displayHighlights = (lang === 'en' && product.highlightsEn && product.highlightsEn.length > 0) ? product.highlightsEn : product.highlights;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-gutter pt-28 pb-24 space-y-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted font-sans pt-4">
        <Link to="/" className="hover:text-primary transition-colors">{t('الرئيسية', 'Home')}</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-primary transition-colors">{t('العطور', 'Perfumes')}</Link>
        <span>/</span>
        <span className="text-primary font-bold">{displayName}</span>
      </div>

      {/* Main Grid Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left Image Showcase */}
        <div className="glass-panel-gold rounded-3xl p-8 relative gold-aura overflow-hidden flex items-center justify-center min-h-[450px]">
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {product.isNew && (
              <span className="px-3 py-1 bg-primary text-on-primary text-xs font-bold rounded-full uppercase">
                {t('جديد', 'NEW')}
              </span>
            )}
            {product.featured && (
              <span className="px-3 py-1 bg-secondary-bg text-primary border border-primary/30 text-xs font-bold rounded-full uppercase">
                {t('حصري', 'EXCLUSIVE')}
              </span>
            )}
          </div>

          <SafeImage
            src={product.image}
            alt={displayName}
            className="max-h-[480px] w-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Right Product Details */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-bold block mb-1">
              {displayCategory}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-on-surface leading-tight">
              {displayName}
            </h1>
          </div>

          {/* Rating & Concentration */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-4 h-4 fill-primary" />
              <span className="font-bold text-sm">{product.rating}</span>
              <span className="text-muted font-normal">({product.reviewsCount} {t('تقييم', 'reviews')})</span>
            </div>
            <span className="text-muted">•</span>
            <span className="px-3 py-1 bg-secondary-bg text-primary rounded-full font-bold border border-primary/20">
              {product.concentration}
            </span>
          </div>

          {/* Dynamic Price Display according to selected size */}
          <div className="flex items-baseline gap-3 pt-2">
            <span className="font-serif text-3xl md:text-4xl font-bold text-primary">
              {currentPrice.toFixed(3)} {t('د.ك', 'KWD')}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-muted line-through font-mono">
                {Number(product.oldPrice).toFixed(3)}
              </span>
            )}
          </div>

          {/* Short Description */}
          {displayShortDesc && (
            <p className="text-sm text-on-surface-variant leading-relaxed font-sans border-t border-b border-outline-variant/15 py-4">
              {displayShortDesc}
            </p>
          )}

          {/* Volume Options / Size Selection */}
          {product.volumeOptions && product.volumeOptions.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-on-surface uppercase tracking-wider">
                <span>{t('اختر سعة الزجاجة العطرية:', 'Select Bottle Size:')}</span>
                <span className="text-primary font-mono">{selectedSize} ({currentPrice.toFixed(3)} KWD)</span>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                {product.volumeOptions.map(vol => (
                  <button
                    key={vol.size}
                    onClick={() => setSelectedSize(vol.size)}
                    className={`px-5 py-3 rounded-2xl text-xs font-mono transition-all flex flex-col items-center justify-center min-w-[90px] border ${
                      selectedSize === vol.size
                        ? 'bg-primary text-on-primary font-bold shadow-gold-glow border-primary scale-105'
                        : 'bg-secondary-bg/80 text-on-surface-variant hover:text-on-surface border-outline-variant/30 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-bold">{vol.size}</span>
                    <span className="text-[10px] opacity-80 mt-0.5">{vol.price.toFixed(3)} KWD</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart & Wishlist Actions */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex items-center border border-outline-variant/30 rounded-xl bg-secondary-bg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-3 text-on-surface hover:text-primary transition-colors text-sm font-bold"
              >
                -
              </button>
              <span className="px-4 py-3 font-mono font-bold text-sm text-on-surface">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-3 text-on-surface hover:text-primary transition-colors text-sm font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={async () => {
                await addToCart(product, selectedSize, quantity, currentPrice);
              }}
              className="flex-1 py-4 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-xl text-sm tracking-wider hover:brightness-110 transition-all shadow-gold-glow flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{t('إضافة للسلة الملكية', 'Add to Cart')}</span>
            </button>

            <button
              onClick={() => toggleFavorite(product)}
              className={`p-4 rounded-xl border transition-all shadow-md flex items-center justify-center ${
                isFavorite(product.id)
                  ? 'bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/30'
                  : 'bg-secondary-bg border-outline-variant/30 text-on-surface-variant hover:text-red-400 hover:border-red-400/50'
              }`}
              title={isFavorite(product.id) ? t('إزالة من المفضلة', 'Remove from favorites') : t('إضافة للمفضلة', 'Add to favorites')}
            >
              <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500' : ''}`} />
            </button>
          </div>

          {/* Highlights */}
          {displayHighlights && displayHighlights.length > 0 && (
            <div className="bg-secondary-bg/40 rounded-2xl p-4 border border-outline-variant/15 space-y-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>{t('أبرز مواصفات العطر:', 'Fragrance Highlights:')}</span>
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant">
                {displayHighlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

      {/* Olfactory Pyramid Section */}
      {product.notes && <OlfactoryPyramid notes={product.notes} />}

      {/* Detailed Description & Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-4">
          <h3 className="font-serif text-xl font-bold text-on-surface">
            {t('قصة وتفاصيل العطر', 'Perfume Story & Description')}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
            {displayDesc}
          </p>
        </div>

        {displayUsage && (
          <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="font-serif text-xl font-bold text-on-surface flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>{t('طريقة الاستخدام والتطبيق', 'Usage Instructions')}</span>
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed font-sans">
              {displayUsage}
            </p>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-8 pt-8 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">
              {t('عطور قد تعجبك أيضاً', 'You May Also Like')}
            </h3>
            <Link to="/catalog" className="text-xs text-primary font-bold hover:underline">
              {t('استكشف المزيد', 'Explore More')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
