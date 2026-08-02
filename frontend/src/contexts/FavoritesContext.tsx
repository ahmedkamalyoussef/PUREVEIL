import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { fetchFavoritesApi, addFavoriteApi, removeFavoriteApi } from '../services/apiService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

interface FavoritesContextType {
  favorites: Product[];
  favoriteIds: Set<number | string>;
  loading: boolean;
  isFavorite: (productId: number | string) => boolean;
  toggleFavorite: (product: Product) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();

  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number | string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchFavoritesApi();
      setFavorites(data || []);
      setFavoriteIds(new Set((data || []).map((p) => p.id)));
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (productId: number | string) => {
      return favoriteIds.has(productId) || favoriteIds.has(Number(productId)) || favoriteIds.has(String(productId));
    },
    [favoriteIds]
  );

  const toggleFavorite = async (product: Product): Promise<boolean> => {
    if (!isAuthenticated) {
      showError(t('يرجى تسجيل الدخول لحفظ العطر في المفضلة', 'Please sign in to save fragrance to favorites'));
      return false;
    }

    const currentlyFavorited = isFavorite(product.id);

    try {
      if (currentlyFavorited) {
        await removeFavoriteApi(product.id);
        
        // Synchronize state immediately after successful backend deletion
        setFavorites((prev) => prev.filter((p) => String(p.id) !== String(product.id)));
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          next.delete(Number(product.id));
          next.delete(String(product.id));
          return next;
        });

        showSuccess(t('تمت إزالة العطر من المفضلة', 'Removed from wishlist'));
        return false;
      } else {
        await addFavoriteApi(product.id);

        // Synchronize state immediately after successful backend insertion
        setFavorites((prev) => [product, ...prev.filter((p) => String(p.id) !== String(product.id))]);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.add(product.id);
          return next;
        });

        showSuccess(t('تمت إضافة العطر للمفضلة', 'Added to wishlist'));
        return true;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || t('حدث خطأ أثناء تحديث المفضلة', 'Failed to update favorites');
      showError(msg);
      throw err;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        loading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
