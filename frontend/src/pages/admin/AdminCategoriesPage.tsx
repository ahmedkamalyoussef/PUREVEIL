import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Globe, Sparkles, Layers, FileText, MoveUp, MoveDown } from 'lucide-react';
import { Category } from '../../types';
import { fetchCollections, createCollectionApi, updateCollectionApi, deleteCollectionApi } from '../../services/apiService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmModalContext';
import { ImageUploader } from '../../components/ImageUploader';
import { SafeImage } from '../../components/SafeImage';

export const AdminCategoriesPage: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'bilingual' | 'seo'>('basic');

  const [form, setForm] = useState<{
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    image: string;
    displayOrder: number;
    status: 'active' | 'inactive';
    seoTitle: string;
    seoTitleEn: string;
    seoDescription: string;
    seoDescriptionEn: string;
  }>({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    image: '',
    displayOrder: 1,
    status: 'active',
    seoTitle: '',
    seoTitleEn: '',
    seoDescription: '',
    seoDescriptionEn: ''
  });

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await fetchCollections();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load collections:", err);
      showError(t('فشل تحميل المجموعات العطرية', 'Failed to load collections'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setActiveTab('basic');
    setForm({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      image: '',
      displayOrder: categories.length + 1,
      status: 'active',
      seoTitle: '',
      seoTitleEn: '',
      seoDescription: '',
      seoDescriptionEn: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setActiveTab('basic');
    setForm({
      name: c.name || '',
      nameEn: c.nameEn || c.name_en || '',
      description: c.description || '',
      descriptionEn: c.descriptionEn || c.description_en || '',
      image: c.image || '',
      displayOrder: c.displayOrder || c.display_order || 1,
      status: c.status || 'active',
      seoTitle: c.seoTitle || c.seo_title || '',
      seoTitleEn: c.seoTitleEn || c.seo_title_en || '',
      seoDescription: c.seoDescription || c.seo_description || '',
      seoDescriptionEn: c.seoDescriptionEn || c.seo_description_en || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('حذف المجموعة العطرية', 'Delete Fragrance Collection'),
      message: t('هل أنت تأكد من حذف هذه المجموعة؟ سيتم تنظيف غلاف المجموعة من السيرفر إذا لم يكن مستخدماً في مكان آخر.', 'Are you sure you want to delete this collection? Associated files will be safely removed.'),
      confirmText: t('نعم، احذف', 'Yes, Delete'),
      cancelText: t('تراجع', 'Cancel'),
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await deleteCollectionApi(id);
      showSuccess(t('تم حذف المجموعة العطرية وتنظيف ملفات الغلاف بنجاح', 'Collection deleted and cover image cleaned up'));
      loadCollections();
    } catch (err) {
      showError(t('فشل حذف المجموعة العطرية', 'Failed to delete collection'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.image) {
      showError(t('يرجى رفع غلاف المجموعة العطرية عبر Multer', 'Please upload a collection cover image'));
      return;
    }

    try {
      if (editingCategory) {
        await updateCollectionApi(editingCategory.id, form);
        showSuccess(t('تم تحديث بيانات وغلاف المجموعة بنجاح', 'Collection updated successfully'));
      } else {
        await createCollectionApi(form);
        showSuccess(t('تم إنشاء المجموعة العطرية الجديدة بنجاح', 'Collection created successfully'));
      }
      setModalOpen(false);
      loadCollections();
    } catch (err) {
      showError(t('فشل حفظ بيانات المجموعة العطرية', 'Failed to save collection details'));
    }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.nameEn || c.name_en || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">
            {t('إدارة المجموعات العطرية والـ SEO', 'Fragrance Collections & SEO')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('تحكم كامل بالمجموعات العطرية، الأغلفة من Multer، والترتيب التنازلي للمتجر', 'Full admin control over collections, Multer uploaded covers, and display order')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-xl text-xs tracking-wider shadow-gold-glow flex items-center justify-center gap-2 hover:brightness-110 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إضافة مجموعة جديدة', 'Add New Collection')}</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('البحث عن اسم المجموعة...', 'Search collections...')}
            className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-10 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs text-muted font-mono">
          Total Collections: <span className="font-bold text-primary">{filtered.length}</span>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-muted">{t('جاري تحميل المجموعات...', 'Loading collections...')}</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted">{t('لا توجد مجموعات عطرية', 'No collections found')}</div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="glass-panel-gold rounded-3xl overflow-hidden border border-outline-variant/20 group hover:border-primary/50 transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-secondary-bg overflow-hidden">
                  {c.image ? (
                    <SafeImage src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted font-mono text-xs">{t('بدون غلاف', 'No Cover')}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full border border-primary/30 text-[10px] font-bold font-mono text-primary">
                    #{c.displayOrder || c.display_order || 1}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <div className="text-xs text-muted font-sans mt-0.5">{c.nameEn || c.name_en}</div>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {c.description || c.description_en || t('مجموعة عطرية ملكية حصرية من بيت عطور بيور فيل...', 'Exclusive fragrance collection...')}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-outline-variant/15">
                    <span className="text-[11px] text-primary font-mono font-bold">
                      {(c.productCount !== undefined ? c.productCount : c.product_count) !== undefined ? `${c.productCount !== undefined ? c.productCount : c.product_count} ${t('عطر', 'fragrances')}` : ''}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {c.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-secondary-bg/30 border-t border-outline-variant/15 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-primary hover:text-on-primary transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t('تعديل', 'Edit')}</span>
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel-gold rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 relative border border-primary/30 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-2xl font-bold text-on-surface">
                  {editingCategory ? t('تعديل غلاف وبينات المجموعة', 'Edit Collection & Cover Image') : t('إنشاء مجموعة عطرية جديدة', 'Create Fragrance Collection')}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-muted hover:text-on-surface rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-outline-variant/15 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'basic' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('الاسم والغلاف (Multer)', 'Basic & Cover')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bilingual')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'bilingual' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>{t('الوصف التوضيحي', 'Descriptions')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'seo' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{t('إعدادات SEO', 'SEO Settings')}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'basic' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('اسم المجموعة بالعربية *', 'Collection Arabic Name *')}</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="المجموعة الشرقية"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-muted mb-1">{t('اسم المجموعة بالإنجليزية *', 'Collection English Name *')}</label>
                      <input
                        type="text"
                        value={form.nameEn}
                        onChange={e => setForm({ ...form, nameEn: e.target.value })}
                        required
                        placeholder="Oriental Collection"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Reusable Image Uploader */}
                  <ImageUploader
                    folder="categories"
                    value={form.image}
                    onChange={url => setForm({ ...form, image: url })}
                    label={t('غلاف المجموعة العطرية (Multer Upload) *', 'Collection Cover Image (Multer Upload) *')}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('ترتيب العرض (Display Order)', 'Display Order')}</label>
                      <input
                        type="number"
                        value={form.displayOrder}
                        onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 1 })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('حالة المجموعة', 'Collection Status')}</label>
                      <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value as any })}
                        className="w-full bg-secondary-bg border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none"
                      >
                        <option value="active">Active (ظاهرة بالمتجر والقائمة)</option>
                        <option value="inactive">Inactive (مخفية)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bilingual' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted mb-1">{t('وصف المجموعة (عربي)', 'Arabic Description')}</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="تشكيلة فاخرة تجسد سحر الأصالة الشرقية..."
                      className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-muted mb-1">{t('وصف المجموعة (English)', 'English Description')}</label>
                    <textarea
                      rows={3}
                      value={form.descriptionEn}
                      onChange={e => setForm({ ...form, descriptionEn: e.target.value })}
                      placeholder="A luxury selection embodying authentic oriental charm..."
                      className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-muted mb-1">{t('عنوان الصفحة (SEO Title Arabic)', 'SEO Title Arabic')}</label>
                      <input
                        type="text"
                        value={form.seoTitle}
                        onChange={e => setForm({ ...form, seoTitle: e.target.value })}
                        placeholder="تسوق عطور المجموعة الشرقية | بيور فيل"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('عنوان الصفحة (SEO Title English)', 'SEO Title English')}</label>
                      <input
                        type="text"
                        value={form.seoTitleEn}
                        onChange={e => setForm({ ...form, seoTitleEn: e.target.value })}
                        placeholder="Shop Oriental Perfume Collection | PURE VEIL"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  <span>{editingCategory ? t('تحديث المجموعة', 'Update Collection') : t('حفظ المجموعة', 'Save Collection')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
