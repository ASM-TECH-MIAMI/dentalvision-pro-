import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Sidebar />
      <TopBar />
      <main className="ml-[280px] mt-16 p-8">{children}</main>
    </div>
  );
}
