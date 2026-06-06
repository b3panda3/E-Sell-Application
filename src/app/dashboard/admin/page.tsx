'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Video,
  Star,
  X,
  Save,
  ArrowLeft,
  BarChart3,
  Play,
} from 'lucide-react';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  category?: string;
  featured: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const CATEGORIES = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'payments', label: 'Payments' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'ai', label: 'AI' },
  { value: 'storefront', label: 'Storefront' },
  { value: 'advanced', label: 'Advanced' },
];

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    description: '',
    category: 'getting-started',
    featured: false,
    sortOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [settingUpAdmin, setSettingUpAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (status === 'loading') return;
      if (!session?.user?.id) {
        setCheckingAdmin(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/check');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin === true);
        }
      } catch {
        // Not admin
      }
      setCheckingAdmin(false);
    }
    checkAdmin();
  }, [session, status]);

  // Fetch videos
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/education/videos');
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error('Fetch videos error:', error);
      } finally {
        setLoading(false);
      }
    }
    if (isAdmin) fetchVideos();
  }, [isAdmin]);

  // Compute YouTube preview directly from form data
  const previewYtId = formData.youtubeUrl ? extractYouTubeId(formData.youtubeUrl) : null;

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      youtubeUrl: '',
      description: '',
      category: 'getting-started',
      featured: false,
      sortOrder: 0,
      isActive: true,
    });
    setEditingVideo(null);
    setShowForm(false);
  }, []);

  const handleEdit = useCallback((video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      description: video.description || '',
      category: video.category || 'getting-started',
      featured: video.featured,
      sortOrder: video.sortOrder,
      isActive: video.isActive,
    });
    setShowForm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.title || !formData.youtubeUrl) return;
    setSaving(true);

    try {
      if (editingVideo) {
        const res = await fetch(`/api/education/videos/${editingVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const data = await res.json();
          setVideos((prev) =>
            prev.map((v) => (v.id === editingVideo.id ? data.video : v))
          );
        }
      } else {
        const res = await fetch('/api/education/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const data = await res.json();
          setVideos((prev) => [...prev, data.video]);
        }
      }
      resetForm();
    } catch (error) {
      console.error('Save video error:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, editingVideo, resetForm]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/education/videos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (error) {
      console.error('Delete video error:', error);
    }
  }, []);

  const handleSetupAdmin = useCallback(async () => {
    if (!session?.user?.email) return;
    setSettingUpAdmin(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });
      if (res.ok) {
        // Re-check admin status
        const checkRes = await fetch('/api/admin/check');
        if (checkRes.ok) {
          const data = await checkRes.json();
          setIsAdmin(data.isAdmin === true);
        }
      }
    } catch (error) {
      console.error('Setup admin error:', error);
    } finally {
      setSettingUpAdmin(false);
    }
  }, [session]);

  if (status === 'loading' || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006633] dark:border-emerald-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to access the admin dashboard.</p>
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">You do not have admin privileges to access this page.</p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSetupAdmin}
                disabled={settingUpAdmin || !session?.user?.email}
                className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
              >
                {settingUpAdmin ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {settingUpAdmin ? 'Setting Up...' : 'Setup Admin'}
              </Button>
              <Button
                render={<Link href="/" />}
                nativeButton={false}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalVideos = videos.length;
  const featuredCount = videos.filter((v) => v.featured).length;
  const activeCount = videos.filter((v) => v.isActive).length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/" />}
            nativeButton={false}
            className="mb-4 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#006633] dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage education videos and content</p>
              </div>
            </div>
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Video
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVideos}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Videos</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{featuredCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Featured</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingVideo ? 'Edit Video' : 'Add New Video'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Video title"
                      className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">YouTube URL *</Label>
                    <Input
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                    />
                    {formData.youtubeUrl && !previewYtId && (
                      <p className="text-xs text-red-500 mt-1">Could not extract YouTube video ID</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Video description"
                      rows={2}
                      className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: string | null) => {
                        if (value) setFormData({ ...formData, category: value });
                      }}
                    >
                      <SelectTrigger className="mt-1 w-full dark:bg-gray-800 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort Order</Label>
                    <Input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      className="mt-1 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>

                {/* Thumbnail Preview */}
                {previewYtId && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Thumbnail Preview</Label>
                    <div className="w-64 h-36 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={`https://img.youtube.com/vi/${previewYtId}/hqdefault.jpg`}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !formData.title || !formData.youtubeUrl}
                    className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    {editingVideo ? 'Update Video' : 'Add Video'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Videos Table */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Video</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order</th>
                    <th className="text-right p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#006633] dark:border-emerald-400 mx-auto" />
                      </td>
                    </tr>
                  ) : videos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8">
                        <Video className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No videos yet</p>
                      </td>
                    </tr>
                  ) : (
                    videos.map((video) => {
                      const ytId = extractYouTubeId(video.youtubeUrl);
                      return (
                        <tr key={video.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                                {ytId ? (
                                  <img
                                    src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <Play className="h-4 w-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                  {video.title}
                                </p>
                                {video.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                    {video.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {video.category?.replace('-', ' ') || 'Uncategorized'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {video.isActive ? (
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">Inactive</Badge>
                              )}
                              {video.featured && (
                                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                                  <Star className="h-3 w-3 mr-0.5" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{video.sortOrder}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEdit(video)}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(video.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
