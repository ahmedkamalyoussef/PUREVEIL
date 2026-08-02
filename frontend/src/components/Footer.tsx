import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/15 pt-16 pb-12 font-sans text-on-surface-variant">
      <div className="max-w-[1440px] mx-auto px-4 md:px-gutter space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="PURE VEIL" className="h-8 w-auto filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
              <span className="font-serif text-2xl font-bold gold-gradient-text">PURE VEIL</span>
            </Link>
            <p className="text-xs text-muted leading-relaxed">
              {t(
                'بيور فيل — دار العطور والعود الفاخرة. نجمع لك أرقى النوتات العطرية الشرقية والفرنسية في زجاجات ملكية ساحرة.',
                'PURE VEIL — House of Luxury Fragrances & Oud. Crafting exquisite oriental and French perfumes presented in royal bottles.'
              )}
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="p-2 rounded-full bg-secondary-bg hover:text-primary transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-full bg-secondary-bg hover:text-primary transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-full bg-secondary-bg hover:text-primary transition-colors"><Facebook className="w-4 h-4" /></a>
            </div>
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
            <div className="space-y-2 text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{t('مدينة الكويت - برج العطور الفاخرة', 'Kuwait City - Luxury Fragrance Tower')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="font-mono">+965 2200 8800</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="font-mono">support@pureveil.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-outline-variant/10 pt-6 text-center text-xs text-muted flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} PURE VEIL (بيور فيل). {t('جميع الحقوق محفوظة.', 'All rights reserved.')}</p>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('عطور فاخرة بأسلوب ملكي رفيع', 'Exquisite Luxury Fragrances')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
