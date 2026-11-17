import React from 'react';
import { cn } from '../utils/helpers';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const badges = {
  PUBLIC: {
    icon: ShieldCheck,
    label: 'Public',
    className: 'bg-green-100 text-green-700',
  },
  FAMILY_ONLY: {
    icon: Shield,
    label: 'Family Only',
    className: 'bg-blue-100 text-blue-700',
  },
  PRIVATE: {
    icon: ShieldAlert,
    label: 'Private',
    className: 'bg-red-100 text-red-700',
  },
};

export default function PrivacyBadge({ level = 'PUBLIC', className = '' }) {
  const badge = badges[level] || badges.PUBLIC;
  const Icon = badge.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        badge.className,
        className
      )}
      title={`Privacy: ${badge.label}`}
    >
      <Icon size={12} />
      {badge.label}
    </span>
  );
}

