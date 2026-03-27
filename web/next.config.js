const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    appDir: true,
  },
  
  // Image optimization settings
  images: {
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
  
  // API rewrites - proxy requests to backend
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
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
    ignoreBuildErrors: false, // Fail build on TS errors
  },
};

module.exports = withNextIntl(nextConfig);
