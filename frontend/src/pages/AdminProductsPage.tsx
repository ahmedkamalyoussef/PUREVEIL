import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Globe, Sparkles, Layers, Package, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { Product, Category, VolumeOption } from '../types';
import { fetchPaginatedProducts, createProduct, updateProduct, deleteProduct, fetchCollections, PaginationMeta } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmModalContext';
import { ImageUploader } from '../components/ImageUploader';
import { SafeImage } from '../components/SafeImage';
import { Pagination } from '../components/Pagination';

export const AdminProductsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'bilingual' | 'variants' | 'notes'>('basic');

  const [form, setForm] = useState<{
    sku: string;
    name: string;
    nameEn: string;
    categoryId: number | string;
    stock: number;
    status: 'active' | 'out_of_stock' | 'draft';
    image: string;
    concentration: string;
    sillage: string;
    longevity: string;
    season: string;
    gender: string;
    featured: boolean;
    isNew: boolean;
    shortDescription: string;
    shortDescriptionEn: string;
    description: string;
    descriptionEn: string;
    usageInstructions: string;
    usageInstructionsEn: string;
    highlights: string;
    highlightsEn: string;
    tags: string;
    tagsEn: string;
    topNotes: string;
    topNotesEn: string;
    heartNotes: string;
    heartNotesEn: string;
    baseNotes: string;
    baseNotesEn: string;
    volumeOptions: VolumeOption[];
  }>({
    sku: '', name: '', nameEn: '', categoryId: '', stock: 15, status: 'active',
    image: '', concentration: 'Extrait de Parfum', sillage: 'فواح جداً', longevity: '18+ ساعة',
    season: 'جميع الفصول', gender: 'للجنسين', featured: true, isNew: true,
    shortDescription: '', shortDescriptionEn: '', description: '', descriptionEn: '',
    usageInstructions: 'يرش على نقاط النبض من مسافة 15 سم.', usageInstructionsEn: 'Apply to pulse points from 15cm distance.',
    highlights: 'ثبات ممتاز, تصميم كويتي فاخر', highlightsEn: 'Long lasting, Kuwaiti Luxury',
    tags: 'عود, عطور شرقية, بيور فيل', tagsEn: 'oud, oriental, pure veil',
    topNotes: 'البرغموت, الهيل', topNotesEn: 'Bergamot, Cardamom',
    heartNotes: 'الورد الجوري, الياسمين', heartNotesEn: 'Damask Rose, Jasmine',
    baseNotes: 'العود الهندي, العنبر, المسك', baseNotesEn: 'Indian Oud, Amber, Musk',
    volumeOptions: [
      { size: '50ml', price: 32.000, stock: 10, sku: 'PV-50' },
      { size: '100ml', price: 45.000, stock: 10, sku: 'PV-100' }
    ]
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodsRes, collections] = await Promise.all([
        fetchPaginatedProducts({
          page: currentPage,
          limit: pageSize,
          search: search || undefined,
          category: selectedCategory || undefined,
        }),
        fetchCollections()
      ]);
      setProducts(prodsRes.data);
      if (prodsRes.pagination) setPagination(prodsRes.pagination);
      setCategories(collections.categories || []);
    } catch (err) {
      console.error(err);
      showError(t('فشل تحميل قائمة المنتجات', 'Failed to load products catalog'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, selectedCategory, showError, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setActiveTab('basic');
    setForm({
      sku: `PV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '', nameEn: '', categoryId: categories[0]?.id || 1,
      stock: 15, status: 'active', image: '',
      concentration: 'Extrait de Parfum', sillage: 'فواح جداً', longevity: '18+ ساعة',
      season: 'جميع الفصول', gender: 'للجنسين', featured: true, isNew: true,
      shortDescription: '', shortDescriptionEn: '', description: '', descriptionEn: '',
      usageInstructions: 'يرش على نقاط النبض من مسافة 15 سم.', usageInstructionsEn: 'Apply to pulse points from 15cm distance.',
      highlights: 'ثبات ممتاز, تصميم كويتي فاخر', highlightsEn: 'Long lasting, Kuwaiti Luxury',
      tags: 'عود, عطور شرقية, بيور فيل', tagsEn: 'oud, oriental, pure veil',
      topNotes: 'البرغموت, الهيل', topNotesEn: 'Bergamot, Cardamom',
      heartNotes: 'الورد الجوري, الياسمين', heartNotesEn: 'Damask Rose, Jasmine',
      baseNotes: 'العود الهندي, العنبر, المسك', baseNotesEn: 'Indian Oud, Amber, Musk',
      volumeOptions: [
        { size: '50ml', price: 32.000, stock: 10, sku: `PV-${Math.floor(1000 + Math.random() * 9000)}-50` },
        { size: '100ml', price: 45.000, stock: 10, sku: `PV-${Math.floor(1000 + Math.random() * 9000)}-100` }
      ]
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setActiveTab('basic');
    setForm({
      sku: p.sku || '',
      name: p.name || '',
      nameEn: p.nameEn || '',
      categoryId: p.categoryId || categories[0]?.id || 1,
      stock: p.stock || 0,
      status: p.status || 'active',
      image: p.image || '',
      concentration: p.concentration || '',
      sillage: p.specs?.sillage || '',
      longevity: p.specs?.longevity || '',
      season: p.specs?.season || '',
      gender: p.specs?.gender || '',
      featured: Boolean(p.featured),
      isNew: Boolean(p.isNew),
      shortDescription: p.shortDescription || '',
      shortDescriptionEn: p.shortDescriptionEn || '',
      description: p.description || '',
      descriptionEn: p.descriptionEn || '',
      usageInstructions: p.usageInstructions || '',
      usageInstructionsEn: p.usageInstructionsEn || '',
      highlights: (p.highlights || []).join(', '),
      highlightsEn: (p.highlightsEn || []).join(', '),
      tags: (p.tags || []).join(', '),
      tagsEn: (p.tagsEn || []).join(', '),
      topNotes: (p.notes?.top || []).join(', '),
      topNotesEn: (p.notes?.topEn || []).join(', '),
      heartNotes: (p.notes?.heart || []).join(', '),
      heartNotesEn: (p.notes?.heartEn || []).join(', '),
      baseNotes: (p.notes?.base || []).join(', '),
      baseNotesEn: (p.notes?.baseEn || []).join(', '),
      volumeOptions: p.volumeOptions && p.volumeOptions.length > 0 ? p.volumeOptions : [
        { size: '50ml', price: p.price || 32.000, stock: 10, sku: `${p.sku}-50` },
        { size: '100ml', price: (p.price || 32.000) * 1.4, stock: 10, sku: `${p.sku}-100` }
      ]
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    const isConfirmed = await confirm({
      title: t('حذف العطر نهائياً', 'Delete Fragrance Product'),
      message: t('هل أنت تأكد من حذف هذا العطر؟ سيتم حذف جميع أحجامه وصوره بشكل تلقائي.', 'Are you sure you want to delete this fragrance? All size variants and image files will be deleted.'),
      confirmText: t('نعم، احذف', 'Yes, Delete'),
      cancelText: t('تراجع', 'Cancel'),
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await deleteProduct(id);
      showSuccess(t('تم حذف العطر وتنظيف الملفات المرتبطة بنجاح', 'Product deleted and files cleaned up successfully'));
      loadData();
    } catch (err: any) {
      showError(t('فشل حذف العطر', 'Failed to delete product'));
    }
  };

  // Size Variant Controls
  const handleAddVariant = () => {
    setForm(prev => ({
      ...prev,
      volumeOptions: [
        ...prev.volumeOptions,
        { size: '75ml', price: 35.000, stock: 10, sku: `${prev.sku}-${prev.volumeOptions.length + 1}` }
      ]
    }));
  };

  const handleUpdateVariant = (index: number, key: keyof VolumeOption, value: any) => {
    const updated = [...form.volumeOptions];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, volumeOptions: updated });
  };

  const handleRemoveVariant = (index: number) => {
    setForm({
      ...form,
      volumeOptions: form.volumeOptions.filter((_, i) => i !== index)
    });
  };

  const handleMoveVariant = (index: number, direction: 'up' | 'down') => {
    const updated = [...form.volumeOptions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setForm({ ...form, volumeOptions: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.nameEn) {
      showError(t('الرجاء إدخال اسم العطر بالعربية والإنجليزية', 'Please enter Arabic & English product names'));
      return;
    }

    if (form.volumeOptions.length === 0) {
      showError(t('يجب إضافة حجم واحد على الأقل للعطر مع السعر (مثال: 50ml -> 32 KWD)', 'At least one size variant with price must be added'));
      return;
    }

    const payload = {
      sku: form.sku,
      name: form.name,
      nameEn: form.nameEn,
      categoryId: Number(form.categoryId),
      stock: Number(form.stock),
      status: form.status,
      image: form.image,
      concentration: form.concentration,
      specs: {
        sillage: form.sillage,
        longevity: form.longevity,
        season: form.season,
        gender: form.gender,
      },
      featured: form.featured,
      isNew: form.isNew,
      volumeOptions: form.volumeOptions,
      notes: {
        top: form.topNotes.split(',').map(s => s.trim()).filter(Boolean),
        topEn: form.topNotesEn.split(',').map(s => s.trim()).filter(Boolean),
        heart: form.heartNotes.split(',').map(s => s.trim()).filter(Boolean),
        heartEn: form.heartNotesEn.split(',').map(s => s.trim()).filter(Boolean),
        base: form.baseNotes.split(',').map(s => s.trim()).filter(Boolean),
        baseEn: form.baseNotesEn.split(',').map(s => s.trim()).filter(Boolean),
      },
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showSuccess(t('تم تحديث العطر والأحجام بنجاح', 'Product updated successfully'));
      } else {
        await createProduct(payload);
        showSuccess(t('تمت إضافة العطر الجديد للكتالوج بنجاح', 'Product created successfully'));
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(t('فشل حفظ بيانات العطر', 'Failed to save product details'));
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">
            {t('إدارة كتالوج العطور والأحجام', 'Perfume Catalog & Size Management')}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {t('إضافة وتعديل العطور بالأحجام المتعددة، رفع الصور عبر Multer، والصفحات المتعددة', 'Multi-size pricing, Multer uploads, & server-side pagination')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-xl text-xs tracking-wider shadow-gold-glow flex items-center justify-center gap-2 hover:brightness-110 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة عطر جديد', 'Add New Fragrance')}</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder={t('البحث عن طريق الاسم أو الـ SKU...', 'Search by name or SKU...')}
              className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-10 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={selectedCategory}
            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="">{t('جميع التصنيفات', 'All Categories')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{t(c.name, c.nameEn || c.name)}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-muted font-mono shrink-0">
          Total Products: <span className="font-bold text-primary">{pagination.totalRecords}</span>
        </div>
      </div>

      {/* Products Table Container */}
      <div className="glass-panel-gold rounded-3xl p-6 overflow-hidden space-y-4">
        {loading ? (
          <div className="py-16 text-center text-xs text-muted flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span>{t('جاري تحميل العطور...', 'Loading fragrances...')}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted">{t('لا توجد عطور مطابقة للكتالوج', 'No fragrance products found')}</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-outline-variant/15">
              <table className="w-full text-right text-xs font-sans">
                <thead className="bg-secondary-bg/80 text-muted uppercase text-[10px] border-b border-outline-variant/15">
                  <tr>
                    <th className="py-3.5 px-4">{t('العطر', 'Fragrance')}</th>
                    <th className="py-3.5 px-4">SKU</th>
                    <th className="py-3.5 px-4">{t('التصنيف', 'Category')}</th>
                    <th className="py-3.5 px-4">{t('الأحجام والأسعار (KWD)', 'Available Sizes & Prices')}</th>
                    <th className="py-3.5 px-4">{t('الحالة', 'Status')}</th>
                    <th className="py-3.5 px-4 text-center">{t('الإجراءات', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 bg-background/30">
                  {products.map(p => {
                    const sizesText = p.volumeOptions && p.volumeOptions.length > 0
                      ? p.volumeOptions.map(v => `${v.size}: ${v.price.toFixed(3)} KWD`).join(' | ')
                      : `${p.price.toFixed(3)} KWD`;

                    return (
                      <tr key={p.id} className="hover:bg-secondary-bg/40 transition-colors">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <SafeImage
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl border border-outline-variant/20 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-on-surface">{p.name}</div>
                            <div className="text-[10px] text-muted">{p.nameEn}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted">{p.sku}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant font-medium">{p.category || '—'}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold gold-gradient-text text-xs">
                          {sizesText}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              p.status === 'out_of_stock' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                              title={t('تعديل', 'Edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title={t('حذف', 'Delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="md:hidden space-y-3">
              {products.map((p) => {
                const sizesText = p.volumeOptions && p.volumeOptions.length > 0
                  ? p.volumeOptions.map(v => `${v.size}: ${v.price} KWD`).join(' | ')
                  : `${p.price} KWD`;

                return (
                  <div key={p.id} className="p-4 bg-secondary-bg/40 border border-outline-variant/20 rounded-2xl space-y-3">
                    <div className="flex items-center gap-3">
                      <SafeImage src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-xl shrink-0 border border-outline-variant/20" />
                      <div className="flex-1 truncate">
                        <div className="font-bold text-on-surface text-sm truncate">{p.name}</div>
                        <div className="text-xs text-muted truncate">{p.nameEn}</div>
                        <span className="text-[10px] font-mono text-primary font-bold">{p.category}</span>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-primary bg-secondary-bg/60 p-2 rounded-xl border border-outline-variant/15">
                      {sizesText}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-xs">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'active' ? 'bg-success/20 text-success-text border border-success/30' :
                        p.status === 'out_of_stock' ? 'bg-warning/20 text-warning-text border border-warning/30' :
                        'bg-secondary-bg text-muted border border-outline-variant/30'
                      }`}>
                        {p.status}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-primary hover:text-on-primary transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{t('تعديل', 'Edit')}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-error hover:bg-error/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Server-Side Pagination */}
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

      {/* Add/Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-gold rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-6 relative border border-primary/30 shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-on-surface">
                  {editingProduct ? t('تعديل بيانات العطر والصورة', 'Edit Fragrance & Media') : t('إضافة عطر جديد للكتالوج', 'Add New Fragrance Product')}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-muted hover:text-on-surface rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-outline-variant/15 gap-2 text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === 'basic' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                  }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('البيانات والصور (Multer)', 'Basic & Media')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bilingual')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === 'bilingual' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                  }`}
              >
                <Globe className="w-4 h-4" />
                <span>{t('النصوص الثنائية', 'Bilingual Content')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === 'variants' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                  }`}
              >
                <Package className="w-4 h-4" />
                <span>{t('الأحجام والأسعار (KWD)', 'Size Variants & Pricing')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === 'notes' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                  }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('النوتات العطرية', 'Olfactory Notes')}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Tab 1: Basic Info & Image Upload */}
              {activeTab === 'basic' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-muted mb-1">SKU *</label>
                      <input
                        type="text"
                        required
                        value={form.sku}
                        onChange={e => setForm({ ...form, sku: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('التصنيف *', 'Category *')}</label>
                      <select
                        value={form.categoryId}
                        onChange={e => setForm({ ...form, categoryId: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{t(c.name, c.nameEn || c.name)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('الحالة *', 'Status *')}</label>
                      <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value as any })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary font-bold"
                      >
                        <option value="active">Active</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Upload with Multer */}
                  <ImageUploader
                    currentImage={form.image}
                    folder="products"
                    onImageUploaded={(url) => setForm({ ...form, image: url })}
                    label={t('صورة العطر الرئيسية (تخزن في /uploads/products)', 'Main Fragrance Cover Image')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div>
                      <label className="block text-muted mb-1">{t('تركيز العطر', 'Concentration')}</label>
                      <input
                        type="text"
                        value={form.concentration}
                        onChange={e => setForm({ ...form, concentration: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">{t('درجة الفوحان', 'Sillage')}</label>
                      <input
                        type="text"
                        value={form.sillage}
                        onChange={e => setForm({ ...form, sillage: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">{t('الثبات', 'Longevity')}</label>
                      <input
                        type="text"
                        value={form.longevity}
                        onChange={e => setForm({ ...form, longevity: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">{t('الجنس', 'Gender')}</label>
                      <input
                        type="text"
                        value={form.gender}
                        onChange={e => setForm({ ...form, gender: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={e => setForm({ ...form, featured: e.target.checked })}
                        className="rounded border-outline-variant/30 text-primary focus:ring-primary"
                      />
                      <span className="text-on-surface font-semibold">{t('عرض في الأقسام المميزة', 'Featured Fragrance')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isNew}
                        onChange={e => setForm({ ...form, isNew: e.target.checked })}
                        className="rounded border-outline-variant/30 text-primary focus:ring-primary"
                      />
                      <span className="text-on-surface font-semibold">{t('إصدار جديد', 'New Arrival')}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Bilingual Content */}
              {activeTab === 'bilingual' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('اسم العطر (بالعربية) *', 'Arabic Fragrance Name *')}</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('اسم العطر (بالإنجليزية) *', 'English Fragrance Name *')}</label>
                      <input
                        type="text"
                        required
                        value={form.nameEn}
                        onChange={e => setForm({ ...form, nameEn: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('الوصف المقتضب (بالعربية)', 'Arabic Short Description')}</label>
                      <textarea
                        rows={2}
                        value={form.shortDescription}
                        onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('الوصف المقتضب (بالإنجليزية)', 'English Short Description')}</label>
                      <textarea
                        rows={2}
                        value={form.shortDescriptionEn}
                        onChange={e => setForm({ ...form, shortDescriptionEn: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('الوصف التفصيلي (بالعربية)', 'Arabic Full Description')}</label>
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('الوصف التفصيلي (بالإنجليزية)', 'English Full Description')}</label>
                      <textarea
                        rows={4}
                        value={form.descriptionEn}
                        onChange={e => setForm({ ...form, descriptionEn: e.target.value })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Size Variants & Pricing (Sole Source of Truth for Prices) */}
              {activeTab === 'variants' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-on-surface">
                        {t('إدارة أحجام العطر وأسعارها بالدينار الكويتي', 'Fragrance Size Variants & KWD Pricing')}
                      </h4>
                      <p className="text-[11px] text-muted">
                        {t('كل حجم يحتوي على سعره الخاص بالدينار الكويتي والكمية في المخزن', 'Each size variant contains its own price in KWD and inventory count')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3.5 py-2 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl flex items-center gap-1.5 hover:bg-primary hover:text-on-primary transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('إضافة حجم جديد', 'Add Size Variant')}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.volumeOptions.map((vol, idx) => (
                      <div key={idx} className="p-3.5 bg-secondary-bg/60 border border-outline-variant/20 rounded-2xl flex flex-col md:flex-row items-center gap-3">
                        <div className="w-full md:w-32">
                          <label className="block text-[10px] text-muted mb-1">{t('الحجم (Size)', 'Size (e.g. 50ml)')}</label>
                          <input
                            type="text"
                            required
                            value={vol.size}
                            onChange={e => handleUpdateVariant(idx, 'size', e.target.value)}
                            placeholder="e.g. 50ml"
                            className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-1.5 text-on-surface focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="w-full md:w-36">
                          <label className="block text-[10px] text-muted mb-1">{t('السعر (KWD) *', 'Price (KWD) *')}</label>
                          <input
                            type="number"
                            step="0.001"
                            required
                            value={vol.price}
                            onChange={e => handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-1.5 text-on-surface font-mono font-bold focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="w-full md:w-28">
                          <label className="block text-[10px] text-muted mb-1">{t('المخزون', 'Stock')}</label>
                          <input
                            type="number"
                            value={vol.stock || 10}
                            onChange={e => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                            className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-1.5 text-on-surface font-mono focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="w-full md:flex-1">
                          <label className="block text-[10px] text-muted mb-1">SKU</label>
                          <input
                            type="text"
                            value={vol.sku || ''}
                            onChange={e => handleUpdateVariant(idx, 'sku', e.target.value)}
                            placeholder={`${form.sku}-${vol.size}`}
                            className="w-full bg-background border border-outline-variant/30 rounded-xl px-3 py-1.5 text-on-surface font-mono text-[11px] focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-1 pt-4 md:pt-0">
                          <button
                            type="button"
                            onClick={() => handleMoveVariant(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 text-muted hover:text-on-surface disabled:opacity-20"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveVariant(idx, 'down')}
                            disabled={idx === form.volumeOptions.length - 1}
                            className="p-1.5 text-muted hover:text-on-surface disabled:opacity-20"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            disabled={form.volumeOptions.length <= 1}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Olfactory Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('قمة العطر (Top Notes Arabic)', 'Top Notes Arabic')}</label>
                      <input
                        type="text"
                        value={form.topNotes}
                        onChange={e => setForm({ ...form, topNotes: e.target.value })}
                        placeholder="البرغموت, الهيل"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('قمة العطر (Top Notes English)', 'Top Notes English')}</label>
                      <input
                        type="text"
                        value={form.topNotesEn}
                        onChange={e => setForm({ ...form, topNotesEn: e.target.value })}
                        placeholder="Bergamot, Cardamom"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('قلب العطر (Heart Notes Arabic)', 'Heart Notes Arabic')}</label>
                      <input
                        type="text"
                        value={form.heartNotes}
                        onChange={e => setForm({ ...form, heartNotes: e.target.value })}
                        placeholder="الورد الجوري, الياسمين"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('قلب العطر (Heart Notes English)', 'Heart Notes English')}</label>
                      <input
                        type="text"
                        value={form.heartNotesEn}
                        onChange={e => setForm({ ...form, heartNotesEn: e.target.value })}
                        placeholder="Damask Rose, Jasmine"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('قاعدة العطر (Base Notes Arabic)', 'Base Notes Arabic')}</label>
                      <input
                        type="text"
                        value={form.baseNotes}
                        onChange={e => setForm({ ...form, baseNotes: e.target.value })}
                        placeholder="العود الهندي, العنبر, المسك"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('قاعدة العطر (Base Notes English)', 'Base Notes English')}</label>
                      <input
                        type="text"
                        value={form.baseNotesEn}
                        onChange={e => setForm({ ...form, baseNotesEn: e.target.value })}
                        placeholder="Indian Oud, Amber, Musk"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-outline-variant/30 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  {t('إلغاء', 'Cancel')}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs shadow-gold-glow hover:brightness-110 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? t('حفظ التغييرات', 'Save Changes') : t('إضافة العطر للكتالوج', 'Add Product')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
