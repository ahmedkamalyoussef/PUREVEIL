import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderTree, Package,
  BarChart3, Settings, LogOut, Menu, X, ShieldCheck, Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';
import { getImageUrl } from '../utils/imageUrl';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, t } = useLanguage();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storeLogo = getImageUrl(settings.logo || '/logo.png');
  const storeName = lang === 'ar' ? (settings.storeName || 'PURE VEIL') : (settings.storeNameEn || 'PURE VEIL');

  const navItems = [
    { path: '/admin', label: t('لوحة التحكم', 'Dashboard'), icon: LayoutDashboard },
    { path: '/admin/products', label: t('إدارة العطور والمنتجات', 'Products Management'), icon: Package },
    { path: '/admin/categories', label: t('التصنيفات', 'Categories'), icon: FolderTree },
    { path: '/admin/orders', label: t('الطلبات والمبيعات', 'Orders & Sales'), icon: BarChart3 },
    { path: '/admin/users', label: t('المستخدمين والأدوار', 'Users & Roles'), icon: Users },
    { path: '/admin/reports', label: t('التقارير والتحليلات', 'Reports & Analytics'), icon: BarChart3 },
    { path: '/admin/settings', label: t('إعدادات المتجر', 'Store Settings'), icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col md:flex-row">

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container-lowest border-r border-outline-variant/15 p-6 sticky top-0 h-screen justify-between z-30">
        <div className="space-y-8">

          {/* Admin Header / Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-surface-container-high/90 border border-primary/40 p-1.5 flex items-center justify-center shadow-seal-shadow group-hover:border-primary group-hover:scale-105 transition-all duration-300 shrink-0">
                <img src={storeLogo} alt={storeName} className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(161,153,127,0.4)]" />
              </div>
              <span className="font-serif text-2xl font-bold gold-gradient-text">{storeName}</span>
            </Link>
            <div className="px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{t('لوحة الإدارة', 'Admin Console')}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1 font-sans text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${active
                      ? 'bg-primary text-on-primary font-bold shadow-gold-glow'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-secondary-bg'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="pt-4 border-t border-outline-variant/15 space-y-3 font-sans text-xs">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-on-surface-variant hover:text-primary transition-colors font-semibold"
          >
            <Home className="w-4 h-4" />
            <span>{t('العودة للمتجر', 'Back to Store')}</span>
          </Link>

          <div className="flex items-center justify-between px-3 py-2 bg-secondary-bg/50 rounded-xl">
            <div className="truncate">
              <div className="font-bold text-on-surface truncate">{user?.name}</div>
              <div className="text-[10px] text-muted truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title={t('تسجيل الخروج', 'Sign Out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-surface-container-lowest border-b border-outline-variant/15 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="PURE VEIL" className="h-7 w-auto" />
          <span className="font-serif text-xl font-bold gold-gradient-text">PURE VEIL ADMIN</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-on-surface hover:text-primary"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-serif text-2xl font-bold gold-gradient-text">PURE VEIL ADMIN</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-on-surface">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${active ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="pt-4 border-t border-outline-variant/15 flex justify-between items-center">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="text-primary font-bold text-sm">
              {t('العودة للمتجر', 'Back to Store')}
            </Link>
            <button onClick={() => { logout(); navigate('/'); }} className="text-red-400 font-bold text-sm">
              {t('تسجيل الخروج', 'Sign Out')}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};
