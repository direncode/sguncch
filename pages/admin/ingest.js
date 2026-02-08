import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { ADMIN_KEY } from '../../lib/data'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
const formatSize = (bytes) => bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`

const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
  'text/markdown': 'MD',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/csv': 'CSV',
}

const ACCEPTED_EXTENSIONS = ['.pdf', '.txt', '.md', '.doc', '.docx', '.csv']

function getFileTypeLabel(file) {
  if (ACCEPTED_TYPES[file.type]) return ACCEPTED_TYPES[file.type]
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext?.toUpperCase() || 'FILE'
}

function isAcceptedFile(file) {
  if (ACCEPTED_TYPES[file.type]) return true
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return ACCEPTED_EXTENSIONS.includes(ext)
}

export default function IngestPage() {
  const router = useRouter()
  const { isAdmin, isLoaded } = useApp()

  const [toast, setToast] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  // Upload queue: { id, file, title, status: 'queued'|'uploading'|'processing'|'done'|'error', chunks, error }
  const [uploadQueue, setUploadQueue] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)

  // Paste text mode
  const [showPaste, setShowPaste] = useState(false)
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteText, setPasteText] = useState('')

  // Reject modal
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && !isAdmin) router.push('/admin/login')
  }, [isLoaded, isAdmin, router])

  useEffect(() => {
    if (isAdmin) loadDocuments()
  }, [isAdmin])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_KEY}`,
  }

  const loadDocuments = async () => {
    setLoadingDocs(true)
    try {
      const [pending, approved, rejected] = await Promise.all([
        fetch('/api/codex/documents?status=pending').then(r => r.json()),
        fetch('/api/codex/documents?status=approved').then(r => r.json()),
        fetch('/api/codex/documents?status=rejected').then(r => r.json()),
      ])
      const all = [
        ...(pending.documents || []).map(d => ({ ...d, status: 'pending' })),
        ...(approved.documents || []).map(d => ({ ...d, status: 'approved' })),
        ...(rejected.documents || []).map(d => ({ ...d, status: 'rejected' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setDocuments(all)
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
    setLoadingDocs(false)
  }

  // === DRAG & DROP ===
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget)) {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    addFilesToQueue(files)
  }, [])

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || [])
    addFilesToQueue(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addFilesToQueue = (files) => {
    const valid = files.filter(f => isAcceptedFile(f))
    const rejected = files.length - valid.length
    if (rejected > 0) {
      notify(`${rejected} file${rejected > 1 ? 's' : ''} skipped (unsupported format)`)
    }
    if (valid.length === 0) return

    const newItems = valid.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      title: f.name.replace(/\.[^.]+$/, ''),
      status: 'queued',
      chunks: 0,
      error: null,
    }))
    setUploadQueue(prev => [...prev, ...newItems])
  }

  const removeFromQueue = (id) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id))
  }

  const updateQueueItem = (id, updates) => {
    setUploadQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  // === PROCESS QUEUE (auto-approve) ===
  const processQueue = async () => {
    const queued = uploadQueue.filter(item => item.status === 'queued')
    if (queued.length === 0) return
    setIsProcessing(true)

    for (const item of queued) {
      updateQueueItem(item.id, { status: 'uploading' })

      try {
        // Read file
        let body = {
          title: item.title,
          version: '1.0',
          file_name: item.file.name,
          file_size: item.file.size,
        }

        const ext = item.file.name.toLowerCase()
        if (ext.endsWith('.pdf')) {
          const buffer = await item.file.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          const chunkSize = 8192
          let binary = ''
          for (let i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize))
          }
          body.file_base64 = btoa(binary)
        } else {
          body.text_content = await item.file.text()
        }

        updateQueueItem(item.id, { status: 'processing' })

        // Use batch-upload for auto-approve
        const res = await fetch('/api/codex/batch-upload', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ files: [body] }),
        })

        // Parse response safely — server may return non-JSON on error
        const responseText = await res.text()
        let data
        try {
          data = JSON.parse(responseText)
        } catch {
          throw new Error(
            res.status === 413
              ? `File too large for server (${formatSize(item.file.size)})`
              : `Server error (${res.status}): ${responseText.slice(0, 120)}`
          )
        }

        if (res.ok && data.results?.[0]?.status === 'approved') {
          updateQueueItem(item.id, {
            status: 'done',
            chunks: data.results[0].chunk_count || 0,
          })
        } else {
          const errorMsg = data.results?.[0]?.error || data.error || 'Upload failed'
          updateQueueItem(item.id, { status: 'error', error: errorMsg })
        }
      } catch (err) {
        updateQueueItem(item.id, { status: 'error', error: err.message || 'Upload failed' })
      }
    }

    setIsProcessing(false)
    loadDocuments()
  }

  // Auto-process when items are added to queue
  useEffect(() => {
    const queued = uploadQueue.filter(item => item.status === 'queued')
    if (queued.length > 0 && !isProcessing) {
      processQueue()
    }
  }, [uploadQueue.length])

  // === PASTE TEXT UPLOAD ===
  const handlePasteUpload = async () => {
    if (!pasteTitle.trim() || !pasteText.trim()) return notify('Title and text are required')
    setIsProcessing(true)
    try {
      const res = await fetch('/api/codex/batch-upload', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ files: [{ title: pasteTitle.trim(), text_content: pasteText, version: '1.0' }] }),
      })
      const data = await res.json()
      if (res.ok && data.succeeded > 0) {
        notify(`Ingested — ${data.results[0]?.chunk_count || 0} chunks indexed`)
        setPasteTitle('')
        setPasteText('')
        setShowPaste(false)
        loadDocuments()
      } else {
        notify(data.results?.[0]?.error || 'Failed')
      }
    } catch { notify('Upload failed') }
    setIsProcessing(false)
  }

  // === APPROVE / REJECT (for legacy pending docs) ===
  const handleApprove = async (id) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/codex/approve', { method: 'POST', headers: authHeaders, body: JSON.stringify({ document_id: id }) })
      const data = await res.json()
      if (res.ok) {
        notify(`Approved — ${data.chunk_count} chunks indexed`)
        loadDocuments()
      } else { notify(data.error || 'Failed') }
    } catch { notify('Failed') }
    setActionLoading(false)
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return notify('Provide a reason')
    setActionLoading(true)
    try {
      const res = await fetch('/api/codex/reject', { method: 'POST', headers: authHeaders, body: JSON.stringify({ document_id: id, reason: rejectReason }) })
      if (res.ok) {
        notify('Document rejected')
        setRejectingId(null)
        setRejectReason('')
        loadDocuments()
      } else { notify('Failed') }
    } catch { notify('Failed') }
    setActionLoading(false)
  }

  // === RENDER ===
  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>
  }
  if (!isAdmin) return null

  const pending = documents.filter(d => d.status === 'pending')
  const approved = documents.filter(d => d.status === 'approved')
  const rejected = documents.filter(d => d.status === 'rejected')

  const queueDone = uploadQueue.filter(i => i.status === 'done').length
  const queueErrors = uploadQueue.filter(i => i.status === 'error').length
  const queueActive = uploadQueue.filter(i => i.status === 'uploading' || i.status === 'processing').length

  const filteredDocs = filterStatus === 'all' ? documents
    : documents.filter(d => d.status === filterStatus)

  const statusColor = (s) =>
    s === 'approved' ? 'text-green-400 border-green-500/30 bg-green-500/10'
    : s === 'rejected' ? 'text-red-400 border-red-500/30 bg-red-500/10'
    : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'

  const queueStatusIcon = (s) =>
    s === 'done' ? '\u2713'
    : s === 'error' ? '\u2717'
    : s === 'uploading' ? '\u2191'
    : s === 'processing' ? '\u2699'
    : '\u2022'

  const queueStatusColor = (s) =>
    s === 'done' ? 'text-green-400'
    : s === 'error' ? 'text-red-400'
    : s === 'uploading' || s === 'processing' ? 'text-blue-400'
    : 'text-gray-500'

  return (
    <div className="min-h-screen bg-black text-white">
      <Head><title>Document Ingestor | Project Bold</title></Head>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-gray-800 text-white px-6 py-3 rounded text-sm font-mono animate-pulse">
          {toast}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-gray-800 rounded max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
              <h3 className="font-semibold">Reject Document</h3>
              <button onClick={() => { setRejectingId(null); setRejectReason('') }} className="text-gray-500 hover:text-white text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="caption block mb-2">Reason for Rejection</label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3}
                  className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-gray-600 focus:outline-none resize-none"
                  placeholder="Why is this document being rejected?" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setRejectingId(null); setRejectReason('') }} className="btn-secondary text-sm !py-2 !px-4">Cancel</button>
                <button onClick={() => handleReject(rejectingId)} disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition disabled:opacity-50">
                  {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-gray-400 text-sm hover:text-white transition">
                &larr; Admin Console
              </Link>
              <span className="px-3 py-1 bg-white/10 rounded text-xs font-mono uppercase tracking-wider">
                Document Ingestor
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="text-green-400">{approved.length} approved</span>
              <span className="text-gray-800">|</span>
              <span className="text-yellow-400">{pending.length} pending</span>
              <span className="text-gray-800">|</span>
              <span>{documents.length} total</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">

        {/* === UPLOAD ZONE === */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Documents</h1>
              <p className="text-gray-500 text-sm">Drop files to instantly ingest into the AI knowledge base. Auto-approved and indexed.</p>
            </div>
            <button
              onClick={() => setShowPaste(!showPaste)}
              className="text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-3 py-2 rounded transition"
            >
              {showPaste ? 'Hide' : 'Paste Text Instead'}
            </button>
          </div>

          {/* Paste text mode */}
          {showPaste && (
            <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-6 mb-6 space-y-4">
              <div>
                <label className="caption block mb-2">Document Title</label>
                <input type="text" value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)}
                  placeholder="e.g. Student Code of Conduct"
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none" />
              </div>
              <div>
                <label className="caption block mb-2">Document Text</label>
                <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                  rows={6} placeholder="Paste full document text here..."
                  className="w-full bg-black border border-gray-800 rounded p-3 text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none resize-none" />
                {pasteText && (
                  <p className="text-xs text-gray-600 mt-1 font-mono">{pasteText.length.toLocaleString()} characters</p>
                )}
              </div>
              <button onClick={handlePasteUpload}
                disabled={isProcessing || !pasteTitle.trim() || !pasteText.trim()}
                className="w-full py-3 bg-white text-black font-medium rounded text-sm hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed">
                {isProcessing ? 'Ingesting...' : 'Ingest Text'}
              </button>
            </div>
          )}

          {/* Drop zone */}
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-white bg-white/10 scale-[1.01]'
                : 'border-gray-800 hover:border-gray-600 hover:bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
            {dragActive ? (
              <div>
                <p className="text-white text-lg font-semibold">Drop files to ingest</p>
                <p className="text-gray-400 text-sm mt-2">They will be auto-approved and indexed immediately</p>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/5 border border-gray-800 flex items-center justify-center">
                  <span className="text-3xl text-gray-600">&uarr;</span>
                </div>
                <p className="text-gray-300 text-sm font-medium">
                  Drop files here or click to browse
                </p>
                <p className="text-gray-600 text-xs mt-2 font-mono">
                  PDF &middot; TXT &middot; MD &middot; DOC &middot; DOCX &middot; CSV &mdash; drop as many as you want
                </p>
                <p className="text-gray-700 text-xs mt-3">
                  Files are automatically approved, chunked, embedded, and indexed for Grok
                </p>
              </div>
            )}
          </div>
        </div>

        {/* === UPLOAD QUEUE === */}
        {uploadQueue.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight">Upload Queue</h2>
                {queueActive > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded text-[10px] font-mono uppercase animate-pulse">
                    Processing {queueActive}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                {queueDone > 0 && <span className="text-green-400">{queueDone} done</span>}
                {queueErrors > 0 && <span className="text-red-400">{queueErrors} failed</span>}
                {uploadQueue.every(i => i.status === 'done' || i.status === 'error') && (
                  <button onClick={() => setUploadQueue([])} className="text-gray-500 hover:text-white transition">
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {uploadQueue.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-white/[0.02] border border-gray-900 rounded-lg px-5 py-3">
                  {/* Status icon */}
                  <span className={`text-lg font-mono ${queueStatusColor(item.status)} ${(item.status === 'uploading' || item.status === 'processing') ? 'animate-spin' : ''}`}>
                    {queueStatusIcon(item.status)}
                  </span>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white truncate">{item.title}</span>
                      <span className="text-[10px] font-mono text-gray-600 px-1.5 py-0.5 border border-gray-800 rounded">
                        {getFileTypeLabel(item.file)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-gray-600 font-mono">{formatSize(item.file.size)}</span>
                      {item.status === 'done' && (
                        <span className="text-[10px] text-green-400/70 font-mono">{item.chunks} chunks indexed</span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-[10px] text-red-400/70 font-mono">{item.error}</span>
                      )}
                      {item.status === 'uploading' && (
                        <span className="text-[10px] text-blue-400/70 font-mono">Uploading...</span>
                      )}
                      {item.status === 'processing' && (
                        <span className="text-[10px] text-blue-400/70 font-mono">Chunking &amp; embedding...</span>
                      )}
                    </div>
                  </div>

                  {/* Remove (only if not processing) */}
                  {(item.status === 'queued' || item.status === 'done' || item.status === 'error') && (
                    <button onClick={() => removeFromQueue(item.id)} className="text-gray-600 hover:text-white text-sm transition">
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === DOCUMENT CATALOGUE === */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Document Catalogue</h2>
              <p className="text-gray-500 text-sm mt-1">
                {approved.length} approved document{approved.length !== 1 ? 's' : ''} feeding Grok
              </p>
            </div>
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {[
                { id: 'all', label: 'All', count: documents.length },
                { id: 'approved', label: 'Approved', count: approved.length },
                { id: 'pending', label: 'Pending', count: pending.length },
                { id: 'rejected', label: 'Rejected', count: rejected.length },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded transition ${
                    filterStatus === f.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {loadingDocs ? (
            <div className="text-center py-16 text-gray-500">Loading documents...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-16 text-center">
              <p className="text-gray-500">
                {filterStatus === 'all' ? 'No documents yet. Drop files above to get started.' : `No ${filterStatus} documents.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="bg-white/[0.02] border border-gray-900 rounded-lg p-5 hover:bg-white/[0.04] hover:border-gray-800 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium truncate">{doc.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${statusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="font-mono">v{doc.version}</span>
                        {doc.file_name && <span className="font-mono truncate max-w-[200px]">{doc.file_name}</span>}
                        <span>{formatDate(doc.created_at)}</span>
                        {doc.file_size && <span className="font-mono">{formatSize(doc.file_size)}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(doc.id)} disabled={actionLoading}
                            className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition disabled:opacity-50 rounded">
                            Approve
                          </button>
                          <button onClick={() => setRejectingId(doc.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition rounded">
                            Reject
                          </button>
                        </>
                      )}
                      {doc.status === 'approved' && (
                        <Link href={`/chat?doc=${doc.id}&title=${encodeURIComponent(doc.title)}`}
                          className="px-3 py-1.5 text-xs font-medium bg-white/5 text-gray-400 border border-gray-800 hover:text-white hover:border-gray-600 transition rounded opacity-0 group-hover:opacity-100">
                          Ask Grok
                        </Link>
                      )}
                    </div>
                  </div>

                  {doc.status === 'rejected' && doc.rejected_reason && (
                    <div className="mt-3 bg-red-500/5 border border-red-500/10 rounded p-2">
                      <p className="text-xs text-red-400/80">{doc.rejected_reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-16 border-t border-gray-900 pt-12">
          <h3 className="text-sm font-semibold text-gray-400 mb-6 uppercase tracking-widest">How it works</h3>
          <div className="grid grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Drop Files', desc: 'Drag PDFs, TXT, DOC, CSV files onto the upload zone. Drop as many as you want.' },
              { step: '02', title: 'Auto-Ingest', desc: 'Files are parsed, text extracted, and automatically approved into the knowledge base.' },
              { step: '03', title: 'Chunk & Embed', desc: 'Text is split into semantic chunks and embedded with xAI vectors for intelligent search.' },
              { step: '04', title: 'Grok Answers', desc: 'Every chat query searches all documents + live platform metrics for comprehensive answers.' },
            ].map(item => (
              <div key={item.step} className="space-y-2">
                <span className="text-xs font-mono text-gray-700">{item.step}</span>
                <h4 className="text-sm font-medium text-white">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
