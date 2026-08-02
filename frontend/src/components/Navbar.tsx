import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User as UserIcon, Heart, Globe, Menu, X, LogOut, Shield, Settings, ChevronDown, Sparkles, ArrowLeft, ArrowRight, FolderTree } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { fetchCollections } from '../services/apiService';
import { Category } from '../types';
import { getImageUrl } from '../utils/imageUrl';

import { SafeImage } from './SafeImage';

export const Navbar: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { lang, toggleLang, t } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [collectionsHovered, setCollectionsHovered] = useState(false);
  const [mobileCollectionsExpanded, setMobileCollectionsExpanded] = useState(false);

  useEffect(() => {
    const loadNavCategories = async () => {
      try {
        const data = await fetchCollections();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to load nav categories:', err);
      }
    };
    loadNavCategories();
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const storeLogo = getImageUrl(settings.logo || '/logo.png');

  return (
    <nav className="bg-background/85 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/10 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 md:px-gutter h-20 flex items-center justify-between">
        
        {/* Right side (RTL): Brand Logo & Name + Dynamic Navigation */}
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={storeLogo} 
              alt={settings.storeName || "PURE VEIL"} 
              className="h-10 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(212,175,55,0.4)] group-hover:scale-105 transition-transform" 
            />
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-wider gold-gradient-text">
              {lang === 'ar' ? (settings.storeName || 'PURE VEIL') : (settings.storeNameEn || 'PURE VEIL')}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 font-sans text-base">
            <Link
              to="/"
              className={`transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary border-b-2 border-primary pb-1 font-semibold' : 'text-on-surface'
              }`}
            >
              {t('الرئيسية', 'Home')}
            </Link>

            <Link
              to="/catalog"
              className={`transition-colors hover:text-primary ${
                isActive('/catalog') && !location.search ? 'text-primary border-b-2 border-primary pb-1 font-semibold' : 'text-on-surface'
              }`}
            >
              {t('جميع العطور', 'All Fragrances')}
            </Link>

            {/* Collections Dynamic Mega Menu Hover Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setCollectionsHovered(true)}
              onMouseLeave={() => setCollectionsHovered(false)}
            >
              <Link
                to="/collections"
                className={`flex items-center gap-1.5 transition-colors hover:text-primary py-2 ${
                  isActive('/collections') || location.search.includes('category=') ? 'text-primary border-b-2 border-primary pb-1 font-semibold' : 'text-on-surface'
                }`}
              >
                <span>{t('المجموعات العطرية', 'Collections')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${collectionsHovered ? 'rotate-180 text-primary' : 'text-muted'}`} />
              </Link>

              {/* Mega Menu Dropdown */}
              {collectionsHovered && categories.length > 0 && (
                <div className="absolute right-0 top-full pt-2 w-[480px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="glass-panel-gold rounded-3xl p-6 shadow-2xl border border-primary/30 space-y-4 backdrop-blur-2xl">
                    <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                      <span className="text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('تصفح حسب المجموعة', 'Browse by Collection')}</span>
                      </span>
                      <span className="text-[10px] text-muted font-mono">{categories.length} {t('مجموعة', 'Collections')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setCollectionsHovered(false)}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-secondary-bg/50 border border-outline-variant/15 hover:border-primary/50 hover:bg-primary/10 transition-all group/cat"
                        >
                          {cat.image ? (
                            <SafeImage src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-xl shrink-0 group-hover/cat:scale-105 transition-transform" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                              <FolderTree className="w-5 h-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <div className="font-serif font-bold text-xs text-on-surface group-hover/cat:text-primary transition-colors truncate">
                              {lang === 'ar' ? cat.name : (cat.nameEn || cat.name_en || cat.name)}
                            </div>
                            <div className="text-[10px] text-muted font-sans">
                              {cat.count !== undefined ? `${cat.count} ${t('عطر', 'fragrances')}` : t('عرض العطور', 'View items')}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Action Link at Bottom */}
                    <div className="pt-3 border-t border-outline-variant/15 text-center">
                      <Link
                        to="/collections"
                        onClick={() => setCollectionsHovered(false)}
                        className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline group/btn"
                      >
                        <span>{t('معاينة جميع المجموعات الحصرية', 'View All Collections')}</span>
                        {lang === 'ar' ? (
                          <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-1 transition-transform" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="px-2.5 py-1 rounded-full border border-outline-variant/30 text-xs tracking-widest text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'EN' : 'العربية'}</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-primary hover:opacity-80 transition-opacity"
            title={t('البحث عن عطر', 'Search perfumes')}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/favorites"
            className={`p-2 transition-opacity ${isActive('/favorites') ? 'text-primary font-bold' : 'text-primary hover:opacity-80'}`}
            title={t('المفضلة', 'Favorites')}
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-primary hover:opacity-80 transition-opacity"
            title={t('سلة المشتريات', 'Shopping Cart')}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-background">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Dropdown */}
          <div className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-2 text-primary hover:opacity-80 transition-opacity flex items-center gap-1.5"
                title={user?.name}
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <Link
                to="/login"
                className="p-2 text-primary hover:opacity-80 transition-opacity"
                title={t('تسجيل الدخول', 'Sign In')}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            {/* User Dropdown Menu */}
            {userDropdownOpen && isAuthenticated && (
              <div className="absolute left-0 mt-3 w-56 glass-panel-gold rounded-2xl p-2 shadow-2xl z-50 border border-primary/30 font-sans text-xs space-y-1">
                <div className="px-3 py-2 border-b border-outline-variant/15">
                  <div className="font-bold text-on-surface truncate">{user?.name}</div>
                  <div className="text-[10px] text-on-surface-variant truncate">{user?.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary rounded-md text-[9px] font-bold uppercase">
                    {user?.role}
                  </span>
                </div>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-primary hover:bg-primary/10 rounded-xl transition-colors font-semibold"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{t('لوحة الإدارة', 'Admin Panel')}</span>
                  </Link>
                )}

                <Link
                  to="/favorites"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-on-surface hover:bg-secondary-bg rounded-xl transition-colors"
                >
                  <Heart className="w-4 h-4 text-primary" />
                  <span>{t('العطور المفضلة', 'Favorites')}</span>
                </Link>

                <Link
                  to="/account"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-on-surface hover:bg-secondary-bg rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-primary" />
                  <span>{t('إعدادات الحساب', 'Account Settings')}</span>
                </Link>

                <button
                  onClick={() => { logout(); setUserDropdownOpen(false); navigate('/'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('تسجيل الخروج', 'Sign Out')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-on-surface hover:text-primary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with Accordion for Collections */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-2xl border-b border-outline-variant/20 px-6 py-6 space-y-4 font-sans text-sm max-h-[85vh] overflow-y-auto">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-on-surface py-2 hover:text-primary font-semibold">
            {t('الرئيسية', 'Home')}
          </Link>
          <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="block text-on-surface py-2 hover:text-primary font-semibold">
            {t('جميع العطور', 'All Fragrances')}
          </Link>

          {/* Mobile Accordion for Collections */}
          <div className="border-y border-outline-variant/15 py-2">
            <button
              onClick={() => setMobileCollectionsExpanded(!mobileCollectionsExpanded)}
              className="w-full flex items-center justify-between py-2 text-on-surface font-semibold hover:text-primary"
            >
              <span>{t('المجموعات العطرية', 'Collections')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileCollectionsExpanded ? 'rotate-180 text-primary' : 'text-muted'}`} />
            </button>

            {mobileCollectionsExpanded && (
              <div className="pl-4 pr-2 pt-2 space-y-2 text-xs border-r-2 border-primary/40 mr-2 my-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-on-surface-variant hover:text-primary py-1.5 font-medium truncate"
                  >
                    {lang === 'ar' ? cat.name : (cat.nameEn || cat.name_en || cat.name)}
                  </Link>
                ))}
                <Link
                  to="/collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-primary font-bold py-2 pt-3 border-t border-outline-variant/15 flex items-center gap-1"
                >
                  <span>{t('معاينة جميع المجموعات', 'View All Collections')}</span>
                  {lang === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            )}
          </div>

          <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="block text-on-surface py-2 hover:text-primary font-semibold">
            {t('المفضلة', 'Favorites')}
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block text-on-surface py-2 hover:text-primary font-semibold">
                {t('إعدادات الحساب', 'Account Settings')}
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-primary py-2 font-bold">
                  {t('لوحة الإدارة', 'Admin Panel')}
                </Link>
              )}
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                className="block text-red-400 py-2 font-bold"
              >
                {t('تسجيل الخروج', 'Sign Out')}
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-primary py-2 font-bold">
              {t('تسجيل الدخول', 'Sign In')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
