'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { LayoutDashboard, ClipboardList, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { Sidebar, SidebarSpacer } from '@/components/shared/sidebar';

const mobileNavItems = [
  { href: '/clinical', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clinical/cases', label: 'Cases', icon: ClipboardList },
  { href: '/clinical/escalations', label: 'Alerts', icon: AlertTriangle },
  { href: '/clinical/briefs', label: 'Briefs', icon: FileText },
  { href: '/clinical/schedule', label: 'Schedule', icon: Calendar },
];

export default function ClinicalLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'THERAPIST') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="oracle-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/10 z-40 safe-area-bottom">
        <div className="flex justify-around py-2 px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/clinical' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        <SidebarSpacer />
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
