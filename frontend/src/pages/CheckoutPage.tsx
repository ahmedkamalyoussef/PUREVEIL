import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, CreditCard, Truck, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { createOrderApi } from '../services/apiService';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, shippingFee, total, clearCart } = useCart();
  const { lang, t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'knet' | 'card' | 'cod'>('knet');
  const [shippingType, setShippingType] = useState<'standard' | 'express'>('standard');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | number>('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'الكويت',
    address: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const finalShippingFee = shippingType === 'express' ? 5.000 : shippingFee;
  const finalTotal = subtotal + finalShippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newOrder = await createOrderApi({
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        items: cart.map(i => ({ productId: i.productId, name: i.product?.name || i.productName || '', size: i.size, price: i.unitPrice, quantity: i.quantity })),
        paymentMethod: paymentMethod === 'knet' ? 'KNET (كروت كي نت)' : paymentMethod === 'card' ? 'Visa / Mastercard' : 'Cash on Delivery (الدفع عند الاستلام)',
        subtotal,
        shippingFee: finalShippingFee,
        total: finalTotal,
      });

      const assignedId = newOrder.id || `PV-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      setOrderId(assignedId);
      setOrderComplete(true);
      showSuccess(t('تم استلام وتأكيد طلبك بنجاح!', 'Your order has been confirmed successfully!'));
      clearCart();
    } catch (err) {
      console.error('Failed to create order:', err);
      showError(t('فشل إرسال الطلب، يرجى المحاولة لاحقاً', 'Failed to place order, please try again'));
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-36 pb-24 text-center space-y-6">
        <div className="glass-panel-gold rounded-3xl p-10 md:p-12 space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              {t('تم تأكيد الطلب بنجاح', 'ORDER CONFIRMED')}
            </span>
            <h1 className="font-serif text-3xl font-bold text-on-surface">
              {t('شكراً لتسوقك من دار بيور فيل', 'Thank You for Shopping at PURE VEIL')}
            </h1>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {t(`رقم طلبك الملكي هو #${orderId}. سيتم التواصل معك عبر الواتساب وتزويدك برابط التتبع.`, `Your order number is #${orderId}. We will notify you with tracking details shortly.`)}
            </p>
          </div>

          <div className="pt-4 border-t border-outline-variant/15 flex justify-center gap-4">
            <Link
              to="/"
              className="px-8 py-3.5 bg-primary text-on-primary font-bold rounded-xl text-xs shadow-gold-glow hover:brightness-110"
            >
              {t('العودة للرئيسية', 'Back to Home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-gutter pt-32 pb-24 space-y-10">
      <div className="border-b border-outline-variant/20 pb-6">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-on-surface">
          {t('إتمام الشراء والدفع', 'Checkout')}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t('أدخل بيانات التوصيل واختر وسيلة الدفع بالدينار الكويتي (KWD)', 'Enter your shipping address and choose your payment method in KWD')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Info */}
          <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="font-serif text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              <span>{t('بيانات العميل والشحن', 'Customer & Shipping Info')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-muted mb-1">{t('الاسم الكامل *', 'Full Name *')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="محمد المنصور"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted mb-1">{t('رقم الهاتف / الواتساب *', 'Phone Number *')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+965 9000 0000"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-muted mb-1">{t('البريد الإلكتروني', 'Email Address')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-muted mb-1">{t('المدينة / المنطقة *', 'City / Area *')}</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-muted mb-1">{t('العنوان التفصيلي (القطعة، الشارع، المنزل) *', 'Detailed Address *')}</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="الشرق، قطعة 3، شارع أحمد الجابر، منزل 12"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="font-serif text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
              <span>{t('طريقة الدفع في الكويت', 'Payment Method')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label
                onClick={() => setPaymentMethod('knet')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'knet' ? 'bg-primary/10 border-primary shadow-gold-glow' : 'bg-secondary-bg/50 border-outline-variant/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">KNET (كي نت)</span>
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[11px] text-muted">{t('الدفع السريع المباشر عبر بطاقة KNET الكويتية', 'Direct payment with Kuwaiti KNET cards')}</p>
              </label>

              <label
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'card' ? 'bg-primary/10 border-primary shadow-gold-glow' : 'bg-secondary-bg/50 border-outline-variant/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">Visa / MasterCard</span>
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[11px] text-muted">{t('البطاقات الائتمانية العالمية المعتمدة', 'Global credit card payment')}</p>
              </label>

              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'cod' ? 'bg-primary/10 border-primary shadow-gold-glow' : 'bg-secondary-bg/50 border-outline-variant/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">{t('الدفع عند الاستلام', 'Cash on Delivery')}</span>
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[11px] text-muted">{t('الدفع نقداً أو KNET لمندوب التوصيل', 'Pay cash or KNET upon arrival')}</p>
              </label>
            </div>
          </div>

        </div>

        {/* Order Summary Side Sidebar */}
        <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-6 shrink-0 sticky top-28">
          <h3 className="font-serif text-xl font-bold text-on-surface border-b border-outline-variant/15 pb-4">
            {t('ملخص طلب بيور فيل', 'PURE VEIL Summary')}
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('المجموع الفرعي:', 'Subtotal:')}</span>
              <span className="font-mono font-bold text-on-surface">{subtotal.toFixed(3)} KWD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('التوصيل في الكويت:', 'Delivery Fee:')}</span>
              <span className="font-mono font-bold text-on-surface">
                {finalShippingFee === 0 ? t('مجاني', 'FREE') : `${finalShippingFee.toFixed(3)} KWD`}
              </span>
            </div>
            <div className="flex justify-between border-t border-outline-variant/15 pt-3 text-sm">
              <span className="font-bold text-on-surface">{t('المبلغ النهائي:', 'Total Due:')}</span>
              <span className="font-serif font-bold text-2xl text-primary">{finalTotal.toFixed(3)} KWD</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-xl text-sm tracking-wider hover:brightness-110 transition-all shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{t('تاكيد واستكمال الطلب', 'Confirm Order')}</span>
              </>
            )}
          </button>

          <div className="text-[11px] text-muted text-center pt-2">
            {t('بالضغط على تأكيد الطلب أنت توافق على شروط وأحكام بيور فيل', 'By confirming, you agree to PURE VEIL terms and conditions')}
          </div>
        </div>

      </form>
    </div>
  );
};
