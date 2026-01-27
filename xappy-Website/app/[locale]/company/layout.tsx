import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company | Mobirizer - AI Development Studio',
  description:
    'About Mobirizer - AI Development Studio founded in 2014, now an AI-first company serving government, education, and enterprise clients.',
  keywords: 'Mobirizer, AI Company, About Us, AI Development Studio, New Delhi',
  openGraph: {
    title: 'Company - Mobirizer AI Development Studio',
    description: 'AI Development Studio since 2014.',
    type: 'website',
  },
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
