import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { ADMIN_KEY } from '../../lib/data'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

export default function IngestPage() {
  const router = useRouter()
  const { isAdmin, isLoaded } = useApp()

  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)

  // Upload form
  const [title, setTitle] = useState('')
  const [version, setVersion] = useState('1.0')
  const [selectedFile, setSelectedFile] = useState(null)
  const [pasteText, setPasteText] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Approve/reject
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (isLoaded && !isAdmin) router.push('/admin/login')
  }, [isLoaded, isAdmin, router])

  useEffect(() => {
    if (isAdmin) loadDocuments()
  }, [isAdmin])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
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

  const handleFileSelect = async (file) => {
    if (!file) return
    const ext = file.name.toLowerCase()
    if (!ext.endsWith('.pdf') && !ext.endsWith('.txt')) {
      return notify('Only .pdf and .txt files are supported')
    }
    setSelectedFile(file)
    setPasteText('')
    if (!title) setTitle(file.name.replace(/\.(pdf|txt)$/i, ''))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleUpload = async () => {
    if (!title.trim()) return notify('Title is required')
    if (!selectedFile && !pasteText.trim()) return notify('Select a file or paste text')
    setLoading(true)
    try {
      let body = { title: title.trim(), version, file_name: selectedFile?.name, file_size: selectedFile?.size }
      if (selectedFile?.name?.toLowerCase().endsWith('.pdf')) {
        const buffer = await selectedFile.arrayBuffer()
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
        body.file_base64 = base64
      } else if (selectedFile) {
        body.text_content = await selectedFile.text()
      } else {
        body.text_content = pasteText
      }
      const res = await fetch('/api/codex/upload', { method: 'POST', headers: authHeaders, body: JSON.stringify(body) })
      const data = await res.json()
      if (res.ok) {
        notify('Document uploaded')
        setTitle('')
        setVersion('1.0')
        setSelectedFile(null)
        setPasteText('')
        loadDocuments()
      } else {
        notify(data.error || 'Upload failed')
      }
    } catch { notify('Upload failed') }
    setLoading(false)
  }

  const handleApprove = async (id) => {
    setLoading(true)
    try {
      const res = await fetch('/api/codex/approve', { method: 'POST', headers: authHeaders, body: JSON.stringify({ document_id: id }) })
      const data = await res.json()
      if (res.ok) {
        notify(`Approved — ${data.chunk_count} chunks indexed`)
        loadDocuments()
      } else { notify(data.error || 'Failed') }
    } catch { notify('Failed') }
    setLoading(false)
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return notify('Provide a reason')
    setLoading(true)
    try {
      const res = await fetch('/api/codex/reject', { method: 'POST', headers: authHeaders, body: JSON.stringify({ document_id: id, reason: rejectReason }) })
      if (res.ok) {
        notify('Document rejected')
        setRejectingId(null)
        setRejectReason('')
        loadDocuments()
      } else { notify('Failed') }
    } catch { notify('Failed') }
    setLoading(false)
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>
  }
  if (!isAdmin) return null

  const pending = documents.filter(d => d.status === 'pending')
  const approved = documents.filter(d => d.status === 'approved')
  const rejected = documents.filter(d => d.status === 'rejected')

  const statusColor = (s) => s === 'approved' ? 'text-green-400 border-green-500/30 bg-green-500/10' : s === 'rejected' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'

  return (
    <div className="min-h-screen bg-black text-white">
      <Head><title>Document Ingestor | Project Bold</title></Head>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-gray-800 text-white px-6 py-3 rounded text-sm font-mono">
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
                <button onClick={() => handleReject(rejectingId)} disabled={loading}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition disabled:opacity-50">
                  {loading ? 'Rejecting...' : 'Confirm Reject'}
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
              <span>{approved.length} approved</span>
              <span className="text-gray-800">|</span>
              <span>{pending.length} pending</span>
              <span className="text-gray-800">|</span>
              <span>{documents.length} total</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">

        {/* Upload Section */}
        <div className="mb-16">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Document</h1>
          <p className="text-gray-500 text-sm mb-8">Add governance documents to the AI knowledge base. Upload as many as you need.</p>

          <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-8 space-y-6">

            {/* Title + Version row */}
            <div className="grid grid-cols-[1fr_120px] gap-4">
              <div>
                <label className="caption block mb-2">Document Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Student Code of Conduct"
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none" />
              </div>
              <div>
                <label className="caption block mb-2">Version</label>
                <input type="text" value={version} onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0"
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none" />
              </div>
            </div>

            {/* Drop zone */}
            <div>
              <label className="caption block mb-2">File</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('ingest-file').click()}
                className={`border border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
                  dragActive ? 'border-white bg-white/5' : selectedFile ? 'border-gray-700 bg-white/[0.02]' : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <input id="ingest-file" type="file" accept=".pdf,.txt" onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" />
                {selectedFile ? (
                  <div>
                    <p className="text-white text-sm font-mono">{selectedFile.name}</p>
                    <p className="text-gray-500 text-xs mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                      className="text-xs text-gray-500 hover:text-white mt-2 underline">Remove</button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 text-sm">Drop a file here or click to browse</p>
                    <p className="text-gray-600 text-xs mt-1">PDF or TXT, max 2MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Or paste text */}
            {!selectedFile && (
              <div>
                <label className="caption block mb-2">Or Paste Text</label>
                <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                  rows={4} placeholder="Paste document text here..."
                  className="w-full bg-black border border-gray-800 rounded p-3 text-sm text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none resize-none" />
                {pasteText && (
                  <p className="text-xs text-gray-600 mt-1">{pasteText.length.toLocaleString()} characters</p>
                )}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleUpload} disabled={loading || (!selectedFile && !pasteText.trim()) || !title.trim()}
              className="w-full py-3 bg-white text-black font-medium rounded text-sm hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed">
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {/* Catalogue */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Document Catalogue</h2>
              <p className="text-gray-500 text-sm mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''} in the system</p>
            </div>
          </div>

          {loadingDocs ? (
            <div className="text-center py-16 text-gray-500">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="bg-white/[0.02] border border-gray-900 rounded-xl p-16 text-center">
              <p className="text-gray-500">No documents yet. Upload your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="bg-white/[0.02] border border-gray-900 rounded-lg p-5 hover:bg-white/[0.04] hover:border-gray-800 transition-all">
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
                        {doc.hash && <span className="font-mono">{doc.hash.slice(0, 10)}...</span>}
                      </div>
                    </div>

                    {doc.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleApprove(doc.id)} disabled={loading}
                          className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition disabled:opacity-50 rounded">
                          Approve
                        </button>
                        <button onClick={() => setRejectingId(doc.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition rounded">
                          Reject
                        </button>
                      </div>
                    )}

                    {doc.status === 'approved' && (
                      <span className="text-xs text-gray-600 shrink-0">{formatDate(doc.approved_at)}</span>
                    )}
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
      </main>
    </div>
  )
}
