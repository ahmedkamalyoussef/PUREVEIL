import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { getImageUrl } from '../utils/imageUrl';

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();
  const { settings } = useSettings();

  const storeLogo = getImageUrl(settings.logo || '/logo.png');
  const storeName = lang === 'ar' ? (settings.storeName || 'PURE VEIL') : (settings.storeNameEn || 'PURE VEIL');
  const storeAddress = lang === 'ar' ? (settings.storeAddress || 'مدينة الكويت') : (settings.storeAddressEn || 'Kuwait City');
  const copyrightText = lang === 'ar' ? (settings.copyrightText || 'جميع الحقوق محفوظة.') : (settings.copyrightTextEn || 'All rights reserved.');

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/15 pt-16 pb-12 font-sans text-on-surface-variant">
      <div className="max-w-[1440px] mx-auto px-4 md:px-gutter space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-surface-container-high/90 border border-primary/40 p-1.5 flex items-center justify-center shadow-seal-shadow group-hover:border-primary group-hover:scale-105 transition-all duration-300 shrink-0">
                <img src={storeLogo} alt={storeName} className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(161,153,127,0.4)]" />
              </div>
              <span className="font-serif text-2xl font-bold gold-gradient-text">{storeName}</span>
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              {t(
                'بيور فيل — دار العطور والعود الفاخرة. نجمع لك أرقى النوتات العطرية الشرقية والفرنسية في زجاجات ملكية ساحرة.',
                'PURE VEIL — House of Luxury Fragrances & Oud. Crafting exquisite oriental and French perfumes presented in royal bottles.'
              )}
            </p>
            {settings.showSocialLinks !== false && (
              <div className="flex gap-3 pt-2">
                {settings.showInstagram !== false && settings.instagramUrl && settings.instagramUrl !== '#' && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary-bg hover:text-primary transition-colors" title="Instagram">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.showTwitter !== false && settings.twitterUrl && settings.twitterUrl !== '#' && (
                  <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary-bg hover:text-primary transition-colors" title="Twitter / X">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {settings.showFacebook !== false && settings.facebookUrl && settings.facebookUrl !== '#' && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-secondary-bg hover:text-primary transition-colors" title="Facebook">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-on-surface uppercase tracking-wider">{t('روابط سريعة', 'Quick Links')}</h4>
            <ul className="space-y-2">
              <li><Link to="/catalog" className="hover:text-primary transition-colors">{t('جميع العطور', 'All Fragrances')}</Link></li>
              <li><Link to="/catalog?category=العطور الشرقية" className="hover:text-primary transition-colors">{t('العطور الشرقية', 'Oriental Perfumes')}</Link></li>
              <li><Link to="/catalog?category=البخور والعود" className="hover:text-primary transition-colors">{t('البخور والعود', 'Oud & Incense')}</Link></li>
              <li><Link to="/collections" className="hover:text-primary transition-colors">{t('المجموعات الحصرية', 'Private Collections')}</Link></li>
              <li><Link to="/favorites" className="hover:text-primary transition-colors">{t('قائمة المفضلة', 'Wishlist')}</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-on-surface uppercase tracking-wider">{t('خدمة العملاء', 'Customer Support')}</h4>
            <ul className="space-y-2">
              <li><Link to="/account" className="hover:text-primary transition-colors">{t('حسابي الشخصي', 'My Account')}</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">{t('سلة الشراء', 'Shopping Cart')}</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t('سياسة الشحن والتوصيل', 'Shipping Policy')}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t('الأسئلة الشائعة', 'FAQs')}</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-on-surface uppercase tracking-wider">{t('تواصل معنا', 'Contact Us')}</h4>
            <div className="space-y-2.5 text-muted">
              {settings.showAddress !== false && storeAddress && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{storeAddress}</span>
                </div>
              )}
              {settings.showPhone !== false && settings.supportPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a href={`tel:${settings.supportPhone}`} className="font-mono hover:text-primary transition-colors">{settings.supportPhone}</a>
                </div>
              )}
              {settings.showWhatsapp !== false && (settings.whatsapp || settings.supportPhone) && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`https://wa.me/${(settings.whatsapp || settings.supportPhone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono hover:text-emerald-400 transition-colors dir-ltr"
                  >
                    {settings.whatsapp || settings.supportPhone} (WhatsApp)
                  </a>
                </div>
              )}
              {settings.showEmail !== false && settings.supportEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href={`mailto:${settings.supportEmail}`} className="font-mono hover:text-primary transition-colors">{settings.supportEmail}</a>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-outline-variant/10 pt-6 text-center text-xs text-muted flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {storeName}. {copyrightText}</p>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('عطور فاخرة بأسلوب ملكي رفيع', 'Exquisite Luxury Fragrances')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
