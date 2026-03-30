import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { SEED_DOCUMENTS } from '../../lib/scrollRegistry'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

function findScrollMatch(seed, approvedDocs) {
  const name = seed.title.toLowerCase()
  return approvedDocs.find(d => {
    const title = d.title.toLowerCase()
    return name.includes(title) || title.includes(name) ||
      (name.split(/\s+/).filter(w => w.length > 3).some(word => title.includes(word)) &&
       title.split(/\s+/).filter(w => w.length > 3).some(word => name.includes(word)))
  })
}

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/codex/documents?status=approved')
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch {
      console.error('Failed to load documents')
    }
    setLoading(false)
  }

  // Build combined list: approved docs + unmatched seed docs
  const seedWithStatus = SEED_DOCUMENTS.map(seed => {
    const match = findScrollMatch(seed, documents)
    return { seed, match, inScroll: !!match }
  })

  const approvedFiltered = documents
    .filter(doc => !search || doc.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return new Date(b.approved_at) - new Date(a.approved_at)
    })

  const unmatchedSeeds = seedWithStatus
    .filter(s => !s.inScroll)
    .filter(s => !search || s.seed.title.toLowerCase().includes(search.toLowerCase()))

  const filtered = approvedFiltered

  return (
    <Layout>
      <Head>
        <title>Knowledge Base | UNC Gov Codex</title>
      </Head>

      <div className="section-padding">
        <div className="max-w-wide mx-auto">
          {/* Header */}
          <div className="mb-16">
            <p className="caption mb-4">Transparency</p>
            <h1 className="section-title mb-4">Knowledge Base</h1>
            <p className="body-text max-w-content">
              All approved governance documents, fully transparent and auditable. Every document includes version history, approver information, and cryptographic verification.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full rounded"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSortBy('date')}
                className={sortBy === 'date' ? 'btn-primary text-sm py-2 px-4' : 'btn-secondary text-sm py-2 px-4'}>
                By Date
              </button>
              <button onClick={() => setSortBy('title')}
                className={sortBy === 'title' ? 'btn-primary text-sm py-2 px-4' : 'btn-secondary text-sm py-2 px-4'}>
                By Title
              </button>
              <Link href="/chat" className="btn-secondary text-sm py-2 px-4">
                Ask AI
              </Link>
            </div>
          </div>

          {/* Document List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-gray-500">Loading documents...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-20">
              <p className="text-gray-500">{search ? 'No documents match your search' : 'No approved documents yet'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(doc => (
                <Link key={doc.id} href={`/knowledge-base/${doc.id}`}>
                  <div className="card group cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg group-hover:text-gray-200 transition truncate">
                          {doc.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="badge text-xs">v{doc.version}</span>
                          <span className="text-xs text-gray-500">
                            Approved by <span className="text-gray-400">{doc.approved_by || 'admin'}</span>
                          </span>
                          <span className="text-xs text-gray-600 font-mono">{formatDate(doc.approved_at)}</span>
                          {doc.source_url && (
                            <span className="text-xs text-gray-400 hover:text-white transition"
                              onClick={(e) => { e.preventDefault(); window.open(doc.source_url, '_blank') }}>
                              Source &rarr;
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span onClick={(e) => { e.preventDefault(); window.location.href = `/chat?doc=${doc.id}&title=${encodeURIComponent(doc.title)}` }}
                          className="btn-ghost text-xs">
                          Ask AI &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pending seed documents */}
          {!loading && unmatchedSeeds.length > 0 && (
            <div className="mt-12">
              <p className="caption mb-4">Pending Documents ({unmatchedSeeds.length})</p>
              <p className="text-xs text-gray-600 mb-4">These governance documents are registered for The Scroll but have not yet been uploaded by an admin.</p>
              <div className="space-y-3">
                {unmatchedSeeds.map(({ seed }) => (
                  <div key={seed.key} className="card group opacity-60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-400 font-semibold text-lg truncate">
                          {seed.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="badge text-xs">v{seed.version}</span>
                          <span className="text-xs text-gray-600">{seed.category}</span>
                          {seed.required && (
                            <span className="text-xs text-yellow-500">Required</span>
                          )}
                        </div>
                        {seed.description && (
                          <p className="text-xs text-gray-600 mt-2">{seed.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-600 font-mono">Not yet seeded</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {!loading && (filtered.length > 0 || unmatchedSeeds.length > 0) && (
            <div className="mt-12 text-center">
              <p className="caption">
                {filtered.length} approved document{filtered.length !== 1 ? 's' : ''} in the knowledge base
                {unmatchedSeeds.length > 0 && ` · ${unmatchedSeeds.length} pending`}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
