import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'CereBro - Your Mental Wellness Companion',
  description: 'A narrative-driven mental wellness platform that guides you through self-discovery, emotional awareness, and personal growth.',
  keywords: ['mental health', 'wellness', 'therapy', 'mindfulness', 'journaling'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-gradient-midnight min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
