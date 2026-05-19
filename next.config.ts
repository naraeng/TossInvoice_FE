import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const backendBaseUrl =
      process.env.BACKEND_INTERNAL_URL?.trim() || 'https://api.tossinvoice.site';

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
