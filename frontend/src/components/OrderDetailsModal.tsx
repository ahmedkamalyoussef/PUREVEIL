import React, { useState } from 'react';
import {
  X, Printer, User, Mail, Phone, MapPin, CreditCard, Calendar,
  Package, CheckCircle2, Clock, Truck, ShieldAlert, XCircle, RefreshCw, DollarSign
} from 'lucide-react';
import { Order } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SafeImage } from './SafeImage';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: number | string, newStatus: string) => Promise<void>;
  onUpdatePaymentStatus: (orderId: number | string, newPaymentStatus: string) => Promise<void>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
}) => {
  const { lang, t } = useLanguage();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdatingStatus(true);
    try {
      await onUpdateStatus(order.id, e.target.value);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePaymentStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdatingPayment(true);
    try {
      await onUpdatePaymentStatus(order.id, e.target.value);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Status Badge Colors & Icons
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          label: t('قيد الانتظار', 'Pending'),
          icon: Clock,
        };
      case 'processing':
        return {
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
          label: t('قيد التجهيز', 'Processing'),
          icon: RefreshCw,
        };
      case 'shipped':
        return {
          bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
          label: t('تم الشحن', 'Shipped'),
          icon: Truck,
        };
      case 'delivered':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          label: t('تم التسليم', 'Delivered'),
          icon: CheckCircle2,
        };
      case 'cancelled':
        return {
          bg: 'bg-red-500/15 border-red-500/30 text-red-300',
          label: t('ملغى', 'Cancelled'),
          icon: XCircle,
        };
      default:
        return {
          bg: 'bg-secondary-bg border-outline-variant/30 text-on-surface-variant',
          label: status,
          icon: Package,
        };
    }
  };

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

  const statusInfo = getStatusBadge(order.status);
  const paymentInfo = getPaymentBadge(order.paymentStatus);
  const StatusIcon = statusInfo.icon;

  const formattedDate = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString(
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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-panel-gold rounded-3xl p-6 md:p-8 w-full max-w-3xl space-y-6 relative border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:p-0">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-on-surface flex items-center gap-2">
                <span>{t('تفاصيل الطلب', 'Order Details')}</span>
                <span className="font-mono text-primary">#{order.id}</span>
              </h2>
              <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
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

        {/* Status Badges Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-secondary-bg/60 rounded-2xl border border-outline-variant/15">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Order Status Badge */}
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${statusInfo.bg}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusInfo.label}</span>
            </div>

            {/* Payment Status Badge */}
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${paymentInfo.bg}`}>
              <DollarSign className="w-4 h-4" />
              <span>{paymentInfo.label}</span>
            </div>

            {/* Payment Method */}
            {order.paymentMethod && (
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-background/50 border border-outline-variant/20 text-on-surface-variant flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="uppercase">{order.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Direct Status Actions (Admin Dropdowns) */}
          <div className="flex items-center gap-3 print:hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted">{t('الحالة:', 'Status:')}</span>
              <select
                value={order.status}
                onChange={handleStatusChange}
                disabled={updatingStatus}
                className="bg-background border border-outline-variant/30 text-on-surface rounded-lg px-2.5 py-1 text-xs focus:border-primary focus:outline-none"
              >
                <option value="pending">{t('قيد الانتظار', 'Pending')}</option>
                <option value="processing">{t('قيد التجهيز', 'Processing')}</option>
                <option value="shipped">{t('تم الشحن', 'Shipped')}</option>
                <option value="delivered">{t('تم التسليم', 'Delivered')}</option>
                <option value="cancelled">{t('ملغى', 'Cancelled')}</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted">{t('الدفع:', 'Payment:')}</span>
              <select
                value={order.paymentStatus || 'paid'}
                onChange={handlePaymentStatusChange}
                disabled={updatingPayment}
                className="bg-background border border-outline-variant/30 text-on-surface rounded-lg px-2.5 py-1 text-xs focus:border-primary focus:outline-none"
              >
                <option value="paid">{t('مدفوع', 'Paid')}</option>
                <option value="unpaid">{t('غير مدفوع', 'Unpaid')}</option>
                <option value="refunded">{t('مسترجع', 'Refunded')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer Info */}
          <div className="p-4 bg-background/50 border border-outline-variant/15 rounded-2xl space-y-2.5">
            <h4 className="font-serif text-sm font-bold text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-1.5">
              <User className="w-4 h-4" />
              <span>{t('معلومات العميل', 'Customer Information')}</span>
            </h4>
            <div className="space-y-1.5 text-xs text-on-surface-variant">
              <div className="font-bold text-on-surface">{order.customerName}</div>
              {order.customerEmail && (
                <div className="flex items-center gap-2 text-muted">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{order.customerEmail}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-mono">{order.customerPhone}</span>
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
            <div className="space-y-1 text-xs text-on-surface-variant">
              <div className="font-semibold text-on-surface">{t('الكويت - العاصمة', 'Kuwait - Kuwait City')}</div>
              <div className="text-muted">{t('توصيل سريع للعنوان المسجل لدى العميل', 'Express delivery to registered address')}</div>
            </div>
          </div>
        </div>

        {/* Ordered Products Table */}
        <div className="space-y-3">
          <h4 className="font-serif text-base font-bold text-on-surface">
            {t('المنتجات المطلوبة', 'Ordered Products')}
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/15">
            <table className="w-full text-xs text-right font-sans">
              <thead className="bg-secondary-bg/80 text-muted border-b border-outline-variant/15">
                <tr>
                  <th className="p-3 font-semibold">{t('المنتج', 'Product')}</th>
                  <th className="p-3 font-semibold text-center">{t('الحجم', 'Size')}</th>
                  <th className="p-3 font-semibold text-center">{t('الكمية', 'Qty')}</th>
                  <th className="p-3 font-semibold text-left">{t('سعر الوحدة', 'Unit Price')}</th>
                  <th className="p-3 font-semibold text-left">{t('الإجمالي', 'Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 bg-background/40">
                {order.items && order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-secondary-bg/30">
                    <td className="p-3 flex items-center gap-3">
                      <SafeImage
                        src={item.productImage || ''}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-xl border border-outline-variant/20 shrink-0"
                      />
                      <span className="font-bold text-on-surface">{item.name}</span>
                    </td>
                    <td className="p-3 text-center text-muted">{item.size || '—'}</td>
                    <td className="p-3 text-center font-mono font-semibold">{item.quantity}</td>
                    <td className="p-3 text-left font-mono">{item.price.toFixed(3)} د.ك</td>
                    <td className="p-3 text-left font-mono font-bold gold-gradient-text">
                      {(item.price * item.quantity).toFixed(3)} د.ك
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary & Financials */}
        <div className="p-4 bg-secondary-bg/50 rounded-2xl border border-outline-variant/15 space-y-2 text-xs">
          <div className="flex justify-between text-muted">
            <span>{t('المجموع الفرعي:', 'Subtotal:')}</span>
            <span className="font-mono">{(order.subtotal || order.total).toFixed(3)} د.ك</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>{t('رسوم التوصيل:', 'Shipping Fee:')}</span>
            <span className="font-mono">
              {(order.shippingFee || 0) === 0
                ? t('مجاني', 'Free')
                : `${(order.shippingFee || 0).toFixed(3)} د.ك`}
            </span>
          </div>
          <div className="border-t border-outline-variant/15 pt-2 flex justify-between items-center text-sm font-bold text-on-surface">
            <span>{t('الإجمالي الكلي:', 'Grand Total:')}</span>
            <span className="font-serif text-lg text-primary font-bold font-mono">
              {order.total.toFixed(3)} KWD
            </span>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="flex justify-between items-center pt-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:text-primary hover:border-primary transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{t('طباعة الفاتورة', 'Print Invoice')}</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-gold-glow hover:brightness-110 transition-all"
          >
            {t('إغلاق', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
