import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { lang, t } = useLanguage();
  const { showSuccess } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selectedSize, setSelectedSize] = useState<string>(
    product.volumeOptions?.[0]?.size || '100ml'
  );
  const [favLoading, setFavLoading] = useState<boolean>(false);

  const isFavorited = isFavorite(product.id);
  const currentVolume = product.volumeOptions?.find((v) => v.size === selectedSize);
  const currentPrice = currentVolume ? currentVolume.price : product.price;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (favLoading) return;
    setFavLoading(true);
    try {
      await toggleFavorite(product);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product, selectedSize, 1);
  };

  return (
    <div className="glass-panel-gold rounded-3xl overflow-hidden flex flex-col justify-between group gold-aura relative transition-all duration-300 h-full border border-outline-variant/20 hover:border-primary/50 shadow-lg hover:shadow-2xl">
      
      {/* Full Width Top Image Area with Floating Overlays */}
      <div className="relative w-full aspect-[4/5] bg-secondary-bg/60 overflow-hidden shrink-0">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <SafeImage
            src={product.image}
            alt={lang === 'ar' ? product.name : product.nameEn}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 group-hover:brightness-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-black/20 pointer-events-none" />
        </Link>

        {/* Top Left Overlay: Favorite Wishlist Button */}
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={handleFavoriteClick}
            disabled={favLoading}
            className={`p-2.5 rounded-full backdrop-blur-xl border transition-all shadow-md ${
              isFavorited
                ? 'bg-red-500/20 border-red-500/50 text-red-500 hover:bg-red-500/30'
                : 'bg-background/70 border-outline-variant/30 text-on-surface-variant hover:text-red-400 hover:border-red-400/50 hover:bg-background/90'
            }`}
            title={isFavorited ? t('إزالة من المفضلة', 'Remove from favorites') : t('إضافة للمفضلة', 'Add to favorites')}
          >
            <Heart className={`w-4 h-4 transition-transform ${isFavorited ? 'fill-red-500 scale-110' : ''}`} />
          </button>
        </div>

        {/* Top Right Overlay: Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 pointer-events-none">
          {product.isNew && (
            <span className="px-2.5 py-1 bg-primary text-on-primary text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md backdrop-blur-md">
              {t('جديد', 'NEW')}
            </span>
          )}
          {product.featured && (
            <span className="px-2.5 py-1 bg-background/80 text-primary border border-primary/40 text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-md shadow-md">
              {t('حصري', 'EXCLUSIVE')}
            </span>
          )}
        </div>

        {/* Hover Quick View Overlay */}
        <Link
          to={`/product/${product.id}`}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
        >
          <span className="px-4 py-2 bg-primary/95 hover:bg-primary text-on-primary text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xl backdrop-blur-md tracking-wider">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('تفاصيل العطر', 'Quick View')}</span>
          </span>
        </Link>
      </div>

      {/* Card Content & Details (Equal Height Flex Layout) */}
      <div className="p-4 md:p-5 flex flex-col justify-between flex-1 space-y-3.5 bg-gradient-to-b from-transparent to-surface-container/20">
        
        <div className="space-y-1.5">
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-sans font-semibold tracking-widest text-primary uppercase truncate max-w-[65%]">
              {lang === 'ar' ? product.category : (product.categoryEn || product.category)}
            </span>
            <div className="flex items-center gap-1 text-primary shrink-0 font-bold">
              <Star className="w-3.5 h-3.5 fill-primary" />
              <span>{product.rating}</span>
              <span className="text-muted font-normal">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-serif text-base md:text-lg font-bold text-on-surface line-clamp-1 leading-snug">
              {lang === 'ar' ? product.name : product.nameEn}
            </h3>
          </Link>
        </div>

        {/* Size Selector Pills */}
        {product.volumeOptions && product.volumeOptions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {product.volumeOptions.map((vol) => (
              <button
                key={vol.size}
                onClick={() => setSelectedSize(vol.size)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  selectedSize === vol.size
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-secondary-bg/80 text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
                }`}
              >
                {vol.size}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Price & Add to Cart Action (KWD Currency) */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/15 mt-auto">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg md:text-xl font-bold text-primary">
                {currentPrice.toFixed(3)} {t('د.ك', 'KWD')}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-muted line-through font-mono">
                  {Number(product.oldPrice).toFixed(3)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary rounded-xl border border-primary/30 transition-all shadow-sm flex items-center justify-center group/btn"
            title={t('إضافة للسلة', 'Add to Cart')}
          >
            <ShoppingBag className="w-4.5 h-4.5 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
