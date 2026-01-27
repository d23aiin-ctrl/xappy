import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp Commerce - Sell Directly on WhatsApp | Mobirizer',
  description:
    'WhatsApp Commerce Platform - Enable customers to discover, browse, and purchase directly on WhatsApp. Product catalogs, native payments, automated checkout, and CRM integrations.',
  keywords: 'WhatsApp Commerce, WhatsApp Business API, WhatsApp Catalog, WhatsApp Payments, Conversational Commerce, WhatsApp Shopping',
  openGraph: {
    title: 'WhatsApp Commerce - Sell on WhatsApp | Mobirizer',
    description: 'Turn WhatsApp into your storefront. Product catalogs, native payments, and automated checkout.',
    type: 'website',
  },
};

export default function WhatsAppCommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
