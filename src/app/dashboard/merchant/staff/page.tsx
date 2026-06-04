'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Mail, Phone, UserCircle } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
}

export default function StaffPage() {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [storefrontId, setStorefrontId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBio, setFormBio] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Fetch storefront first
        const sfRes = await fetch('/api/storefront');
        if (!sfRes.ok || cancelled) return;

        const sfData = await sfRes.json();
        const sfId: string | undefined = sfData.storefronts?.[0]?.id;
        if (!sfId || cancelled) {
          setLoading(false);
          return;
        }

        setStorefrontId(sfId);

        // Then fetch staff
        const staffRes = await fetch(`/api/staff?storefrontId=${sfId}`);
        if (staffRes.ok && !cancelled) {
          const staffData = await staffRes.json();
          setStaffList(staffData.staff || []);
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const handleAddStaff = async () => {
    if (!storefrontId || !formName.trim() || !formRole.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storefrontId,
          name: formName.trim(),
          role: formRole.trim(),
          email: formEmail.trim() || null,
          phone: formPhone.trim() || null,
          bio: formBio.trim() || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStaffList((prev) => [data.staff, ...prev]);
        setFormName('');
        setFormRole('');
        setFormEmail('');
        setFormPhone('');
        setFormBio('');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Add staff error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm(t('storefront.confirmDelete'))) return;

    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStaffList((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Delete staff error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006633] dark:border-emerald-400" />
      </div>
    );
  }

  if (!storefrontId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            {t('storefront.staffManagement')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('storefront.noStorefront')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            {t('storefront.staffManagement')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your team members and their roles
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('storefront.addStaff')}
        </Button>
      </div>

      {/* Add Staff Form */}
      {showAddForm && (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">{t('storefront.addStaff')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  {t('storefront.staffName')} *
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('storefront.staffNamePlaceholder')}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  {t('storefront.staffRole')} *
                </label>
                <Input
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder={t('storefront.staffRolePlaceholder')}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="staff@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                {t('storefront.staffBio')}
              </label>
              <Input
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder={t('storefront.staffBioPlaceholder')}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAddStaff}
                disabled={!formName.trim() || !formRole.trim() || submitting}
                className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
              >
                {submitting ? t('common.loading') : t('storefront.addStaffBtn')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormName('');
                  setFormRole('');
                  setFormEmail('');
                  setFormPhone('');
                  setFormBio('');
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      {staffList.length === 0 ? (
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No team members yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add staff members to help manage your store.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((member) => (
            <Card key={member.id} className="dark:bg-gray-900 dark:border-gray-800 group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center shrink-0">
                    {member.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.profileImageUrl}
                        alt={member.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-8 w-8 text-[#006633] dark:text-emerald-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {member.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {member.role}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteStaff(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {member.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {member.bio}
                      </p>
                    )}

                    <div className="flex flex-col gap-1 mt-2">
                      {member.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
