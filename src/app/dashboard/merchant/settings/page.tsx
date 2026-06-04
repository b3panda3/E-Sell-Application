'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Trash2, Camera, Check } from 'lucide-react';

export default function MerchantSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track local edits separately from session-derived defaults.
  // If the user hasn't edited, we show the session value directly.
  const [localEdits, setLocalEdits] = useState<{ name?: string; image?: string | null }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Derive display values: prefer local edits, fall back to session
  const name = localEdits.name !== undefined ? localEdits.name : (session?.user?.name || '');
  const profileImage = localEdits.image !== undefined ? localEdits.image : (session?.user?.image || null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(file);
      });

      // Preview locally immediately
      setLocalEdits((prev) => ({ ...prev, image: base64 }));

      // Save to database
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (res.ok) {
        // Don't pass large base64 through JWT — just flag that image was updated.
        // The session callback will fetch the fresh image from DB.
        // Clear local image edit so session value takes over after refresh.
        setLocalEdits((prev) => {
          const next = { ...prev };
          delete next.image;
          return next;
        });
        await updateSession({ imageUpdated: true });
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setLocalEdits((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: '' }),
      });
      await updateSession({ imageUpdated: true });
    } catch (error) {
      console.error('Remove image error:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const body: { name: string } = { name: name.trim() };

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaved(true);
        // Clear local name edit so session value takes over
        setLocalEdits((prev) => {
          const next = { ...prev };
          delete next.name;
          return next;
        });
        // Update session with name; image is handled via imageUpdated flag
        await updateSession({ name: name.trim(), imageUpdated: true });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'M';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.merchant.settings')}</h1>

      {/* Profile Picture */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('settings.profilePicture')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage || undefined} alt={session?.user?.name || 'Profile'} />
                <AvatarFallback className="bg-[#006633]/10 text-[#006633] dark:bg-emerald-400/10 dark:text-emerald-400 text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={t('settings.uploadPhoto')}
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Upload a profile picture. This will also appear on your storefront staff section.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-[#006633] text-[#006633] dark:border-emerald-400 dark:text-emerald-400"
                >
                  {isUploading ? t('common.loading') : t('settings.uploadPhoto')}
                </Button>
                {profileImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                  >
                    {t('settings.removePhoto')}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('settings.profileInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">{t('auth.name')}</Label>
            <Input value={name} onChange={(e) => setLocalEdits((prev) => ({ ...prev, name: e.target.value }))} className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">{t('auth.email')}</Label>
            <Input value={session?.user?.email || ''} disabled className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400" />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
          >
            {saving ? t('common.loading') : saved ? <><Check className="h-4 w-4 mr-1" />Saved!</> : t('common.save')}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {t('settings.dangerZone')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('settings.deleteWarning')}
          </p>
          <Button variant="destructive" render={<Link href="/dashboard/merchant/delete" />} nativeButton={false}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t('dashboard.merchant.deleteAccount')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
