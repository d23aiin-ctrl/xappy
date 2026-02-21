'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Home,
  Brain,
  BookOpen,
  Wind,
  MessageCircle,
  Sparkles,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  Activity,
  Building2,
  TrendingUp,
  AlertTriangle,
  Stethoscope,
  ClipboardList,
  UserCog,
  BarChart3,
  Heart,
  Mic,
  Calendar,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

const INDIVIDUAL_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Mood Mirror', href: '/mood-mirror', icon: <Heart className="w-5 h-5" /> },
  { label: 'Journal', href: '/journal', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Breath Loops', href: '/breath-loops', icon: <Wind className="w-5 h-5" /> },
  { label: 'AI Companion', href: '/companion', icon: <MessageCircle className="w-5 h-5" /> },
  { label: 'AI Twin', href: '/ai-twin', icon: <Brain className="w-5 h-5" />, badge: 'PRO' },
  { label: 'Community', href: '/community', icon: <Users className="w-5 h-5" /> },
  { label: 'Profile', href: '/profile', icon: <User className="w-5 h-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];

const THERAPIST_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/clinical', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Active Cases', href: '/clinical/cases', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Escalations', href: '/clinical/escalations', icon: <AlertTriangle className="w-5 h-5" /> },
  { label: 'AI Briefs', href: '/clinical/briefs', icon: <FileText className="w-5 h-5" /> },
  { label: 'Schedule', href: '/clinical/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'My Profile', href: '/clinical/profile', icon: <Stethoscope className="w-5 h-5" /> },
  { label: 'Settings', href: '/clinical/settings', icon: <Settings className="w-5 h-5" /> },
];

const HR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/corporate', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Stress Heatmap', href: '/corporate/heatmap', icon: <Activity className="w-5 h-5" /> },
  { label: 'Attrition Risk', href: '/corporate/attrition', icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Departments', href: '/corporate/departments', icon: <Building2 className="w-5 h-5" /> },
  { label: 'ESG Reports', href: '/corporate/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Insights', href: '/corporate/insights', icon: <Brain className="w-5 h-5" /> },
  { label: 'Settings', href: '/corporate/settings', icon: <Settings className="w-5 h-5" /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Therapists', href: '/admin/therapists', icon: <Stethoscope className="w-5 h-5" /> },
  { label: 'Organizations', href: '/admin/organizations', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Audit Logs', href: '/admin/audit', icon: <FileText className="w-5 h-5" /> },
  { label: 'Compliance', href: '/admin/compliance', icon: <Shield className="w-5 h-5" /> },
  { label: 'Permissions', href: '/admin/permissions', icon: <UserCog className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

const ROLE_NAV_MAP: Record<string, NavItem[]> = {
  INDIVIDUAL: INDIVIDUAL_NAV,
  THERAPIST: THERAPIST_NAV,
  HR: HR_NAV,
  ADMIN: ADMIN_NAV,
  SUPER_ADMIN: ADMIN_NAV,
};

const ROLE_COLORS: Record<string, { gradient: string; accent: string }> = {
  INDIVIDUAL: { gradient: 'from-veil-500 to-oracle-500', accent: 'veil' },
  THERAPIST: { gradient: 'from-cyan-500 to-blue-500', accent: 'cyan' },
  HR: { gradient: 'from-amber-500 to-orange-500', accent: 'amber' },
  ADMIN: { gradient: 'from-emerald-500 to-teal-500', accent: 'emerald' },
  SUPER_ADMIN: { gradient: 'from-red-500 to-pink-500', accent: 'red' },
};

const ROLE_LABELS: Record<string, string> = {
  INDIVIDUAL: 'Personal Wellness',
  THERAPIST: 'Clinical Portal',
  HR: 'Corporate Wellness',
  ADMIN: 'Administration',
  SUPER_ADMIN: 'Super Admin',
};

interface SidebarProps {
  defaultCollapsed?: boolean;
}

export function Sidebar({ defaultCollapsed = false }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Restore collapsed state from localStorage
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    }
  }, [collapsed, mounted]);

  if (!session) return null;

  const role = (session?.user as any)?.role || 'INDIVIDUAL';
  const navItems = ROLE_NAV_MAP[role] || INDIVIDUAL_NAV;
  const colors = ROLE_COLORS[role] || ROLE_COLORS.INDIVIDUAL;
  const roleLabel = ROLE_LABELS[role] || 'Personal Wellness';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 h-screen z-40',
        'bg-[#0a0a12]/95 backdrop-blur-xl',
        'border-r border-white/5',
        'flex flex-col',
        'hidden lg:flex'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            `bg-gradient-to-br ${colors.gradient}`
          )}>
            <Brain className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-display text-xl font-bold whitespace-nowrap"
              >
                <span className="text-gradient-veil">Cere</span>
                <span className="text-gradient-oracle">Bro</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Role Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-b border-white/5"
          >
            <div className={cn(
              'px-3 py-2 rounded-lg',
              `bg-gradient-to-r ${colors.gradient}/10`,
              'border border-white/10'
            )}>
              <p className="text-xs text-gray-400">Portal</p>
              <p className={cn('text-sm font-semibold', `text-${colors.accent}-400`)}>
                {roleLabel}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    'group relative',
                    isActive
                      ? `bg-gradient-to-r ${colors.gradient}/20 text-white border border-white/10`
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className={cn(
                        'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full',
                        `bg-gradient-to-b ${colors.gradient}`
                      )}
                    />
                  )}

                  <span className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive && `text-${colors.accent}-400`
                  )}>
                    {item.icon}
                  </span>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {item.badge && !collapsed && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-bold rounded-full',
                        `bg-gradient-to-r ${colors.gradient} text-white`
                      )}
                    >
                      {item.badge}
                    </motion.span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-[#1a1a2e] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-white/10 shadow-xl">
                      <span className="text-sm text-white">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          'ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full',
                          `bg-gradient-to-r ${colors.gradient} text-white`
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Help & Support */}
      <div className="p-3 border-t border-white/5">
        <Link
          href="/help"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
            'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          <HelpCircle className="w-5 h-5" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Help & Support
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl',
            'text-gray-400 hover:text-white hover:bg-white/5 transition-all'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User Section */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-white/5"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              `bg-gradient-to-br ${colors.gradient}/20 border border-white/10`
            )}>
              <User className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}

export function SidebarSpacer() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }

    // Listen for storage changes
    const handleStorage = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    };

    window.addEventListener('storage', handleStorage);

    // Also poll for changes (for same-tab updates)
    const interval = setInterval(handleStorage, 100);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="hidden lg:block flex-shrink-0 transition-all duration-200"
      style={{ width: collapsed ? 72 : 256 }}
    />
  );
}
