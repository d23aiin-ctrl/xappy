import { Metadata } from 'next';

export const siteConfig = {
  name: 'Mobirizer',
  tagline: 'AI Development Studio',
  description:
    'AI Development Studio building production-grade solutions for government, education, healthcare, and enterprise clients since 2014.',
  url: 'https://mobirizer.com',
  themeColor: '#6366f1',
  company: {
    name: 'Mobirizer Services Pvt. Ltd.',
    address: 'At- Bihari Gadh, Post- Bithauli, P.S.- Bhagwanpur, Hajipur, Dist.- Vaishali, Bihar 844114, India',
    email: 'info@mobirizer.com',
    phone: '+91 9810503222',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/mobirizer/',
    twitter: 'https://twitter.com/mobirizer',
    github: 'https://github.com/mobirizer',
    facebook: 'https://www.facebook.com/MobiRizer',
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
