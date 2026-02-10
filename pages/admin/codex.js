import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { getAdminToken, getAuthHeaders } from '../../lib/adminSession'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''

const LiveClock = () => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="font-mono text-xs text-gray-500">
      {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  )
}

export default function CodexAdmin() {
  const router = useRouter()
  const { isAdmin, isLoaded } = useApp()

  const [activeTab, setActiveTab] = useState('upload')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  // Upload form state
  const [uploadForm, setUploadForm] = useState({ title: '', version: '1.0', source_url: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewText, setPreviewText] = useState('')

  // Document lists
  const [pendingDocs, setPendingDocs] = useState([])
  const [approvedDocs, setApprovedDocs] = useState([])
  const [rejectedDocs, setRejectedDocs] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [expandedDoc, setExpandedDoc] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  useEffect(() => {
    if (isLoaded && !isAdmin) router.push('/admin/login')
  }, [isLoaded, isAdmin, router])

  useEffect(() => {
    if (isAdmin) loadData()
  }, [isAdmin, activeTab])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const authHeaders = getAuthHeaders()

  const loadData = async () => {
    try {
      if (activeTab === 'pending' || activeTab === 'upload') {
        const res = await fetch('/api/codex/documents?status=pending')
        const data = await res.json()
        setPendingDocs(data.documents || [])
      }
      if (activeTab === 'approved') {
        const res = await fetch('/api/codex/documents?status=approved')
        const data = await res.json()
        setApprovedDocs(data.documents || [])
      }
      if (activeTab === 'rejected') {
        const res = await fetch('/api/codex/documents?status=rejected')
        const data = await res.json()
        setRejectedDocs(data.documents || [])
      }
      if (activeTab === 'audit') {
        const res = await fetch('/api/codex/audit')
        const data = await res.json()
        setAuditLog(data.audit_log || [])
      }
    } catch (err) {
      console.error('Load data error:', err)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)
    if (file.name.toLowerCase().endsWith('.txt')) {
      const text = await file.text()
      setPreviewText(text)
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      setPreviewText('[PDF file selected - text will be extracted on upload]')
    } else {
      setPreviewText('')
      notify('Please select a .pdf or .txt file')
    }
    if (!uploadForm.title) {
      setUploadForm(f => ({ ...f, title: file.name.replace(/\.(pdf|txt)$/i, '') }))
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.title) return notify('Title is required')
    if (!selectedFile && !previewText) return notify('Please select a file or enter text')
    setLoading(true)
    try {
      let body = {
        title: uploadForm.title,
        version: uploadForm.version,
        source_url: uploadForm.source_url,
        file_name: selectedFile?.name,
        file_size: selectedFile?.size,
      }
      if (selectedFile?.name?.toLowerCase().endsWith('.pdf')) {
        const buffer = await selectedFile.arrayBuffer()
        const base64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))
        body.file_base64 = base64
      } else {
        body.text_content = previewText
      }
      const res = await fetch('/api/codex/upload', { method: 'POST', headers: authHeaders, body: JSON.stringify(body) })
      const data = await res.json()
      if (res.ok) {
        notify('Document uploaded for review')
        setUploadForm({ title: '', version: '1.0', source_url: '' })
        setSelectedFile(null)
        setPreviewText('')
        setActiveTab('pending')
        loadData()
      } else {
        notify(data.error || 'Upload failed')
      }
    } catch { notify('Upload failed') }
    setLoading(false)
  }

  const handleApprove = async (docId) => {
    setLoading(true)
    try {
      const res = await fetch('/api/codex/approve', { method: 'POST', headers: authHeaders, body: JSON.stringify({ document_id: docId }) })
      const data = await res.json()
      if (res.ok) {
        notify(`Approved - ${data.chunk_count} chunks indexed`)
        loadData()
      } else { notify(data.error || 'Approval failed') }
    } catch { notify('Approval failed') }
    setLoading(false)
  }

  const handleReject = async (docId) => {
    if (!rejectReason.trim()) return notify('Please provide a reason')
    setLoading(true)
    try {
      const res = await fetch('/api/codex/reject', { method: 'POST', headers: authHeaders, body: JSON.stringify({ document_id: docId, reason: rejectReason }) })
      if (res.ok) {
        notify('Document rejected')
        setRejectingId(null)
        setRejectReason('')
        loadData()
      } else { notify('Rejection failed') }
    } catch { notify('Rejection failed') }
    setLoading(false)
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>
  }
  if (!isAdmin) return null

  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'pending', label: `Pending (${pendingDocs.length})` },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'audit', label: 'Audit Log' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Head><title>Gov Codex Admin | Project Bold</title></Head>

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
                  className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-gray-600 resize-none"
                  placeholder="Why is this document being rejected?" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setRejectingId(null); setRejectReason('') }} className="btn-secondary text-sm py-2 px-4">Cancel</button>
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
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-gray-400 text-sm hover:text-white transition flex items-center gap-2">
                &larr; Admin
              </Link>
              <span className="px-3 py-1 bg-white/10 rounded text-xs font-mono uppercase tracking-wider">Gov Codex</span>
            </div>
            <div className="flex items-center gap-6">
              <LiveClock />
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-16 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl space-y-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Upload Governance Document</h2>
              <p className="text-gray-500 text-sm mt-1">Upload a PDF or text file for review and approval</p>
            </div>
            <div className="card space-y-6">
              <div>
                <label className="caption block mb-2">Document Title *</label>
                <input type="text" value={uploadForm.title} onChange={(e) => setUploadForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Student Code of Conduct" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="caption block mb-2">Version</label>
                  <input type="text" value={uploadForm.version} onChange={(e) => setUploadForm(f => ({ ...f, version: e.target.value }))} placeholder="1.0" />
                </div>
                <div>
                  <label className="caption block mb-2">Source URL</label>
                  <input type="url" value={uploadForm.source_url} onChange={(e) => setUploadForm(f => ({ ...f, source_url: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="caption block mb-2">Document File</label>
                <div className="border border-dashed border-gray-700 rounded p-8 text-center hover:border-gray-500 transition cursor-pointer"
                  onClick={() => document.getElementById('file-input').click()}>
                  <input id="file-input" type="file" accept=".pdf,.txt" onChange={handleFileSelect} className="hidden" />
                  {selectedFile ? (
                    <div>
                      <p className="text-white text-sm font-mono">{selectedFile.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 text-sm">Click to select a PDF or TXT file</p>
                      <p className="text-gray-600 text-xs mt-1">Max 2MB</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="caption block mb-2">Or Paste Text Directly</label>
                <textarea value={selectedFile?.name?.endsWith('.pdf') ? '' : previewText}
                  onChange={(e) => { setPreviewText(e.target.value); setSelectedFile(null) }}
                  rows={6} placeholder="Paste document text here..."
                  disabled={selectedFile?.name?.toLowerCase().endsWith('.pdf')} />
              </div>
              {previewText && !selectedFile?.name?.toLowerCase().endsWith('.pdf') && (
                <div>
                  <p className="caption mb-2">Preview ({previewText.length.toLocaleString()} chars)</p>
                  <div className="bg-black border border-gray-900 rounded p-4 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">{previewText.slice(0, 2000)}{previewText.length > 2000 ? '\n...' : ''}</pre>
                  </div>
                </div>
              )}
              <button onClick={handleUpload} disabled={loading || (!previewText && !selectedFile)} className="btn-primary w-full text-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Uploading...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        )}

        {/* PENDING TAB */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Pending Documents ({pendingDocs.length})</h2>
            {pendingDocs.length === 0 ? (
              <div className="card text-center py-16"><p className="text-gray-500">No pending documents</p></div>
            ) : (
              pendingDocs.map(doc => (
                <div key={doc.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{doc.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-mono text-gray-500">v{doc.version}</span>
                        {doc.file_name && <span className="text-xs font-mono text-gray-600">{doc.file_name}</span>}
                        <span className="text-xs text-gray-600">{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                    <span className="badge text-yellow-400 border-yellow-400/30">Pending</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => handleApprove(doc.id)} disabled={loading}
                      className="px-4 py-2 text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition disabled:opacity-50">
                      {loading ? 'Processing...' : 'Approve & Index'}
                    </button>
                    <button onClick={() => setRejectingId(doc.id)}
                      className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition">
                      Reject
                    </button>
                    <button onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      className="btn-secondary text-sm py-2 px-4">
                      {expandedDoc === doc.id ? 'Hide Text' : 'View Text'}
                    </button>
                  </div>
                  {expandedDoc === doc.id && (
                    <div className="mt-4 bg-black border border-gray-900 rounded p-4 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">{doc.text_full || 'No text available in list view'}</pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* APPROVED TAB */}
        {activeTab === 'approved' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Approved Documents ({approvedDocs.length})</h2>
            {approvedDocs.length === 0 ? (
              <div className="card text-center py-16"><p className="text-gray-500">No approved documents yet</p></div>
            ) : (
              <div className="overflow-x-auto border border-gray-900 rounded">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black">
                      <th className="text-left px-4 py-3 caption border-b border-gray-900">Title</th>
                      <th className="text-left px-4 py-3 caption border-b border-gray-900">Version</th>
                      <th className="text-left px-4 py-3 caption border-b border-gray-900">Approved By</th>
                      <th className="text-left px-4 py-3 caption border-b border-gray-900">Approved At</th>
                      <th className="text-left px-4 py-3 caption border-b border-gray-900">Hash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedDocs.map(doc => (
                      <tr key={doc.id} className="border-b border-gray-900 hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-sm text-white font-medium">{doc.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">v{doc.version}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{doc.approved_by || 'admin'}</td>
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">{formatDate(doc.approved_at)}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 font-mono">{doc.hash?.slice(0, 12)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REJECTED TAB */}
        {activeTab === 'rejected' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Rejected Documents ({rejectedDocs.length})</h2>
            {rejectedDocs.length === 0 ? (
              <div className="card text-center py-16"><p className="text-gray-500">No rejected documents</p></div>
            ) : (
              rejectedDocs.map(doc => (
                <div key={doc.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{doc.title}</h3>
                      <p className="text-xs font-mono text-gray-600 mt-1">v{doc.version} | {formatDate(doc.created_at)}</p>
                    </div>
                    <span className="badge text-red-400 border-red-400/30">Rejected</span>
                  </div>
                  {doc.rejected_reason && (
                    <div className="mt-3 bg-red-500/5 border border-red-500/10 rounded p-3">
                      <p className="text-xs text-red-400">Reason: {doc.rejected_reason}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Approval Audit Trail</h2>
            {auditLog.length === 0 ? (
              <div className="card text-center py-16"><p className="text-gray-500">No audit entries yet</p></div>
            ) : (
              <div className="space-y-2">
                {auditLog.map(entry => (
                  <div key={entry.id} className="card flex items-center gap-4 !p-4">
                    <div className={`w-2 h-2 rounded-full ${
                      entry.action === 'approved' ? 'bg-green-500' : entry.action === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${
                        entry.action === 'approved' ? 'text-green-400' : entry.action === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                      }`}>{entry.action}</span>
                      {entry.reason && <span className="text-xs text-gray-500 ml-3">{entry.reason}</span>}
                    </div>
                    <span className="text-xs text-gray-600">{entry.performed_by}</span>
                    <span className="text-xs text-gray-600 font-mono">{formatDate(entry.performed_at)} {formatTime(entry.performed_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
