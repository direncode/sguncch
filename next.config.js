/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Security headers for production
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.unc.edu https://img.clerk.com",
              "font-src 'self' data:",
              "connect-src 'self' https://api.web3forms.com https://*.supabase.co wss://*.supabase.co https://api.x.ai https://*.clerk.accounts.dev https://api.clerk.com",
              "frame-src 'self' https://policies.unc.edu https://studentgovernment.unc.edu https://dos.unc.edu https://eoc.unc.edu https://*.clerk.accounts.dev",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ]
  },

  // Powered by header removal
  poweredByHeader: false,

  webpack: (config) => {
    // pdf-parse compatibility: disable canvas module
    config.resolve.alias.canvas = false
    return config
  },
}

module.exports = nextConfig
