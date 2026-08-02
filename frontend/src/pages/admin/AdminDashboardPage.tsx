import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Package, ShoppingBag, DollarSign,
  ArrowUpRight, Sparkles, Clock
} from 'lucide-react';
import { DashboardStats, Order } from '../../types';
import { fetchDashboardStatsApi } from '../../services/apiService';
import { useLanguage } from '../../contexts/LanguageContext';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStatsApi();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-secondary-bg/50 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-secondary-bg/50 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: t('إجمالي المبيعات (KWD)', 'Total Revenue (KWD)'), value: `${(stats?.totalRevenue || 0).toFixed(3)} KWD`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: t('إجمالي الطلبات', 'Total Orders'), value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { title: t('العطور المتاحة', 'Active Perfumes'), value: stats?.totalProducts || 0, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { title: t('العملاء المسجلين', 'Registered Customers'), value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-on-surface">
            {t('نظرة عامة على لوحة التحكم', 'Dashboard Overview')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('متابعة أداء متجر PURE VEIL والمبيعات بالدينار الكويتي', 'Real-time performance metrics of PURE VEIL store in KWD')}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl shadow-gold-glow hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('إضافة عطر جديد', 'Add New Fragrance')}</span>
          </Link>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel-gold rounded-2xl p-6 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">{card.title}</span>
                <div className={`p-2.5 rounded-xl border ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="font-serif text-3xl font-bold text-on-surface">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-bold text-on-surface">
              {t('أحدث الطلبات', 'Recent Orders')}
            </h2>
          </div>
          <Link to="/admin/orders" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
            <span>{t('عرض الكل', 'View All')}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-sans">
            <thead>
              <tr className="border-b border-outline-variant/20 text-muted uppercase text-[10px]">
                <th className="py-3 px-4">{t('رقم الطلب', 'Order ID')}</th>
                <th className="py-3 px-4">{t('العميل', 'Customer')}</th>
                <th className="py-3 px-4">{t('المبلغ الإجمالي (KWD)', 'Total (KWD)')}</th>
                <th className="py-3 px-4">{t('وسيلة الدفع', 'Payment')}</th>
                <th className="py-3 px-4">{t('الحالة', 'Status')}</th>
                <th className="py-3 px-4">{t('التاريخ', 'Date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {stats?.recentOrders?.map((order: Order) => (
                <tr key={order.id} className="hover:bg-secondary-bg/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">#{order.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-on-surface">{order.customer_name}</td>
                  <td className="py-3.5 px-4 font-mono text-on-surface font-bold">{Number(order.total).toFixed(3)} KWD</td>
                  <td className="py-3.5 px-4 text-on-surface-variant">{order.payment_method || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                          order.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-500/20 text-gray-400'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted text-[11px]">
                    {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
