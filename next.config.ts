import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable HTTPS in development for Monday.com integration
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Allow iframe embedding from Monday.com
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.monday.com monday.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
