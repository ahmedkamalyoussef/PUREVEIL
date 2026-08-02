import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Globe, Sparkles, Layers, MoveUp, MoveDown, RefreshCw } from 'lucide-react';
import { Category } from '../../types';
import { fetchCollections, createCollectionApi, updateCollectionApi, deleteCollectionApi } from '../../services/apiService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmModalContext';
import { ImageUploader } from '../../components/ImageUploader';
import { SafeImage } from '../../components/SafeImage';
import { Pagination } from '../../components/Pagination';

export const AdminCategoriesPage: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'bilingual'>('basic');

  const [form, setForm] = useState<{
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    image: string;
    displayOrder: number;
    status: 'active' | 'inactive';
  }>({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    image: '',
    displayOrder: 1,
    status: 'active'
  });

  const loadCollections = useCallback(async () => {
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
  }, [showError, t]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

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
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setActiveTab('basic');
    setForm({
      name: cat.name || '',
      nameEn: cat.nameEn || cat.name_en || '',
      description: cat.description || '',
      descriptionEn: cat.descriptionEn || cat.description_en || '',
      image: cat.image || '',
      displayOrder: cat.displayOrder || cat.display_order || 1,
      status: cat.status || 'active'
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: t('حذف المجموعة العطرية', 'Delete Fragrance Collection'),
      message: t('هل أنت تأكد من حذف هذه المجموعة؟ سيتم فك ارتباط العطور المسجلة تحتها وتنظيف صورتها من السيرفر.', 'Are you sure you want to delete this collection? Associated products will be unlinked and file cleaned up.'),
      confirmText: t('نعم، احذف', 'Yes, Delete'),
      cancelText: t('تراجع', 'Cancel'),
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await deleteCollectionApi(id);
      showSuccess(t('تم حذف المجموعة العطرية وتنظيف ملفاتها بنجاح', 'Collection deleted successfully'));
      loadCollections();
    } catch (err) {
      showError(t('فشل حذف المجموعة العطرية', 'Failed to delete collection'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name) {
      showError(t('الرجاء إدخال اسم المجموعة بالعربية', 'Please enter Arabic collection name'));
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

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-on-surface">
            {t('إدارة المجموعات العطرية', 'Fragrance Collections Management')}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            {t('تحكم كامل بالمجموعات العطرية الأغلفة من Multer، والترتيب التنازلي للمتجر', 'Full admin control over collections, Multer uploaded covers, and display order')}
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
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder={t('البحث عن مجموعة عطرية...', 'Search collection...')}
            className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-10 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs text-muted font-mono">
          Total Collections: <span className="font-bold text-primary">{filtered.length}</span>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-muted flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <span>{t('جاري تحميل المجموعات...', 'Loading collections...')}</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-muted">
            {t('لا توجد مجموعات عطرية مطابقة', 'No collections found')}
          </div>
        ) : (
          paginated.map(c => (
            <div key={c.id} className="glass-panel-gold rounded-3xl p-5 space-y-4 relative overflow-hidden group">
              <div className="relative h-44 rounded-2xl overflow-hidden border border-outline-variant/20">
                <SafeImage
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md border border-outline-variant/20 px-2.5 py-1 rounded-xl text-[10px] font-bold text-primary font-mono">
                  #{c.displayOrder || c.display_order || 1}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-on-surface">{c.name}</h3>
                {(c.nameEn || c.name_en) && <p className="text-xs text-primary font-medium">{c.nameEn || c.name_en}</p>}
                {c.description && <p className="text-xs text-muted line-clamp-2 mt-1">{c.description}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-xs">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${(c.status || 'active') === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                  {c.status || 'active'}
                </span>

                <div className="flex items-center gap-2">
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
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filtered.length / pageSize)}
          totalRecords={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[3, 6, 12, 24]}
        />
      )}

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
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === 'basic' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                  }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t('الاسم والغلاف (Multer)', 'Basic & Cover')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bilingual')}
                className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${activeTab === 'bilingual' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-muted hover:text-on-surface'
                  }`}
              >
                <Globe className="w-4 h-4" />
                <span>{t('الوصف التوضيحي', 'Descriptions')}</span>
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
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="العطور الشرقية الفاخرة"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('اسم المجموعة بالإنجليزية', 'Collection English Name')}</label>
                      <input
                        type="text"
                        value={form.nameEn}
                        onChange={e => setForm({ ...form, nameEn: e.target.value })}
                        placeholder="Oriental Luxury Fragrances"
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <ImageUploader
                    currentImage={form.image}
                    folder="collections"
                    onImageUploaded={(url) => setForm({ ...form, image: url })}
                    label={t('غلاف المجموعة (يتم رفعه عبر Multer وتخزينه في /uploads/collections)', 'Collection Cover Image')}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-muted mb-1">{t('ترتيب العرض بالمتجر', 'Display Order')}</label>
                      <input
                        type="number"
                        value={form.displayOrder}
                        onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value) || 1 })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-mono focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-muted mb-1">{t('الحالة', 'Status')}</label>
                      <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value as any })}
                        className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary font-bold"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bilingual' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-muted mb-1">{t('وصف المجموعة (بالعربية)', 'Arabic Description')}</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="تشكيلة حصرية تجسد سحر الشرق الأصيل في زجاجات فاخرة..."
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
                  <span>{editingCategory ? t('حفظ التغييرات', 'Save Changes') : t('إنشاء المجموعة', 'Create Collection')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
