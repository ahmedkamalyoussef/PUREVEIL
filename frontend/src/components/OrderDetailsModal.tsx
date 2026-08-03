import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Printer, User, Mail, Phone, MapPin, CreditCard, Calendar,
  Package, CheckCircle2, Clock, Truck, ShieldAlert, XCircle, RefreshCw, DollarSign, ExternalLink
} from 'lucide-react';
import { Order } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchOrderByIdApi } from '../services/apiService';
import { getStatusConfig } from '../utils/orderStatusConfig';
import { OrderStatusTracker } from './OrderStatusTracker';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { SafeImage } from './SafeImage';
import { OrderInvoicePrint } from './OrderInvoicePrint';


interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus?: (orderId: number | string, newStatus: string, note?: string) => Promise<void>;
  onUpdatePaymentStatus?: (orderId: number | string, newPaymentStatus: string) => Promise<void>;
  isAdminView?: boolean;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order: initialOrder,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
  isAdminView = false,
}) => {
  const { lang, t } = useLanguage();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Fetch complete details with status timeline if not present
  useEffect(() => {
    const loadFullOrderDetails = async () => {
      if (!initialOrder.timeline || initialOrder.timeline.length === 0) {
        setLoadingDetails(true);
        const fullData = await fetchOrderByIdApi(initialOrder.id);
        if (fullData) {
          setOrder(fullData);
        }
        setLoadingDetails(false);
      }
    };
    loadFullOrderDetails();
  }, [initialOrder]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onUpdateStatus) return;
    setUpdatingStatus(true);
    try {
      await onUpdateStatus(order.id, e.target.value);
      // Reload timeline
      const updated = await fetchOrderByIdApi(order.id);
      if (updated) {
        setOrder(updated);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onUpdatePaymentStatus) return;
    setUpdatingPayment(true);
    try {
      await onUpdatePaymentStatus(order.id, e.target.value);
      setOrder(prev => ({ ...prev, paymentStatus: e.target.value as any }));
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  const getPaymentBadge = (payStatus?: string) => {
    const status = payStatus || 'paid';
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          label: t('مدفوع', 'Paid'),
        };
      case 'unpaid':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          label: t('غير مدفوع', 'Unpaid'),
        };
      case 'refunded':
        return {
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
          label: t('مسترجع', 'Refunded'),
        };
      default:
        return {
          bg: 'bg-secondary-bg border-outline-variant/30 text-on-surface-variant',
          label: status,
        };
    }
  };

  const paymentInfo = getPaymentBadge(order.paymentStatus);

  const formattedDate = new Date(order.createdAt || order.created_at || order.date || Date.now()).toLocaleDateString(
    lang === 'ar' ? 'ar-KW' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  return (
    <div className="fixed top-16 sm:top-20 inset-x-0 bottom-0 z-40 bg-background/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 py-6 sm:py-8 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-panel-gold rounded-3xl p-5 sm:p-8 w-full max-w-4xl space-y-6 relative border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:p-0 max-h-[88dvh] sm:max-h-[82dvh] overflow-y-auto my-auto">


        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-on-surface flex items-center gap-2">
                <span>{t('تفاصيل الطلب', 'Order Details')}</span>
                <span className="font-mono text-primary">#{order.id}</span>
              </h2>
              <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5 font-sans">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-on-surface rounded-xl hover:bg-secondary-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badges & Admin Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-secondary-bg/60 rounded-2xl border border-outline-variant/15">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${statusConfig.color.badge}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{lang === 'ar' ? statusConfig.nameAr : statusConfig.nameEn}</span>
            </div>

            {/* Payment Status Badge */}
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${paymentInfo.bg}`}>
              <DollarSign className="w-4 h-4" />
              <span>{paymentInfo.label}</span>
            </div>

            {/* Payment Method */}
            {(order.paymentMethod || order.payment_method) && (
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-background/50 border border-outline-variant/20 text-on-surface-variant flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="uppercase">{order.paymentMethod || order.payment_method}</span>
              </div>
            )}
          </div>

          {/* Admin Controls (When called from Admin Panel) */}
          {isAdminView && onUpdateStatus && onUpdatePaymentStatus && (
            <div className="flex items-center gap-3 print:hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted">{t('الحالة:', 'Status:')}</span>
                <select
                  value={order.status}
                  onChange={handleStatusChange}
                  disabled={updatingStatus}
                  className="bg-background border border-outline-variant/30 text-on-surface rounded-lg px-2.5 py-1 text-xs focus:border-primary focus:outline-none font-sans"
                >
                  <option value="pending">{t('تم تقديم الطلب', 'Order Placed')}</option>
                  <option value="processing">{t('قيد التجهيز', 'Processing')}</option>
                  <option value="shipped">{t('تم الشحن', 'Shipped')}</option>
                  <option value="delivered">{t('تم التسليم', 'Delivered')}</option>
                  <option value="cancelled">{t('ملغى', 'Cancelled')}</option>
                  <option value="refunded">{t('مسترجع', 'Refunded')}</option>
                  <option value="returned">{t('مُعَاد', 'Returned')}</option>
                </select>
              </div>


              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted">{t('الدفع:', 'Payment:')}</span>
                <select
                  value={order.paymentStatus || 'paid'}
                  onChange={handlePaymentStatusChange}
                  disabled={updatingPayment}
                  className="bg-background border border-outline-variant/30 text-on-surface rounded-lg px-2.5 py-1 text-xs focus:border-primary focus:outline-none font-sans"
                >
                  <option value="paid">{t('مدفوع', 'Paid')}</option>
                  <option value="unpaid">{t('غير مدفوع', 'Unpaid')}</option>
                  <option value="refunded">{t('مسترجع', 'Refunded')}</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Visual Progress Tracker Component */}
        <div className="p-4 sm:p-5 bg-background/50 border border-outline-variant/15 rounded-2xl">
          <OrderStatusTracker
            currentStatus={order.status}
            currentStageStep={order.currentStageStep}
          />
        </div>

        {/* Customer & Shipping Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Info */}
          <div className="p-4 bg-background/50 border border-outline-variant/15 rounded-2xl space-y-2.5">
            <h4 className="font-serif text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-1.5">
              <User className="w-4 h-4" />
              <span>{t('معلومات العميل', 'Customer Information')}</span>
            </h4>
            <div className="space-y-1.5 text-xs text-on-surface-variant font-sans">
              <div className="font-bold text-on-surface">{order.customerName || (order as any).customer_name}</div>
              {(order.customerEmail || (order as any).customer_email) && (
                <div className="flex items-center gap-2 text-muted">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{order.customerEmail || (order as any).customer_email}</span>
                </div>
              )}
              {(order.customerPhone || (order as any).customer_phone) && (
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-mono">{order.customerPhone || (order as any).customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="p-4 bg-background/50 border border-outline-variant/15 rounded-2xl space-y-2.5">
            <h4 className="font-serif text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-1.5">
              <MapPin className="w-4 h-4" />
              <span>{t('عنوان التوصيل', 'Shipping Address')}</span>
            </h4>
            <div className="space-y-1 text-xs text-on-surface-variant font-sans">
              <div className="font-semibold text-on-surface">{t('دولة الكويت - العاصمة', 'State of Kuwait - Kuwait City')}</div>
              <div className="text-muted">{t('توصيل سريع خاص للعنوان المسجل لدى العميل', 'Express courier delivery to registered customer address')}</div>
            </div>
          </div>
        </div>

        {/* Ordered Products Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-bold text-on-surface flex items-center gap-2">
              <Package className="w-4.5 h-4.5 text-primary" />
              <span>{t('المنتجات المطلوبة', 'Ordered Products')}</span>
            </h4>
            <span className="text-xs text-muted font-mono">
              ({order.items?.length || 0} {t('صنف', 'Items')})
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-outline-variant/15">
            <table className="w-full text-xs text-right font-sans">
              <thead className="bg-secondary-bg/80 text-muted border-b border-outline-variant/15">
                <tr>
                  <th className="p-3 font-semibold">{t('المنتج', 'Product')}</th>
                  <th className="p-3 font-semibold text-center">{t('الحجم', 'Size')}</th>
                  <th className="p-3 font-semibold text-center">{t('الكمية', 'Qty')}</th>
                  <th className="p-3 font-semibold text-left">{t('سعر الوحدة', 'Unit Price')}</th>
                  <th className="p-3 font-semibold text-left">{t('الإجمالي', 'Line Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 bg-background/40">
                {order.items && order.items.map((item, idx) => {
                  const productUrl = item.productId ? `/product/${item.productId}` : null;

                  return (
                    <tr key={idx} className="hover:bg-secondary-bg/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={item.productImage || (item as any).product_image || ''}
                            alt={item.name}
                            className="w-11 h-11 object-cover rounded-xl border border-outline-variant/20 shrink-0"
                          />
                          <div>
                            {productUrl ? (
                              <Link
                                to={productUrl}
                                onClick={onClose}
                                className="font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1 group"
                              >
                                <span>{item.name}</span>
                                <ExternalLink className="w-3 h-3 text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            ) : (
                              <span className="font-bold text-on-surface">{item.name}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center text-muted font-mono">{item.size || '100ml'}</td>
                      <td className="p-3 text-center font-mono font-semibold">{item.quantity}</td>
                      <td className="p-3 text-left font-mono">{Number(item.price).toFixed(3)} KWD</td>
                      <td className="p-3 text-left font-mono font-bold gold-gradient-text">
                        {(Number(item.price) * item.quantity).toFixed(3)} KWD
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary Financial Breakdown */}
        <div className="p-4 bg-secondary-bg/50 rounded-2xl border border-outline-variant/15 space-y-2 text-xs font-sans">
          <div className="flex justify-between text-muted">
            <span>{t('المجموع الفرعي:', 'Subtotal:')}</span>
            <span className="font-mono">{(Number(order.subtotal) || Number(order.total)).toFixed(3)} KWD</span>
          </div>

          <div className="flex justify-between text-muted">
            <span>{t('رسوم الشحن والتوصيل:', 'Shipping Cost:')}</span>
            <span className="font-mono">
              {(Number(order.shippingFee) || 0) === 0
                ? t('مجاني', 'Free')
                : `${(Number(order.shippingFee) || 0).toFixed(3)} KWD`}
            </span>
          </div>

          <div className="border-t border-outline-variant/15 pt-2.5 flex justify-between items-center text-sm font-bold text-on-surface">
            <span>{t('الإجمالي الكلي:', 'Grand Total:')}</span>
            <span className="font-serif text-lg text-primary font-bold font-mono">
              {Number(order.total).toFixed(3)} KWD
            </span>
          </div>
        </div>

        {/* Status Timeline Chronological Display */}
        <OrderStatusTimeline
          timeline={order.timeline}
          currentStatus={order.status}
        />

        {/* Modal Footer Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-outline-variant/15 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:text-primary hover:border-primary transition-all font-sans"
          >
            <Printer className="w-4 h-4" />
            <span>{t('طباعة الفاتورة', 'Print Invoice')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-gold-glow hover:brightness-110 transition-all font-sans"
          >
            {t('إغلاق', 'Close')}
          </button>
        </div>
      </div>

      {/* Hidden Standalone Print Invoice - Activated via window.print() */}
      <OrderInvoicePrint order={order} />
    </div>
  );
};

