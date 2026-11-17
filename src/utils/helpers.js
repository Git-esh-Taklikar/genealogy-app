import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx for conditional class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get initials from a full name string.
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format a birth year or date for display.
 */
export function formatBirthYear(year, dob) {
  if (dob) {
    try {
      return new Date(dob).getFullYear().toString();
    } catch {
      return year ? String(year) : '';
    }
  }
  return year ? String(year) : '';
}

/**
 * Get a display-friendly relationship type label.
 */
export function getRelationshipLabel(relType) {
  const labels = {
    PARENT_OF: 'Parent',
    SPOUSE_OF: 'Spouse',
    CHILD_OF: 'Child',
  };
  return labels[relType] || relType;
}

/**
 * Gender display color helpers.
 */
export function getGenderColor(gender) {
  switch (gender?.toUpperCase()) {
    case 'M':
    case 'MALE':
      return 'bg-blue-100 text-blue-700';
    case 'F':
    case 'FEMALE':
      return 'bg-pink-100 text-pink-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

/**
 * Get the gender icon label.
 */
export function getGenderLabel(gender) {
  switch (gender?.toUpperCase()) {
    case 'M':
    case 'MALE':
      return '♂';
    case 'F':
    case 'FEMALE':
      return '♀';
    default:
      return '⚬';
  }
}

/**
 * Truncate a string to a max length.
 */
export function truncate(str, maxLen = 24) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

/**
 * Download a blob as a file.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate confetti particle data for celebration animations.
 */
export function generateConfetti(count = 40) {
  const colors = ['#f59e0b', '#d97706', '#6366f1', '#4f46e5', '#ec4899', '#10b981', '#f43f5e'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }));
}

/**
 * Debounce utility function.
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

