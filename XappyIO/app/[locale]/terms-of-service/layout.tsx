import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Mobirizer',
  description: 'Terms of Service for Mobirizer Services Pvt. Ltd. Read our terms and conditions for using our AI development services.',
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
