import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

// Check if environment variables are configured
function useConfigStatus() {
  const [status, setStatus] = useState({
    checking: true,
    supabase: false,
    groq: false,
    web3forms: false,
  })

  useEffect(() => {
    // Check client-side env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

    setStatus({
      checking: false,
      supabase: !!(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')),
      web3forms: !!(web3formsKey && !web3formsKey.includes('your-')),
      // Groq is server-side only, we check via API
      groq: false,
    })

    // Check Groq API status
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setStatus(prev => ({ ...prev, groq: data.groqConfigured || false }))
      })
      .catch(() => {})
  }, [])

  return status
}

export default function SetupPage() {
  const configStatus = useConfigStatus()
  const [copiedEnv, setCopiedEnv] = useState(false)

  const envTemplate = `# ============================================
# PROJECT BOLD - REQUIRED CONFIGURATION
# ============================================

# Admin Authentication (REQUIRED)
# Generate: openssl rand -base64 32
ADMIN_KEY=your-secure-admin-key-here

# ============================================
# OPTIONAL: AI Price Validation (Groq)
# ============================================
# Get FREE key at: https://console.groq.com
GROQ_API_KEY=your-groq-api-key

# ============================================
# OPTIONAL: Persistent Database (Supabase)
# ============================================
# Get FREE account at: https://supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ============================================
# OPTIONAL: Form Submissions (Web3Forms)
# ============================================
# Get FREE key at: https://web3forms.com
NEXT_PUBLIC_WEB3FORMS_KEY=your-web3forms-key`

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envTemplate)
    setCopiedEnv(true)
    setTimeout(() => setCopiedEnv(false), 2000)
  }

  const services = [
    {
      id: 'admin',
      name: 'Admin Authentication',
      required: true,
      configured: true, // Always show as needing setup
      description: 'Secure admin access to manage budget requests and approvals',
      steps: [
        'Generate a secure key: openssl rand -base64 32',
        'Add to your .env.local or Vercel Environment Variables',
        'Access admin panel at /admin/login',
      ],
      envVar: 'ADMIN_KEY',
      link: null,
    },
    {
      id: 'groq',
      name: 'AI Price Validation (Groq)',
      required: false,
      configured: configStatus.groq,
      description: 'LLAMA 3.3 powered real-world price validation for funding requests',
      steps: [
        'Sign up at console.groq.com (FREE tier available)',
        'Create an API key in your dashboard',
        'Add GROQ_API_KEY to environment variables',
        'AI validation will automatically activate',
      ],
      envVar: 'GROQ_API_KEY',
      link: 'https://console.groq.com',
    },
    {
      id: 'supabase',
      name: 'Persistent Database (Supabase)',
      required: false,
      configured: configStatus.supabase,
      description: 'Store budget data permanently instead of local browser storage',
      steps: [
        'Create account at supabase.com (FREE tier available)',
        'Create a new project',
        'Go to Settings > API',
        'Copy Project URL → NEXT_PUBLIC_SUPABASE_URL',
        'Copy anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'Run the schema from supabase-schema.sql',
      ],
      envVar: 'NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY',
      link: 'https://supabase.com',
    },
    {
      id: 'web3forms',
      name: 'Form Submissions (Web3Forms)',
      required: false,
      configured: configStatus.web3forms,
      description: 'Enable contact form submissions via email',
      steps: [
        'Sign up at web3forms.com (FREE)',
        'Create a new form and copy Access Key',
        'Add NEXT_PUBLIC_WEB3FORMS_KEY to environment variables',
      ],
      envVar: 'NEXT_PUBLIC_WEB3FORMS_KEY',
      link: 'https://web3forms.com',
    },
  ]

  const allConfigured = services.filter(s => !s.required).every(s => s.configured)

  return (
    <Layout>
      <Head>
        <title>Setup & Configuration | Project Bold</title>
        <meta name="description" content="Configure API keys and services for full functionality" />
      </Head>

      {/* Hero */}
      <div className="relative bg-[#0a0e14] border-b border-[#30363d] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#3fb950 1px, transparent 1px), linear-gradient(90deg, #3fb950 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3fb950]/10 blur-3xl rounded-full" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <p className="text-[#3fb950] text-xs font-medium tracking-widest uppercase mb-4">
            Configuration
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f0f6fc] tracking-tight mb-4">
            Setup & API Keys
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl leading-relaxed">
            Configure your environment to unlock all features. All services offer free tiers.
          </p>
        </div>
      </div>

      <main className="bg-[#0d1117] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Status Overview */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#f0f6fc]">Configuration Status</h2>
              {configStatus.checking ? (
                <span className="px-3 py-1 rounded text-xs font-mono bg-[#21262d] text-[#8b949e]">
                  Checking...
                </span>
              ) : allConfigured ? (
                <span className="px-3 py-1 rounded text-xs font-mono bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]">
                  Fully Configured
                </span>
              ) : (
                <span className="px-3 py-1 rounded text-xs font-mono bg-[#d29922]/20 text-[#d29922] border border-[#d29922]">
                  Demo Mode
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {services.map(service => (
                <div
                  key={service.id}
                  className={`p-4 rounded-lg border ${
                    service.configured
                      ? 'bg-[#3fb950]/10 border-[#3fb950]/30'
                      : 'bg-[#21262d] border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${service.configured ? 'bg-[#3fb950]' : 'bg-[#6e7681]'}`} />
                    <span className="text-sm font-medium text-[#f0f6fc]">{service.name.split('(')[0].trim()}</span>
                  </div>
                  <p className="text-xs text-[#6e7681]">
                    {service.configured ? 'Configured' : service.required ? 'Required' : 'Optional'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-[#161b22] border border-[#388bfd] rounded-lg p-6 mb-10">
            <h2 className="text-xl font-bold text-[#f0f6fc] mb-4">Quick Start</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#388bfd] text-[#0d1117] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-[#f0f6fc] font-medium mb-2">Copy environment template</p>
                  <div className="relative">
                    <pre className="bg-[#0d1117] border border-[#30363d] rounded p-4 text-xs text-[#8b949e] overflow-x-auto max-h-48">
                      {envTemplate}
                    </pre>
                    <button
                      onClick={handleCopyEnv}
                      className="absolute top-2 right-2 px-3 py-1 text-xs bg-[#21262d] text-[#f0f6fc] rounded hover:bg-[#30363d] transition-colors"
                    >
                      {copiedEnv ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#388bfd] text-[#0d1117] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-[#f0f6fc] font-medium mb-1">Add to your environment</p>
                  <p className="text-sm text-[#8b949e]">
                    <strong>Local:</strong> Save as <code className="bg-[#21262d] px-1.5 py-0.5 rounded text-[#f0f6fc]">.env.local</code> in project root<br />
                    <strong>Vercel:</strong> Add each variable in Project Settings → Environment Variables
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#388bfd] text-[#0d1117] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-[#f0f6fc] font-medium mb-1">Restart and verify</p>
                  <p className="text-sm text-[#8b949e]">
                    Run <code className="bg-[#21262d] px-1.5 py-0.5 rounded text-[#f0f6fc]">npm run dev</code> locally, or redeploy on Vercel
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <h2 className="text-xl font-bold text-[#f0f6fc] mb-6">Service Configuration</h2>
          <div className="space-y-6">
            {services.map(service => (
              <div
                key={service.id}
                className={`bg-[#161b22] border rounded-lg p-6 ${
                  service.configured ? 'border-[#3fb950]/30' : 'border-[#30363d]'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#f0f6fc]">{service.name}</h3>
                      {service.required ? (
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#f85149]/20 text-[#f85149] border border-[#f85149]">
                          Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                          Optional
                        </span>
                      )}
                      {service.configured && (
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#3fb950]/20 text-[#3fb950]">
                          Configured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#8b949e]">{service.description}</p>
                  </div>
                  {service.link && (
                    <a
                      href={service.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm text-[#388bfd] border border-[#388bfd] rounded hover:bg-[#388bfd]/10 transition-colors whitespace-nowrap"
                    >
                      Get API Key
                    </a>
                  )}
                </div>

                <div className="bg-[#0d1117] rounded-lg p-4 mb-4">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">Environment Variable(s)</p>
                  <code className="text-sm text-[#f0f6fc] font-mono">{service.envVar}</code>
                </div>

                <div>
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-3">Setup Steps</p>
                  <ol className="space-y-2">
                    {service.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#8b949e]">
                        <span className="w-5 h-5 bg-[#21262d] text-[#6e7681] rounded flex items-center justify-center text-xs flex-shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>

          {/* Vercel Deployment */}
          <div className="mt-10 bg-[#161b22] border border-[#a371f7] rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#f0f6fc] mb-4">Deploying to Vercel</h2>
            <p className="text-sm text-[#8b949e] mb-6">
              For production deployment, add environment variables in your Vercel project settings.
            </p>
            <ol className="space-y-3">
              {[
                'Go to your Vercel dashboard',
                'Select your project',
                'Navigate to Settings → Environment Variables',
                'Add each variable from the template above',
                'Redeploy your project to apply changes',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#8b949e]">
                  <span className="w-6 h-6 bg-[#a371f7] text-[#0d1117] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Help */}
          <div className="mt-10 text-center">
            <p className="text-[#8b949e] mb-4">Need help with setup?</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 text-[#388bfd] border border-[#388bfd] rounded hover:bg-[#388bfd]/10 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  )
}
