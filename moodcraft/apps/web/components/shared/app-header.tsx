'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  Brain,
  Menu,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AppHeaderProps {
  variant?: 'default' | 'minimal';
}

const ROLE_HOME_ROUTES: Record<string, string> = {
  INDIVIDUAL: '/dashboard',
  THERAPIST: '/clinical',
  HR: '/corporate',
  ADMIN: '/admin',
  SUPER_ADMIN: '/admin',
};

const ROLE_LABELS: Record<string, string> = {
  INDIVIDUAL: 'User',
  THERAPIST: 'Therapist',
  HR: 'HR Manager',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export function AppHeader({ variant = 'default' }: AppHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = (session?.user as any)?.role || 'INDIVIDUAL';
  const homeRoute = ROLE_HOME_ROUTES[role] || '/dashboard';
  const roleLabel = ROLE_LABELS[role] || 'User';

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-midnight-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={session ? homeRoute : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-veil-500 to-oracle-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold">
            <span className="text-gradient-veil">Cere</span>
            <span className="text-gradient-oracle">Bro</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        {session && variant === 'default' && (
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href={homeRoute} icon={<Home className="w-4 h-4" />}>
              Home
            </NavLink>
            {role === 'INDIVIDUAL' && (
              <>
                <NavLink href="/mood-mirror">Mood</NavLink>
                <NavLink href="/journal">Journal</NavLink>
                <NavLink href="/breath-loops">Breathe</NavLink>
                <NavLink href="/companion">Companion</NavLink>
                <Link
                  href="/agent"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-300 hover:text-white hover:from-violet-500/20 hover:to-fuchsia-500/20 border border-violet-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Agent
                </Link>
              </>
            )}
            {role === 'THERAPIST' && (
              <>
                <NavLink href="/clinical">Cases</NavLink>
                <NavLink href="/clinical/profile">My Profile</NavLink>
              </>
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-white/5"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-veil-500/20 to-oracle-500/20 border border-white/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-veil-400" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-white leading-none">
                        {session.user?.name?.split(' ')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 leading-none mt-0.5">{roleLabel}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#12121a] border-white/10"
                >
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-sm font-medium text-white">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>
                  {role === 'INDIVIDUAL' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {role === 'THERAPIST' && (
                    <DropdownMenuItem asChild>
                      <Link href="/clinical/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-400 focus:text-red-400 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && session && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-[#0a0a12]"
          >
            <nav className="flex flex-col p-4 gap-1">
              {role === 'INDIVIDUAL' && (
                <>
                  <MobileNavLink href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </MobileNavLink>
                  <MobileNavLink href="/mood-mirror" onClick={() => setMobileMenuOpen(false)}>
                    Mood Mirror
                  </MobileNavLink>
                  <MobileNavLink href="/journal" onClick={() => setMobileMenuOpen(false)}>
                    Journal
                  </MobileNavLink>
                  <MobileNavLink href="/breath-loops" onClick={() => setMobileMenuOpen(false)}>
                    Breath Loops
                  </MobileNavLink>
                  <MobileNavLink href="/companion" onClick={() => setMobileMenuOpen(false)}>
                    AI Companion
                  </MobileNavLink>
                  <Link
                    href="/agent"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-violet-300 border border-violet-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Agent
                    <span className="text-xs bg-violet-500/30 px-1.5 py-0.5 rounded">NEW</span>
                  </Link>
                  <MobileNavLink href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </MobileNavLink>
                  <MobileNavLink href="/settings" onClick={() => setMobileMenuOpen(false)}>
                    Settings
                  </MobileNavLink>
                </>
              )}
              {role === 'THERAPIST' && (
                <>
                  <MobileNavLink href="/clinical" onClick={() => setMobileMenuOpen(false)}>
                    Cases
                  </MobileNavLink>
                  <MobileNavLink href="/clinical/profile" onClick={() => setMobileMenuOpen(false)}>
                    My Profile
                  </MobileNavLink>
                </>
              )}
              {role === 'HR' && (
                <MobileNavLink href="/corporate" onClick={() => setMobileMenuOpen(false)}>
                  Corporate Dashboard
                </MobileNavLink>
              )}
              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                <MobileNavLink href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  Admin Dashboard
                </MobileNavLink>
              )}
              <div className="pt-2 mt-2 border-t border-white/5">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}
