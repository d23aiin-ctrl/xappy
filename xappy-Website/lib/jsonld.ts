import { Locale } from '@/i18n';

const siteUrl = 'https://mobirizer.com';

// Organization Schema - used on all pages
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mobirizer Services Pvt. Ltd.',
    alternateName: 'Mobirizer',
    url: siteUrl,
    logo: `${siteUrl}/assets/images/logo.png`,
    description:
      'AI Development Studio building production-grade solutions for government, education, healthcare, and enterprise clients since 2014.',
    foundingDate: '2014',
    founders: [
      {
        '@type': 'Person',
        name: 'Naseer Ahmad',
        jobTitle: 'Chief Executive Officer',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Umdesh Bhawan wz-3, Palam Village',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110045',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9810503222',
      contactType: 'customer service',
      email: 'info@mobirizer.com',
      availableLanguage: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'],
    },
    sameAs: [
      'https://www.linkedin.com/company/mobirizer/',
      'https://twitter.com/mobirizer',
      'https://github.com/mobirizer',
      'https://www.facebook.com/MobiRizer',
    ],
  };
}

// Website Schema
export function generateWebsiteSchema(locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mobirizer',
    alternateName: 'Mobirizer - AI Development Studio',
    url: siteUrl,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

// Product/Software Application Schema
export function generateProductSchema(product: {
  name: string;
  description: string;
  url: string;
  image?: string;
  category?: string;
  rating?: number;
  ratingCount?: number;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description,
    url: `${siteUrl}${product.url}`,
    applicationCategory: product.category || 'BusinessApplication',
    operatingSystem: 'Web, Android, iOS',
    ...(product.image && { image: `${siteUrl}${product.image}` }),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        ratingCount: product.ratingCount || 100,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(product.offers && {
      offers: {
        '@type': 'Offer',
        price: product.offers.price,
        priceCurrency: product.offers.priceCurrency,
      },
    }),
    provider: {
      '@type': 'Organization',
      name: 'Mobirizer Services Pvt. Ltd.',
      url: siteUrl,
    },
  };
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

// FAQ Schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Local Business Schema
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness`,
    name: 'Mobirizer Services Pvt. Ltd.',
    image: `${siteUrl}/assets/images/logo.png`,
    telephone: '+91-9810503222',
    email: 'info@mobirizer.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Umdesh Bhawan wz-3, Palam Village',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110045',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.5813,
      longitude: 77.0885,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: '$$',
  };
}

// Service Schema for Solutions
export function generateServiceSchema(service: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: `${siteUrl}${service.url}`,
    provider: {
      '@type': 'Organization',
      name: 'Mobirizer Services Pvt. Ltd.',
      url: siteUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };
}

// Products data for schema generation
export const productsData = {
  'd23-ai': {
    name: 'D23.ai',
    description:
      "India's first WhatsApp-native AI assistant that understands and responds in 11+ Indian languages. Send voice messages, generate images, check train PNR status, search the web—all within WhatsApp.",
    url: '/products/d23-ai',
    image: '/assets/images/og-image.png',
    category: 'CommunicationApplication',
    rating: 4.8,
    ratingCount: 5000,
  },
  roboguru: {
    name: 'RoboGuru',
    description:
      'AI-powered educational assistant that helps students solve problems, understand concepts, and learn at their own pace with photo-to-solution AI.',
    url: '/products/roboguru',
    image: '/assets/images/og-image.png',
    category: 'EducationalApplication',
    rating: 4.7,
    ratingCount: 10000,
  },
  ohgrt: {
    name: 'OHGRT',
    description:
      'Professional AI voice generation platform enabling content creators and enterprises with text-to-speech, voice cloning, and video dubbing in 10+ languages.',
    url: '/products/ohgrt',
    image: '/assets/images/og-image.png',
    category: 'MultimediaApplication',
    rating: 4.8,
    ratingCount: 20000,
  },
  xappy: {
    name: 'Xappy',
    description:
      'Comprehensive healthcare management platform with electronic health records, multi-facility support, and health analytics for hospitals and clinics.',
    url: '/products/xappy',
    image: '/assets/images/og-image.png',
    category: 'HealthApplication',
    rating: 4.6,
    ratingCount: 1000,
  },
  janseva: {
    name: 'JanSeva',
    description:
      '24/7 WhatsApp-based citizen engagement platform for government services with voice support and analytics. 95% resolution rate.',
    url: '/products/janseva',
    image: '/assets/images/og-image.png',
    category: 'GovernmentApplication',
    rating: 4.5,
    ratingCount: 50000,
  },
  'whatsapp-commerce': {
    name: 'WhatsApp Commerce',
    description:
      'Complete e-commerce solution for WhatsApp with product catalogs, native payments, and automated checkout. 98% open rate.',
    url: '/products/whatsapp-commerce',
    image: '/assets/images/og-image.png',
    category: 'BusinessApplication',
    rating: 4.7,
    ratingCount: 3000,
  },
};

// Solutions data for schema generation
export const solutionsData = {
  'agentic-ai': {
    name: 'Agentic AI Solutions',
    description:
      'Build autonomous AI agents that can reason, plan, and execute complex multi-step tasks with minimal human intervention.',
    url: '/solutions/agentic-ai',
  },
  'conversational-ai': {
    name: 'Conversational AI Solutions',
    description:
      'Deploy intelligent chatbots and voice assistants that understand context, handle complex queries, and deliver human-like interactions.',
    url: '/solutions/conversational-ai',
  },
  'ai-integration': {
    name: 'AI Integration Services',
    description:
      'Seamlessly integrate AI capabilities into your existing infrastructure—CRMs, ERPs, databases, and third-party APIs.',
    url: '/solutions/ai-integration',
  },
  'custom-development': {
    name: 'Custom AI Development',
    description:
      'End-to-end development of custom AI solutions designed specifically for your unique business requirements.',
    url: '/solutions/custom-development',
  },
};
