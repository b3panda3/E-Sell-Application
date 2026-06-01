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
import { Trash2, Camera } from 'lucide-react';

export default function CustomerSettingsPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(
    session?.user?.image || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image locally
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: Upload to Cloudinary in Phase 2
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 1000);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // TODO: Delete from Cloudinary & update DB in Phase 2
  };

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'C';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.customer.settings')}</h1>

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
                <AvatarFallback className="bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 text-2xl font-bold">
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
                Upload a profile picture to personalize your account.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
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
            <Input defaultValue={session?.user?.name || ''} className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">{t('auth.email')}</Label>
            <Input defaultValue={session?.user?.email || ''} disabled className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            {t('common.save')}
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
          <Button variant="destructive" render={<Link href="/dashboard/customer/delete" />} nativeButton={false}>
            <Trash2 className="h-4 w-4 mr-2" />
            {t('dashboard.customer.deleteAccount')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
