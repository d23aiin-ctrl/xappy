import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import { HomePageContent } from './HomePageContent';

export const metadata: Metadata = {
  title: 'Mobirizer - AI Development Studio | Transform Your Business with AI',
  description:
    'Mobirizer - AI Development Studio delivering tailored AI solutions from strategy through implementation, designed to drive efficiency and growth.',
  keywords:
    'AI Development, Machine Learning, Conversational AI, Agentic AI, Voice AI, AI Strategy, AI Solutions, Mobirizer',
  openGraph: {
    title: 'Mobirizer - AI Development Studio',
    description:
      'Tailored AI solutions from strategy through implementation, designed to drive efficiency and growth.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function HomePage() {
  return (
    <>
      <Header activePage="home" />
      <HomePageContent />
      <Footer />
    </>
  );
}
