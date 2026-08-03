import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User as UserIcon, Heart, Globe, Menu, X, LogOut, Shield, Settings, ChevronDown, FolderTree, Home, Sparkles, Package } from 'lucide-react';

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

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click-away listener for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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
    <nav className="bg-background/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-outline-variant/15 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-gutter h-16 sm:h-20 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-4 lg:gap-8 shrink-0 min-w-0">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-surface-container-high/90 border border-primary/40  flex items-center justify-center shadow-seal-shadow group-hover:border-primary group-hover:scale-105 transition-all duration-300 shrink-0">
              <img 
                src={storeLogo} 
                alt={settings.storeName || "PURE VEIL"} 
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(161,153,127,0.4)] rounded-full" 
              />
            </div>
            <span className="font-serif text-base sm:text-2xl md:text-3xl font-bold tracking-wider gold-gradient-text truncate max-w-[110px] sm:max-w-none">
              {lang === 'ar' ? (settings.storeName || 'PURE VEIL') : (settings.storeNameEn || 'PURE VEIL')}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-sans text-sm">
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

            {/* Desktop Collections Mega Menu */}
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

              {collectionsHovered && categories.length > 0 && (
                <div className="absolute right-0 ltr:right-auto ltr:left-0 top-full pt-2 w-[480px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="glass-panel-gold rounded-3xl p-6 shadow-2xl border border-primary/30 space-y-4 backdrop-blur-2xl">
                    <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
                      <span className="font-serif font-bold text-on-surface text-sm flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-primary" />
                        <span>{t('تصفح حسب التشكيلة العطرية', 'Browse By Fragrance Line')}</span>
                      </span>
                      <Link to="/collections" className="text-xs text-primary font-bold hover:underline">
                        {t('عرض الكل', 'View All')}
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          to={`/catalog?category=${encodeURIComponent(c.name)}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary-bg/80 border border-transparent hover:border-outline-variant/20 transition-all group/item"
                        >
                          <SafeImage
                            src={c.image}
                            alt={c.name}
                            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-outline-variant/20"
                          />
                          <div className="truncate">
                            <span className="font-serif font-bold text-xs text-on-surface group-hover/item:text-primary transition-colors block truncate">
                              {lang === 'ar' ? c.name : (c.nameEn || c.name_en || c.name)}
                            </span>
                            <span className="text-[10px] text-muted block truncate font-sans">
                              {c.count !== undefined ? `${c.count} ${t('عطر', 'Fragrances')}` : t('استكشف', 'Explore')}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Icons (Language, Search, Wishlist, Cart, Profile, Mobile Menu) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="p-1.5 sm:p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-secondary-bg/60 transition-colors flex items-center gap-1 text-xs font-bold font-mono min-h-[36px] min-w-[36px] justify-center"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Globe className="w-4 h-4 text-primary" />
            <span className="uppercase text-[11px]">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 sm:p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-secondary-bg/60 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={t('البحث عن عطر', 'Search perfumes')}
          >
            <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          {/* Favorites Link */}
          <Link
            to="/favorites"
            className="p-1.5 sm:p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-secondary-bg/60 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={t('قائمة المفضلة', 'Wishlist')}
          >
            <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </Link>

          {/* Cart Icon & Counter Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-1.5 sm:p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-secondary-bg/60 transition-colors relative min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={t('حقيبة التسوق', 'Shopping Bag')}
          >
            <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold font-mono w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Dropdown (Desktop & Responsive) */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            {isAuthenticated ? (
              <div>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-colors bg-secondary-bg/50"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>

                {/* Dropdown with safe positioning & click-away listener */}
                {userDropdownOpen && (
                  <div className="absolute right-0 ltr:right-0 ltr:left-auto rtl:left-0 rtl:right-auto top-full mt-2 w-60 max-w-[calc(100vw-2rem)] glass-panel-gold rounded-2xl p-2 shadow-2xl border border-primary/30 z-50 animate-in fade-in duration-150">
                    <div className="p-3 border-b border-outline-variant/15">
                      <div className="font-bold text-xs text-on-surface truncate">{user?.name}</div>
                      <div className="text-[10px] text-muted truncate">{user?.email}</div>
                    </div>

                    <div className="py-1 space-y-0.5 text-xs">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-primary font-bold hover:bg-primary/10 rounded-xl transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span>{t('لوحة الإدارة', 'Admin Console')}</span>
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-on-surface hover:bg-secondary-bg rounded-xl transition-colors font-medium"
                      >
                        <Package className="w-4 h-4 text-primary" />
                        <span>{t('طلباتي والتتبع', 'My Orders')}</span>
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-on-surface hover:bg-secondary-bg rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>{t('إعدادات الحساب', 'Account Settings')}</span>
                      </Link>

                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-error hover:bg-error/10 rounded-xl transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('تسجيل الخروج', 'Sign Out')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary border border-primary/30 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>{t('تسجيل الدخول', 'Sign In')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-on-surface hover:text-primary transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* FULL SCREEN MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 z-40 bg-background backdrop-blur-3xl border-t border-outline-variant/20 p-6 sm:p-8 overflow-y-auto h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] flex flex-col justify-between animate-in slide-in-from-top duration-300 shadow-2xl">
          <div className="space-y-6 pt-2">
            
            {/* Primary Page Navigation Links */}
            <div className="space-y-3 font-serif text-lg sm:text-xl font-bold border-b border-outline-variant/15 pb-6">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl transition-all ${
                  isActive('/') ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface hover:bg-secondary-bg'
                }`}
              >
                <Home className="w-6 h-6 text-primary" />
                <span>{t('الرئيسية', 'Home')}</span>
              </Link>

              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl transition-all ${
                  isActive('/catalog') ? 'bg-primary/20 text-primary border border-primary/30' : 'text-on-surface hover:bg-secondary-bg'
                }`}
              >
                <Sparkles className="w-6 h-6 text-primary" />
                <span>{t('جميع العطور والعود', 'All Fragrances & Oud')}</span>
              </Link>

              {/* Mobile Collections Expandable Sub-Menu */}
              <div>
                <button
                  onClick={() => setMobileCollectionsExpanded(!mobileCollectionsExpanded)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl text-on-surface hover:bg-secondary-bg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <FolderTree className="w-6 h-6 text-primary" />
                    <span>{t('المجموعات العطرية', 'Collections')}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${mobileCollectionsExpanded ? 'rotate-180 text-primary' : 'text-muted'}`} />
                </button>

                {mobileCollectionsExpanded && (
                  <div className="pl-6 pr-2 py-2 space-y-2 text-sm sm:text-base font-sans font-medium border-l border-outline-variant/20 my-2">
                    <Link
                      to="/collections"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 text-primary font-bold hover:underline"
                    >
                      {t('عرض كل المجموعات →', 'View All Collections →')}
                    </Link>
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/catalog?category=${encodeURIComponent(c.name)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-3 text-on-surface-variant hover:text-primary transition-colors truncate"
                      >
                        {lang === 'ar' ? c.name : (c.nameEn || c.name_en || c.name)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Account Options */}
            <div className="space-y-3 pt-2">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="p-4 bg-secondary-bg/80 rounded-2xl border border-outline-variant/20 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-base">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-sm text-on-surface truncate">{user?.name}</div>
                      <div className="text-xs text-muted truncate">{user?.email}</div>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3.5 p-3.5 bg-primary/10 text-primary font-bold rounded-2xl border border-primary/30 text-sm sm:text-base"
                    >
                      <Shield className="w-5 h-5" />
                      <span>{t('لوحة التحكم والإدارة', 'Admin Console')}</span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 p-3.5 bg-primary/10 text-primary rounded-2xl text-sm sm:text-base font-semibold border border-primary/20"
                  >
                    <Package className="w-5 h-5 text-primary" />
                    <span>{t('طلباتي والتتبع', 'My Orders')}</span>
                  </Link>

                  <Link
                    to="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 p-3.5 bg-secondary-bg rounded-2xl text-on-surface text-sm sm:text-base font-semibold"
                  >
                    <Settings className="w-5 h-5 text-muted" />
                    <span>{t('إعدادات الحساب', 'Account Settings')}</span>
                  </Link>


                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }}
                    className="w-full flex items-center gap-3.5 p-3.5 text-error bg-error/10 rounded-2xl font-bold text-sm sm:text-base"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('تسجيل الخروج', 'Sign Out')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3.5 text-center bg-primary/10 border border-primary/30 text-primary font-bold rounded-2xl text-xs sm:text-sm"
                  >
                    {t('تسجيل الدخول', 'Sign In')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3.5 text-center bg-primary text-on-primary font-bold rounded-2xl text-xs sm:text-sm shadow-gold-glow"
                  >
                    {t('حساب جديد', 'Create Account')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
