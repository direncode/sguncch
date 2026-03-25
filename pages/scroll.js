import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

function highlightText(text, query) {
  if (!query || !text) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5">{part}</mark>
      : part
  )
}

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
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [readingDoc, setReadingDoc] = useState(null)

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

  const [mounted, setMounted] = useState(false)

  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)
  const searchTimerRef = useRef(null)

  useEffect(() => {
    loadScroll()
    requestAnimationFrame(() => setMounted(true))
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
  }, [search])

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
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase()
      return doc.title.toLowerCase().includes(s) || (doc.text_full || '').toLowerCase().includes(s)
    }
    return true
  })

  // Match counts per category when searching
  const categoryMatchCounts = useMemo(() => {
    if (!debouncedSearch) return {}
    const counts = {}
    const s = debouncedSearch.toLowerCase()
    for (const doc of documents) {
      if (doc.title.toLowerCase().includes(s) || (doc.text_full || '').toLowerCase().includes(s)) {
        counts[doc.category] = (counts[doc.category] || 0) + 1
      }
    }
    return counts
  }, [documents, debouncedSearch])

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

      <div className={`max-w-[1600px] mx-auto px-6 lg:px-12 pt-28 pb-20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Hero */}
        <div className="mb-12">
          <span className="caption mb-4 block">Knowledge Base</span>
          <h1 className="section-title mb-3">The Scroll</h1>
          <p className="body-text text-gray-400 max-w-2xl">
            The living knowledge base of UNC Student Government. Every approved document,
            searchable and organized. Anyone can contribute.
          </p>
          {!loading && (
            <div className="flex items-center gap-6 mt-4 text-xs text-gray-600 font-mono transition-opacity duration-500">
              <span>{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
              <span>{totalChars.toLocaleString()} characters</span>
              <span>{buckets.length} categor{buckets.length !== 1 ? 'ies' : 'y'}</span>
            </div>
          )}
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {debouncedSearch && (
                <span className="text-xs text-gray-500 font-mono">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              )}
              {search && (
                <button onClick={() => { setSearch(''); setDebouncedSearch('') }} className="text-gray-500 hover:text-white text-sm">
                  &times;
                </button>
              )}
            </div>
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
            const matchCount = debouncedSearch ? (categoryMatchCounts[bucket.id] || 0) : null
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
                {bucket.label} ({matchCount !== null ? matchCount : bucket.count})
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
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/[0.02] border border-gray-900 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-4 w-48 bg-gray-800 rounded" />
                  <div className="h-4 w-16 bg-gray-800/50 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-800/30 rounded" />
                  <div className="h-3 w-3/4 bg-gray-800/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-16 text-center">
            {search ? (
              <div>
                <svg className="w-10 h-10 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-gray-500">No documents match &ldquo;{search}&rdquo;</p>
                <button onClick={() => { setSearch(''); setDebouncedSearch('') }} className="mt-3 text-sm text-gray-400 hover:text-white transition">Clear search</button>
              </div>
            ) : documents.length === 0 ? (
              <div>
                <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="text-gray-400 font-medium mb-1">The Scroll is empty</p>
                <p className="text-gray-600 text-sm mb-4">Upload seed documents via the Admin Scroll panel, or contribute below.</p>
                <button onClick={() => setShowSubmit(true)} className="text-sm text-white bg-white/10 border border-gray-700 px-4 py-2 rounded hover:bg-white/15 transition">
                  Contribute a document
                </button>
              </div>
            ) : (
              <p className="text-gray-500">No documents in this category.</p>
            )}
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
                      <DocumentCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggle={() => toggleExpand(doc.id)} searchQuery={debouncedSearch} onRead={() => setReadingDoc(doc)} allDocs={documents} />
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
                    <DocumentCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggle={() => toggleExpand(doc.id)} searchQuery={debouncedSearch} onRead={() => setReadingDoc(doc)} allDocs={documents} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          // Single category view
          <div className="space-y-3" ref={scrollRef}>
            {filtered.map(doc => (
              <DocumentCard key={doc.id} doc={doc} expanded={expandedDocs.has(doc.id)} onToggle={() => toggleExpand(doc.id)} searchQuery={debouncedSearch} onRead={() => setReadingDoc(doc)} allDocs={documents} />
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

      {/* Reading Mode Overlay */}
      {readingDoc && (
        <ReadingMode doc={readingDoc} onClose={() => setReadingDoc(null)} />
      )}
    </Layout>
  )
}

function DocumentCard({ doc, expanded, onToggle, searchQuery, onRead, allDocs }) {
  const [copied, setCopied] = useState(false)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)
  const style = getCatStyle(doc.category)
  const preview = doc.summary || (doc.text_full || '').slice(0, 400)
  const hasMore = !doc.summary && (doc.text_full || '').length > 400
  const wordCount = (doc.text_full || '').split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  // Measure content height for smooth expand/collapse
  useEffect(() => {
    if (expanded && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [expanded])

  // Related documents: up to 2 other docs from the same category
  const relatedDocs = useMemo(() => {
    if (!allDocs) return []
    return allDocs
      .filter(d => d.category === doc.category && d.id !== doc.id)
      .slice(0, 2)
  }, [allDocs, doc.category, doc.id])

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
            <h3 className="text-white font-medium truncate">
              {searchQuery ? highlightText(doc.title, searchQuery) : doc.title}
            </h3>
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

      {/* Preview — always visible */}
      <div className="px-5 pb-4">
        <p className={`text-sm text-gray-500 leading-relaxed transition-all duration-300 ${expanded ? 'line-clamp-none' : 'line-clamp-3'}`}>
          {searchQuery ? highlightText(preview + (hasMore && !expanded ? '...' : ''), searchQuery) : <>{preview}{hasMore && !expanded ? '...' : ''}</>}
        </p>

        {/* Key provisions chips */}
        {doc.key_provisions && doc.key_provisions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(expanded ? doc.key_provisions : doc.key_provisions.slice(0, 4)).map((provision, i) => (
              <span key={i} className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${style.color} ${style.border} ${style.bg}`}>
                {provision}
              </span>
            ))}
            {!expanded && doc.key_provisions.length > 4 && (
              <span className="text-[9px] text-gray-600 font-mono self-center">+{doc.key_provisions.length - 4} more</span>
            )}
          </div>
        )}

        {/* Expanded content — animated */}
        <div
          className="overflow-hidden transition-all duration-400 ease-in-out"
          style={{ maxHeight: expanded ? `${Math.max(contentHeight, 800)}px` : '0px', opacity: expanded ? 1 : 0 }}
        >
          <div ref={contentRef}>
            {/* Action bar */}
            <div className="flex items-center gap-2 mt-3 mb-3 flex-wrap">
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
              <button
                onClick={(e) => { e.stopPropagation(); onRead && onRead() }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Read
              </button>
              <span className="text-[10px] text-gray-600 font-mono ml-auto">{(doc.char_count || 0).toLocaleString()} characters</span>
            </div>

            <div className="bg-black/50 border border-gray-900 rounded p-4 max-h-[600px] overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {doc.text_full}
              </pre>
            </div>

            {/* Related documents */}
            {relatedDocs.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-gray-600 font-mono">Related:</span>
                {relatedDocs.map(rd => (
                  <span key={rd.id} className={`px-2 py-0.5 rounded text-[10px] border cursor-default ${style.color} ${style.border} ${style.bg}`}>
                    {rd.title.length > 40 ? rd.title.slice(0, 40) + '...' : rd.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hover actions — collapsed only */}
        {!expanded && (
          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <a
              href={`/chat?doc=${doc.id}&title=${encodeURIComponent(doc.title)}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-gray-500 hover:text-white transition"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
              Ask Grok
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); onRead && onRead() }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-gray-500 hover:text-white transition"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Read
            </button>
            {relatedDocs.length > 0 && (
              <>
                <span className="text-[9px] text-gray-600 font-mono ml-1">Related:</span>
                {relatedDocs.map(rd => (
                  <span key={rd.id} className={`px-1.5 py-0.5 rounded text-[9px] border cursor-default ${style.color} ${style.border} ${style.bg}`}>
                    {rd.title.length > 30 ? rd.title.slice(0, 30) + '...' : rd.title}
                  </span>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ReadingMode({ doc, onClose }) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)
  const style = getCatStyle(doc.category)
  const text = doc.text_full || ''

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Detect headings: ALL CAPS lines, "Section X", "Article X"
  const headings = useMemo(() => {
    const lines = text.split('\n')
    const found = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const isAllCaps = line.length > 3 && line === line.toUpperCase() && /[A-Z]/.test(line)
      const isSectionOrArticle = /^(Section|Article|SECTION|ARTICLE)\s+\w/i.test(line)
      if (isAllCaps || isSectionOrArticle) {
        found.push({ text: line, id: `heading-${i}`, lineIndex: i })
      }
    }
    return found
  }, [text])

  // Build rendered content with heading detection
  const renderedContent = useMemo(() => {
    const lines = text.split('\n')
    const headingLineSet = new Set(headings.map(h => h.lineIndex))
    const elements = []
    let currentParagraph = []
    let lineCounter = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim() === '') {
        if (currentParagraph.length > 0) {
          elements.push({ type: 'paragraph', text: currentParagraph.join('\n'), key: `p-${lineCounter}` })
          currentParagraph = []
          lineCounter++
        }
      } else if (headingLineSet.has(i)) {
        if (currentParagraph.length > 0) {
          elements.push({ type: 'paragraph', text: currentParagraph.join('\n'), key: `p-${lineCounter}` })
          currentParagraph = []
          lineCounter++
        }
        elements.push({ type: 'heading', text: line.trim(), id: `heading-${i}`, key: `h-${i}` })
      } else {
        currentParagraph.push(line)
      }
    }
    if (currentParagraph.length > 0) {
      elements.push({ type: 'paragraph', text: currentParagraph.join('\n'), key: `p-${lineCounter}` })
    }
    return elements
  }, [text, headings])

  const scrollToHeading = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className={`fixed inset-0 z-50 bg-white overflow-hidden flex transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Sidebar navigation */}
      {headings.length > 0 && (
        <div className="hidden lg:block w-64 border-r border-gray-200 overflow-y-auto p-6 shrink-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-4">Sections</p>
          <nav className="space-y-1">
            {headings.map(h => (
              <button
                key={h.id}
                onClick={() => scrollToHeading(h.id)}
                className="block w-full text-left text-xs text-gray-500 hover:text-gray-900 py-1 px-2 rounded hover:bg-gray-100 transition truncate"
                title={h.text}
              >
                {h.text.length > 35 ? h.text.slice(0, 35) + '...' : h.text}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main reading area */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{doc.title}</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border shrink-0 ${style.color} ${style.border} ${style.bg}`}>
              {doc.category}
            </span>
            {doc.version && <span className="text-xs text-gray-400 font-mono shrink-0">v{doc.version}</span>}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-full hover:border-gray-400 transition"
            >
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              aria-label="Close reading mode"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Document body */}
        <div className="max-w-[680px] mx-auto px-6 py-10" style={{ fontSize: '16px', lineHeight: '1.8' }}>
          {renderedContent.map(el => {
            if (el.type === 'heading') {
              return (
                <h2
                  key={el.key}
                  id={el.id}
                  className="text-gray-900 font-semibold text-lg mt-8 mb-3 scroll-mt-20"
                >
                  {el.text}
                </h2>
              )
            }
            return (
              <p key={el.key} className="text-gray-700 mb-4 whitespace-pre-wrap">
                {el.text}
              </p>
            )
          })}
        </div>
      </div>

      {/* Floating Ask Grok button */}
      <a
        href={`/chat?doc=${doc.id}&title=${encodeURIComponent(doc.title)}`}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition text-sm font-medium"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
        Ask Grok
      </a>
    </div>
  )
}
