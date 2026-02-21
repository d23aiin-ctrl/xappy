import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import { HomePageContent } from './HomePageContent';

export const metadata: Metadata = {
  title: 'Xappy - AI-First Customer Experience Platform | Igniting Connections',
  description:
    'Xappy helps businesses automate, personalize, and scale customer interactions across channels using AI-powered conversational experiences — from sales and onboarding to support and retention.',
  keywords:
    'Conversational AI, Customer Experience, AI Chatbot, Virtual Assistant, Omnichannel, WhatsApp Business, Customer Support Automation, Xappy',
  openGraph: {
    title: 'Xappy - Igniting Connections',
    description:
      'Conversations that convert. Support that scales. Experience that feels human.',
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
