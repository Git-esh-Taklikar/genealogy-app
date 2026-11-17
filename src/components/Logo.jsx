import React from 'react';

const sizes = {
  sm: 32,
  md: 48,
  lg: 72,
};

export default function Logo({ size = 'md', className = '' }) {
  const s = sizes[size] || sizes.md;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={s}
      height={s}
      fill="none"
      className={className}
      aria-label="Genealogy logo"
    >
      <defs>
        <linearGradient id="logo-trunk" x1="32" y1="58" x2="32" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="logo-canopy" x1="32" y1="6" x2="32" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path d="M28 58 L28 34 Q28 28 32 26 Q36 28 36 34 L36 58 Z" fill="url(#logo-trunk)" />
      <path d="M30 36 Q22 30 16 24" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M34 36 Q42 30 48 24" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="14" r="8" fill="url(#logo-canopy)" stroke="#1e1b4b" strokeWidth="1.5" />
      <circle cx="18" cy="20" r="6" fill="url(#logo-canopy)" stroke="#1e1b4b" strokeWidth="1.5" />
      <circle cx="46" cy="20" r="6" fill="url(#logo-canopy)" stroke="#1e1b4b" strokeWidth="1.5" />
      <circle cx="10" cy="30" r="4.5" fill="#fcd34d" stroke="#1e1b4b" strokeWidth="1" />
      <circle cx="24" cy="28" r="4.5" fill="#fcd34d" stroke="#1e1b4b" strokeWidth="1" />
      <circle cx="40" cy="28" r="4.5" fill="#fcd34d" stroke="#1e1b4b" strokeWidth="1" />
      <circle cx="54" cy="30" r="4.5" fill="#fcd34d" stroke="#1e1b4b" strokeWidth="1" />
      <line x1="32" y1="22" x2="18" y2="20" stroke="#312e81" strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="22" x2="46" y2="20" stroke="#312e81" strokeWidth="1" opacity="0.5" />
      <line x1="18" y1="26" x2="10" y2="30" stroke="#312e81" strokeWidth="0.8" opacity="0.4" />
      <line x1="18" y1="26" x2="24" y2="28" stroke="#312e81" strokeWidth="0.8" opacity="0.4" />
      <line x1="46" y1="26" x2="40" y2="28" stroke="#312e81" strokeWidth="0.8" opacity="0.4" />
      <line x1="46" y1="26" x2="54" y2="30" stroke="#312e81" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

