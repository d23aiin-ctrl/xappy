'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Home, Brain, BookOpen, Wind, MessageCircle, Users, Sparkles } from 'lucide-react';
import { Sidebar, SidebarSpacer } from '@/components/shared/sidebar';
import { SOSButton } from '@/components/shared/sos-button';

const mobileNavItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/mood-mirror', label: 'Mood', icon: Brain },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/breath-loops', label: 'Breathe', icon: Wind },
  { href: '/ai-twin', label: 'AI Twin', icon: Sparkles },
];

export default function B2CLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <div className="oracle-spinner" />
      </div>
    );
  }

  const isOnboarding = pathname?.startsWith('/onboarding');

  return (
    <div className="min-h-screen bg-midnight-950">
      {!isOnboarding && (
        <>
          {/* Desktop Sidebar - New Component */}
          <Sidebar />

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/10 z-40 safe-area-bottom">
            <div className="flex justify-around py-2 px-2">
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                      isActive
                        ? 'text-veil-400 bg-veil-500/10'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-veil-400' : ''}`} />
                    <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}

      {/* Main Content */}
      <div className="flex">
        {!isOnboarding && <SidebarSpacer />}
        <main className={`flex-1 min-w-0 ${!isOnboarding ? 'pb-20 lg:pb-0' : ''}`}>
          {children}
        </main>
      </div>

      {/* SOS Button */}
      {!isOnboarding && <SOSButton />}
    </div>
  );
}
