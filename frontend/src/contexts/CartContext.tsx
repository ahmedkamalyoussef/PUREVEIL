import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types';
import {
  fetchCartApi,
  addToCartApi,
  removeCartItemApi,
  updateCartItemApi,
  clearCartApi,
  CartDataResponse,
} from '../services/apiService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';
import { useSettings } from './SettingsContext';

interface CartContextType {
  cart: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size?: string, quantity?: number, customUnitPrice?: number) => Promise<void>;
  removeFromCart: (productId: number | string, size: string) => Promise<void>;
  updateQuantity: (productId: number | string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  const { settings } = useSettings();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Helper: Recalculate local totals for guest cart
  const calculateLocalTotals = useCallback((items: CartItem[]) => {
    const sub = items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
    const shipThreshold = settings.freeShippingThreshold || 30;
    const baseShip = settings.shippingFee !== undefined ? settings.shippingFee : 2.0;
    const ship = sub >= shipThreshold || items.length === 0 ? 0 : baseShip;

    setSubtotal(Number(sub.toFixed(3)));
    setShippingFee(Number(ship.toFixed(3)));
    setTotal(Number((sub + ship).toFixed(3)));
  }, [settings.freeShippingThreshold, settings.shippingFee]);

  // Synchronize state with backend response
  const applyCartResponse = (data: CartDataResponse) => {
    if (data && Array.isArray(data.items)) {
      setCart(data.items);
      setSubtotal(data.subtotal || 0);
      setShippingFee(data.shippingFee || 0);
      setTotal(data.total || 0);
    }
  };

  // Sync Guest Cart to MySQL on login
  const syncGuestCartToBackend = useCallback(async () => {
    const stored = localStorage.getItem('pureveil_guest_cart');
    if (stored) {
      try {
        const guestItems: CartItem[] = JSON.parse(stored);
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          for (const item of guestItems) {
            await addToCartApi(item.productId, item.size, item.quantity, item.unitPrice);
          }
        }
      } catch (e) {
        console.error('Failed to sync guest cart:', e);
      } finally {
        localStorage.removeItem('pureveil_guest_cart');
      }
    }
  }, []);

  // Load cart on auth change
  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await syncGuestCartToBackend();
        const data = await fetchCartApi();
        applyCartResponse(data);
      } catch (err) {
        console.error('Failed to load user cart:', err);
      }
    } else {
      const stored = localStorage.getItem('pureveil_guest_cart');
      if (stored) {
        try {
          const parsed: CartItem[] = JSON.parse(stored);
          setCart(parsed);
          calculateLocalTotals(parsed);
        } catch (e) {
          setCart([]);
          calculateLocalTotals([]);
        }
      } else {
        setCart([]);
        calculateLocalTotals([]);
      }
    }
  }, [isAuthenticated, syncGuestCartToBackend]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addToCart = async (
    product: Product,
    size: string = '100ml',
    quantity: number = 1,
    customUnitPrice?: number
  ) => {
    const selectedVol = product.volumeOptions?.find((v) => v.size === size);
    const unitPrice =
      customUnitPrice !== undefined ? customUnitPrice : selectedVol ? selectedVol.price : product.price;

    if (isAuthenticated) {
      try {
        const data = await addToCartApi(product.id, size, quantity, unitPrice);
        applyCartResponse(data);
        showSuccess(t('تمت إضافة العطر إلى حقيبة التسوق', 'Added fragrance to shopping bag'));
      } catch (err: any) {
        const msg = err.response?.data?.message || t('فشل إضافته للسلة', 'Failed to add item to cart');
        showError(msg);
        return;
      }
    } else {
      setCart((prevCart) => {
        const existingIdx = prevCart.findIndex((item) => item.productId === product.id && item.size === size);
        let updated: CartItem[];
        if (existingIdx > -1) {
          updated = [...prevCart];
          updated[existingIdx].quantity += quantity;
        } else {
          updated = [
            ...prevCart,
            {
              productId: product.id,
              productName: product.name,
              productNameEn: product.nameEn,
              productImage: product.image,
              product,
              size,
              unitPrice,
              quantity,
            },
          ];
        }
        localStorage.setItem('pureveil_guest_cart', JSON.stringify(updated));
        calculateLocalTotals(updated);
        return updated;
      });
      showSuccess(t('تمت إضافة العطر إلى حقيبة التسوق', 'Added fragrance to shopping bag'));
    }
    setIsCartOpen(true);
  };

  const removeFromCart = async (productId: number | string, size: string) => {
    if (isAuthenticated) {
      try {
        const data = await removeCartItemApi(productId, size);
        applyCartResponse(data);
      } catch (err: any) {
        const msg = err.response?.data?.message || t('فشل حذف العطر من السلة', 'Failed to remove item');
        showError(msg);
      }
    } else {
      setCart((prev) => {
        const updated = prev.filter((item) => !(item.productId === productId && item.size === size));
        localStorage.setItem('pureveil_guest_cart', JSON.stringify(updated));
        calculateLocalTotals(updated);
        return updated;
      });
    }
  };

  const updateQuantity = async (productId: number | string, size: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, size);
      return;
    }

    if (isAuthenticated) {
      try {
        const data = await updateCartItemApi(productId, size, quantity);
        applyCartResponse(data);
      } catch (err: any) {
        const msg = err.response?.data?.message || t('فشل تحديث الكمية', 'Failed to update quantity');
        showError(msg);
      }
    } else {
      setCart((prev) => {
        const updated = prev.map((item) =>
          item.productId === productId && item.size === size ? { ...item, quantity } : item
        );
        localStorage.setItem('pureveil_guest_cart', JSON.stringify(updated));
        calculateLocalTotals(updated);
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        const data = await clearCartApi();
        applyCartResponse(data);
      } catch (err: any) {
        const msg = err.response?.data?.message || t('فشل تفريغ السلة', 'Failed to clear cart');
        showError(msg);
      }
    } else {
      setCart([]);
      calculateLocalTotals([]);
      localStorage.removeItem('pureveil_guest_cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal,
        shippingFee,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
