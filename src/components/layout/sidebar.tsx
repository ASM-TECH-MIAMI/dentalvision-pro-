'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Camera,
  Scan,
  Video,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Capture', href: '/capture/case-001', icon: Camera },
  { label: 'Workspace', href: '/workspace/case-001', icon: Scan },
  { label: 'Consultations', href: '/consult/case-001', icon: Video },
  { label: 'Treatment Plans', href: '/treatment/case-001', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col bg-brand-charcoal">
      {/* Logo */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="font-serif text-lg font-bold uppercase tracking-widest text-brand-gold">
          DentalVision Pro
        </h1>
        <p className="mt-1 font-sans text-xs text-brand-mid-gray">
          AI Smile Design Studio
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => {
          const basePath = item.href.split('/').slice(0, 2).join('/');
          const isActive =
            pathname === item.href || pathname.startsWith(basePath + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-[14px] px-4 py-2.5 font-sans text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-4 border-brand-gold text-brand-gold bg-brand-gold/5'
                  : 'border-l-4 border-transparent text-brand-mid-gray hover:text-brand-cream hover:bg-white/5'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Doctor info */}
      <div className="border-t border-brand-warm-gray/20 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-gold/10">
            <span className="font-serif text-sm font-semibold text-brand-gold">
              SS
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-sans text-sm font-medium text-brand-cream">
              Dr. Sam Saleh
            </p>
            <p className="truncate font-sans text-xs text-brand-mid-gray">
              Ora Dentistry Spa
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
