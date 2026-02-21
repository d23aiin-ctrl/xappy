import { Locale } from '@/i18n';

const siteUrl = 'https://xappy.ai';

// Organization Schema - used on all pages
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Xappy',
    alternateName: 'Xappy - Igniting Connections',
    url: siteUrl,
    logo: `${siteUrl}/assets/images/xappy.jpg`,
    description:
      'AI-first customer experience platform helping businesses automate, personalize, and scale customer interactions across channels.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9810503222',
      contactType: 'customer service',
      email: 'hello@xappy.ai',
      availableLanguage: ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'],
    },
    sameAs: [
      'https://www.linkedin.com/company/xappy/',
      'https://twitter.com/xappy',
      'https://www.facebook.com/xappy',
    ],
  };
}

// Website Schema
export function generateWebsiteSchema(locale: Locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Xappy',
    alternateName: 'Xappy - AI-First Customer Experience Platform',
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
      name: 'Xappy',
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
    name: 'Xappy',
    image: `${siteUrl}/assets/images/xappy.jpg`,
    telephone: '+91-9810503222',
    email: 'hello@xappy.ai',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
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
      name: 'Xappy',
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
  'virtual-assistant': {
    name: 'AI Virtual Assistants',
    description:
      'Deploy intelligent AI systems that understand intent, context, and language to handle business queries, transactions, and complex workflows.',
    url: '/products/virtual-assistant',
    image: '/assets/images/og-image.png',
    category: 'BusinessApplication',
    rating: 4.8,
    ratingCount: 5000,
  },
  automation: {
    name: 'End-to-End Automation',
    description:
      'Automate lead qualification, appointment booking, order tracking, payments, refunds, and support workflows.',
    url: '/products/automation',
    image: '/assets/images/og-image.png',
    category: 'BusinessApplication',
    rating: 4.7,
    ratingCount: 3000,
  },
  omnichannel: {
    name: 'Omnichannel Experiences',
    description:
      'Engage customers seamlessly across Web, Mobile Apps, WhatsApp, Instagram, Facebook Messenger, SMS, and more.',
    url: '/products/omnichannel',
    image: '/assets/images/og-image.png',
    category: 'CommunicationApplication',
    rating: 4.8,
    ratingCount: 4000,
  },
};

// Solutions data for schema generation
export const solutionsData = {
  'conversational-ai': {
    name: 'Conversational AI',
    description:
      'Deploy intelligent chatbots and voice assistants that understand context, handle complex queries, and deliver human-like interactions.',
    url: '/solutions/conversational-ai',
  },
  'ai-integration': {
    name: 'AI Integration',
    description:
      'Seamlessly integrate AI capabilities into your existing infrastructure—CRMs, ERPs, databases, and third-party APIs.',
    url: '/solutions/ai-integration',
  },
  'custom-development': {
    name: 'Custom Development',
    description:
      'End-to-end development of custom AI solutions designed specifically for your unique business requirements.',
    url: '/solutions/custom-development',
  },
};
