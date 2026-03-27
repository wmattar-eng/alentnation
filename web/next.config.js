const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Render
  output: 'export',
  distDir: 'dist',
  
  // Experimental features
  experimental: {
    appDir: true,
  },
  
  // Image optimization settings - DISABLED for static export
  images: {
    unoptimized: true,
    domains: [
      'localhost',
      'talentnation.s3.amazonaws.com',
      'talentnation-api.onrender.com',
      'talentnation-web.onrender.com',
    ],
    // Allow images from any Render subdomain
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.onrender.com',
      },
    ],
  },
  
  // Internationalization
  i18n: {
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  
  // ESLint configuration for build
  eslint: {
    ignoreDuringBuilds: true, // Allow build even with ESLint errors
  },
  
  // TypeScript configuration for build
  typescript: {
    ignoreBuildErrors: true, // Allow build even with TS errors
  },
};

module.exports = withNextIntl(nextConfig);
