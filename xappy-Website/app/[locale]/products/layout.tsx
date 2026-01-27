import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | Mobirizer - AI Development Studio',
  description:
    'Mobirizer Products - AI solutions including D23.ai, RoboGuru, OHGRT, Xappy, and JanSeva serving millions of users worldwide.',
  keywords:
    'AI Products, D23.ai, RoboGuru, OHGRT, Xappy, JanSeva, Government AI, Education AI, Healthcare AI',
  openGraph: {
    title: 'Products - Mobirizer AI Development Studio',
    description:
      'AI solutions serving millions of users worldwide across government, education, and enterprise sectors.',
    type: 'website',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
