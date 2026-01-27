import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solutions | Mobirizer - AI Development Studio',
  description:
    'Mobirizer Solutions - Agentic AI, Conversational AI, AI Integration, and Custom AI Development services from strategy to production.',
  keywords:
    'AI Solutions, Agentic AI, Conversational AI, AI Integration, Custom AI Development, AI Strategy, AI Services',
  openGraph: {
    title: 'Solutions - Mobirizer AI Development Studio',
    description:
      'AI solutions from concept to production—strategy, development, integration, and ongoing support.',
    type: 'website',
  },
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
