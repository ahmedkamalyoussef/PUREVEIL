import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { fetchOrdersApi, updateOrderStatusApi } from '../../services/apiService';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdminOrdersPage: React.FC = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await fetchOrdersApi();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateOrderStatusApi(id, status);
      loadOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          {t('إدارة طلبات المبيعات', 'Orders Management')}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t('متابعة طلبات العملاء بالدينار الكويتي وتحديث حالات الشحن والدفع', 'Track customer orders in KWD and manage order fulfillment')}
        </p>
      </div>

      <div className="glass-panel-gold rounded-3xl p-6 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">{t('جاري التحميل...', 'Loading...')}</div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">{t('لا توجد طلبات بعد', 'No orders found')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs font-sans">
              <thead>
                <tr className="border-b border-outline-variant/20 text-muted uppercase text-[10px]">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">{t('العميل', 'Customer')}</th>
                  <th className="py-3 px-4">{t('الهاتف', 'Phone')}</th>
                  <th className="py-3 px-4">{t('الإجمالي (KWD)', 'Total (KWD)')}</th>
                  <th className="py-3 px-4">{t('وسيلة الدفع', 'Payment Method')}</th>
                  <th className="py-3 px-4">{t('الحالة الحالية', 'Status')}</th>
                  <th className="py-3 px-4">{t('التاريخ', 'Date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary-bg/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">#{o.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-on-surface">{o.customer_name}</td>
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant">{o.customer_phone || '—'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-on-surface">{Number(o.total).toFixed(3)} KWD</td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{o.payment_method || '—'}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="bg-secondary-bg border border-outline-variant/30 rounded-lg px-2.5 py-1 text-xs font-bold text-primary focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-muted text-[11px]">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
