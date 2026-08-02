import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { lang, t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login({ email, password });
      showSuccess(t(`مرحباً بعودتك، ${loggedUser.name}!`, `Welcome back, ${loggedUser.name}!`));
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const msg = lang === 'ar'
        ? (err.response?.data?.message || 'فشل تسجيل الدخول')
        : (err.response?.data?.messageEn || 'Login failed');
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="glass-panel-gold rounded-3xl p-8 md:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <img src="/logo.png" alt="PURE VEIL" className="h-10 w-auto filter drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
              <span className="font-serif text-3xl font-bold gold-gradient-text tracking-wider">PURE VEIL</span>
            </Link>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">
              {t('تسجيل الدخول', 'Sign In')}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {t('أدخل بيانات حسابك للوصول إلى مجموعاتك المفضلة', 'Enter your credentials to access your luxury collection')}
            </p>
          </div>

          {/* Quick Demo Credentials Notice */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-xs space-y-1.5 text-on-surface-variant">
            <div className="font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{t('حسابات التجربة (2 أداوار):', 'Demo Accounts (2 Roles):')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('مدير النظام (Admin):', 'Admin:')}</span>
              <button
                onClick={() => { setEmail('admin@pureveil.com'); setPassword('Admin@123'); }}
                className="text-primary underline font-mono text-[11px]"
              >
                admin@pureveil.com
              </button>
            </div>
            <div className="flex justify-between">
              <span>{t('مستخدم عادي (User):', 'User:')}</span>
              <button
                onClick={() => { setEmail('mohammed@example.com'); setPassword('User@123'); }}
                className="text-primary underline font-mono text-[11px]"
              >
                mohammed@example.com
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                {t('البريد الإلكتروني', 'Email Address')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@pureveil.com"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3.5 pl-11 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
                />
                <Mail className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                {t('كلمة المرور', 'Password')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3.5 pl-11 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
                <Lock className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-xl text-base tracking-wider hover:brightness-110 transition-all shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('دخول الحساب', 'Sign In')}</span>
                  {lang === 'ar' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10 flex justify-between items-center">
            <span>{t('ليس لديك حساب؟', "Don't have an account?")}</span>
            <Link to="/register" className="text-primary font-bold hover:underline">
              {t('إنشاء حساب جديد', 'Create Account')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
