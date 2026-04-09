// DentalVision Pro - Utility Functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string into a human-readable form.
 * Example: "Apr 5, 2026"
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a number as USD currency.
 * Example: 3200 -> "$3,200"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Return a Tailwind color class for a given case status.
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    consultation: 'bg-brand-mid-gray/20 text-brand-mid-gray',
    capture:      'bg-brand-gold/20 text-brand-gold',
    analysis:     'bg-brand-gold/30 text-brand-gold',
    design:       'bg-brand-gold-light/20 text-brand-gold-light',
    treatment:    'bg-brand-gold/20 text-brand-gold',
    complete:     'bg-emerald-500/20 text-emerald-400',
  };
  return colors[status] ?? 'bg-brand-mid-gray/20 text-brand-mid-gray';
}

/**
 * Return a human-readable label for a case status.
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    consultation: 'Consultation',
    capture:      'Photo Capture',
    analysis:     'AI Analysis',
    design:       'Smile Design',
    treatment:    'In Treatment',
    complete:     'Complete',
  };
  return labels[status] ?? status;
}

/**
 * Generate a simple unique ID with an optional prefix.
 */
export function generateId(prefix = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}
