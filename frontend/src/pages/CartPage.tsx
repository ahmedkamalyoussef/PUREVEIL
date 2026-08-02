import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmModalContext';

import { SafeImage } from '../components/SafeImage';

export const CartPage: React.FC = () => {
  const { cart, subtotal, shippingFee, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { lang, t } = useLanguage();
  const { showSuccess, showInfo } = useToast();
  const { confirm } = useConfirm();

  const freeShippingThreshold = 30; // 30 KWD
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleClearCart = async () => {
    const isConfirmed = await confirm({
      title: t('تفريغ حقيبة التسوق', 'Clear Shopping Bag'),
      message: t('هل أنت تأكد من إزالة جميع العطور من السلة؟', 'Are you sure you want to remove all items from your shopping bag?'),
      confirmText: t('نعم، تفريغ السلة', 'Yes, Clear Bag'),
      cancelText: t('تراجع', 'Cancel'),
      type: 'warning'
    });

    if (isConfirmed) {
      await clearCart();
      showInfo(t('تم تفريغ حقيبة التسوق', 'Shopping bag cleared'));
    }
  };

  const handleRemoveItem = async (productId: number | string, size: string, name: string) => {
    const isConfirmed = await confirm({
      title: t('إزالة العطر من السلة', 'Remove Item from Bag'),
      message: t(`هل تريد إزالة (${name} - ${size}) من حقيبة التسوق؟`, `Remove (${name} - ${size}) from your shopping bag?`),
      confirmText: t('إزالة', 'Remove'),
      cancelText: t('تراجع', 'Cancel'),
      type: 'danger'
    });

    if (isConfirmed) {
      await removeFromCart(productId, size);
      showSuccess(t('تمت إزالة العطر من السلة', 'Item removed from bag'));
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-gutter pt-32 pb-24 space-y-12">
      
      {/* Header */}
      <div className="border-b border-outline-variant/20 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            {t('حقيبة التسوق الملكية', 'ROYAL SHOPPING BAG')}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-on-surface mt-2">
            {t('سلة المشتريات', 'Shopping Cart')}
          </h1>
        </div>
        {cart.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('تفريغ السلة', 'Clear Cart')}</span>
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="glass-panel-gold rounded-3xl p-16 text-center space-y-6 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-on-surface">
              {t('سلة المشتريات فارغة', 'Your Shopping Bag is Empty')}
            </h2>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {t('لم تقم بإضافة أي عطور لسلتك بعد. استكشف تشكيلاتنا العطرية الفاخرة واختر ما يناسب ذوقك.', 'Explore our royal fragrance catalog and add exquisite perfumes to your bag.')}
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-gold-glow hover:brightness-110 transition-all"
          >
            <span>{t('تسوق الآن', 'Shop Now')}</span>
            {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Free Shipping Progress */}
            <div className="glass-panel-gold rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface">
                  {remainingForFreeShipping === 0
                    ? t('تهانينا! لقد حصلت على توصيل مجاني لحقيبتك', 'Congratulations! You qualify for FREE Shipping')
                    : t(`أضف ${remainingForFreeShipping.toFixed(3)} KWD أخرى للحصول على توصيل مجاني`, `Add ${remainingForFreeShipping.toFixed(3)} KWD more for FREE Shipping`)}
                </span>
                <span className="text-primary font-mono font-bold">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-secondary-bg rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="glass-panel-gold rounded-3xl overflow-hidden divide-y divide-outline-variant/15">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-surface-container/20 transition-colors">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SafeImage
                      src={item.product?.image || item.productImage || ''}
                      alt={item.product?.name || item.productName || ''}
                      className="w-20 h-24 object-cover rounded-xl bg-surface-container-high shrink-0"
                    />
                    <div>
                      <span className="text-[11px] text-primary uppercase font-sans tracking-widest">
                        {t(item.product?.category || '', item.product?.categoryEn || '')}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-on-surface">
                        {t(item.product?.name || item.productName || '', item.product?.nameEn || item.productNameEn || '')}
                      </h3>
                      <span className="text-xs text-muted block mt-1">
                        {t('السعة العطرية:', 'Size:')} {item.size}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Controls */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                    <div className="flex items-center border border-outline-variant/30 rounded-xl bg-secondary-bg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="px-3 py-1.5 text-on-surface hover:text-primary transition-colors text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-3.5 py-1.5 font-mono font-bold text-xs text-on-surface">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="px-3 py-1.5 text-on-surface hover:text-primary transition-colors text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-left font-mono font-bold text-base text-primary">
                      {((item.unitPrice || 0) * item.quantity).toFixed(3)} KWD
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.productId, item.size, item.product?.name || item.productName || '')}
                      className="text-muted hover:text-red-400 p-2 transition-colors"
                      title={t('حذف العطر', 'Remove item')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-6 shrink-0 sticky top-28">
            <h3 className="font-serif text-xl font-bold text-on-surface border-b border-outline-variant/15 pb-4">
              {t('ملخص الطلب بالدينار الكويتي', 'Order Summary (KWD)')}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{t('المجموع الفرعي:', 'Subtotal:')}</span>
                <span className="font-mono font-bold text-on-surface">{subtotal.toFixed(3)} KWD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{t('رسوم الشحن والتوصيل:', 'Shipping Fee:')}</span>
                <span className="font-mono font-bold text-on-surface">
                  {shippingFee === 0 ? t('مجاني', 'FREE') : `${shippingFee.toFixed(3)} KWD`}
                </span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/15 pt-3 text-sm">
                <span className="font-bold text-on-surface">{t('المجموع الإجمالي:', 'Total:')}</span>
                <span className="font-serif font-bold text-xl text-primary">{total.toFixed(3)} KWD</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-xl text-sm tracking-wider hover:brightness-110 transition-all shadow-gold-glow flex items-center justify-center gap-2"
            >
              <span>{t('متابعة لإتمام الشراء', 'Proceed to Checkout')}</span>
              {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>

            <div className="pt-2 border-t border-outline-variant/15 text-[11px] text-muted space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>{t('دفع آمن ومضمون 100%', '100% Secure Payment Guarantee')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{t('عطور أصلية ومكفولة من دار بيور فيل', 'Guaranteed authentic fragrances by PURE VEIL')}</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
