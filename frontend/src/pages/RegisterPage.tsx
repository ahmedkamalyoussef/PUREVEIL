import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { lang, t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      const msg = t('كلمتا المرور غير متطابقتين', 'Passwords do not match');
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      showSuccess(t('أهلاً بك في بيور فيل! تم إنشاء حسابك بنجاح', 'Welcome to PURE VEIL! Account created successfully'));
      navigate('/');
    } catch (err: any) {
      const msg = lang === 'ar'
        ? (err.response?.data?.message || 'فشل إنشاء الحساب')
        : (err.response?.data?.messageEn || 'Registration failed');
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleRegister = async () => {
    // Ready for Apple OAuth / Register with Apple integration
    try {
      showSuccess(t('خدمة التسجيل عبر Apple / iCloud ستكون متاحة قريباً', 'Apple / iCloud Sign-Up will be available soon'));
    } catch (err) {
      console.error('Apple Auth Error:', err);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="glass-panel-gold rounded-3xl p-8 md:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-full bg-surface-container-high/90 border border-primary/40 p-1.5 flex items-center justify-center shadow-seal-shadow group-hover:border-primary group-hover:scale-105 transition-all duration-300 shrink-0">
                <img src="/logo.png" alt="PURE VEIL" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(161,153,127,0.4)]" />
              </div>
              <span className="font-serif text-3xl font-bold gold-gradient-text tracking-wider">PURE VEIL</span>
            </Link>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">
              {t('إنشاء حساب جديد', 'Create Account')}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {t('انضم لدار بيور فيل واستمتع بمميزات وخصومات عطرية حصرية', 'Join PURE VEIL for exclusive fragrance privileges')}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                {t('الاسم الكامل', 'Full Name')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t('أحمد المنصور', 'John Doe')}
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 pl-11 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
                <User className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                {t('البريد الإلكتروني', 'Email Address')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 pl-11 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
                />
                <Mail className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                {t('كلمة المرور', 'Password')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 pl-11 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
                <Lock className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                {t('تأكيد كلمة المرور', 'Confirm Password')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 pl-11 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
                <Lock className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-hover text-on-primary font-bold rounded-xl text-base tracking-wider hover:brightness-110 transition-all shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('إنشاء الحساب', 'Create Account')}</span>
                  {lang === 'ar' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>
          </form>

          {/* Social / Apple Sign In Divider & Button */}
          <div className="space-y-4 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-outline-variant/20 w-full" />
              <span className="bg-secondary-bg px-3 text-[10px] text-muted font-bold tracking-widest uppercase shrink-0 rounded-full border border-outline-variant/20">
                {t('أو عبر', 'OR')}
              </span>
              <div className="border-t border-outline-variant/20 w-full" />
            </div>

            <button
              type="button"
              onClick={handleAppleRegister}
              disabled={true}
              className="w-full py-3.5 px-4 bg-secondary-bg/90 border border-outline-variant/30 text-on-surface rounded-xl font-semibold text-xs transition-all flex items-center justify-between gap-3 opacity-75 cursor-not-allowed hover:bg-secondary-bg group"
              title={t('التسجيل باستخدام Apple iCloud (قريباً)', 'Sign up with Apple iCloud (Coming Soon)')}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 fill-primary shrink-0 opacity-90" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.64c.67-.82 1.12-1.96.99-3.1-.97.04-2.14.65-2.83 1.46-.62.72-1.16 1.88-1.01 3.01 1.08.08 2.18-.55 2.85-1.37z"/>
                </svg>
                <span>{t('التسجيل بحساب Apple / iCloud', 'Sign up with Apple / iCloud')}</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/30 text-primary rounded-full">
                {t('قريباً', 'SOON')}
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/10 flex justify-between items-center">
            <span>{t('لديك حساب بالفعل؟', 'Already have an account?')}</span>
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t('تسجيل الدخول', 'Sign In')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
