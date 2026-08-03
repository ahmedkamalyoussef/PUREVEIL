import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Lock, Save, KeyRound, LogOut, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmModalContext';
import { updateProfileApi, updatePasswordApi } from '../services/apiService';


export const AccountSettingsPage: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();

  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleLogoutConfirm = async () => {
    const isConfirmed = await confirm({
      title: t('تسجيل الخروج من الحساب', 'Sign Out of Account'),
      message: t('هل أنت تأكد من تسجيل الخروج من حسابك بدار بيور فيل؟', 'Are you sure you want to sign out of your PURE VEIL account?'),
      confirmText: t('تسجيل الخروج', 'Sign Out'),
      cancelText: t('تراجع', 'Cancel'),
      type: 'warning'
    });

    if (isConfirmed) {
      logout();
      showSuccess(t('تم تسجيل الخروج بنجاح', 'Signed out successfully'));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const updated = await updateProfileApi({ name });
      setUser(prev => prev ? { ...prev, name: updated.name } : null);
      showSuccess(t('تم تحديث بيانات الملف الشخصي بنجاح', 'Profile updated successfully'));
    } catch (err: any) {
      showError(err.response?.data?.message || t('حدث خطأ أثناء التحديث', 'Update failed'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showError(t('كلمتا المرور غير متطابقتين', 'Passwords do not match'));
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePasswordApi({ currentPassword, newPassword });
      showSuccess(t('تم تغيير كلمة المرور بنجاح', 'Password changed successfully'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showError(err.response?.data?.message || t('فشل تغيير كلمة المرور', 'Password change failed'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-gutter pt-32 pb-20 space-y-10">

      {/* Header */}
      <div className="border-b border-outline-variant/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-on-surface">
            {t('إعدادات الحساب الشخصي', 'Account Settings')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('إدارة بيانات حسابك في دار بيور فيل وكلمة المرور ومتابعة الطلبات', 'Manage your personal profile, security, and track your orders')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-gold-glow"
          >
            <Package className="w-4 h-4" />
            <span>{t('طلباتي والتتبع', 'My Orders')}</span>
          </Link>
          <button
            onClick={handleLogoutConfirm}
            className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('تسجيل الخروج', 'Sign Out')}</span>
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Profile Info Form */}
        <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-on-surface">
                {t('الملف الشخصي', 'Personal Profile')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {user?.email} ({user?.role === 'admin' ? t('مدير النظام', 'Admin') : t('عميل بيور فيل', 'User')})
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                {t('الاسم الكامل', 'Full Name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                {t('البريد الإلكتروني (غير قابل للتعديل)', 'Email (Read-only)')}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-secondary-bg/40 border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-muted cursor-not-allowed font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-gold-glow disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{profileLoading ? t('جاري الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel-gold rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-on-surface">
                {t('تغيير كلمة المرور', 'Change Password')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('تحديث كلمة المرور لحماية حسابك في المتجر', 'Update your password to keep your account secure')}
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                {t('كلمة المرور الحالية', 'Current Password')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                {t('كلمة المرور الجديدة', 'New Password')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">
                {t('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-3.5 bg-primary text-on-primary font-bold rounded-xl text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-gold-glow disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordLoading ? t('جاري التغيير...', 'Updating...') : t('تحديث كلمة المرور', 'Update Password')}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
