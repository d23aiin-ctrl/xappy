import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RoboGuru - AI Education Platform | Mobirizer',
  description:
    'RoboGuru - AI-powered education platform with photo-to-solution technology and adaptive learning for students.',
  keywords: 'RoboGuru, AI Tutor, Education AI, Photo to Solution, Adaptive Learning',
  openGraph: {
    title: 'RoboGuru - AI Education Platform | Mobirizer',
    description: 'Photo-to-solution AI tutor for students.',
    type: 'website',
  },
};

export default function RoboGuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
