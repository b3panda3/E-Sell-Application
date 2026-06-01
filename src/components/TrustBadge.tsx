'use client';

import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrustBadgeProps {
  badge: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function TrustBadge({ badge, size = 'md', showLabel = true }: TrustBadgeProps) {
  const badgeConfig: Record<string, { icon: typeof ShieldCheck; label: string; color: string; bg: string }> = {
    GREEN: {
      icon: ShieldCheck,
      label: 'Trusted',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    },
    BLUE: {
      icon: Shield,
      label: 'Verified',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    RED: {
      icon: ShieldAlert,
      label: 'New',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    },
  };

  const config = badgeConfig[badge] || badgeConfig.RED;
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Badge className={`${config.bg} border gap-1 font-medium`}>
      <Icon className={iconSize} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}
