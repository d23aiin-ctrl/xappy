'use client';

import { useSession } from 'next-auth/react';
import { Sidebar, SidebarSpacer } from './sidebar';
import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
}

export function AppLayout({
  children,
  showHeader = true,
  showSidebar = true,
}: AppLayoutProps) {
  const { data: session } = useSession();

  // Don't show sidebar for unauthenticated users
  const shouldShowSidebar = showSidebar && !!session;

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Sidebar - fixed position */}
      {shouldShowSidebar && <Sidebar />}

      {/* Main content wrapper */}
      <div className="flex">
        {/* Spacer to push content */}
        {shouldShowSidebar && <SidebarSpacer />}

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {showHeader && <AppHeader variant="minimal" />}
          {children}
        </div>
      </div>
    </div>
  );
}
