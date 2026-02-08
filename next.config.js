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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.web3forms.com https://*.supabase.co wss://*.supabase.co https://api.groq.com https://api.x.ai",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
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

  webpack: (config, { isServer }) => {
    // pdf-parse compatibility: disable canvas module
    config.resolve.alias.canvas = false

    // pdfjs-dist: exclude worker from server bundle, handle on client
    if (!isServer) {
      config.resolve.alias['pdfjs-dist/build/pdf.worker.mjs'] = false
      config.resolve.alias['pdfjs-dist/build/pdf.worker.min.mjs'] = false
    }

    return config
  },
}

module.exports = nextConfig
