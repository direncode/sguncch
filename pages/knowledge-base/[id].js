import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Layout from '../../components/Layout'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''

export default function DocumentDetail() {
  const router = useRouter()
  const { id } = router.query

  const [doc, setDoc] = useState(null)
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    loadDocument()
  }, [id])

  const loadDocument = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/codex/document/${id}`)
      if (!res.ok) { setError('Document not found'); setLoading(false); return }
      const data = await res.json()
      setDoc(data.document)
      setAuditLog(data.audit_log || [])
    } catch { setError('Failed to load document') }
    setLoading(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (error || !doc) {
    return (
      <Layout>
        <Head><title>Not Found | UNC Gov Codex</title></Head>
        <div className="section-padding text-center">
          <p className="text-red-400 text-lg font-semibold mb-4">{error || 'Document not found'}</p>
          <Link href="/knowledge-base" className="btn-ghost">&larr; Back to Knowledge Base</Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{doc.title} | UNC Gov Codex</title>
      </Head>

      <div className="section-padding">
        <div className="max-w-content mx-auto">
          {/* Back */}
          <Link href="/knowledge-base" className="btn-ghost text-sm mb-12 inline-block">
            &larr; Back to Knowledge Base
          </Link>

          {/* Header */}
          <div className="card-highlight mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-3">{doc.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="badge">v{doc.version}</span>
                  <span className="badge text-green-400 border-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Approved
                  </span>
                </div>
              </div>
              <Link href={`/chat?doc=${doc.id}&title=${encodeURIComponent(doc.title)}`} className="btn-secondary text-sm py-2 px-4 whitespace-nowrap">
                Ask AI About This
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="caption mb-1">Approved By</p>
                <p className="text-white">{doc.approved_by || 'admin'}</p>
              </div>
              <div>
                <p className="caption mb-1">Approved At</p>
                <p className="text-white font-mono">{formatDate(doc.approved_at)}</p>
              </div>
              <div>
                <p className="caption mb-1">SHA-256 Hash</p>
                <p className="text-gray-500 font-mono text-xs break-all">{doc.hash}</p>
              </div>
            </div>

            {doc.source_url && (
              <div className="mt-6 pt-6 border-t border-gray-900">
                <p className="caption mb-1">Source</p>
                <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition break-all">
                  {doc.source_url}
                </a>
              </div>
            )}
          </div>

          {/* Full Text */}
          <div className="card mb-8">
            <div className="mb-4">
              <p className="caption">Document Text</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{doc.text_full}</pre>
            </div>
          </div>

          {/* Approval Chain */}
          <div className="card">
            <div className="mb-6">
              <p className="caption">Approval Chain ({auditLog.length} entries)</p>
            </div>
            {auditLog.length === 0 ? (
              <p className="text-gray-600 text-sm">No audit entries</p>
            ) : (
              <div className="space-y-4">
                {auditLog.map((entry, i) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        entry.action === 'approved' ? 'border-green-500 bg-green-500/20' :
                        entry.action === 'rejected' ? 'border-red-500 bg-red-500/20' :
                        'border-yellow-500 bg-yellow-500/20'
                      }`} />
                      {i < auditLog.length - 1 && <div className="w-px flex-1 bg-gray-900 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${
                          entry.action === 'approved' ? 'text-green-400' :
                          entry.action === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                        }`}>{entry.action}</span>
                        <span className="text-xs text-gray-600">by {entry.performed_by}</span>
                        <span className="text-xs text-gray-600 font-mono">{formatDate(entry.performed_at)} {formatTime(entry.performed_at)}</span>
                      </div>
                      {entry.reason && <p className="text-xs text-gray-500 mt-1">{entry.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
