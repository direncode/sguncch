import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { ADMIN_KEY } from '../../lib/data'

const documents = [
  {
    id: 'ferpa',
    name: 'Policies and Procedures Under the Family Educational Rights and Privacy Act of 1974 ("FERPA")',
    category: 'University Policy',
    size: '3.6 MB',
    url: 'https://policies.unc.edu/files/2024/10/Policies-and-Procedures-Under-the-Family-Educational-Rights-and-Privacy-Act-of-1974-FERPA.pdf',
  },
  {
    id: 'appeals-bot',
    name: 'Procedure for Appeals to the Board of Trustees',
    category: 'University Policy',
    size: '1.1 MB',
    url: 'https://policies.unc.edu/files/2024/10/Procedure-for-Appeals-to-the-Board-of-Trustees.pdf',
  },
  {
    id: 'gpsg-code',
    name: 'GPSG Code',
    category: 'Student Government',
    size: '1.3 MB',
    url: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/GPSG_Code_08_25_25.pdf',
  },
  {
    id: 'undergrad-statutes',
    name: 'Undergraduate General Statutes',
    category: 'Student Government',
    size: '1.8 MB',
    url: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/Undergraduate_General_Statutes_09_03_2025.pdf',
  },
  {
    id: 'joint-code',
    name: 'Joint Code of the Student Government',
    category: 'Student Government',
    size: '1017 KB',
    url: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2023/02/Joint_Code_of_the_Student_Government_01_12_23.pdf',
  },
  {
    id: 'constitution',
    name: 'Constitution of the Student Body',
    category: 'Student Government',
    size: '361 KB',
    url: 'https://studentgovernment.unc.edu/wp-content/uploads/sites/136/2025/09/Constitution_of_the_Student_Body_8_20_25.pdf',
  },
  {
    id: 'workplace-violence',
    name: 'Workplace Violence Policy',
    category: 'University Policy',
    size: '1.6 MB',
    url: 'https://policies.unc.edu/files/2024/10/Workplace-Violence-Policy.pdf',
  },
  {
    id: 'whistleblower',
    name: 'Whistleblower Policy',
    category: 'University Policy',
    size: '1.2 MB',
    url: 'https://policies.unc.edu/files/2024/10/Whistleblower-Policy.pdf',
  },
  {
    id: 'threat-assessment',
    name: 'Behavioral Threat Assessment Policy',
    category: 'University Policy',
    size: '1.2 MB',
    url: 'https://policies.unc.edu/files/2024/10/Behavioral-Threat-Assessment-Policy.pdf',
  },
  {
    id: 'discrimination',
    name: 'Policy on Prohibited Discrimination, Harassment, and Related Misconduct Including Sex-Based Harassment, Sexual Assault, Interpersonal Violence, and Stalking',
    category: 'University Policy',
    size: '7.2 MB',
    url: 'https://policies.unc.edu/files/2024/10/Policy-on-Prohibited-Discrimination-Harassment-and-Related-Misconduct.pdf',
  },
  {
    id: 'eoc-guide',
    name: 'EOC Comprehensive Resource Guide',
    category: 'University Policy',
    size: '826 KB',
    url: 'https://eoc.unc.edu/files/2024/08/eoc-comprehensive-resource-guide.pdf',
  },
  {
    id: 'drugs',
    name: 'Illegal Drugs Policy',
    category: 'University Policy',
    size: '947 KB',
    url: 'https://policies.unc.edu/files/2024/10/Illegal-Drugs-Policy.pdf',
  },
  {
    id: 'alcohol',
    name: 'Alcohol Policy',
    category: 'University Policy',
    size: '4.6 MB',
    url: 'https://policies.unc.edu/files/2024/10/Alcohol-Policy.pdf',
  },
  {
    id: 'conduct-procedures',
    name: 'Student Conduct Procedures',
    category: 'Student Conduct',
    size: '6.7 MB',
    url: 'https://dos.unc.edu/files/2024/08/Student-Conduct-Procedures.pdf',
  },
  {
    id: 'code-of-conduct',
    name: 'The Student Code of Conduct',
    category: 'Student Conduct',
    size: '3.4 MB',
    url: 'https://dos.unc.edu/files/2024/08/The-Student-Code-of-Conduct.pdf',
  },
]

const categories = ['All', ...new Set(documents.map(d => d.category))]

function AiPanel({ doc, grokAvailable, onClose }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  const extractContent = async (userQuery) => {
    if (!grokAvailable) {
      setError('XAI_API_KEY not configured on server. Add it to .env.local.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/codex/extract-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_KEY}`,
        },
        body: JSON.stringify({ url: doc.url, query: userQuery || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setContent(data.content)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = (e) => {
    e.preventDefault()
    if (query.trim()) extractContent(query.trim())
  }

  return (
    <div className="mt-4 border-t border-[#30363d] pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-[#a371f7] uppercase tracking-wider">AI Document Reader</span>
          <span className="text-[10px] text-[#6e7681]">Powered by Grok</span>
        </div>
        <button onClick={onClose} className="text-[10px] text-[#6e7681] hover:text-[#f0f6fc] transition">Close</button>
      </div>

      {!grokAvailable && (
        <div className="bg-[#d29922]/10 border border-[#d29922]/30 rounded-lg p-3 mb-3">
          <p className="text-xs text-[#d29922]">XAI_API_KEY not configured. Add your xAI API key to .env.local to enable AI document reading.</p>
        </div>
      )}

      {grokAvailable && (
        <>
          {/* Action buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => extractContent(null)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium bg-[#a371f7]/10 text-[#a371f7] border border-[#a371f7]/30 rounded hover:border-[#a371f7] transition disabled:opacity-50"
            >
              {loading && !query ? 'Reading...' : 'Extract Full Text'}
            </button>
          </div>

          {/* Ask a question */}
          <form onSubmit={handleAsk} className="flex gap-2 mb-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask a question about this document..."
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-sm text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-[#a371f7] transition"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-3 py-1.5 text-xs font-medium bg-[#a371f7] text-white rounded hover:bg-[#a371f7]/80 transition disabled:opacity-50"
            >
              {loading && query ? 'Asking...' : 'Ask Grok'}
            </button>
          </form>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg p-3 mb-3">
          <p className="text-xs text-[#f85149]">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 text-center">
          <div className="inline-block w-5 h-5 border-2 border-[#a371f7] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-[#8b949e]">Grok is reading the PDF...</p>
          <p className="text-[10px] text-[#6e7681] mt-1">This may take a moment for large documents</p>
        </div>
      )}

      {/* Content */}
      {content && !loading && (
        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 max-h-[500px] overflow-y-auto">
          <div className="prose prose-invert prose-sm max-w-none">
            {content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) return <h2 key={i} className="text-[#f0f6fc] text-base font-bold mt-4 mb-2">{line.slice(2)}</h2>
              if (line.startsWith('## ')) return <h3 key={i} className="text-[#f0f6fc] text-sm font-semibold mt-3 mb-1">{line.slice(3)}</h3>
              if (line.startsWith('### ')) return <h4 key={i} className="text-[#8b949e] text-sm font-semibold mt-2 mb-1">{line.slice(4)}</h4>
              if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-sm text-[#8b949e] ml-4 mb-0.5">{line.slice(2)}</li>
              if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-sm text-[#f0f6fc] font-semibold mt-2">{line.slice(2, -2)}</p>
              if (line.trim() === '') return <br key={i} />
              return <p key={i} className="text-sm text-[#8b949e] mb-1">{line}</p>
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Documents() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [previewDoc, setPreviewDoc] = useState(null)
  const [aiDoc, setAiDoc] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [grokAvailable, setGrokAvailable] = useState(false)

  // Check if Grok PDF extraction is available
  useEffect(() => {
    fetch('/api/codex/extract-pdf', {
      headers: { 'Authorization': `Bearer ${ADMIN_KEY}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.available && setGrokAvailable(true))
      .catch(() => {})
  }, [])

  const filtered = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categoryColors = {
    'University Policy': { bg: 'bg-[#388bfd]/10', text: 'text-[#388bfd]', border: 'border-[#388bfd]' },
    'Student Government': { bg: 'bg-[#a371f7]/10', text: 'text-[#a371f7]', border: 'border-[#a371f7]' },
    'Student Conduct': { bg: 'bg-[#d29922]/10', text: 'text-[#d29922]', border: 'border-[#d29922]' },
  }

  return (
    <Layout>
      <Head>
        <title>Document Catalogue | Project Bold</title>
        <meta name="description" content="UNC governance documents, policies, and student government codes" />
      </Head>

      {/* Header */}
      <div className="bg-[#0d1117] border-b border-[#30363d]">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#388bfd]/10 border border-[#388bfd] rounded text-[10px] font-semibold text-[#388bfd] uppercase tracking-wider">
              {documents.length} Documents
            </div>
            {grokAvailable && (
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#a371f7]/10 border border-[#a371f7] rounded text-[10px] font-semibold text-[#a371f7] uppercase tracking-wider">
                Grok Connected
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-[#f0f6fc] tracking-tight mb-2">Document Catalogue</h1>
          <p className="text-[#8b949e] max-w-2xl">
            Official UNC governance documents, university policies, student government codes, and conduct procedures.
            {grokAvailable ? ' Use AI Read to extract content and ask Grok questions about any document.' : ''}
          </p>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-[#388bfd] transition"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider rounded transition ${
                  selectedCategory === cat
                    ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]'
                    : 'text-[#8b949e] border border-[#30363d] hover:bg-[#21262d]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid gap-3">
          {filtered.map(doc => {
            const colors = categoryColors[doc.category] || categoryColors['University Policy']
            return (
              <div
                key={doc.id}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#484f58] transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* PDF Icon */}
                    <div className="w-10 h-12 bg-[#f85149]/10 border border-[#f85149]/30 rounded flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[#f85149] uppercase">PDF</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#f0f6fc] text-sm mb-1 leading-snug">{doc.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-[#6e7681] font-mono">{doc.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setAiDoc(aiDoc?.id === doc.id ? null : doc)
                        if (previewDoc?.id === doc.id) setPreviewDoc(null)
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                        aiDoc?.id === doc.id
                          ? 'bg-[#a371f7] text-white'
                          : 'text-[#a371f7] border border-[#a371f7]/30 hover:border-[#a371f7]'
                      }`}
                    >
                      {aiDoc?.id === doc.id ? 'Close AI' : 'Ask Grok'}
                    </button>
                    <button
                      onClick={() => {
                        setPreviewDoc(previewDoc?.id === doc.id ? null : doc)
                        if (aiDoc?.id === doc.id) setAiDoc(null)
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-[#8b949e] border border-[#30363d] rounded hover:text-[#00d4ff] hover:border-[#00d4ff] transition"
                    >
                      {previewDoc?.id === doc.id ? 'Close' : 'Preview'}
                    </button>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-medium text-[#f0f6fc] bg-[#388bfd] rounded hover:bg-[#58a6ff] transition"
                    >
                      Open
                    </a>
                  </div>
                </div>

                {/* AI Reader Panel */}
                {aiDoc?.id === doc.id && (
                  <AiPanel doc={doc} grokAvailable={grokAvailable} onClose={() => setAiDoc(null)} />
                )}

                {/* Inline PDF Preview (native browser rendering) */}
                {previewDoc?.id === doc.id && (
                  <div className="mt-4 border-t border-[#30363d] pt-4">
                    <iframe
                      src={doc.url}
                      className="w-full h-[600px] rounded-lg border border-[#30363d] bg-white"
                      title={doc.name}
                    />
                    <p className="text-[10px] text-[#6e7681] mt-2">
                      If the preview doesn't load, try "Ask Grok" or click "Open" to view in a new tab.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#6e7681] text-sm">No documents match your search.</p>
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 border-t border-[#21262d] pt-12">
          <h3 className="text-[10px] font-semibold text-[#6e7681] uppercase tracking-widest mb-6">How it works</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Browse', desc: 'Find the governance document you need from the catalogue above.' },
              { step: '02', title: 'Preview', desc: 'Use your browser\'s native PDF viewer to read the document inline.' },
              { step: '03', title: 'Ask Grok', desc: 'Click "Ask Grok" to have xAI read the full PDF and extract text or answer questions.' },
              { step: '04', title: 'Get Answers', desc: 'Ask specific questions about any policy — Grok reads the full document and responds.' },
            ].map(item => (
              <div key={item.step} className="space-y-2">
                <span className="text-[10px] font-mono text-[#6e7681]">{item.step}</span>
                <h4 className="text-sm font-medium text-[#f0f6fc]">{item.title}</h4>
                <p className="text-xs text-[#8b949e] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  )
}
