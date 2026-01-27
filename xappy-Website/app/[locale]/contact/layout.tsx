import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Mobirizer - AI Development Studio',
  description:
    'Contact Mobirizer - Get in touch with our AI development team. Email, phone, or visit our office in New Delhi.',
  keywords: 'Contact Mobirizer, AI Development, New Delhi, India',
  openGraph: {
    title: 'Contact - Mobirizer AI Development Studio',
    description: 'Get in touch with our AI development team.',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
