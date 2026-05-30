'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function CustomerDeleteAccountPage() {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setLoading(true);

    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        await signOut({ callbackUrl: '/' });
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('deleteAccount.title')}</h1>
        <p className="text-gray-600 mt-1">{t('deleteAccount.description')}</p>
      </div>

      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Warning: Irreversible Action
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-600">{t('deleteAccount.warning')}</p>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-red-700">
              {t('deleteAccount.confirmLabel')}
            </Label>
            <Input
              id="confirm-delete"
              placeholder={t('deleteAccount.confirmPlaceholder')}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="border-red-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={confirmText !== 'DELETE'}
                />
              }
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('deleteAccount.button')}
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 justify-end mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
