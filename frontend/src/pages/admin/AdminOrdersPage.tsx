import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, Filter, Calendar, DollarSign, ArrowUpDown, RefreshCw, Eye,
  Package, Clock, Truck, CheckCircle2, XCircle, CreditCard, RotateCcw
} from 'lucide-react';
import { Order } from '../../types';
import { fetchOrdersApi, updateOrderStatusApi, updatePaymentStatusApi, PaginationMeta } from '../../services/apiService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { Pagination } from '../../components/Pagination';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';

export const AdminOrdersPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load Orders with Filters
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOrdersApi({
        page: currentPage,
        limit: pageSize,
        search,
        status,
        paymentStatus,
        datePreset,
        startDate: datePreset === 'custom' ? startDate : '',
        endDate: datePreset === 'custom' ? endDate : '',
        minPrice,
        maxPrice,
        sortBy,
      });

      setOrders(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      showError(t('فشل تحميل الطلبات', 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, status, paymentStatus, datePreset, startDate, endDate, minPrice, maxPrice, sortBy, showError, t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPaymentStatus('');
    setDatePreset('');
    setStartDate('');
    setEndDate('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Status Change Handlers
  const handleStatusChange = async (id: number | string, newStatus: string) => {
    try {
      const updated = await updateOrderStatusApi(id, newStatus);
      showSuccess(t('تم تحديث حالة الطلب بنجاح', 'Order status updated successfully'));
      loadOrders();

      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as Order['status'] } : null));
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      showError(t('فشل تحديث حالة الطلب', 'Failed to update order status'));
    }
  };

  const handlePaymentStatusChange = async (id: number | string, newPaymentStatus: string) => {
    try {
      await updatePaymentStatusApi(id, newPaymentStatus);
      showSuccess(t('تم تحديث حالة الدفع بنجاح', 'Payment status updated successfully'));
      loadOrders();

      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: newPaymentStatus as any } : null));
      }
    } catch (err) {
      console.error('Failed to update payment status:', err);
      showError(t('فشل تحديث حالة الدفع', 'Failed to update payment status'));
    }
  };

  // Status Badge Colors & Labels
  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case 'pending':
        return { bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300', label: t('قيد الانتظار', 'Pending'), icon: Clock };
      case 'processing':
        return { bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300', label: t('قيد التجهيز', 'Processing'), icon: RefreshCw };
      case 'shipped':
        return { bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300', label: t('تم الشحن', 'Shipped'), icon: Truck };
      case 'delivered':
        return { bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', label: t('تم التسليم', 'Delivered'), icon: CheckCircle2 };
      case 'cancelled':
        return { bg: 'bg-red-500/15 border-red-500/30 text-red-300', label: t('ملغى', 'Cancelled'), icon: XCircle };
      default:
        return { bg: 'bg-secondary-bg border-outline-variant/30 text-on-surface-variant', label: orderStatus, icon: Package };
    }
  };

  const getPaymentBadge = (payStatus?: string) => {
    const s = payStatus || 'paid';
    switch (s) {
      case 'paid':
        return { bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', label: t('مدفوع', 'Paid') };
      case 'unpaid':
        return { bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300', label: t('غير مدفوع', 'Unpaid') };
      case 'refunded':
        return { bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300', label: t('مسترجع', 'Refunded') };
      default:
        return { bg: 'bg-secondary-bg border-outline-variant/30 text-on-surface-variant', label: s };
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">
            {t('إدارة طلبات المبيعات', 'Orders Management')}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {t('إدارة وتتبع طلبيات العملاء، الفلترة المتقدمة، وتحديث حالات التوصيل والدفع بالدينار الكويتي', 'Track customer orders, advance filter, update fulfillment & payment statuses in KWD')}
          </p>
        </div>
      </div>

      {/* Advanced Filtering & Controls Container */}
      <div className="glass-panel-gold rounded-3xl p-5 md:p-6 space-y-4">
        {/* Row 1: Global Search & Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Global Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-muted absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder={t('بحث برقم الطلب، اسم العميل، الإيميل، الهاتف...', 'Search Order #, Name, Email, Phone...')}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-10 text-xs text-on-surface placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Order Status */}
          <div>
            <select
              value={status}
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="">{t('جميع حالات الطلب', 'All Order Statuses')}</option>
              <option value="pending">{t('تم تقديم الطلب', 'Order Placed')}</option>
              <option value="processing">{t('قيد التجهيز', 'Processing')}</option>
              <option value="shipped">{t('تم الشحن', 'Shipped')}</option>
              <option value="delivered">{t('تم التسليم', 'Delivered')}</option>
              <option value="cancelled">{t('ملغى', 'Cancelled')}</option>
              <option value="refunded">{t('مسترجع', 'Refunded')}</option>
              <option value="returned">{t('مُعَاد', 'Returned')}</option>


            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => handleFilterChange(setPaymentStatus, e.target.value)}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="">{t('جميع حالات الدفع', 'All Payment Statuses')}</option>
              <option value="paid">{t('مدفوع', 'Paid')}</option>
              <option value="unpaid">{t('غير مدفوع', 'Unpaid')}</option>
              <option value="refunded">{t('مسترجع', 'Refunded')}</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Presets, Price Range & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-outline-variant/10">
          {/* Date Presets */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-muted absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto pointer-events-none" />
            <select
              value={datePreset}
              onChange={(e) => handleFilterChange(setDatePreset, e.target.value)}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-9 text-xs text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="">{t('كل التواريخ', 'All Dates')}</option>
              <option value="today">{t('اليوم', 'Today')}</option>
              <option value="yesterday">{t('أمس', 'Yesterday')}</option>
              <option value="last7days">{t('آخر 7 أيام', 'Last 7 Days')}</option>
              <option value="last30days">{t('آخر 30 يوم', 'Last 30 Days')}</option>
              <option value="thisMonth">{t('هذا الشهر', 'This Month')}</option>
              <option value="lastMonth">{t('الشهر الماضي', 'Last Month')}</option>
              <option value="custom">{t('نطاق تاريخ مخصص', 'Custom Date Range')}</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-muted absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-9 text-xs text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="newest">{t('الأحدث أولاً', 'Newest First')}</option>
              <option value="oldest">{t('الأقدم أولاً', 'Oldest First')}</option>
              <option value="highestTotal">{t('الأعلى سعراً', 'Highest Total')}</option>
              <option value="lowestTotal">{t('الأقل سعراً', 'Lowest Total')}</option>
              <option value="customerName">{t('اسم العميل', 'Customer Name')}</option>
              <option value="orderStatus">{t('حالة الطلب', 'Order Status')}</option>
            </select>
          </div>

          {/* Min Price */}
          <div className="relative">
            <DollarSign className="w-4 h-4 text-muted absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto pointer-events-none" />
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handleFilterChange(setMinPrice, e.target.value)}
              placeholder={t('الحد الأدنى (KWD)', 'Min KWD')}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-9 text-xs text-on-surface placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Max Price & Reset Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign className="w-4 h-4 text-muted absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto pointer-events-none" />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => handleFilterChange(setMaxPrice, e.target.value)}
                placeholder={t('الحد الأقصى (KWD)', 'Max KWD')}
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-9 text-xs text-on-surface placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>

            <button
              onClick={handleResetFilters}
              className="p-2.5 bg-secondary-bg hover:bg-primary/20 text-muted hover:text-primary rounded-xl border border-outline-variant/30 transition-colors shrink-0"
              title={t('إعادة ضبط الفلاتر', 'Reset Filters')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 3: Custom Date Picker Inputs (only when Custom is selected) */}
        {datePreset === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-outline-variant/10 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] text-muted mb-1">{t('من تاريخ:', 'From Date:')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2 px-3 text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1">{t('إلى تاريخ:', 'To Date:')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2 px-3 text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders List Container */}
      <div className="glass-panel-gold rounded-3xl p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span>{t('جاري تحميل الطلبات...', 'Loading orders...')}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="p-4 bg-secondary-bg/60 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-muted border border-outline-variant/20">
              <Package className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-on-surface">{t('لم يتم العثور على أي طلبات', 'No orders found')}</p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {t('حاول تغيير كلمات البحث أو إعادة ضبط الفلاتر المطبقة', 'Try altering your search query or reset applied filters')}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-outline-variant/15">
              <table className="w-full text-right text-xs font-sans">
                <thead className="bg-secondary-bg/80 text-muted uppercase text-[10px] border-b border-outline-variant/15">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">{t('العميل', 'Customer')}</th>
                    <th className="py-3.5 px-4">{t('الهاتف', 'Phone')}</th>
                    <th className="py-3.5 px-4 text-left">{t('الإجمالي (KWD)', 'Total (KWD)')}</th>
                    <th className="py-3.5 px-4 text-center">{t('وسيلة الدفع', 'Payment Method')}</th>
                    <th className="py-3.5 px-4 text-center">{t('حالة الدفع', 'Payment Status')}</th>
                    <th className="py-3.5 px-4 text-center">{t('حالة الطلب', 'Order Status')}</th>
                    <th className="py-3.5 px-4">{t('التاريخ', 'Date')}</th>
                    <th className="py-3.5 px-4 text-center">{t('الإجراءات', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 bg-background/30">
                  {orders.map((o) => {
                    const statusInfo = getStatusBadge(o.status);
                    const payInfo = getPaymentBadge(o.paymentStatus);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={o.id} className="hover:bg-secondary-bg/40 transition-colors">
                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">#{o.id}</td>

                        {/* Customer Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-on-surface">{o.customerName || (o as any).customer_name}</div>
                          {(o.customerEmail || (o as any).customer_email) && (
                            <div className="text-[10px] text-muted">{o.customerEmail || (o as any).customer_email}</div>
                          )}
                        </td>

                        {/* Customer Phone */}
                        <td className="py-3.5 px-4 font-mono text-on-surface-variant">
                          {o.customerPhone || (o as any).customer_phone || '—'}
                        </td>

                        {/* Total KWD */}
                        <td className="py-3.5 px-4 font-mono font-bold text-left text-on-surface">
                          {Number(o.total).toFixed(3)} KWD
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="uppercase text-[10px] font-semibold text-muted bg-secondary-bg px-2 py-0.5 rounded-lg border border-outline-variant/15">
                            {o.paymentMethod || (o as any).payment_method || 'KNET'}
                          </span>
                        </td>

                        {/* Payment Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-bold border ${payInfo.bg}`}>
                            {payInfo.label}
                          </span>
                        </td>

                        {/* Order Status Select Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              className={`rounded-xl px-2.5 py-1 text-xs font-bold border focus:outline-none ${statusInfo.bg}`}
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
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-muted text-[11px]">
                          {new Date(o.createdAt || (o as any).created_at).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-US')}
                        </td>

                        {/* View Details Button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-2 text-primary hover:bg-primary/20 rounded-xl transition-colors border border-primary/30"
                            title={t('معاينة التفاصيل', 'View Details')}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="md:hidden space-y-3">
              {orders.map((o) => {
                const statusInfo = getStatusBadge(o.status);
                const payInfo = getPaymentBadge(o.paymentStatus);

                return (
                  <div key={o.id} className="p-4 bg-background/50 border border-outline-variant/20 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-primary text-sm">#{o.id}</span>
                        <h4 className="font-bold text-on-surface text-xs mt-0.5">{o.customerName || (o as any).customer_name}</h4>
                        <div className="text-[10px] text-muted font-mono">{o.customerPhone || (o as any).customer_phone}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-sm font-bold gold-gradient-text font-mono">
                          {Number(o.total).toFixed(3)} KWD
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold border mt-1 ${payInfo.bg}`}>
                          {payInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-xs">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold border ${statusInfo.bg}`}
                      >
                        <option value="pending">{t('تم تقديم الطلب', 'Order Placed')}</option>
                        <option value="processing">{t('قيد التجهيز', 'Processing')}</option>
                        <option value="shipped">{t('تم الشحن', 'Shipped')}</option>
                        <option value="delivered">{t('تم التسليم', 'Delivered')}</option>
                        <option value="cancelled">{t('ملغى', 'Cancelled')}</option>
                        <option value="refunded">{t('مسترجع', 'Refunded')}</option>
                        <option value="returned">{t('مُعَاد', 'Returned')}</option>
                      </select>


                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs flex items-center gap-1.5 hover:bg-primary/20"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('التفاصيل', 'Details')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reusable Global Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalRecords={pagination.totalRecords}
              pageSize={pagination.pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => setPageSize(size)}
            />
          </>
        )}
      </div>

      {/* Order Details Inspection Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleStatusChange}
          onUpdatePaymentStatus={handlePaymentStatusChange}
          isAdminView={true}
        />
      )}
    </div>
  );
};

