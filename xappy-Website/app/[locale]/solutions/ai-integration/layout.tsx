import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Integration Services - Connect AI to Your Systems | Mobirizer',
  description:
    'Seamlessly integrate AI capabilities into your existing workflows. API development, legacy system modernization, and data pipeline automation.',
  keywords: 'AI Integration, API Development, System Integration, Data Pipelines, AI Deployment, MLOps',
  openGraph: {
    title: 'AI Integration Services | Mobirizer',
    description: 'Connect AI to your existing systems and workflows.',
    type: 'website',
  },
};

export default function AIIntegrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
