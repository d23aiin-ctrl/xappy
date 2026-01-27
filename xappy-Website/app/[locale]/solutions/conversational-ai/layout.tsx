import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversational AI - Chatbots & Voice Assistants | Mobirizer',
  description:
    'Build intelligent chatbots and voice assistants with natural language understanding. Multi-channel deployment on WhatsApp, web, mobile, and voice platforms.',
  keywords: 'Conversational AI, Chatbots, Voice AI, NLP, WhatsApp Bots, Customer Service AI',
  openGraph: {
    title: 'Conversational AI Solutions | Mobirizer',
    description: 'Intelligent chatbots and voice assistants for your business.',
    type: 'website',
  },
};

export default function ConversationalAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
