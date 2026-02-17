import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { getAdminToken, getAuthHeaders } from '../../lib/adminSession'
import { SEED_DOCUMENTS } from '../../lib/scrollRegistry'
import AdminNav from '../../components/AdminNav'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
const formatSize = (bytes) => bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`

const CATEGORIES = {
  laws: { label: 'Laws & Statutes', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  policies: { label: 'Policies', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  resources: { label: 'Resources', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  academic: { label: 'Academic', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  budget: { label: 'Budget', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  'student-life': { label: 'Student Life', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  general: { label: 'General', color: 'text-gray-400 border-gray-500/30 bg-gray-500/10' },
}

const CAT_KEYWORDS = {
  laws: ['law', 'statute', 'code of conduct', 'act', 'legislation', 'legal', 'regulation', 'ferpa', 'title ix', 'clery', 'judicial'],
  policies: ['policy', 'governance', 'procedure', 'bylaw', 'constitution', 'charter', 'rules', 'guideline', 'conduct', 'honor code', 'resolution'],
  resources: ['resource', 'service', 'support', 'program', 'center', 'office', 'help', 'assistance', 'counseling', 'health', 'wellness', 'safety'],
  academic: ['academic', 'course', 'faculty', 'curriculum', 'degree', 'registration', 'advising', 'research', 'grading', 'provost'],
  budget: ['budget', 'finance', 'funding', 'allocation', 'expenditure', 'revenue', 'fee', 'cost', 'appropriation', 'treasurer', 'fiscal'],
  'student-life': ['organization', 'club', 'event', 'housing', 'dining', 'recreation', 'campus life', 'greek', 'fraternity', 'athletics'],
}

function autoCategory(title) {
  const text = title.toLowerCase()
  let best = null, bestScore = 0
  for (const [cat, keywords] of Object.entries(CAT_KEYWORDS)) {
    let score = 0
    for (const kw of keywords) {
      if (text.includes(kw)) score += kw.includes(' ') ? 3 : 1
    }
    if (score > bestScore) { bestScore = score; best = cat }
  }
  return best || 'general'
}

const ACCEPTED_EXTENSIONS = ['.txt', '.md', '.csv']

function isAcceptedFile(file) {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return ACCEPTED_EXTENSIONS.includes(ext)
}

// Inline .txt uploader for the Documents tab
function DocTxtUploader({ seed, authHeaders, onUploaded, notify }) {
  const [file, setFile] = useState(null)
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
        headers: authHeaders,
        body: JSON.stringify({
          files: [{
            title: seed.title,
            text_content: textContent,
            version: seed.version || '1.0',
            file_name: file.name,
            file_size: file.size,
            source_url: seed.pdfUrl || null,
          }],
        }),
      })
      const data = await res.json()
      if (res.ok && data.succeeded > 0) {
        setResult({ ok: true, message: `Added to The Scroll — ${data.results[0]?.chunk_count || 0} chunks indexed.` })
        setFile(null)
        notify(`${seed.title} added to The Scroll`)
        setTimeout(() => onUploaded(), 1000)
      } else {
        setResult({ ok: false, message: data.results?.[0]?.error || data.error || 'Upload failed' })
      }
    } catch {
      setResult({ ok: false, message: 'Upload failed. Check your connection.' })
    }
    setUploading(false)
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-800">
      <p className="text-xs text-gray-500 mb-3">
        Upload the .txt version of <strong className="text-gray-400">{seed.title}</strong> for Grok RAG indexing.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 text-xs font-medium bg-black border border-gray-800 rounded hover:border-green-500/50 hover:text-green-400 transition text-gray-400"
        >
          {file ? file.name : 'Choose .txt file'}
        </button>
        <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} className="hidden" />
        {file && (
          <>
            <span className="text-[10px] text-gray-600 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 text-xs font-medium bg-green-500 text-black rounded hover:bg-green-400 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Add to Scroll'}
            </button>
          </>
        )}
      </div>
      {result && (
        <div className={`mt-3 p-3 rounded border text-xs ${
          result.ok ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>{result.message}</div>
      )}
    </div>
  )
}

export default function ScrollAdmin() {
  const router = useRouter()
  const { isAdmin, isLoaded } = useApp()

  const [activeTab, setActiveTab] = useState('overview')
  const [toast, setToast] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [expandedDoc, setExpandedDoc] = useState(null)

  // Upload queue
  const [uploadQueue, setUploadQueue] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  // Paste text
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteText, setPasteText] = useState('')

  // AI classification cache: { [docId]: { category, tags, summary, commit_id, ... } }
  const [classifications, setClassifications] = useState({})
  const [classifyingId, setClassifyingId] = useState(null)

  // Database setup
  const [dbSetupNeeded, setDbSetupNeeded] = useState(null) // null=checking, true=needed, false=ok
  const [dbConnString, setDbConnString] = useState('')
  const [dbSetupLoading, setDbSetupLoading] = useState(false)
  const [dbSetupResult, setDbSetupResult] = useState(null)
  const [dbSqlVisible, setDbSqlVisible] = useState(false)
  const [dbSqlCopied, setDbSqlCopied] = useState(false)

  // Reject modal
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && !isAdmin) router.push('/admin/login')
  }, [isLoaded, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      loadDocuments()
      // Check if database tables exist
      fetch('/api/setup/db-status')
        .then(r => r.json())
        .then(data => {
          if (data.supabaseConfigured && !data.tablesExist) {
            setDbSetupNeeded(true)
          } else {
            setDbSetupNeeded(false)
          }
        })
        .catch(() => setDbSetupNeeded(false))
    }
  }, [isAdmin])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const authHeaders = getAuthHeaders()

  const [dbMigrationSQL, setDbMigrationSQL] = useState(null)

  const handleDbSetup = async () => {
    if (!dbConnString.trim()) return notify('Paste your Supabase connection string')
    setDbSetupLoading(true)
    setDbSetupResult(null)
    try {
      const res = await fetch('/api/setup/init-db', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ connectionString: dbConnString }),
      })
      const data = await res.json()
      if (data.status === 'migrated' || data.status === 'already_configured') {
        setDbSetupResult({ ok: true, message: data.message })
        setDbSetupNeeded(false)
        setDbConnString('')
        setTimeout(() => loadDocuments(), 1000)
      } else {
        setDbSetupResult({ ok: false, message: data.message })
        if (data.sql) setDbMigrationSQL(data.sql)
      }
    } catch {
      setDbSetupResult({ ok: false, message: 'Connection failed. Check your connection string and try again.' })
    }
    setDbSetupLoading(false)
  }

  const handleCopySQL = async () => {
    // Fetch SQL from server if we don't have it yet
    let sql = dbMigrationSQL
    if (!sql) {
      try {
        const res = await fetch('/api/setup/init-db', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({}),
        })
        const data = await res.json()
        sql = data.sql
        if (sql) setDbMigrationSQL(sql)
      } catch { /* ignore */ }
    }
    if (sql) {
      await navigator.clipboard.writeText(sql)
      setDbSqlCopied(true)
      notify('SQL copied — paste it into Supabase SQL Editor and click Run')
      setTimeout(() => setDbSqlCopied(false), 3000)
    } else {
      notify('Could not fetch SQL')
    }
  }

  const handleDbCheckAfterManualSQL = async () => {
    setDbSetupLoading(true)
    setDbSetupResult(null)
    try {
      const res = await fetch('/api/setup/db-status')
      const data = await res.json()
      if (data.tablesExist) {
        setDbSetupResult({ ok: true, message: 'Tables detected. Supabase is now active for permanent storage.' })
        setDbSetupNeeded(false)
        resetCodexCacheOnServer()
        setTimeout(() => loadDocuments(), 1000)
      } else {
        setDbSetupResult({ ok: false, message: 'Tables not found yet. Make sure you ran the SQL in Supabase SQL Editor.' })
      }
    } catch {
      setDbSetupResult({ ok: false, message: 'Check failed.' })
    }
    setDbSetupLoading(false)
  }

  const resetCodexCacheOnServer = async () => {
    try {
      await fetch('/api/setup/init-db', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({}),
      })
    } catch { /* ignore */ }
  }

  const loadDocuments = async () => {
    setLoadingDocs(true)
    try {
      const [pending, approved, rejected] = await Promise.all([
        fetch('/api/codex/documents?status=pending&include_text=true').then(r => r.json()),
        fetch('/api/codex/documents?status=approved&include_text=true').then(r => r.json()),
        fetch('/api/codex/documents?status=rejected').then(r => r.json()),
      ])
      const all = [
        ...(pending.documents || []).map(d => ({ ...d, status: 'pending' })),
        ...(approved.documents || []).map(d => ({ ...d, status: 'approved' })),
        ...(rejected.documents || []).map(d => ({ ...d, status: 'rejected' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setDocuments(all)
    } catch (err) {
      console.error('Failed to load:', err)
    }
    setLoadingDocs(false)
  }

  // Drag & drop
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true) }, [])
  const handleDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget)) setDragActive(false)
  }, [])
  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    addFilesToQueue(Array.from(e.dataTransfer.files))
  }, [])
  const handleFileInput = (e) => {
    addFilesToQueue(Array.from(e.target.files || []))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addFilesToQueue = (files) => {
    const valid = files.filter(f => isAcceptedFile(f))
    if (files.length - valid.length > 0) notify(`${files.length - valid.length} unsupported file(s) skipped`)
    if (valid.length === 0) return
    const newItems = valid.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f, title: f.name.replace(/\.[^.]+$/, ''),
      status: 'queued', chunks: 0, error: null,
    }))
    setUploadQueue(prev => [...prev, ...newItems])
  }

  const removeFromQueue = (id) => setUploadQueue(prev => prev.filter(i => i.id !== id))
  const updateQueueItem = (id, updates) => setUploadQueue(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))

  const processQueue = async () => {
    const queued = uploadQueue.filter(i => i.status === 'queued')
    if (queued.length === 0) return
    setIsProcessing(true)
    await Promise.all(queued.map(async (item) => {
      updateQueueItem(item.id, { status: 'uploading' })
      try {
        const textContent = await item.file.text()
        const body = {
          title: item.title, version: '1.0',
          file_name: item.file.name, file_size: item.file.size,
          text_content: textContent,
        }
        const res = await fetch('/api/codex/batch-upload', {
          method: 'POST', headers: authHeaders,
          body: JSON.stringify({ files: [body] }),
        })
        const text = await res.text()
        let data
        try { data = JSON.parse(text) } catch {
          throw new Error(res.status === 413 ? `File too large` : `Server error (${res.status})`)
        }
        if (res.ok && data.results?.[0]?.status === 'approved') {
          const docId = data.results[0].document_id
          updateQueueItem(item.id, { status: 'done', chunks: data.results[0].chunk_count || 0, docId })

          // Auto-classify with Grok
          try {
            const classRes = await fetch('/api/codex/classify', {
              method: 'POST', headers: authHeaders,
              body: JSON.stringify({ title: item.title, text_preview: textContent.slice(0, 2000) }),
            })
            if (classRes.ok) {
              const classData = await classRes.json()
              setClassifications(prev => ({ ...prev, [docId]: classData }))
            }
          } catch { /* classification is non-blocking */ }
        } else {
          updateQueueItem(item.id, { status: 'error', error: data.results?.[0]?.error || data.error || 'Failed' })
        }
      } catch (err) {
        updateQueueItem(item.id, { status: 'error', error: err.message })
      }
    }))
    setIsProcessing(false)
    loadDocuments()
  }

  useEffect(() => {
    if (uploadQueue.some(i => i.status === 'queued') && !isProcessing) processQueue()
  }, [uploadQueue.length])

  const handlePasteUpload = async () => {
    if (!pasteTitle.trim() || !pasteText.trim()) return notify('Title and text required')
    setIsProcessing(true)
    try {
      const res = await fetch('/api/codex/batch-upload', {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ files: [{ title: pasteTitle.trim(), text_content: pasteText, version: '1.0' }] }),
      })
      const data = await res.json()
      if (res.ok && data.succeeded > 0) {
        const docId = data.results[0]?.document_id
        notify(`Ingested — ${data.results[0]?.chunk_count || 0} chunks indexed`)

        // Auto-classify with Grok
        if (docId) {
          try {
            const classRes = await fetch('/api/codex/classify', {
              method: 'POST', headers: authHeaders,
              body: JSON.stringify({ title: pasteTitle.trim(), text_preview: pasteText.slice(0, 2000) }),
            })
            if (classRes.ok) {
              const classData = await classRes.json()
              setClassifications(prev => ({ ...prev, [docId]: classData }))
            }
          } catch { /* non-blocking */ }
        }

        setPasteTitle(''); setPasteText('')
        loadDocuments()
      } else { notify(data.results?.[0]?.error || 'Failed') }
    } catch { notify('Upload failed') }
    setIsProcessing(false)
  }

  const handleApprove = async (id) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/codex/approve', { method: 'POST', headers: authHeaders, body: JSON.stringify({ document_id: id }) })
      const data = await res.json()
      if (res.ok) { notify(`Approved — ${data.chunk_count} chunks indexed`); loadDocuments() }
      else { notify(data.error || 'Failed') }
    } catch { notify('Failed') }
    setActionLoading(false)
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return notify('Provide a reason')
    setActionLoading(true)
    try {
      const res = await fetch('/api/codex/reject', { method: 'POST', headers: authHeaders, body: JSON.stringify({ document_id: id, reason: rejectReason }) })
      if (res.ok) { notify('Rejected'); setRejectingId(null); setRejectReason(''); loadDocuments() }
      else { notify('Failed') }
    } catch { notify('Failed') }
    setActionLoading(false)
  }

  const classifyDocument = async (doc) => {
    setClassifyingId(doc.id)
    try {
      const res = await fetch('/api/codex/classify', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: doc.title,
          text_preview: doc.text_full || '',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setClassifications(prev => ({ ...prev, [doc.id]: data }))
        notify(`Classified: ${data.category} (${Math.round(data.confidence * 100)}% confidence)`)
      } else {
        notify(data.error || 'Classification failed')
      }
    } catch {
      notify('Classification failed')
    }
    setClassifyingId(null)
  }

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>
  if (!isAdmin) return null

  const pending = documents.filter(d => d.status === 'pending')
  const approved = documents.filter(d => d.status === 'approved')
  const rejected = documents.filter(d => d.status === 'rejected')

  // Track which seed documents are in the Scroll
  const seedStatus = SEED_DOCUMENTS.map(seed => {
    const match = approved.find(d =>
      d.title.toLowerCase().includes(seed.title.toLowerCase()) ||
      seed.title.toLowerCase().includes(d.title.toLowerCase().replace(/\s*\(.*\)/, ''))
    )
    return { ...seed, uploaded: !!match, docId: match?.id }
  })
  const seedUploadedCount = seedStatus.filter(s => s.uploaded).length

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: `Documents (${SEED_DOCUMENTS.length})` },
    { id: 'upload', label: 'Upload' },
    { id: 'pending', label: `Pending (${pending.length})`, alert: pending.length > 0 },
    { id: 'approved', label: `Approved (${approved.length})` },
    { id: 'rejected', label: `Rejected (${rejected.length})` },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Head><title>The Scroll — Admin | Project Bold</title></Head>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-gray-800 text-white px-6 py-3 rounded text-sm font-mono">
          {toast}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-gray-800 rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
              <h3 className="font-semibold">Reject Submission</h3>
              <button onClick={() => { setRejectingId(null); setRejectReason('') }} className="text-gray-500 hover:text-white text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
                className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-gray-600 focus:outline-none resize-none"
                placeholder="Reason for rejection..." />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setRejectingId(null); setRejectReason('') }}
                  className="px-4 py-2 text-sm bg-white/5 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition">Cancel</button>
                <button onClick={() => handleReject(rejectingId)} disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition disabled:opacity-50 rounded-lg">
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-gray-400 text-sm hover:text-white transition">&larr; Admin</Link>
              <span className="text-xl font-bold tracking-tight">The Scroll</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-400 font-mono">{approved.length} live</span>
              {pending.length > 0 && (
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded font-mono animate-pulse">
                  {pending.length} pending
                </span>
              )}
              <Link href="/scroll" className="text-gray-500 hover:text-white transition">View Public Scroll &rarr;</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-16 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
                }`}>
                {tab.label}
                {tab.alert && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Database Setup Banner */}
      {dbSetupNeeded && (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-6">
          <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-2xl">&#9888;</span>
              <div className="flex-1">
                <h3 className="text-yellow-400 font-semibold mb-1">Database Setup Required</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Your Supabase tables don&apos;t exist yet. Documents uploaded now will be lost on redeploy.
                </p>

                {/* Option A: Copy SQL (recommended) */}
                <div className="bg-black/40 border border-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">Option 1 — Run SQL in Supabase (recommended)</p>
                  <ol className="text-xs text-gray-500 space-y-1 mb-3 list-decimal list-inside">
                    <li>Click <strong className="text-gray-300">Copy SQL</strong> below</li>
                    <li>Open <strong className="text-gray-300">Supabase Dashboard</strong> &rarr; SQL Editor</li>
                    <li>Paste and click <strong className="text-gray-300">Run</strong></li>
                    <li>Come back here and click <strong className="text-gray-300">Verify Tables</strong></li>
                  </ol>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopySQL}
                      className="px-5 py-2.5 text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition whitespace-nowrap"
                    >
                      {dbSqlCopied ? 'Copied!' : 'Copy SQL'}
                    </button>
                    <button
                      onClick={handleDbCheckAfterManualSQL}
                      disabled={dbSetupLoading}
                      className="px-5 py-2.5 text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {dbSetupLoading ? 'Checking...' : 'Verify Tables'}
                    </button>
                  </div>
                </div>

                {/* Option B: Connection string */}
                <details className="group">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 transition">
                    Option 2 — Auto-create via connection string
                  </summary>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-3">
                      <strong className="text-gray-400">Supabase Dashboard</strong> &rarr; Connect &rarr; Session pooler &rarr; copy the URI
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="password"
                        value={dbConnString}
                        onChange={(e) => setDbConnString(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDbSetup()}
                        placeholder="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres"
                        className="flex-1 px-4 py-2.5 bg-black border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-yellow-500/50 focus:outline-none font-mono"
                      />
                      <button
                        onClick={handleDbSetup}
                        disabled={dbSetupLoading || !dbConnString.trim()}
                        className="px-5 py-2.5 text-sm font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition disabled:opacity-50 whitespace-nowrap"
                      >
                        {dbSetupLoading ? 'Creating...' : 'Initialize'}
                      </button>
                    </div>
                  </div>
                </details>

                {dbSetupResult && (
                  <div className={`mt-3 p-3 rounded-lg border text-sm ${
                    dbSetupResult.ok
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {dbSetupResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Knowledge Base</h1>
              <p className="text-gray-500 text-sm">The Scroll feeds Grok with your governance documents. Upload content, approve public submissions, and manage what the AI knows.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Documents</p>
                <p className="text-3xl font-mono font-bold text-white">{documents.length}</p>
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
                <p className="text-xs text-green-400 uppercase tracking-wider mb-2">Live in Scroll</p>
                <p className="text-3xl font-mono font-bold text-green-400">{approved.length}</p>
              </div>
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
                <p className="text-xs text-yellow-400 uppercase tracking-wider mb-2">Awaiting Review</p>
                <p className="text-3xl font-mono font-bold text-yellow-400">{pending.length}</p>
              </div>
              <div className="bg-white/5 border border-gray-800 rounded-xl p-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Rejected</p>
                <p className="text-3xl font-mono font-bold text-gray-400">{rejected.length}</p>
              </div>
            </div>

            {/* Seed checklist — show when not all foundation documents are uploaded */}
            {(() => {
              const allSeeded = seedUploadedCount === SEED_DOCUMENTS.length

              return (
                <div className={`mb-12 rounded-xl border p-6 ${allSeeded ? 'bg-green-500/5 border-green-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        {allSeeded ? 'Foundation Documents Seeded' : 'Seed The Scroll'}
                        {!allSeeded && <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        {allSeeded
                          ? 'All governing documents are uploaded. Grok is fully operational.'
                          : 'Upload .txt versions of these official governing documents. Grok chat is blocked until at least one is uploaded.'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-mono font-bold ${allSeeded ? 'text-green-400' : 'text-yellow-400'}`}>
                        {seedUploadedCount}/{SEED_DOCUMENTS.length}
                      </span>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">seeded</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {seedStatus.map(seed => (
                      <div key={seed.key} className={`flex items-center gap-4 rounded-lg border p-3 ${
                        seed.uploaded ? 'bg-green-500/5 border-green-500/20' : 'bg-black/40 border-gray-800'
                      }`}>
                        <span className={`text-lg font-mono ${seed.uploaded ? 'text-green-400' : 'text-gray-700'}`}>
                          {seed.uploaded ? '\u2713' : '\u2022'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${seed.uploaded ? 'text-green-300' : 'text-white'}`}>
                              {seed.title}
                            </span>
                            <span className="text-[10px] text-gray-600 font-mono">v{seed.version}</span>
                            {seed.required && !seed.uploaded && (
                              <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-[10px] text-yellow-400 font-mono">REQUIRED</span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-mono shrink-0 ${seed.uploaded ? 'text-green-400' : 'text-gray-600'}`}>
                          {seed.uploaded ? 'Seeded' : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {!allSeeded && (
                    <button onClick={() => setActiveTab('documents')}
                      className="mt-4 w-full py-3 bg-white/10 border border-gray-700 rounded-lg text-sm text-white font-medium hover:bg-white/20 transition">
                      Go to Documents tab to add .txt files
                    </button>
                  )}
                </div>
              )
            })()}

            {/* Category breakdown */}
            {approved.length > 0 && (
              <div className="mb-12">
                <h2 className="text-lg font-semibold mb-4">Categories (auto-detected)</h2>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(CATEGORIES).map(([id, cat]) => {
                    const count = approved.filter(d => autoCategory(d.title) === id).length
                    if (count === 0) return null
                    return (
                      <div key={id} className={`px-4 py-2 rounded-lg border text-sm ${cat.color}`}>
                        {cat.label}: {count}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pending submissions requiring action */}
            {pending.length > 0 && (
              <div className="mb-12">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  Submissions Awaiting Review
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                </h2>
                <div className="space-y-3">
                  {pending.slice(0, 5).map(doc => (
                    <div key={doc.id} className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-white font-medium">{doc.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="font-mono">v{doc.version}</span>
                            <span>{formatDate(doc.created_at)}</span>
                            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${CATEGORIES[autoCategory(doc.title)]?.color || CATEGORIES.general.color}`}>
                              {CATEGORIES[autoCategory(doc.title)]?.label || 'General'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleApprove(doc.id)} disabled={actionLoading}
                            className="px-4 py-2 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition disabled:opacity-50 rounded-lg">
                            Approve
                          </button>
                          <button onClick={() => setRejectingId(doc.id)}
                            className="px-4 py-2 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition rounded-lg">
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pending.length > 5 && (
                    <button onClick={() => setActiveTab('pending')} className="text-sm text-gray-400 hover:text-white transition">
                      View all {pending.length} pending &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid sm:grid-cols-3 gap-4">
              <button onClick={() => setActiveTab('upload')}
                className="p-6 bg-white/5 border border-gray-800 rounded-xl hover:bg-white/10 transition-all text-left">
                <p className="text-white font-medium mb-1">Upload Documents</p>
                <p className="text-xs text-gray-500">Drop files or paste text to add to the knowledge base</p>
              </button>
              <Link href="/scroll"
                className="p-6 bg-white/5 border border-gray-800 rounded-xl hover:bg-white/10 transition-all text-left block">
                <p className="text-white font-medium mb-1">View Public Scroll</p>
                <p className="text-xs text-gray-500">See how approved content appears to users</p>
              </Link>
              <Link href="/chat?mode=admin"
                className="p-6 bg-white/5 border border-gray-800 rounded-xl hover:bg-white/10 transition-all text-left block">
                <p className="text-white font-medium mb-1">Grok Admin</p>
                <p className="text-xs text-gray-500">Ask Grok with full admin context and Scroll data</p>
              </Link>
            </div>
          </div>
        )}

        {/* DOCUMENTS — Full PDF catalogue with inline .txt upload */}
        {activeTab === 'documents' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Document Catalogue</h1>
              <p className="text-gray-500 text-sm">
                All official UNC governance documents. Open PDFs directly or upload .txt versions to The Scroll.
                {seedUploadedCount < SEED_DOCUMENTS.length
                  ? ` ${seedUploadedCount}/${SEED_DOCUMENTS.length} documents are in The Scroll.`
                  : ' All documents are in The Scroll.'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-8 bg-white/5 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Scroll Coverage</span>
                <span className={`text-sm font-mono font-bold ${seedUploadedCount === SEED_DOCUMENTS.length ? 'text-green-400' : 'text-yellow-400'}`}>
                  {seedUploadedCount}/{SEED_DOCUMENTS.length}
                </span>
              </div>
              <div className="w-full bg-gray-900 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${seedUploadedCount === SEED_DOCUMENTS.length ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${(seedUploadedCount / SEED_DOCUMENTS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Category groups */}
            {['Student Government', 'University Policy', 'Student Conduct'].map(category => {
              const catDocs = seedStatus.filter(s => s.category === category)
              const catUploaded = catDocs.filter(s => s.uploaded).length
              const catColors = {
                'Student Government': 'text-purple-400 border-purple-500/30 bg-purple-500/10',
                'University Policy': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
                'Student Conduct': 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
              }
              return (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-2.5 py-1 rounded border text-xs font-medium uppercase tracking-wider ${catColors[category]}`}>
                      {category}
                    </span>
                    <span className="text-xs text-gray-600 font-mono">{catUploaded}/{catDocs.length} in Scroll</span>
                  </div>
                  <div className="space-y-3">
                    {catDocs.map(seed => (
                      <div key={seed.key} className={`rounded-xl border p-5 transition-all ${
                        seed.uploaded
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-white/[0.02] border-gray-800 hover:border-gray-700'
                      }`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-base font-mono ${seed.uploaded ? 'text-green-400' : 'text-gray-700'}`}>
                                {seed.uploaded ? '\u2713' : '\u2022'}
                              </span>
                              <h3 className={`font-semibold text-sm ${seed.uploaded ? 'text-green-300' : 'text-white'}`}>
                                {seed.title}
                              </h3>
                              <span className="text-[10px] text-gray-600 font-mono">v{seed.version}</span>
                              {seed.required && (
                                <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-[10px] text-red-400 font-mono">REQUIRED</span>
                              )}
                              {seed.uploaded && (
                                <span className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/30 text-[10px] text-green-400 font-mono">IN SCROLL</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 ml-7">{seed.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!seed.uploaded && (
                              <button
                                onClick={() => setExpandedDoc(expandedDoc === `txt-${seed.key}` ? null : `txt-${seed.key}`)}
                                className={`px-4 py-2 text-xs font-medium rounded-lg transition ${
                                  expandedDoc === `txt-${seed.key}`
                                    ? 'bg-green-500 text-black'
                                    : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20'
                                }`}
                              >
                                {expandedDoc === `txt-${seed.key}` ? 'Close' : 'Add .txt'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Add .txt panel */}
                        {!seed.uploaded && expandedDoc === `txt-${seed.key}` && (
                          <DocTxtUploader
                            seed={seed}
                            authHeaders={authHeaders}
                            onUploaded={() => { loadDocuments(); setExpandedDoc(null) }}
                            notify={notify}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Instructions */}
            <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-6 mt-4">
              <h3 className="text-sm font-semibold text-white mb-2">How to add documents to The Scroll</h3>
              <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Click <strong className="text-gray-400">Add .txt</strong> to upload the text version for Grok RAG indexing</li>
                <li>The document is instantly chunked, embedded, and available to Grok</li>
                <li>PDF links are automatically pulled from the document registry</li>
              </ol>
            </div>
          </div>
        )}

        {/* UPLOAD */}
        {activeTab === 'upload' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Upload to The Scroll</h1>
              <p className="text-gray-500 text-sm">Drop plain text files or paste content. Documents are auto-approved, chunked, embedded, and indexed.</p>
            </div>

            {/* Drop zone */}
            <div
              ref={dropRef} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-8 ${
                dragActive ? 'border-white bg-white/10 scale-[1.01]' : 'border-gray-800 hover:border-gray-600 hover:bg-white/[0.02]'
              }`}
            >
              <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_EXTENSIONS.join(',')} onChange={handleFileInput} className="hidden" />
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/5 border border-gray-800 flex items-center justify-center">
                <span className="text-3xl text-gray-600">&uarr;</span>
              </div>
              <p className="text-gray-300 text-sm font-medium">Drop files here or click to browse</p>
              <p className="text-gray-600 text-xs mt-2 font-mono">TXT / MD / CSV</p>
            </div>

            {/* Upload queue */}
            {uploadQueue.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Queue</h3>
                  {uploadQueue.every(i => i.status === 'done' || i.status === 'error') && (
                    <button onClick={() => setUploadQueue([])} className="text-xs text-gray-500 hover:text-white transition">Clear</button>
                  )}
                </div>
                <div className="space-y-2">
                  {uploadQueue.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-white/[0.02] border border-gray-900 rounded-lg px-5 py-3">
                      <span className={`text-lg font-mono ${
                        item.status === 'done' ? 'text-green-400' : item.status === 'error' ? 'text-red-400' : item.status === 'uploading' ? 'text-blue-400 animate-spin' : 'text-gray-500'
                      }`}>
                        {item.status === 'done' ? '\u2713' : item.status === 'error' ? '\u2717' : item.status === 'uploading' ? '\u2191' : '\u2022'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white truncate block">{item.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-600 font-mono">
                            {item.status === 'done' ? `${item.chunks} chunks indexed` : item.status === 'error' ? item.error : item.status === 'uploading' ? 'Uploading & classifying...' : 'Queued'}
                          </span>
                          {item.status === 'done' && item.docId && classifications[item.docId] && (
                            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-mono uppercase ${CATEGORIES[classifications[item.docId].category]?.color || CATEGORIES.general.color}`}>
                              {classifications[item.docId].category}
                            </span>
                          )}
                          {item.status === 'done' && item.docId && classifications[item.docId]?.commit_id && (
                            <span className="text-[10px] text-gray-600 font-mono">
                              #{classifications[item.docId].commit_id}
                            </span>
                          )}
                        </div>
                      </div>
                      {(item.status === 'queued' || item.status === 'done' || item.status === 'error') && (
                        <button onClick={() => removeFromQueue(item.id)} className="text-gray-600 hover:text-white text-sm">&times;</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paste text */}
            <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold">Or Paste Text</h3>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Title</label>
                <input type="text" value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)}
                  placeholder="Document title..."
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Text</label>
                <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={6}
                  placeholder="Paste full document text..."
                  className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none resize-none" />
                {pasteText && <p className="text-xs text-gray-600 mt-1 font-mono">{pasteText.length.toLocaleString()} chars</p>}
              </div>
              <button onClick={handlePasteUpload} disabled={isProcessing || !pasteTitle.trim() || !pasteText.trim()}
                className="w-full py-3 bg-white text-black font-medium rounded-lg text-sm hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed">
                {isProcessing ? 'Ingesting...' : 'Add to The Scroll'}
              </button>
            </div>
          </div>
        )}

        {/* PENDING */}
        {activeTab === 'pending' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Pending Submissions</h1>
              <p className="text-gray-500 text-sm">Review and approve community contributions before they enter The Scroll.</p>
            </div>
            {pending.length === 0 ? (
              <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-16 text-center">
                <p className="text-gray-500">No pending submissions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.map(doc => {
                  const aiClass = classifications[doc.id]
                  const cat = aiClass?.category || autoCategory(doc.title)
                  const catInfo = CATEGORIES[cat] || CATEGORIES.general
                  return (
                    <div key={doc.id} className="bg-white/[0.02] border border-gray-900 rounded-xl p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-white font-semibold text-lg">{doc.title}</h3>
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase ${catInfo.color}`}>
                              {catInfo.label}
                            </span>
                            {aiClass?.commit_id && (
                              <span className="text-[10px] text-gray-600 font-mono">#{aiClass.commit_id}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="font-mono">v{doc.version}</span>
                            {doc.file_name && <span className="font-mono">{doc.file_name}</span>}
                            <span>{formatDate(doc.created_at)}</span>
                          </div>
                          {aiClass && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {aiClass.tags?.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-gray-900 text-[10px] text-gray-500 font-mono">{tag}</span>
                              ))}
                              {aiClass.summary && <span className="text-[11px] text-gray-500 italic">{aiClass.summary}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {!aiClass && (
                            <button onClick={() => classifyDocument(doc)} disabled={classifyingId === doc.id}
                              className="px-4 py-2 text-sm font-medium bg-white/5 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-600 transition disabled:opacity-50 rounded-lg">
                              {classifyingId === doc.id ? 'Classifying...' : 'AI Classify'}
                            </button>
                          )}
                          <button onClick={() => handleApprove(doc.id)} disabled={actionLoading}
                            className="px-4 py-2 text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition disabled:opacity-50 rounded-lg">
                            Approve & Index
                          </button>
                          <button onClick={() => setRejectingId(doc.id)}
                            className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition rounded-lg">
                            Reject
                          </button>
                        </div>
                      </div>
                      <button onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                        className="text-xs text-gray-500 hover:text-white transition">
                        {expandedDoc === doc.id ? 'Hide text' : 'Preview text'}
                      </button>
                      {expandedDoc === doc.id && (
                        <div className="mt-3 bg-black border border-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans">{doc.text_full || 'Full text not available in list view'}</pre>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* APPROVED */}
        {activeTab === 'approved' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Live in The Scroll</h1>
              <p className="text-gray-500 text-sm">These documents are active in the knowledge base and feeding Grok. Click AI Classify to get Grok-powered category, metadata, and commit ID.</p>
            </div>
            {approved.length === 0 ? (
              <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-16 text-center">
                <p className="text-gray-500">No approved documents yet. Upload content or approve pending submissions.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {approved.map(doc => {
                  const aiClass = classifications[doc.id]
                  const cat = aiClass?.category || autoCategory(doc.title)
                  const catInfo = CATEGORIES[cat] || CATEGORIES.general
                  return (
                    <div key={doc.id} className="bg-white/[0.02] border border-gray-900 rounded-lg p-5 hover:bg-white/[0.04] hover:border-gray-800 transition-all group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${catInfo.color.includes('green') ? 'bg-green-400' : catInfo.color.includes('red') ? 'bg-red-400' : catInfo.color.includes('blue') ? 'bg-blue-400' : catInfo.color.includes('purple') ? 'bg-purple-400' : catInfo.color.includes('yellow') ? 'bg-yellow-400' : catInfo.color.includes('cyan') ? 'bg-cyan-400' : 'bg-gray-400'}`} />
                          <h3 className="text-white font-medium truncate">{doc.title}</h3>
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase shrink-0 ${catInfo.color}`}>
                            {aiClass ? catInfo.label : catInfo.label}
                          </span>
                          {aiClass && (
                            <>
                              <span className="text-[10px] text-gray-600 font-mono" title="Commit ID">
                                #{aiClass.commit_id}
                              </span>
                              {aiClass.document_type && (
                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-gray-800 text-[10px] text-gray-500 font-mono">
                                  {aiClass.document_type}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs text-gray-600">
                          <span className="font-mono">v{doc.version}</span>
                          <span>{formatDate(doc.approved_at)}</span>
                          {!aiClass && (
                            <button
                              onClick={() => classifyDocument(doc)}
                              disabled={classifyingId === doc.id}
                              className="px-3 py-1.5 bg-white/5 border border-gray-800 hover:text-white hover:border-gray-600 transition rounded opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            >
                              {classifyingId === doc.id ? 'Classifying...' : 'AI Classify'}
                            </button>
                          )}
                          <Link href={`/chat?doc=${doc.id}&title=${encodeURIComponent(doc.title)}`}
                            className="px-3 py-1.5 bg-white/5 border border-gray-800 hover:text-white hover:border-gray-600 transition rounded opacity-0 group-hover:opacity-100">
                            Ask Grok
                          </Link>
                        </div>
                      </div>
                      {/* AI classification details */}
                      {aiClass && (
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          {aiClass.tags?.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-white/[0.03] border border-gray-900 text-[10px] text-gray-500 font-mono">
                              {tag}
                            </span>
                          ))}
                          {aiClass.summary && (
                            <span className="text-[11px] text-gray-500 italic">{aiClass.summary}</span>
                          )}
                          {aiClass.confidence && (
                            <span className="text-[10px] text-gray-600 font-mono ml-auto">
                              {Math.round(aiClass.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* REJECTED */}
        {activeTab === 'rejected' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Rejected</h1>
              <p className="text-gray-500 text-sm">Submissions that were not approved for The Scroll.</p>
            </div>
            {rejected.length === 0 ? (
              <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-16 text-center">
                <p className="text-gray-500">No rejected documents</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rejected.map(doc => (
                  <div key={doc.id} className="bg-white/[0.02] border border-gray-900 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-medium">{doc.title}</h3>
                        <span className="text-xs text-gray-600 font-mono">{formatDate(doc.created_at)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded border text-[10px] font-mono uppercase text-red-400 border-red-500/30 bg-red-500/10">Rejected</span>
                    </div>
                    {doc.rejected_reason && (
                      <div className="mt-3 bg-red-500/5 border border-red-500/10 rounded p-3">
                        <p className="text-xs text-red-400/80">{doc.rejected_reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
      <AdminNav />
      <div className="h-12" />
    </div>
  )
}
