import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';

export const FavoritesPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { favorites, loading } = useFavorites();

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-gutter pt-32 pb-24 space-y-12">
      
      {/* Header */}
      <div className="border-b border-outline-variant/20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">
            {t('قائمة الرغبات الحصرية', 'EXCLUSIVE WISHLIST')}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-on-surface mt-2">
            {t('العطور المفضلة', 'Your Favorite Fragrances')}
          </h1>
        </div>
        {isAuthenticated && (
          <p className="text-sm text-on-surface-variant font-sans">
            {t(`لديك (${favorites.length}) عطور في قائمة المفضلة`, `You have (${favorites.length}) items in your wishlist`)}
          </p>
        )}
      </div>

      {/* Unauthenticated view */}
      {!isAuthenticated ? (
        <div className="glass-panel-gold rounded-3xl p-12 text-center max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-on-surface">
            {t('سجل الدخول لعرض المفضلة', 'Sign In to View Favorites')}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {t('يرجى تسجيل الدخول لحفظ واستعراض عطورك المفضلة عبر جميع أجهزتك.', 'Please sign in to save and sync your favorite fragrances across all devices.')}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-gold-glow hover:brightness-110 transition-all"
          >
            <span>{t('تسجيل الدخول', 'Sign In')}</span>
            {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel rounded-3xl h-[420px] animate-pulse bg-secondary-bg/30" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-panel-gold rounded-3xl p-16 text-center max-w-lg mx-auto space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-on-surface">
              {t('قائمة المفضلة فارغة', 'Your Wishlist is Empty')}
            </h2>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
              {t('لم تقم بإضافة أي عطور إلى المفضلة بعد. استكشف كتالوجنا الملكي وأضف عطورك المفضلة!', 'Explore our royal catalog and click the heart icon to save your favorite perfumes!')}
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-gold-glow hover:brightness-110 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('استكشف الكتالوج', 'Explore Catalog')}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {favorites.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
};
