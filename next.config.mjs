/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1foa0aaimjyw4.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'admin.tilalr.com',
      },
      {
        protocol: 'https',
        hostname: 'tilalr.com',
      },
      {
        protocol: 'https',
        hostname: 'www.tilalr.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  async headers() {
    return [
      {
        source: '/:path(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },

  async rewrites() {
  // localhost on Vercel is Vercel's own private address, so every proxied /api call (including
  // the Moyasar webhook sent to tilalr.com) failed with DNS_HOSTNAME_RESOLVED_PRIVATE.
  const backend =
    process.env.BACKEND_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://admin.tilalr.com');
  return [
    {
      source: '/api/:path*',
      destination: `${backend}/api/:path*`,
    },
    {
      source: '/:lang/proxy/:path*',
      destination: '/proxy/:path*',
    },
    {
      source: '/:lang/proxy',
      destination: '/proxy',
    },
  ];
}
};

export default nextConfig;


