import React from 'react';
import ReactDOM from 'react-dom';
import { Order } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { getStatusConfig } from '../utils/orderStatusConfig';
import { getImageUrl } from '../utils/imageUrl';

interface OrderInvoicePrintProps {
  order: Order;
}

export const OrderInvoicePrint: React.FC<OrderInvoicePrintProps> = ({ order }) => {
  const { lang, t } = useLanguage();
  const { settings } = useSettings();

  const statusConfig = getStatusConfig(order.status);
  const storeLogoUrl = getImageUrl(settings.logo || '/logo.png');

  const orderDate = new Date(order.createdAt || order.created_at || order.date || Date.now()).toLocaleDateString(
    lang === 'ar' ? 'ar-KW' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const paymentStatusText =
    order.paymentStatus === 'paid' || order.payment_status === 'paid'
      ? t('مدفوع بالكامل', 'Paid in Full')
      : order.paymentStatus === 'refunded' || order.payment_status === 'refunded'
      ? t('مسترجع', 'Refunded')
      : t('غير مدفوع', 'Unpaid');

  const paymentMethodText = (order.paymentMethod || order.payment_method || 'KNET').toUpperCase();

  return ReactDOM.createPortal(
    <div id="printable-order-invoice" className="hidden print:block text-black bg-white font-sans p-6 text-xs leading-normal">

      {/* Header Section: Store Info & Logo */}
      <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={storeLogoUrl}
            alt="PURE VEIL"
            className="w-14 h-14 object-contain rounded-full border border-slate-300"
          />
          <div>
            <h1 className="font-serif text-xl font-bold text-slate-900 uppercase tracking-wide">
              {settings.storeNameEn || 'PURE VEIL'}
            </h1>
            <p className="text-[11px] text-slate-600 font-serif font-bold">
              {settings.storeName || 'بيور فيل - العطور الفاخرة والعود'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {settings.storeAddressEn || 'Kuwait City - Luxury Fragrance Tower'}
            </p>
          </div>
        </div>

        <div className="text-right rtl:text-left space-y-1">
          <div className="inline-block px-3 py-1 bg-slate-900 text-white font-serif font-bold text-xs rounded uppercase tracking-wider">
            {t('فاتورة ضريبية / INVOICE', 'TAX INVOICE')}
          </div>
          <div className="text-[10px] text-slate-600 font-mono">
            {settings.supportEmail || 'support@pureveil.com'}
          </div>
          <div className="text-[10px] text-slate-600 font-mono">
            {settings.supportPhone || '+965 2200 8800'}
          </div>
        </div>
      </div>

      {/* Invoice & Order Meta Bar */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-slate-100 rounded border border-slate-300 mb-4">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">{t('رقم الطلب:', 'Order Number:')}</span>
          <span className="font-mono text-sm font-bold text-slate-900">#{order.id}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">{t('تاريخ الفاتورة:', 'Invoice Date:')}</span>
          <span className="text-xs font-semibold text-slate-800">{orderDate}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">{t('حالة الطلب:', 'Order Status:')}</span>
          <span className="text-xs font-bold text-slate-900">
            {lang === 'ar' ? statusConfig.nameAr : statusConfig.nameEn}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">{t('حالة وطريقة الدفع:', 'Payment Details:')}</span>
          <span className="text-xs font-bold text-slate-900">
            {paymentStatusText} ({paymentMethodText})
          </span>
        </div>
      </div>

      {/* Customer & Shipping Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 border border-slate-300 rounded space-y-1">
          <h3 className="font-bold text-xs border-b border-slate-200 pb-1 text-slate-900 uppercase">
            {t('بيانات العميل', 'Customer Info')}
          </h3>
          <p className="font-bold text-slate-900">{order.customerName || (order as any).customer_name}</p>
          {(order.customerEmail || (order as any).customer_email) && (
            <p className="text-slate-600 font-mono text-[11px]">{order.customerEmail || (order as any).customer_email}</p>
          )}
          {(order.customerPhone || (order as any).customer_phone) && (
            <p className="text-slate-600 font-mono text-[11px]">{order.customerPhone || (order as any).customer_phone}</p>
          )}
        </div>

        <div className="p-3 border border-slate-300 rounded space-y-1">
          <h3 className="font-bold text-xs border-b border-slate-200 pb-1 text-slate-900 uppercase">
            {t('عنوان التوصيل', 'Shipping Address')}
          </h3>
          <p className="font-bold text-slate-900">{t('دولة الكويت - العاصمة', 'State of Kuwait - Kuwait City')}</p>
          <p className="text-slate-600 text-[11px]">
            {t('توصيل خاص سريع للعنوان المسجل', 'Express direct delivery to customer address')}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
              <th className="p-2 text-right rtl:text-right ltr:text-left border-r border-slate-300">#</th>
              <th className="p-2 text-right rtl:text-right ltr:text-left border-r border-slate-300">{t('اسم المنتج', 'Product Description')}</th>
              <th className="p-2 text-center border-r border-slate-300">{t('الحجم', 'Size')}</th>
              <th className="p-2 text-center border-r border-slate-300">{t('الكمية', 'Qty')}</th>
              <th className="p-2 text-left rtl:text-left ltr:text-right border-r border-slate-300">{t('سعر الوحدة', 'Unit Price')}</th>
              <th className="p-2 text-left rtl:text-left ltr:text-right">{t('الإجمالي', 'Line Total')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="p-2 text-center border-r border-slate-300 font-mono text-[11px]">{idx + 1}</td>
                <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{item.name}</td>
                <td className="p-2 text-center border-r border-slate-300 font-mono text-[11px]">{item.size || '100ml'}</td>
                <td className="p-2 text-center border-r border-slate-300 font-mono font-bold">{item.quantity}</td>
                <td className="p-2 text-left rtl:text-left ltr:text-right border-r border-slate-300 font-mono">
                  {Number(item.price).toFixed(3)} KWD
                </td>
                <td className="p-2 text-left rtl:text-left ltr:text-right font-mono font-bold">
                  {(Number(item.price) * item.quantity).toFixed(3)} KWD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary Box */}
      <div className="flex justify-end mb-6">
        <div className="w-64 border border-slate-400 rounded p-3 space-y-1.5 bg-slate-50 text-xs">
          <div className="flex justify-between text-slate-700">
            <span>{t('المجموع الفرعي:', 'Subtotal:')}</span>
            <span className="font-mono font-semibold">
              {(Number(order.subtotal) || Number(order.total)).toFixed(3)} KWD
            </span>
          </div>

          <div className="flex justify-between text-slate-700">
            <span>{t('رسوم الشحن والتوصيل:', 'Shipping Fee:')}</span>
            <span className="font-mono font-semibold">
              {(Number(order.shippingFee) || 0) === 0
                ? t('مجاني', 'FREE')
                : `${(Number(order.shippingFee) || 0).toFixed(3)} KWD`}
            </span>
          </div>

          <div className="border-t-2 border-slate-800 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
            <span>{t('الإجمالي الكلي:', 'Grand Total:')}</span>
            <span className="font-mono text-base">{Number(order.total).toFixed(3)} KWD</span>
          </div>
        </div>
      </div>

      {/* Printable Invoice Footer */}
      <div className="border-t border-slate-300 pt-4 text-center text-[10px] text-slate-500 space-y-1">
        <p className="font-bold text-slate-700">{t('شكراً لتسوقك من دار بيور فيل للعطور الفاخرة', 'Thank you for choosing PURE VEIL Luxury Perfumes')}</p>
        <p>{t('جميع عطورنا أصلية وتخضع لأعلى معايير الجودة العالمية.', 'All our fragrances are authentic and crafted to the highest international standards.')}</p>
        <p className="font-mono text-[9px] text-slate-400">PURE VEIL • {settings.supportEmail || 'support@pureveil.com'} • {settings.supportPhone || '+965 2200 8800'}</p>
      </div>
    </div>,
    document.body
  );
};

