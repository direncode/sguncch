import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'

const CATEGORY_STYLES = {
  'laws':         { color: 'text-red-400',    border: 'border-red-500/20',    bg: 'bg-red-500/5',    activeBg: 'bg-red-500/10' },
  'policies':     { color: 'text-blue-400',   border: 'border-blue-500/20',   bg: 'bg-blue-500/5',   activeBg: 'bg-blue-500/10' },
  'resources':    { color: 'text-green-400',  border: 'border-green-500/20',  bg: 'bg-green-500/5',  activeBg: 'bg-green-500/10' },
  'academic':     { color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', activeBg: 'bg-purple-500/10' },
  'budget':       { color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', activeBg: 'bg-yellow-500/10' },
  'student-life': { color: 'text-cyan-400',   border: 'border-cyan-500/20',   bg: 'bg-cyan-500/5',   activeBg: 'bg-cyan-500/10' },
  'general':      { color: 'text-gray-400',   border: 'border-gray-500/20',   bg: 'bg-gray-500/5',   activeBg: 'bg-gray-500/10' },
}

function getCatStyle(cat) {
  return CATEGORY_STYLES[cat] || CATEGORY_STYLES['general']
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

export default function ScrollPage() {
  const [documents, setDocuments] = useState([])
  const [buckets, setBuckets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedDocs, setExpandedDocs] = useState(new Set())
  const [search, setSearch] = useState('')

  // Submission state
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitMode, setSubmitMode] = useState('text') // 'text' or 'file'
  const [submitTitle, setSubmitTitle] = useState('')
  const [submitText, setSubmitText] = useState('')
  const [submitName, setSubmitName] = useState('')
  const [submitFile, setSubmitFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    loadScroll()
  }, [])

  const loadScroll = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/codex/scroll')
      const data = await res.json()
      if (res.ok) {
        setDocuments(data.documents || [])
        setBuckets(data.buckets || [])
      }
    } catch (err) {
      console.error('Failed to load scroll:', err)
    }
    setLoading(false)
  }

  const toggleExpand = (id) => {
    setExpandedDocs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // File drop handlers
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true) }, [])
  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget)) setDragActive(false)
  }, [])
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.txt')) {
      setSubmitFile(file)
      if (!submitTitle) setSubmitTitle(file.name.replace(/\.txt$/, ''))
    } else {
      setSubmitResult({ type: 'error', message: 'Only .txt files are accepted.' })
    }
  }, [submitTitle])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.txt')) {
      setSubmitFile(file)
      if (!submitTitle) setSubmitTitle(file.name.replace(/\.txt$/, ''))
    } else if (file) {
      setSubmitResult({ type: 'error', message: 'Only .txt files are accepted.' })
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitResult(null)

    let textContent = submitText.trim()

    // If file mode, read the file
    if (submitMode === 'file' && submitFile) {
      try {
        textContent = await submitFile.text()
      } catch {
        setSubmitResult({ type: 'error', message: 'Failed to read file.' })
        setSubmitting(false)
        return
      }
    }

    if (!submitTitle.trim() || !textContent) {
      setSubmitResult({ type: 'error', message: 'Title and content are required.' })
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/codex/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: submitTitle.trim(),
          text_content: textContent,
          submitter_name: submitName.trim() || undefined,
          file_name: submitFile?.name || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitResult({ type: 'success', message: data.message })
        setSubmitTitle('')
        setSubmitText('')
        setSubmitName('')
        setSubmitFile(null)
      } else {
        setSubmitResult({ type: 'error', message: data.error })
      }
    } catch {
      setSubmitResult({ type: 'error', message: 'Submission failed. Please try again.' })
    }
    setSubmitting(false)
  }

  // Filter documents
  const filtered = documents.filter(doc => {
    if (activeCategory !== 'all' && doc.category !== activeCategory) return false
    if (search) {
      const s = search.toLowerCase()
      return doc.title.toLowerCase().includes(s) || (doc.text_full || '').toLowerCase().includes(s)
    }
    return true
  })

  // Group by category for stream view
  const groupedByCategory = {}
  for (const doc of filtered) {
    if (!groupedByCategory[doc.category]) groupedByCategory[doc.category] = []
    groupedByCategory[doc.category].push(doc)
  }

  const totalChars = documents.reduce((sum, d) => sum + (d.char_count || 0), 0)

  return (
    <Layout>
      <Head>
        <title>The Scroll | Project Bold</title>
      </Head>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-28 pb-20">

        {/* Hero */}
        <div className="mb-12">
          <span className="caption mb-4 block">Knowledge Base</span>
          <h1 className="section-title mb-3">The Scroll</h1>
          <p className="body-text text-gray-400 max-w-2xl">
            The living knowledge base of UNC Student Government. Every approved document,
            searchable and organized. Anyone can contribute.
          </p>
          <div className="flex items-center gap-6 mt-4 text-xs text-gray-600 font-mono">
            <span>{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
            <span>{totalChars.toLocaleString()} characters</span>
            <span>{buckets.length} categories</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search The Scroll..."
              className="w-full px-4 py-2.5 bg-white/[0.03] border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm">
                &times;
              </button>
            )}
          </div>

          {/* Contribute button */}
          <button
            onClick={() => setShowSubmit(!showSubmit)}
            className="btn-primary text-sm py-2.5 px-5 whitespace-nowrap"
          >
            {showSubmit ? 'Close' : 'Contribute'}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition ${
              activeCategory === 'all'
                ? 'bg-white/10 border-gray-600 text-white'
                : 'border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            All ({documents.length})
          </button>
          {buckets.map(bucket => {
            const style = getCatStyle(bucket.id)
            return (
              <button
                key={bucket.id}
                onClick={() => setActiveCategory(bucket.id)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded border transition ${
                  activeCategory === bucket.id
                    ? `${style.activeBg} ${style.border} ${style.color}`
                    : `border-gray-800 text-gray-500 hover:${style.color} hover:border-gray-700`
                }`}
              >
                {bucket.label} ({bucket.count})
              </button>
            )
          })}
        </div>

        {/* Submission Form */}
        {showSubmit && (
          <div className="mb-10 bg-white/[0.02] border border-gray-900 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight mb-1">Contribute to The Scroll</h2>
            <p className="text-gray-500 text-sm mb-6">
              Upload a .txt file or paste text for review. An admin will approve contributions before they appear in The Scroll.
            </p>

            {submitResult && (
              <div className={`mb-4 p-3 rounded border text-sm ${
                submitResult.type === 'success'
                  ? 'bg-green-500/5 border-green-500/20 text-green-400'
                  : 'bg-red-500/5 border-red-500/20 text-red-400'
              }`}>
                {submitResult.message}
              </div>
            )}

            {/* Mode toggle */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => { setSubmitMode('file'); setSubmitText('') }}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border transition ${
                  submitMode === 'file'
                    ? 'bg-white/10 border-gray-600 text-white'
                    : 'border-gray-800 text-gray-500 hover:text-white hover:border-gray-700'
                }`}
              >
                Upload .txt
              </button>
              <button
                onClick={() => { setSubmitMode('text'); setSubmitFile(null) }}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border transition ${
                  submitMode === 'text'
                    ? 'bg-white/10 border-gray-600 text-white'
                    : 'border-gray-800 text-gray-500 hover:text-white hover:border-gray-700'
                }`}
              >
                Paste Text
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="caption block mb-2">Document Title *</label>
                  <input
                    type="text"
                    value={submitTitle}
                    onChange={(e) => setSubmitTitle(e.target.value)}
                    placeholder="e.g. Student Fee Transparency Act"
                    maxLength={200}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="caption block mb-2">Your Name (optional)</label>
                  <input
                    type="text"
                    value={submitName}
                    onChange={(e) => setSubmitName(e.target.value)}
                    placeholder="Anonymous if blank"
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none"
                  />
                </div>
              </div>

              {submitMode === 'file' ? (
                <div>
                  <label className="caption block mb-2">Upload .txt File *</label>
                  <div
                    ref={dropRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-white bg-white/10'
                        : submitFile
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-gray-800 hover:border-gray-600 hover:bg-white/[0.02]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {submitFile ? (
                      <div>
                        <p className="text-green-400 font-medium text-sm">{submitFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                          {(submitFile.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSubmitFile(null) }}
                          className="mt-2 text-xs text-gray-500 hover:text-white transition"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-400 text-sm">Drop a .txt file here or click to browse</p>
                        <p className="text-xs text-gray-600 mt-1 font-mono">.TXT only</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="caption block mb-2">Document Text *</label>
                  <textarea
                    value={submitText}
                    onChange={(e) => setSubmitText(e.target.value)}
                    rows={8}
                    placeholder="Paste the full text of the document here..."
                    className="w-full bg-black border border-gray-800 rounded p-3 text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none resize-none"
                  />
                  {submitText && (
                    <p className="text-xs text-gray-600 mt-1 font-mono">{submitText.length.toLocaleString()} characters</p>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !submitTitle.trim() || (submitMode === 'text' ? !submitText.trim() : !submitFile)}
                className="w-full py-3 bg-white text-black font-medium rounded text-sm hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        )}

        {/* The Stream */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm">Loading The Scroll...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-16 text-center">
            <p className="text-gray-500">
              {search ? `No documents match "${search}"` : documents.length === 0 ? 'The Scroll is empty. Be the first to contribute.' : 'No documents in this category.'}
            </p>
          </div>
        ) : activeCategory === 'all' ? (
          // Grouped by category
          <div className="space-y-10" ref={scrollRef}>
            {buckets.filter(b => groupedByCategory[b.id]?.length > 0).map(bucket => {
              const style = getCatStyle(bucket.id)
              const docs = groupedByCategory[bucket.id] || []
              return (
                <section key={bucket.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-2 h-2 rounded-full ${style.color.replace('text-', 'bg-')}`} />
                    <h2 className={`text-sm font-semibold uppercase tracking-widest ${style.color}`}>
                      {bucket.label}
                    </h2>
                    <span className="text-xs text-gray-600 font-mono">{docs.length}</span>
                  </div>
                  <div className="space-y-3">
                    {docs.map(doc => (
                      <DocumentCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggle={() => toggleExpand(doc.id)} />
                    ))}
                  </div>
                </section>
              )
            })}
            {/* General bucket at the end */}
            {groupedByCategory['general']?.length > 0 && !buckets.find(b => b.id === 'general') && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">General</h2>
                  <span className="text-xs text-gray-600 font-mono">{groupedByCategory['general'].length}</span>
                </div>
                <div className="space-y-3">
                  {groupedByCategory['general'].map(doc => (
                    <DocumentCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggle={() => toggleExpand(doc.id)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          // Single category view
          <div className="space-y-3" ref={scrollRef}>
            {filtered.map(doc => (
              <DocumentCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggle={() => toggleExpand(doc.id)} />
            ))}
          </div>
        )}

        {/* Stats footer */}
        {!loading && documents.length > 0 && (
          <div className="mt-16 border-t border-gray-900 pt-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
                <p className="text-xs text-gray-500 mt-1">Documents</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalChars.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Characters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{buckets.length}</p>
                <p className="text-xs text-gray-500 mt-1">Categories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Grok</p>
                <p className="text-xs text-gray-500 mt-1">AI-Powered Search</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

function DocumentCard({ doc, expanded, onToggle }) {
  const [copied, setCopied] = useState(false)
  const style = getCatStyle(doc.category)
  const preview = (doc.text_full || '').slice(0, 400)
  const hasMore = (doc.text_full || '').length > 400
  const wordCount = (doc.text_full || '').split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(doc.text_full || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="bg-white/[0.02] border border-gray-900 rounded-lg overflow-hidden hover:bg-white/[0.04] hover:border-gray-800 transition-all group">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-white font-medium truncate">{doc.title}</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border shrink-0 ${style.color} ${style.border} ${style.bg}`}>
              {doc.category}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {doc.version && <span className="font-mono">v{doc.version}</span>}
            {doc.approved_at && <span>{formatDate(doc.approved_at)}</span>}
            <span className="font-mono">{wordCount.toLocaleString()} words</span>
            <span>{readTime} min read</span>
          </div>
        </div>
        <span className={`text-gray-600 text-sm transition-transform duration-200 shrink-0 mt-1 ${expanded ? 'rotate-180' : ''}`}>
          &#9660;
        </span>
      </button>

      {/* Preview / Full text */}
      <div className="px-5 pb-4">
        {expanded ? (
          <div>
            {/* Action bar */}
            <div className="flex items-center gap-2 mb-3">
              <a
                href={`/chat?doc=${doc.id}&title=${encodeURIComponent(doc.title)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                Ask Grok
              </a>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              >
                {copied ? 'Copied' : 'Copy text'}
              </button>
              <span className="text-[10px] text-gray-600 font-mono ml-auto">{(doc.char_count || 0).toLocaleString()} characters</span>
            </div>
            <div className="bg-black/50 border border-gray-900 rounded p-4 max-h-[600px] overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {doc.text_full}
              </pre>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
              {preview}{hasMore ? '...' : ''}
            </p>
            {/* Hover actions */}
            <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={`/chat?doc=${doc.id}&title=${encodeURIComponent(doc.title)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-gray-500 hover:text-white transition"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                Ask Grok about this
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
