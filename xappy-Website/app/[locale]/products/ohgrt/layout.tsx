import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OHGRT - AI Voice Generation Studio | Mobirizer',
  description:
    'OHGRT - AI Voice Generation Studio with support for 10+ languages, video dubbing, and voice cloning technology.',
  keywords: 'OHGRT, AI Voice, Voice Generation, Voice Cloning, Video Dubbing, TTS',
  openGraph: {
    title: 'OHGRT - AI Voice Generation Studio | Mobirizer',
    description: 'AI Voice Generation in 10+ languages.',
    type: 'website',
  },
};

export default function OHGRTLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
