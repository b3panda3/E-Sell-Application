'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft, Plus, Trash2, UserCircle, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Storefront {
  id: string;
  storeName: string | null;
  themeId: string | null;
  customColors: string | null;
  aboutUs: string | null;
  address: string | null;
  socialLinks: string | null;
  bankDetails: string | null;
  isActive: boolean;
  logoUrl: string | null;
  currency: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  profileImageUrl: string | null;
}

interface SocialLinks {
  twitter?: string;
  instagram?: string;
  telegram?: string;
  whatsapp?: string;
}

export default function CustomizeStorefrontPage() {
  const { t } = useTranslation();
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [aboutUs, setAboutUs] = useState('');
  const [address, setAddress] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#006633');
  const [secondaryColor, setSecondaryColor] = useState('#00875A');
  const [accentColor, setAccentColor] = useState('#FFB800');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    twitter: '',
    instagram: '',
    telegram: '',
    whatsapp: '',
  });
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newStaff, setNewStaff] = useState({ name: '', role: '', email: '', phone: '', bio: '' });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const sfRes = await fetch('/api/storefront');
        if (sfRes.ok) {
          const data = await sfRes.json();
          const sf = data.storefronts?.[0] || null;
          setStorefront(sf);
          if (sf) {
            setAboutUs(sf.aboutUs || '');
            setAddress(sf.address || '');
            setLogoUrl(sf.logoUrl || null);
            if (sf.socialLinks) {
              try {
                setSocialLinks(JSON.parse(sf.socialLinks));
              } catch { /* ignore */ }
            }
            if (sf.customColors) {
              try {
                const colors = JSON.parse(sf.customColors);
                setPrimaryColor(colors.primary || '#006633');
                setSecondaryColor(colors.secondary || '#00875A');
                setAccentColor(colors.accent || '#FFB800');
              } catch { /* ignore */ }
            }

            // Fetch staff
            const staffRes = await fetch(`/api/staff?storefrontId=${sf.id}`);
            if (staffRes.ok) {
              const staffData = await staffRes.json();
              setStaff(staffData.staff || []);
            }
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const customColors = JSON.stringify({
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      });
      const socialLinksJson = JSON.stringify(socialLinks);
      const addressWithContact = JSON.stringify({ address, phone, email });

      const res = await fetch('/api/storefront', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: storefront?.storeName || undefined,
          customColors,
          aboutUs,
          address: addressWithContact,
          socialLinks: socialLinksJson,
          logoUrl: logoUrl || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStorefront(data.storefront);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'logos');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.url);
      }
    } catch (error) {
      console.error('Logo upload error:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAddStaff = async () => {
    if (!storefront || !newStaff.name || !newStaff.role) return;

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storefrontId: storefront.id,
          ...newStaff,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStaff((prev) => [...prev, data.staff]);
        setNewStaff({ name: '', role: '', email: '', phone: '', bio: '' });
      }
    } catch (error) {
      console.error('Add staff error:', error);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      const res = await fetch(`/api/staff/${staffId}`, { method: 'DELETE' });
      if (res.ok) {
        setStaff((prev) => prev.filter((s) => s.id !== staffId));
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

  if (!storefront) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('storefront.noStorefront')}</p>
        <Button
          render={<Link href="/dashboard/merchant/storefront" />}
          nativeButton={false}
          className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('storefront.goSelectTheme')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/dashboard/merchant/storefront" />}
            nativeButton={false}
            className="mb-2 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('storefront.customize')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('storefront.customizeDesc')}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
        >
          <Save className="h-4 w-4" />
          {saving ? t('common.loading') : saved ? '✓ Saved!' : t('common.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">{t('storefront.logo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Store logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-3xl">🏪</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {t('storefront.logoHint')}
                </p>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {uploadingLogo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Customization */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">{t('storefront.colors')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm mb-1 block">{t('storefront.primaryColor')}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm mb-1 block">{t('storefront.secondaryColor')}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm mb-1 block">{t('storefront.accentColor')}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            {/* Preview */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-8 w-full rounded-lg" style={{ backgroundColor: primaryColor }} />
              <div className="h-8 w-full rounded-lg" style={{ backgroundColor: secondaryColor }} />
              <div className="h-8 w-full rounded-lg" style={{ backgroundColor: accentColor }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* About Us */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base">{t('storefront.aboutUs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={aboutUs}
            onChange={(e) => setAboutUs(e.target.value)}
            placeholder={t('storefront.aboutUsPlaceholder')}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base">{t('storefront.socialLinks')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1 block">Twitter / X</Label>
              <Input
                value={socialLinks.twitter || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Instagram</Label>
              <Input
                value={socialLinks.instagram || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">Telegram</Label>
              <Input
                value={socialLinks.telegram || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                placeholder="@username or t.me/..."
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">WhatsApp</Label>
              <Input
                value={socialLinks.whatsapp || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                placeholder="+234..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base">{t('storefront.contactInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-1 block">{t('storefront.address')}</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('storefront.addressPlaceholder')}
              />
            </div>
            <div>
              <Label className="text-sm mb-1 block">{t('storefront.phone')}</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm mb-1 block">{t('auth.email')}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Management */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            {t('storefront.staffManagement')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Staff */}
          {staff.length > 0 && (
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
                        <UserCircle className="h-4 w-4 text-[#006633] dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    {(member.email || member.phone) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-10">
                        {member.email}{member.email && member.phone ? ' · ' : ''}{member.phone}
                      </p>
                    )}
                    {member.bio && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-10 line-clamp-2">{member.bio}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteStaff(member.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Staff */}
          <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('storefront.addStaff')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">{t('storefront.staffName')} *</Label>
                <Input
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder={t('storefront.staffNamePlaceholder')}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">{t('storefront.staffRole')} *</Label>
                <Input
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  placeholder={t('storefront.staffRolePlaceholder')}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">{t('auth.email')}</Label>
                <Input
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="staff@example.com"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">{t('auth.phone')}</Label>
                <Input
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="+234..."
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs mb-1 block">{t('storefront.staffBio')}</Label>
                <Input
                  value={newStaff.bio}
                  onChange={(e) => setNewStaff({ ...newStaff, bio: e.target.value })}
                  placeholder={t('storefront.staffBioPlaceholder')}
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleAddStaff}
              disabled={!newStaff.name || !newStaff.role}
              className="mt-3 bg-[#006633] hover:bg-[#1B6B3A] text-white"
            >
              <Plus className="h-4 w-4" />
              {t('storefront.addStaffBtn')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button Bottom */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#006633] hover:bg-[#1B6B3A] text-white px-8"
        >
          <Save className="h-4 w-4" />
          {saving ? t('common.loading') : saved ? '✓ Saved!' : t('common.save')}
        </Button>
      </div>
    </div>
  );
}
