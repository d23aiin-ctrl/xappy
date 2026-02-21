import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xappy - Healthcare Management Platform | Mobirizer',
  description:
    'Xappy - Digital healthcare solutions for patient management and health services delivery. Electronic health records, multi-facility support, and government healthcare programs.',
  keywords: 'Xappy, Healthcare Platform, EHR, Health Records, Digital Healthcare, Government Healthcare, Sri Lanka',
  openGraph: {
    title: 'Xappy - Healthcare Management Platform | Mobirizer',
    description: 'Digital healthcare solutions for patient management and health services delivery.',
    type: 'website',
  },
};

export default function XappyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
