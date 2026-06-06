'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Lock, Eye, EyeOff, Phone, User, Store, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

const BUSINESS_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Food',
  'Consulting',
  'Tech',
  'Artisan',
  'Other',
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER' as 'MERCHANT' | 'CUSTOMER',
    businessCategory: '' as string | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          businessCategory: formData.businessCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#006633]/5 via-white to-[#00875A]/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-[#006633]/10">
        <CardHeader className="text-center space-y-2 pb-2">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="E-Sell" width={48} height={48} className="mx-auto rounded-xl mb-2" />
            <h1 className="text-3xl font-bold text-[#006633]">E-Sell</h1>
          </Link>
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>Join the blockchain-powered marketplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>I am a</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'MERCHANT' })}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  formData.role === 'MERCHANT'
                    ? 'border-[#006633] bg-[#006633]/5 text-[#006633]'
                    : 'border-muted hover:border-[#006633]/30'
                }`}
              >
                <Store className="h-8 w-8 mb-2" />
                <span className="font-semibold text-sm">Merchant</span>
                <span className="text-xs text-muted-foreground mt-1">Sell products & services</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'CUSTOMER' })}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  formData.role === 'CUSTOMER'
                    ? 'border-[#006633] bg-[#006633]/5 text-[#006633]'
                    : 'border-muted hover:border-[#006633]/30'
                }`}
              >
                <ShoppingCart className="h-8 w-8 mb-2" />
                <span className="font-semibold text-sm">Customer</span>
                <span className="text-xs text-muted-foreground mt-1">Browse & buy</span>
              </button>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            {formData.role === 'MERCHANT' && (
              <div className="space-y-2">
                <Label>Business Category</Label>
                <Select
                  value={formData.businessCategory || undefined}
                  onValueChange={(value) => value !== null && setFormData({ ...formData, businessCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-9 pr-9"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#006633] hover:bg-[#1B6B3A] text-white"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-[#006633] font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
