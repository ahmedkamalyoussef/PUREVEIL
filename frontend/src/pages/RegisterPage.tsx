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

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        <div className="glass-panel-gold rounded-3xl p-8 md:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <img src="/logo.png" alt="PURE VEIL" className="h-10 w-auto filter drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
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
