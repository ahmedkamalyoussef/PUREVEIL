import React, { useEffect, useState } from 'react';
import { UserCheck, Shield, Trash2, Search, User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { fetchUsersApi, updateUserRoleApi, deleteUserApi } from '../../services/apiService';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmModalContext';

export const AdminUsersPage: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsersApi();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showError(t('فشل تحميل قائمة المستخدمين', 'Failed to load users list'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    const isConfirmed = await confirm({
      title: t('تعديل صلاحية المستخدم', 'Update User Role'),
      message: t(`هل أنت تأكد من تغيير دور (${user.name}) إلى (${newRole})؟`, `Are you sure you want to change (${user.name}) role to (${newRole})?`),
      confirmText: t('تأكيد التغيير', 'Confirm Change'),
      cancelText: t('تراجع', 'Cancel'),
      type: 'warning'
    });

    if (!isConfirmed) return;

    try {
      await updateUserRoleApi(user.id, newRole);
      showSuccess(t('تم تحديث دور المستخدم بنجاح', 'User role updated successfully'));
      loadUsers();
    } catch (err) {
      showError(t('فشل تحديث دور المستخدم', 'Failed to update user role'));
    }
  };

  const handleDeleteUser = async (id: number | string, name: string) => {
    const isConfirmed = await confirm({
      title: t('حذف حساب المستخدم', 'Delete User Account'),
      message: t(`هل أنت تأكد من حذف حساب (${name}) بشكل نهائي؟`, `Are you sure you want to permanently delete user account (${name})?`),
      confirmText: t('نعم، احذفالحساب', 'Yes, Delete Account'),
      cancelText: t('تراجع', 'Cancel'),
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await deleteUserApi(id);
      showSuccess(t('تم حذف حساب المستخدم بنجاح', 'User account deleted successfully'));
      loadUsers();
    } catch (err) {
      showError(t('فشل حذف المستخدم', 'Failed to delete user'));
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          {t('إدارة المستخدمين والعملاء', 'Users & Customers Management')}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {t('استعراض حسابات العملاء وتعديل الصلاحيات الإدارية', 'View customer accounts and manage administrative privileges')}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('البحث عن طريق الاسم أو البريد...', 'Search by name or email...')}
            className="w-full bg-secondary-bg/80 border border-outline-variant/30 rounded-xl px-4 py-2.5 pl-10 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="text-xs text-muted font-mono">
          Total Users: <span className="font-bold text-primary">{filtered.length}</span>
        </div>
      </div>

      <div className="glass-panel-gold rounded-3xl p-6 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-muted">{t('جاري تحميل المستخدمين...', 'Loading users...')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-muted">{t('لا يوجد مستخدمين مطبقين', 'No users found')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs font-sans">
              <thead>
                <tr className="border-b border-outline-variant/20 text-muted uppercase text-[10px]">
                  <th className="py-3 px-4">{t('المستخدم', 'User')}</th>
                  <th className="py-3 px-4">{t('البريد الإلكتروني', 'Email')}</th>
                  <th className="py-3 px-4">{t('رقم الهاتف', 'Phone')}</th>
                  <th className="py-3 px-4">{t('الصلاحية', 'Role')}</th>
                  <th className="py-3 px-4 text-center">{t('الإجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-secondary-bg/40 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-on-surface">{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-muted font-mono">{u.email}</td>
                    <td className="py-3.5 px-4 text-muted font-mono">{u.phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                        u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary-bg text-muted'
                      }`}>
                        {u.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRoleToggle(u)}
                          className="px-2.5 py-1 bg-secondary-bg hover:bg-primary/20 hover:text-primary rounded-lg transition-colors text-[10px] font-bold"
                        >
                          {u.role === 'admin' ? t('تخفيض إلى زبون', 'Demote to Customer') : t('ترقية إلى أدمن', 'Promote to Admin')}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
