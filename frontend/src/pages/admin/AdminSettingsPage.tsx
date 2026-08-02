import React, { useEffect, useState } from 'react';
import { Save, Store, Mail, Phone, MapPin, Truck, RefreshCw, MessageSquare, Instagram, Twitter, Facebook, Image, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';
import { StoreSettings } from '../../services/apiService';
import { ImageUploader } from '../../components/ImageUploader';

export const AdminSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<StoreSettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateSettings({
        ...form,
        shippingFee: Number(form.shippingFee),
        freeShippingThreshold: Number(form.freeShippingThreshold),
      });
      showSuccess(t('تمت تحديث وتعميم إعدادات المتجر على الفور عبر الموقع', 'Store settings saved & immediately applied site-wide'));
    } catch (err) {
      console.error(err);
      showError(t('فشل حفظ إعدادات المتجر', 'Failed to save store settings'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl font-sans pb-12">
      <div>
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          {t('إعدادات وتخصيص المتجر المركزي', 'Centralized Store Settings & Branding')}
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          {t('تغيير شعار المتجر، الأيقونة، الاسم، الشحن وتفاصيل التواصل. تتحدث كافة عناصر الموقع فوراً دون الحاجة لتحديث الصفحة.', 'Manage store logo, favicon, name, delivery fees & contact details. Updates reflect immediately site-wide without manual refresh.')}
        </p>
      </div>

      {settingsLoading ? (
        <div className="glass-panel-gold rounded-3xl p-12 text-center text-xs text-muted flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span>{t('جاري تحميل إعدادات المتجر...', 'Loading store settings...')}</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-8">
          
          {/* Section 1: Logo & Branding Images Upload (Multer) */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/15 pb-2">
              <Image className="w-5 h-5 text-primary" />
              <span>{t('الهوية البصرية والشعارات (Multer)', 'Branding Images & Favicon')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader
                value={form.logo}
                onChange={(url) => setForm({ ...form, logo: url })}
                folder="banners"
                label={t('شعار المتجر الرئيسي (Logo)', 'Main Store Logo')}
              />

              <ImageUploader
                value={form.favicon}
                onChange={(url) => setForm({ ...form, favicon: url })}
                folder="banners"
                label={t('أيقونة المتصفح (Favicon)', 'Browser Favicon')}
              />
            </div>
          </div>

          {/* Section 2: Store Names */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/15 pb-2">
              <Store className="w-5 h-5 text-primary" />
              <span>{t('اسم المتجر والعلامة التجارية', 'Store Name & Brand')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  {t('اسم المتجر (بالعربية) *', 'Store Name (Arabic) *')}
                </label>
                <input
                  type="text"
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  {t('اسم المتجر (بالإنجليزية) *', 'Store Name (English) *')}
                </label>
                <input
                  type="text"
                  required
                  value={form.storeNameEn || ''}
                  onChange={(e) => setForm({ ...form, storeNameEn: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Contact Info & Address */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/15 pb-2">
              <Phone className="w-5 h-5 text-primary" />
              <span>{t('معلومات التواصل والعناوين', 'Contact Information & Address')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{t('البريد الإلكتروني للدعم', 'Support Email')}</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.supportEmail}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{t('رقم الهاتف للتواصل', 'Support Phone')}</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.supportPhone}
                  onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>{t('رقم الواتساب (WhatsApp)', 'WhatsApp Phone Number')}</span>
                </label>
                <input
                  type="text"
                  value={form.whatsapp || ''}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{t('عنوان الفرع الرئيسي (بالعربية)', 'Headquarters Address (Arabic)')}</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.storeAddress}
                  onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{t('عنوان الفرع الرئيسي (بالإنجليزية)', 'Headquarters Address (English)')}</span>
                </label>
                <input
                  type="text"
                  value={form.storeAddressEn || ''}
                  onChange={(e) => setForm({ ...form, storeAddressEn: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social Media Links */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/15 pb-2">
              <Instagram className="w-5 h-5 text-primary" />
              <span>{t('روابط التواصل الاجتماعي', 'Social Media Links')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>Instagram</span>
                </label>
                <input
                  type="text"
                  value={form.instagramUrl || ''}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/pureveil"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <Twitter className="w-4 h-4 text-sky-400" />
                  <span>Twitter / X</span>
                </label>
                <input
                  type="text"
                  value={form.twitterUrl || ''}
                  onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/pureveil"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span>Facebook</span>
                </label>
                <input
                  type="text"
                  value={form.facebookUrl || ''}
                  onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/pureveil"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Financial & Shipping Settings */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/15 pb-2">
              <Truck className="w-5 h-5 text-primary" />
              <span>{t('إعدادات الشحن والتوصيل (KWD)', 'Shipping Fees & Currency')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  {t('رسوم الشحن والتوصيل (KWD) *', 'Shipping Fee (KWD) *')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.shippingFee}
                  onChange={(e) => setForm({ ...form, shippingFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  {t('حد الشحن المجاني (KWD) *', 'Free Shipping Threshold *')}
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={form.freeShippingThreshold}
                  onChange={(e) => setForm({ ...form, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  {t('العملة الرسمية', 'Official Currency')}
                </label>
                <input
                  type="text"
                  value={form.currency}
                  disabled
                  className="w-full bg-secondary-bg/40 border border-outline-variant/10 rounded-xl px-4 py-3 text-xs text-muted font-bold font-mono cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Copyright & Footer Text */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/15 pb-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>{t('حقوق النشر وحاشية الصفحة', 'Copyright & Footer Notes')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  {t('نص الحقوق (بالعربية)', 'Copyright Text (Arabic)')}
                </label>
                <input
                  type="text"
                  value={form.copyrightText || ''}
                  onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  {t('نص الحقوق (بالإنجليزية)', 'Copyright Text (English)')}
                </label>
                <input
                  type="text"
                  value={form.copyrightTextEn || ''}
                  onChange={(e) => setForm({ ...form, copyrightTextEn: e.target.value })}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/15">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-2xl text-xs shadow-gold-glow hover:brightness-110 flex items-center gap-2.5 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{t('حفظ وتعميم الإعدادات على كامل الموقع فوراً', 'Save & Instantly Apply Site-Wide Settings')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
