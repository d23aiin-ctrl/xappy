import { Metadata } from 'next';

export const siteConfig = {
  name: 'Xappy',
  tagline: 'Igniting Connections',
  description:
    'AI-first customer experience platform helping businesses automate, personalize, and scale customer interactions across channels.',
  url: 'https://xappy.ai',
  themeColor: '#0078D4',
  company: {
    name: 'Xappy',
    address: 'India',
    email: 'hello@xappy.ai',
    phone: '+91 9810503222',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/xappy/',
    twitter: 'https://twitter.com/xappy',
    facebook: 'https://www.facebook.com/xappy',
  },
};

export function createMetadata(options: {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  themeColor?: string;
}): Metadata {
  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    authors: [{ name: siteConfig.company.name }],
    robots: 'index, follow',
    themeColor: options.themeColor || siteConfig.themeColor,
    openGraph: {
      title: options.ogTitle || options.title,
      description: options.ogDescription || options.description,
      type: 'website',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: options.ogTitle || options.title,
      description: options.ogDescription || options.description,
    },
    icons: {
      icon: '/assets/images/favicon.png',
    },
  };
}
