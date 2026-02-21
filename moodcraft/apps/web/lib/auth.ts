import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      organizationId?: string | null;
    };
  }
  interface User {
    role: Role;
    organizationId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    organizationId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/onboarding',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account has been deactivated');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      if (trigger === 'update' && session) {
        token.role = session.role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
    async signIn({ user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (dbUser && !dbUser.isActive) {
        return false;
      }
      return true;
    },
  },
};

export function getRoleRedirect(role: Role): string {
  switch (role) {
    case 'INDIVIDUAL':
      return '/dashboard';
    case 'HR':
      return '/corporate';
    case 'THERAPIST':
      return '/clinical';
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin';
    default:
      return '/dashboard';
  }
}

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  INDIVIDUAL: ['self:read', 'self:write', 'mood:write', 'journal:write', 'companion:chat', 'community:participate'],
  HR: ['corporate:read', 'corporate:reports', 'department:read'],
  THERAPIST: ['clinical:read', 'clinical:write', 'escalation:manage', 'brief:read'],
  ADMIN: ['admin:read', 'admin:write', 'users:manage', 'audit:read'],
  SUPER_ADMIN: ['admin:read', 'admin:write', 'users:manage', 'audit:read', 'system:manage', 'roles:manage'],
};

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
