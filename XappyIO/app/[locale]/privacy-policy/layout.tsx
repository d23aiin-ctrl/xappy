import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Mobirizer',
  description: 'Privacy Policy for Mobirizer Services Pvt. Ltd. Learn how we collect, use, and protect your personal data.',
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
