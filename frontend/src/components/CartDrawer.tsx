import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

import { SafeImage } from './SafeImage';

export const CartDrawer: React.FC = () => {
  const { cart, subtotal, shippingFee, total, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const { lang, t } = useLanguage();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest border-l border-outline-variant/15 p-6 flex flex-col justify-between shadow-2xl relative">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-xl font-bold text-on-surface">
                {t('حقيبة التسوق (KWD)', 'Shopping Bag (KWD)')}
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-muted hover:text-on-surface rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="my-auto text-center space-y-4 py-12">
              <ShoppingBag className="w-12 h-12 text-primary mx-auto opacity-50" />
              <h4 className="font-serif text-lg font-bold text-on-surface">
                {t('سلتك فارغة حالياً', 'Your bag is empty')}
              </h4>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                {t('استكشف تشكيلات عطور بيور فيل الفاخرة وأضف عطورك المفضلة!', 'Explore PURE VEIL luxury fragrances and add your favorites!')}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs shadow-gold-glow hover:brightness-110"
              >
                {t('متابعة التسوق', 'Continue Shopping')}
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4 p-4 rounded-xl bg-surface-container/40 border border-outline-variant/15 hover:border-primary/30 transition-all"
                >
                  <SafeImage
                    src={item.product?.image || item.productImage || ''}
                    alt={item.product?.name || item.productName || ''}
                    className="w-20 h-24 object-cover rounded-lg bg-surface-container-high shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-on-surface line-clamp-1">
                          {t(item.product?.name || item.productName || '', item.product?.nameEn || item.productNameEn || '')}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-muted hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-primary font-sans block mt-0.5">
                        {item.size}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center border border-outline-variant/30 rounded-lg bg-secondary-bg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="px-2 py-0.5 text-on-surface hover:text-primary transition-colors text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-mono text-xs text-on-surface font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="px-2 py-0.5 text-on-surface hover:text-primary transition-colors text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-sm text-primary">
                        {((item.unitPrice || 0) * item.quantity).toFixed(3)} KWD
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-outline-variant/15 pt-4 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('المجموع الفرعي:', 'Subtotal:')}</span>
                  <span className="font-mono font-bold text-on-surface">{subtotal.toFixed(3)} KWD</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('الشحن والتوصيل:', 'Shipping:')}</span>
                  <span className="font-mono font-bold text-on-surface">
                    {shippingFee === 0 ? t('مجاني', 'FREE') : `${shippingFee.toFixed(3)} KWD`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-outline-variant/15 pt-2">
                  <span className="text-on-surface">{t('الإجمالي:', 'Total:')}</span>
                  <span className="font-serif text-lg text-primary">{total.toFixed(3)} KWD</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3 bg-secondary-bg hover:bg-secondary-bg/80 text-on-surface text-center font-bold rounded-xl text-xs border border-outline-variant/30 transition-all"
                >
                  {t('معاينة السلة', 'View Bag')}
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="py-3 bg-primary hover:brightness-110 text-on-primary text-center font-bold rounded-xl text-xs shadow-gold-glow transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{t('الشراء الآن', 'Checkout')}</span>
                  {lang === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
