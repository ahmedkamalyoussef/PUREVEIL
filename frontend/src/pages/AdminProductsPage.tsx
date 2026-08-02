import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Globe, Sparkles, Layers, FileText, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { Product, Category, VolumeOption } from '../types';
import { fetchProducts, createProduct, updateProduct, deleteProduct, fetchCollections } from '../services/apiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmModalContext';
import { ImageUploader } from '../components/ImageUploader';
import { SafeImage } from '../components/SafeImage';

export const AdminProductsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'bilingual' | 'variants' | 'notes' | 'seo'>('basic');

  const [form, setForm] = useState<{
    sku: string;
    name: string;
    nameEn: string;
    categoryId: number | string;
    price: number;
    oldPrice: number | string;
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
    seoTitle: string;
    seoTitleEn: string;
    seoDescription: string;
    seoDescriptionEn: string;
    topNotes: string;
    topNotesEn: string;
    heartNotes: string;
    heartNotesEn: string;
    baseNotes: string;
    baseNotesEn: string;
    volumeOptions: VolumeOption[];
  }>({
    sku: '', name: '', nameEn: '', categoryId: '', price: 0, oldPrice: '',
    stock: 10, status: 'active', image: '', concentration: 'Eau de Parfum',
    sillage: 'قوي (Heavy)', longevity: '12-16 ساعة', season: 'جميع الفصول', gender: 'للجنسين',
    featured: false, isNew: true,
    shortDescription: '', shortDescriptionEn: '', description: '', descriptionEn: '',
    usageInstructions: '', usageInstructionsEn: '', highlights: '', highlightsEn: '',
    tags: '', tagsEn: '', seoTitle: '', seoTitleEn: '', seoDescription: '', seoDescriptionEn: '',
    topNotes: '', topNotesEn: '', heartNotes: '', heartNotesEn: '', baseNotes: '', baseNotesEn: '',
    volumeOptions: []
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, collections] = await Promise.all([
        fetchProducts(),
        fetchCollections()
      ]);
      setProducts(prods);
      setCategories(collections.categories || []);
    } catch (err) {
      console.error(err);
      showError(t('فشل تحميل قائمة المنتجات', 'Failed to load products catalog'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setActiveTab('basic');
    setForm({
      sku: `PV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '', nameEn: '', categoryId: categories[0]?.id || 1,
      price: 45.000, oldPrice: '', stock: 15, status: 'active',
      image: '',
      concentration: 'Extrait de Parfum', sillage: 'فواح جداً', longevity: '18+ ساعة',
      season: 'جميع الفصول', gender: 'للجنسين', featured: true, isNew: true,
      shortDescription: '', shortDescriptionEn: '', description: '', descriptionEn: '',
      usageInstructions: 'يرش على نقاط النبض من مسافة 15 سم.', usageInstructionsEn: 'Apply to pulse points from 15cm distance.',
      highlights: 'ثبات ممتاز, تصميم كويتي فاخر', highlightsEn: 'Long lasting, Kuwaiti Luxury',
      tags: 'عود, عطور شرقية, بيور فيل', tagsEn: 'oud, oriental, pure veil',
      seoTitle: '', seoTitleEn: '', seoDescription: '', seoDescriptionEn: '',
      topNotes: 'البرغموت, الهيل', topNotesEn: 'Bergamot, Cardamom',
      heartNotes: 'الورد الجوري, الياسمين', heartNotesEn: 'Damask Rose, Jasmine',
      baseNotes: 'العود الهندي, العنبر, المسك', baseNotesEn: 'Indian Oud, Amber, Musk',
      volumeOptions: [
        { size: '50ml', price: 32.000, stock: 10, sku: 'PV-NEW-50' },
        { size: '100ml', price: 45.000, stock: 10, sku: 'PV-NEW-100' }
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
      price: p.price || 0,
      oldPrice: p.oldPrice || '',
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
      highlights: Array.isArray(p.highlights) ? p.highlights.join(', ') : '',
      highlightsEn: Array.isArray(p.highlightsEn) ? p.highlightsEn.join(', ') : '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      tagsEn: Array.isArray(p.tagsEn) ? p.tagsEn.join(', ') : '',
      seoTitle: p.seoTitle || '',
      seoTitleEn: p.seoTitleEn || '',
      seoDescription: p.seoDescription || '',
      seoDescriptionEn: p.seoDescriptionEn || '',
      topNotes: p.notes?.top?.join(', ') || '',
      topNotesEn: p.notes?.topEn?.join(', ') || '',
      heartNotes: p.notes?.heart?.join(', ') || '',
      heartNotesEn: p.notes?.heartEn?.join(', ') || '',
      baseNotes: p.notes?.base?.join(', ') || '',
      baseNotesEn: p.notes?.baseEn?.join(', ') || '',
      volumeOptions: p.volumeOptions && p.volumeOptions.length > 0 ? p.volumeOptions : [
        { size: '100ml', price: p.price || 45.000, stock: p.stock || 10, sku: `${p.sku}-100` }
      ]
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    const isConfirmed = await confirm({
      title: t('حذف العطر من الكتالوج', 'Delete Product from Catalog'),
      message: t('هل أنت تأكد من حذف هذا العطر بشكل نهائي؟ سيتم تنظيف الصور المرتبطة به تلقائياً.', 'Are you sure you want to permanently delete this product? Associated files will be cleaned automatically.'),
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
        { size: '75ml', price: prev.price, stock: 10, sku: `${prev.sku}-${prev.volumeOptions.length + 1}` }
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

    if (!form.image) {
      showError(t('يرجى رفع صورة العطر الرئيسية قبل الحفظ', 'Please upload main perfume image before saving'));
      return;
    }

    const payload: Partial<Product> = {
      sku: form.sku,
      name: form.name,
      nameEn: form.nameEn,
      shortDescription: form.shortDescription,
      shortDescriptionEn: form.shortDescriptionEn,
      description: form.description,
      descriptionEn: form.descriptionEn,
      usageInstructions: form.usageInstructions,
      usageInstructionsEn: form.usageInstructionsEn,
      highlights: form.highlights.split(',').map(s => s.trim()).filter(Boolean),
      highlightsEn: form.highlightsEn.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
      tagsEn: form.tagsEn.split(',').map(s => s.trim()).filter(Boolean),
      seoTitle: form.seoTitle,
      seoTitleEn: form.seoTitleEn,
      seoDescription: form.seoDescription,
      seoDescriptionEn: form.seoDescriptionEn,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
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

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.nameEn?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">
            {t('إدارة كتالوج العطور والأحجام', 'Perfume Catalog & Size Management')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('إضافة وتعديل العطور ورفع الصور عبر Multer والتنظيف التلقائي للملفات', 'Multi-size pricing, Multer uploads, & automatic orphan file cleanup')}
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

      {/* Filter / Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('البحث عن طريق الاسم أو الـ SKU...', 'Search by name or SKU...')}
            className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-10 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs text-muted font-mono">
          Total Products: <span className="font-bold text-primary">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel-gold rounded-3xl p-6 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">{t('جاري تحميل المنتجات...', 'Loading products...')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">{t('لا توجد عطور مطابقة', 'No products found')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs font-sans">
              <thead>
                <tr className="border-b border-outline-variant/20 text-muted uppercase text-[10px]">
                  <th className="py-3 px-4">{t('العطر', 'Perfume')}</th>
                  <th className="py-3 px-4">{t('SKU', 'SKU')}</th>
                  <th className="py-3 px-4">{t('المجموعة العطرية', 'Collection')}</th>
                  <th className="py-3 px-4">{t('الأحجام المتوفرة والأسعار', 'Available Sizes & Prices')}</th>
                  <th className="py-3 px-4">{t('الحالة', 'Status')}</th>
                  <th className="py-3 px-4 text-center">{t('الإجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-secondary-bg/40 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <SafeImage src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-lg bg-secondary-bg border border-outline-variant/20" />
                      <div>
                        <div className="font-bold text-sm text-on-surface">{p.name}</div>
                        <div className="text-xs text-muted font-sans">{p.nameEn}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">{p.sku}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-semibold">
                      {p.category || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.volumeOptions && p.volumeOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.volumeOptions.map(v => (
                            <span key={v.size} className="px-2 py-0.5 bg-secondary-bg border border-outline-variant/20 rounded-md text-[10px] font-mono text-primary">
                              {v.size}: {v.price.toFixed(3)} KWD
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-on-surface">{p.price.toFixed(3)} KWD</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        p.status === 'out_of_stock' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
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
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'basic' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('البيانات والصورة', 'Basic Details & Media')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'variants' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>{t('الأحجام والأسعار (KWD)', 'Size Variants')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bilingual')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'bilingual' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>{t('الوصف الثنائي (عربي / English)', 'Bilingual Content')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'notes' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('النوتات والتركيز', 'Notes & Specs')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'seo' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{t('إعدادات SEO والتاجات', 'SEO & Tags')}</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Tab 1: Basic & Image Upload */}
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-muted mb-1">{t('الاسم بالعربية *', 'Arabic Name *')}</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="دهن العود الملكي"
                      className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">{t('الاسم بالإنجليزية *', 'English Name *')}</label>
                    <input
                      type="text"
                      value={form.nameEn}
                      onChange={e => setForm({ ...form, nameEn: e.target.value })}
                      required
                      placeholder="Royal Oud Essence"
                      className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Reusable Multer Image Uploader */}
                  <div className="col-span-2">
                    <ImageUploader
                      folder="products"
                      value={form.image}
                      onChange={url => setForm({ ...form, image: url })}
                      label={t('صورة العطر الرئيسية (Multer Upload) *', 'Main Fragrance Image (Multer Upload) *')}
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">{t('رمز SKU الرئيسي', 'Main SKU')}</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={e => setForm({ ...form, sku: e.target.value })}
                      className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">{t('السعر الافتراضي (KWD) *', 'Default Price (KWD) *')}</label>
                    <input
                      type="number"
                      step="0.001"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      required
                      placeholder="45.000"
                      className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary font-mono font-bold text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">{t('السعر السابق (KWD)', 'Old Price (KWD)')}</label>
                    <input
                      type="number"
                      step="0.001"
                      value={form.oldPrice}
                      onChange={e => setForm({ ...form, oldPrice: e.target.value })}
                      placeholder="55.000"
                      className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">{t('المجموعة العطرية', 'Collection / Category')}</label>
                    <select
                      value={form.categoryId}
                      onChange={e => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full bg-secondary-bg border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.nameEn || c.name_en})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-muted mb-1">{t('حالة المنتج', 'Product Status')}</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as any })}
                      className="w-full bg-secondary-bg border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none"
                    >
                      <option value="active">Active (مفعل)</option>
                      <option value="out_of_stock">Out of Stock (نفذ)</option>
                      <option value="draft">Draft (مسودة)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 pt-4 col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={e => setForm({ ...form, featured: e.target.checked })}
                        className="rounded border-outline-variant text-primary"
                      />
                      <span>{t('عطر مميز (Featured)', 'Featured Fragrance')}</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isNew}
                        onChange={e => setForm({ ...form, isNew: e.target.checked })}
                        className="rounded border-outline-variant text-primary"
                      />
                      <span>{t('منتج جديد (New)', 'New Arrival')}</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 2: Dynamic Size Variants */}
              {activeTab === 'variants' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                    <div>
                      <h3 className="font-bold text-primary text-sm">{t('أحجام الزجاجات والأسعار المخصصة', 'Bottle Sizes & Custom Prices')}</h3>
                      <p className="text-[11px] text-muted">{t('حدد أسعار ومخزون الأحجام بالدينار الكويتي', 'Configure variant prices and stock levels')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-primary hover:text-on-primary transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('إضافة حجم جديد', 'Add Size Variant')}</span>
                    </button>
                  </div>

                  {form.volumeOptions.length === 0 ? (
                    <div className="p-8 text-center text-muted bg-secondary-bg/30 rounded-2xl border border-dashed border-outline-variant/30">
                      {t('لا توجد أحجام مضافة بعد. اضغط على إضافة حجم جديد لبدء الإضافة.', 'No size variants added yet.')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {form.volumeOptions.map((vol, idx) => (
                        <div key={idx} className="glass-panel p-4 rounded-2xl border border-outline-variant/20 flex flex-col md:flex-row items-center gap-3 justify-between">
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-mono text-[10px]">
                              {idx + 1}
                            </span>
                            <div className="w-full md:w-32">
                              <label className="block text-[10px] text-muted mb-0.5">{t('الحجم (Size)', 'Size')}</label>
                              <input
                                type="text"
                                value={vol.size}
                                onChange={e => handleUpdateVariant(idx, 'size', e.target.value)}
                                placeholder="50ml / 100ml"
                                required
                                className="w-full bg-secondary-bg border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                            <div>
                              <label className="block text-[10px] text-muted mb-0.5">{t('السعر (KWD)', 'Price (KWD)')}</label>
                              <input
                                type="number"
                                step="0.001"
                                value={vol.price}
                                onChange={e => handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                                required
                                className="w-full bg-secondary-bg border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-primary font-mono font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-muted mb-0.5">{t('المخزون', 'Stock')}</label>
                              <input
                                type="number"
                                value={vol.stock ?? 10}
                                onChange={e => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                                className="w-full bg-secondary-bg border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-muted mb-0.5">{t('SKU الحجم', 'Variant SKU')}</label>
                              <input
                                type="text"
                                value={vol.sku || ''}
                                onChange={e => handleUpdateVariant(idx, 'sku', e.target.value)}
                                placeholder={`${form.sku}-${vol.size}`}
                                className="w-full bg-secondary-bg border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-on-surface font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 pt-2 md:pt-0">
                            <button
                              type="button"
                              onClick={() => handleMoveVariant(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-muted hover:text-on-surface disabled:opacity-30"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveVariant(idx, 'down')}
                              disabled={idx === form.volumeOptions.length - 1}
                              className="p-1.5 text-muted hover:text-on-surface disabled:opacity-30"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(idx)}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Bilingual Content */}
              {activeTab === 'bilingual' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('وصف قصير (عربي)', 'Short Description (Arabic)')}</label>
                      <textarea
                        rows={2}
                        value={form.shortDescription}
                        onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                        placeholder="إكسير العود المعتق مع نفحات العنبر..."
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">{t('وصف قصير (English)', 'Short Description (English)')}</label>
                      <textarea
                        rows={2}
                        value={form.shortDescriptionEn}
                        onChange={e => setForm({ ...form, shortDescriptionEn: e.target.value })}
                        placeholder="A vintage oud elixir infused with dark amber..."
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('الوصف التفصيلي (عربي)', 'Full Description (Arabic)')}</label>
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="تركيبة عطرية حصرية تمزج أنقى قطرات العود..."
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">{t('الوصف التفصيلي (English)', 'Full Description (English)')}</label>
                      <textarea
                        rows={4}
                        value={form.descriptionEn}
                        onChange={e => setForm({ ...form, descriptionEn: e.target.value })}
                        placeholder="An exclusive olfactory composition blending purest vintage oud..."
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Notes & Specs */}
              {activeTab === 'notes' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('التركيز', 'Concentration')}</label>
                      <input
                        type="text"
                        value={form.concentration}
                        onChange={e => setForm({ ...form, concentration: e.target.value })}
                        placeholder="Extrait de Parfum / Eau de Parfum"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('الفواحان (Sillage)', 'Sillage')}</label>
                      <input
                        type="text"
                        value={form.sillage}
                        onChange={e => setForm({ ...form, sillage: e.target.value })}
                        placeholder="قوي (Heavy)"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/15 space-y-3">
                    <h3 className="font-bold text-primary">{t('الهرم العطري (مفصولة بفاصلة)', 'Olfactory Notes')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={form.topNotes}
                        onChange={e => setForm({ ...form, topNotes: e.target.value })}
                        placeholder="النوتات العليا (عربي): البرغموت, الهيل"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none"
                      />
                      <input
                        type="text"
                        value={form.topNotesEn}
                        onChange={e => setForm({ ...form, topNotesEn: e.target.value })}
                        placeholder="Top Notes (English): Bergamot, Cardamom"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: SEO & Tags */}
              {activeTab === 'seo' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('الكلمات المفتاحية / Tags (عربي)', 'Tags (Arabic)')}</label>
                      <input
                        type="text"
                        value={form.tags}
                        onChange={e => setForm({ ...form, tags: e.target.value })}
                        placeholder="عود, عطور شرقية, بيور فيل"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">{t('الكلمات المفتاحية / Tags (English)', 'Tags (English)')}</label>
                      <input
                        type="text"
                        value={form.tagsEn}
                        onChange={e => setForm({ ...form, tagsEn: e.target.value })}
                        placeholder="oud, oriental, pure veil"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
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
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-xl text-xs shadow-gold-glow hover:brightness-110 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? t('تحديث العطر والأحجام', 'Update Product & Sizes') : t('حفظ العطر', 'Save Product')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
