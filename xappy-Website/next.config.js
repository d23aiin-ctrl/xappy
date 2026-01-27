const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // Keep images unoptimized to match original behavior
    unoptimized: false,
  },
  // Preserve trailing slashes for URL compatibility
  trailingSlash: false,
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = withNextIntl(nextConfig);
