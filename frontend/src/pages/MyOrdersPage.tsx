import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Search, Calendar, ArrowUpDown, RotateCcw, Eye, Clock,
  ShoppingBag, Truck, CheckCircle2, ChevronRight, Sparkles, Filter
} from 'lucide-react';
import { Order } from '../types';
import { fetchOrdersApi, PaginationMeta } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { Pagination } from '../components/Pagination';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { SafeImage } from '../components/SafeImage';
import { getStatusConfig } from '../utils/orderStatusConfig';

export const MyOrdersPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { showError } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    pageSize: 6,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOrdersApi({
        page: currentPage,
        limit: pageSize,
        search,
        status,
        datePreset,
        startDate: datePreset === 'custom' ? startDate : '',
        endDate: datePreset === 'custom' ? endDate : '',
        sortBy,
      });

      setOrders(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
      showError(t('فشل في تحميل طلباتك', 'Failed to load your orders'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, status, datePreset, startDate, endDate, sortBy, showError, t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setDatePreset('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    setCurrentPage(1);
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
    <div className="max-w-6xl mx-auto px-4 md:px-gutter pt-28 sm:pt-32 pb-20 space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="border-b border-outline-variant/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
            <Link to="/account" className="hover:underline text-muted">
              {t('إعدادات الحساب', 'Account Settings')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-muted" />
            <span>{t('طلباتي', 'My Orders')}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface flex items-center gap-3">
            <span>{t('سجل الطلبات وتتبع التوصيل', 'My Orders')}</span>
            <span className="text-xs font-sans font-mono bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              {pagination.totalRecords} {t('طلب', 'Orders')}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {t('تابع وتتبع حالة كافة طلباتك من عطور دار بيور فيل بسهولة ودقة', 'Track the status and progress of all your PURE VEIL order purchases')}
          </p>
        </div>

        <Link
          to="/catalog"
          className="px-5 py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:brightness-110 transition-all flex items-center gap-2 w-fit shadow-gold-glow"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('تسوق الآن', 'Shop Fragrances')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel-gold rounded-3xl p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Order Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-muted absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              placeholder={t('البحث برقم الطلب أو اسم المنتج...', 'Search by Order # or product name...')}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-10 text-xs text-on-surface placeholder:text-muted focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface focus:border-primary focus:outline-none transition-colors"
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


          {/* Date Filter & Sort */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="w-4 h-4 text-muted absolute top-3.5 right-3.5 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto pointer-events-none" />
              <select
                value={datePreset}
                onChange={(e) => handleFilterChange(setDatePreset, e.target.value)}
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl py-2.5 px-9 text-xs text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">{t('كل التواريخ', 'All Dates')}</option>
                <option value="last7days">{t('آخر 7 أيام', 'Last 7 Days')}</option>
                <option value="last30days">{t('آخر 30 يوم', 'Last 30 Days')}</option>
                <option value="thisMonth">{t('هذا الشهر', 'This Month')}</option>
                <option value="custom">{t('نطاق مخصص', 'Custom Range')}</option>
              </select>
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

        {/* Sorting option row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/10 text-xs">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
            <span className="text-muted">{t('ترتيب حسب:', 'Sort By:')}</span>
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className="bg-transparent text-primary font-bold focus:outline-none"
            >
              <option value="newest" className="bg-background text-on-surface">{t('الأحدث أولاً', 'Newest First')}</option>
              <option value="oldest" className="bg-background text-on-surface">{t('الأقدم أولاً', 'Oldest First')}</option>
              <option value="highestTotal" className="bg-background text-on-surface">{t('الأعلى قيمة', 'Highest Total')}</option>
              <option value="lowestTotal" className="bg-background text-on-surface">{t('الأقل قيمة', 'Lowest Total')}</option>
            </select>
          </div>
        </div>

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

      {/* Orders List / Cards Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-panel-gold rounded-3xl p-6 h-40 animate-pulse bg-secondary-bg/30" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="glass-panel-gold rounded-3xl p-10 sm:p-16 text-center space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 text-primary">
            <Package className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-serif text-2xl font-bold text-on-surface">
              {search || status || datePreset
                ? t('لا توجد نتائج تطابق خيارات البحث', 'No orders match your filter criteria')
                : t('لم تقم بإجراء أي طلبات حتى الآن', 'You Have Placed No Orders Yet')}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {search || status || datePreset
                ? t('جرب تغيير أو إعادة ضبط الفلاتر المطبقة للوصول للطلب المطلوب.', 'Try resetting your filter parameters to locate your orders.')
                : t('استكشف تشكيلاتنا الفاخرة من العطور والعود الزيتي وقم بإجراء طلبك الأول اليوم.', 'Discover our luxury fragrance collections and place your first order today.')}
            </p>
          </div>

          <div className="pt-2">
            {search || status || datePreset ? (
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-secondary-bg border border-outline-variant/30 text-on-surface font-bold text-xs rounded-xl hover:bg-primary/20 transition-colors"
              >
                {t('إعادة ضبط البحث', 'Reset Filters')}
              </button>
            ) : (
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:brightness-110 transition-all shadow-gold-glow"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('تصفح كتالوج العطور', 'Explore Fragrance Catalog')}</span>
              </Link>

            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const statusConfig = getStatusConfig(o.status);
            const payInfo = getPaymentBadge(o.paymentStatus);
            const StatusIcon = statusConfig.icon;

            const orderDate = new Date(o.createdAt || (o as any).created_at || Date.now()).toLocaleDateString(
              lang === 'ar' ? 'ar-KW' : 'en-US',
              { year: 'numeric', month: 'short', day: 'numeric' }
            );

            return (
              <div
                key={o.id}
                className="glass-panel-gold rounded-3xl p-5 sm:p-6 border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 space-y-4 group"
              >
                {/* Order Top Bar: Order ID, Date, Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/15 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary font-mono font-bold text-sm border border-primary/20">
                      #{o.id}
                    </div>
                    <div>
                      <div className="text-xs text-muted font-sans flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{orderDate}</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-semibold mt-0.5">
                        {o.itemCount || o.items?.length || 1} {t('منتج', 'Items')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Order Status Badge */}
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${statusConfig.color.badge}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? statusConfig.nameAr : statusConfig.nameEn}</span>
                    </span>

                    {/* Payment Badge */}
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${payInfo.bg}`}>
                      {payInfo.label}
                    </span>
                  </div>
                </div>

                {/* Main Card Content: Product Thumbs Preview + Delivery Estimate + Total */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  
                  {/* Item Image Thumbnails Preview */}
                  <div className="md:col-span-2 flex items-center gap-3 overflow-x-auto py-1">
                    {o.items && o.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 bg-secondary-bg/60 border border-outline-variant/20 rounded-2xl shrink-0">
                        <SafeImage
                          src={item.productImage || (item as any).product_image || ''}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl border border-outline-variant/20"
                        />
                        <div className="max-w-[120px] sm:max-w-[140px] truncate">
                          <span className="font-bold text-xs text-on-surface truncate block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-muted block font-mono">
                            {item.size || '100ml'} x {item.quantity}
                          </span>
                        </div>
                      </div>
                    ))}

                    {o.items && o.items.length > 3 && (
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        +{o.items.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Order Total & Tracking CTA */}
                  <div className="flex flex-col md:items-end justify-between gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/15">
                    <div>
                      <span className="text-[11px] text-muted block md:text-right">{t('الإجمالي الكلي:', 'Total Amount:')}</span>
                      <span className="font-serif text-xl sm:text-2xl font-bold gold-gradient-text font-mono">
                        {Number(o.total).toFixed(3)} KWD
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="w-full md:w-auto px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary border border-primary/30 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{t('تتبع الطلب بالتفصيل', 'Track Order Details')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Estimated Delivery Footer Note */}
                {o.estimatedDelivery && (
                  <div className="bg-secondary-bg/40 px-3.5 py-2 rounded-xl border border-outline-variant/15 flex items-center justify-between text-xs text-muted font-sans">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      <span>{t('موعد التوصيل المتوقع:', 'Estimated Delivery:')}</span>
                      <span className="font-semibold text-on-surface">
                        {lang === 'ar' ? o.estimatedDelivery.ar : o.estimatedDelivery.en}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination Component */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalRecords={pagination.totalRecords}
            pageSize={pagination.pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        </div>
      )}

      {/* Order Details Tracking Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          isAdminView={false}
        />
      )}
    </div>
  );
};

export default MyOrdersPage;
