'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => {
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    const href = '/' + segments.slice(0, index + 1).join('/');
    return { label, href };
  });
}

export function TopBar() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="fixed left-[280px] right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-brand-light-gray bg-brand-cream px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 font-sans text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-brand-mid-gray/50">/</span>
            )}
            <span
              className={cn(
                index === breadcrumbs.length - 1
                  ? 'font-medium text-brand-black'
                  : 'text-brand-mid-gray'
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-mid-gray" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-full border border-brand-light-gray bg-white pl-9 pr-4 font-sans text-sm text-brand-black placeholder:text-brand-mid-gray/60 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
          />
        </div>

        {/* Notification bell */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-brand-mid-gray transition-colors hover:bg-brand-light-gray hover:text-brand-black"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-gold" />
        </button>

        {/* Profile avatar */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-gold/10 font-serif text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/20"
        >
          SS
        </button>
      </div>
    </header>
  );
}
