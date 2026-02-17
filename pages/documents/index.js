import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import { getAdminToken } from '../../lib/adminSession'
import { useApp } from '../../lib/store'
import { SEED_DOCUMENTS } from '../../lib/scrollRegistry'

// Build documents list from the scroll registry (single source of truth)
const documents = SEED_DOCUMENTS.map(seed => ({
  id: seed.key,
  name: seed.title,
  category: seed.category,
  version: seed.version,
  description: seed.description,
  defaultPdfUrl: seed.pdfUrl,
}))

const categories = ['All', ...new Set(documents.map(d => d.category))]

function findScrollMatch(doc, scrollDocs) {
  const name = doc.name.toLowerCase()
  return scrollDocs.find(sd => {
    const title = sd.title.toLowerCase()
    return name.includes(title) || title.includes(name) ||
      name.split(/\s+/).filter(w => w.length > 3).some(word => title.includes(word)) &&
      title.split(/\s+/).filter(w => w.length > 3).some(word => name.includes(word))
  })
}

// .txt upload panel for a specific PDF document (admin only)
function TxtUploadPanel({ doc, onUploaded, onClose }) {
  const [file, setFile] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(doc.defaultPdfUrl || '')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (f && f.name.endsWith('.txt')) {
      setFile(f)
      setResult(null)
    } else if (f) {
      setResult({ ok: false, message: 'Only .txt files are accepted.' })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) return
    if (!pdfUrl.trim()) {
      setResult({ ok: false, message: 'PDF link is required. Paste the direct URL to the PDF.' })
      return
    }
    setUploading(true)
    setResult(null)
    try {
      const textContent = await file.text()
      if (!textContent.trim()) {
        setResult({ ok: false, message: 'File is empty.' })
        setUploading(false)
        return
      }
      const res = await fetch('/api/codex/batch-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          files: [{
            title: doc.name,
            text_content: textContent,
            version: doc.version || '1.0',
            file_name: file.name,
            file_size: file.size,
            source_url: pdfUrl.trim(),
          }],
        }),
      })
      const data = await res.json()
      if (res.ok && data.succeeded > 0) {
        setResult({ ok: true, message: `Added to The Scroll — ${data.results[0]?.chunk_count || 0} chunks indexed. PDF link saved.` })
        setFile(null)
        onUploaded()
      } else {
        setResult({ ok: false, message: data.results?.[0]?.error || data.error || 'Upload failed' })
      }
    } catch {
      setResult({ ok: false, message: 'Upload failed. Check your connection.' })
    }
    setUploading(false)
  }

  return (
    <div className="mt-4 border-t border-gray-900 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="caption text-green-400">Add .txt to The Scroll</span>
          <span className="text-xs text-gray-600">Enables Grok RAG for this document</span>
        </div>
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-white transition">Close</button>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Upload the .txt version of this PDF and set the direct PDF link for users.
      </p>

      <div className="mb-3">
        <label className="caption block mb-1.5">PDF Link (required)</label>
        <input
          type="url"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          placeholder="https://policies.unc.edu/files/..."
          className="w-full px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none"
        />
        <p className="text-xs text-gray-600 mt-1">This URL becomes the "Open PDF" link users see.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 text-xs font-medium border border-gray-800 rounded hover:border-green-500/50 hover:text-green-400 transition text-gray-500"
        >
          {file ? file.name : 'Choose .txt file'}
        </button>
        <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} className="hidden" />

        {file && (
          <>
            <span className="text-xs text-gray-600 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
            <button
              onClick={handleUpload}
              disabled={uploading || !pdfUrl.trim()}
              className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Add to Scroll'}
            </button>
          </>
        )}
      </div>

      {result && (
        <div className={`mt-3 p-3 rounded border text-xs ${
          result.ok
            ? 'bg-green-500/5 border-green-500/20 text-green-400'
            : 'bg-red-500/5 border-red-500/20 text-red-400'
        }`}>
          {result.message}
        </div>
      )}
    </div>
  )
}

export default function Documents() {
  const { isAdmin } = useApp()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [txtUploadDoc, setTxtUploadDoc] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrollDocs, setScrollDocs] = useState([])
  const [uploadedDocId, setUploadedDocId] = useState(null)

  const loadScrollDocs = () => {
    fetch('/api/codex/documents?status=approved')
      .then(r => r.json())
      .then(data => setScrollDocs(data.documents || []))
      .catch(() => {})
  }

  const handleRemoveDoc = async (scrollDocId, docName) => {
    if (!confirm(`Remove "${docName}" from The Scroll? You can re-upload it later.`)) return
    try {
      const res = await fetch(`/api/codex/document/${scrollDocId}/delete`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` },
      })
      if (res.ok) {
        loadScrollDocs()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to remove document')
      }
    } catch {
      alert('Failed to remove document')
    }
  }

  useEffect(() => { loadScrollDocs() }, [])

  const scrollCount = scrollDocs.length

  const filtered = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <Layout>
      <Head>
        <title>Document Catalogue | Project Bold</title>
        <meta name="description" content="UNC governance documents, policies, and student government codes" />
      </Head>

      {/* Hero */}
      <section className="min-h-[40vh] flex items-end relative overflow-hidden border-b border-gray-900">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24">
          <div className="flex items-center gap-4 mb-4">
            <span className="caption">{documents.length} Documents</span>
            {scrollCount > 0 && (
              <span className="caption text-green-400">{scrollCount} in The Scroll</span>
            )}
          </div>
          <h1 className="section-title mb-3">Document Catalogue</h1>
          <p className="body-text text-gray-400 max-w-2xl">
            Official UNC governance documents, university policies, student government codes, and conduct procedures.
            {isAdmin ? ' Upload .txt versions and set PDF links to add them to The Scroll for Grok RAG.' : ''}
          </p>
        </div>
      </section>

      <main className="section-padding">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md w-full">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none transition"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition ${
                    selectedCategory === cat
                      ? 'bg-white/10 border-gray-600 text-white'
                      : 'border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
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
              const scrollMatch = findScrollMatch(doc, scrollDocs)
              const inScroll = !!scrollMatch
              const pdfLink = scrollMatch?.source_url || null
              return (
                <div
                  key={doc.id}
                  className={`card p-6 group ${inScroll ? 'border-green-500/20' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className={`w-10 h-12 rounded flex items-center justify-center shrink-0 border ${
                        inScroll
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase ${inScroll ? 'text-green-400' : 'text-red-400'}`}>
                          {inScroll ? 'TXT' : 'PDF'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1 leading-snug">{doc.name}</h3>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded border border-gray-800 text-gray-500 bg-white/5">
                            {doc.category}
                          </span>
                          <span className="text-xs text-gray-600 font-mono">{doc.version}</span>
                          {inScroll && (
                            <span className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded border bg-green-500/5 text-green-400 border-green-500/20">
                              In The Scroll
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isAdmin && inScroll && (
                        <button
                          onClick={() => handleRemoveDoc(scrollMatch.id, doc.name)}
                          className="px-3 py-1.5 text-xs font-medium rounded border text-red-400 border-red-500/30 hover:border-red-400 transition"
                        >
                          Remove
                        </button>
                      )}
                      {isAdmin && !inScroll && (
                        <button
                          onClick={() => setTxtUploadDoc(txtUploadDoc?.id === doc.id ? null : doc)}
                          className={`px-3 py-1.5 text-xs font-medium rounded border transition ${
                            txtUploadDoc?.id === doc.id
                              ? 'bg-white text-black border-white'
                              : 'text-green-400 border-green-500/30 hover:border-green-400'
                          }`}
                        >
                          {txtUploadDoc?.id === doc.id ? 'Close' : 'Add .txt'}
                        </button>
                      )}
                      {pdfLink ? (
                        <a
                          href={pdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          Open PDF
                        </a>
                      ) : (
                        <span className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-800 rounded cursor-not-allowed" title="PDF link not yet set by admin">
                          Open PDF
                        </span>
                      )}
                    </div>
                  </div>

                  {uploadedDocId === doc.id && (
                    <div className="mt-3 p-3 rounded border text-xs bg-green-500/5 border-green-500/20 text-green-400">
                      Successfully added to The Scroll and indexed.
                    </div>
                  )}

                  {txtUploadDoc?.id === doc.id && (
                    <TxtUploadPanel
                      doc={doc}
                      onUploaded={() => {
                        setTxtUploadDoc(null)
                        setUploadedDocId(doc.id)
                        loadScrollDocs()
                        setTimeout(() => setUploadedDocId(null), 5000)
                      }}
                      onClose={() => setTxtUploadDoc(null)}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-sm">No documents match your search.</p>
            </div>
          )}

          {/* How it works */}
          <div className="mt-16 border-t border-gray-900 pt-12">
            <span className="caption mb-6 block">How it works</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Browse', desc: 'Find the governance document you need from the catalogue above.' },
                { step: '02', title: 'Admin Adds', desc: 'Admin uploads the .txt version and sets the PDF link for each document.' },
                { step: '03', title: 'Grok Indexes', desc: 'The document is chunked, embedded, and instantly available in The Scroll for Grok.' },
                { step: '04', title: 'Ask Questions', desc: 'Go to Grok chat to ask questions — it sources from The Scroll and UNC news.' },
              ].map(item => (
                <div key={item.step} className="space-y-2">
                  <span className="text-xs font-mono text-gray-600">{item.step}</span>
                  <h4 className="text-sm font-medium text-white">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}
