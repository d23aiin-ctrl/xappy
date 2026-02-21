import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JanSeva - AI Citizen Engagement Platform | Mobirizer',
  description:
    'JanSeva - AI-powered citizen engagement platform for elected representatives. Connect with constituents via WhatsApp, manage grievances, and build digital presence.',
  keywords: 'JanSeva, Citizen Engagement, WhatsApp Bot, Grievance Management, MP MLA Platform, GovTech',
  openGraph: {
    title: 'JanSeva - AI Citizen Engagement Platform | Mobirizer',
    description: 'AI-powered platform for elected representatives to connect with citizens.',
    type: 'website',
  },
};

export default function JanSevaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
