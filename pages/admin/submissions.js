import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { getAuthHeaders } from '../../lib/adminSession'
import AdminNav from '../../components/AdminNav'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''

// Form type → human readable category mapping
const FORM_CATEGORIES = {
  'wellness': { label: 'Wellness', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  'basicneeds': { label: 'Basic Needs', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  'academic': { label: 'Academic', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  'communications': { label: 'Communications', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  'environmental': { label: 'Environmental', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  'funding': { label: 'Funding Requests', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
}

function getCategory(formType) {
  if (!formType) return 'other'
  if (formType.startsWith('wellness')) return 'wellness'
  if (formType.startsWith('basicneeds')) return 'basicneeds'
  if (formType.startsWith('academic')) return 'academic'
  if (formType.startsWith('communications')) return 'communications'
  if (formType.startsWith('environmental') || formType === 'adopt-a-space' || formType === 'donation-schedule') return 'environmental'
  return 'other'
}

function getFormTypeLabel(formType) {
  const labels = {
    'wellness-feedback': 'Feedback',
    'wellness-ride': 'Ride Request',
    'wellness-volunteer': 'Volunteer Application',
    'wellness-safetyplan': 'Safety Plan',
    'basicneeds-feedback': 'Feedback',
    'basicneeds-swipe': 'Meal Swipe Exchange',
    'basicneeds-shuttle': 'Shuttle Reservation',
    'academic-feedback': 'Feedback',
    'academic-mentor': 'Mentor Request',
    'academic-center': 'Study Center Reservation',
    'communications-feedback': 'Feedback',
    'communications-story': 'Story Submission',
    'communications-nomination': 'Nomination',
    'communications-podcast-guest': 'Podcast Guest',
    'communications-podcast-nomination': 'Podcast Nomination',
    'communications-talent': 'Talent Spotlight',
    'communications-podcast-subscribe': 'Newsletter',
    'environmental-feedback': 'Feedback',
    'adopt-a-space': 'Adopt-a-Space',
    'donation-schedule': 'Donation Scheduling',
  }
  return labels[formType] || formType
}

// Render form data fields as a clean key-value list
function DataFields({ data }) {
  if (!data || typeof data !== 'object') return null
  const skip = ['formType', 'department', 'timestamp', 'type']
  const entries = Object.entries(data).filter(([k]) => !skip.includes(k) && data[k])

  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 text-sm">
          <span className="text-gray-600 font-mono text-xs w-28 shrink-0 pt-0.5">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toLowerCase()}</span>
          <span className="text-gray-300 break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminSubmissions() {
  const router = useRouter()
  const { isAdmin, isLoaded, fundingRequests } = useApp()
  const authHeaders = getAuthHeaders()

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    if (isLoaded && !isAdmin) router.push('/admin/login')
  }, [isLoaded, isAdmin, router])

  const loadSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/forms', { headers: authHeaders })
      const data = await res.json()
      setSubmissions(data.data || [])
      setLastRefresh(new Date())
    } catch {
      setSubmissions([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) loadSubmissions()
  }, [isAdmin, loadSubmissions])

  // Auto-refresh every 30s
  useEffect(() => {
    if (!isAdmin) return
    const interval = setInterval(loadSubmissions, 30000)
    return () => clearInterval(interval)
  }, [isAdmin, loadSubmissions])

  const updateStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      await fetch('/api/forms', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ id, status }),
      })
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    } catch { /* ignore */ }
    setUpdatingId(null)
  }

  // Merge form submissions + funding requests into unified list
  const allItems = [
    ...submissions.map(s => ({
      id: s.id,
      type: 'form',
      formType: s.form_type,
      category: getCategory(s.form_type),
      data: s.data,
      status: s.status || 'new',
      submittedAt: s.submitted_at,
    })),
    ...(fundingRequests || []).map(r => ({
      id: r.id,
      type: 'funding',
      formType: 'funding-request',
      category: 'funding',
      data: {
        organization: r.orgName,
        category: r.category,
        amount: `$${r.amount}`,
        description: r.description,
        justification: r.justification,
        studentsImpacted: r.studentsImpacted,
        contactEmail: r.contactEmail,
      },
      status: r.status || 'pending',
      submittedAt: r.submittedAt,
      contextCheck: r.contextCheck,
    })),
  ].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  const filtered = activeCategory === 'all'
    ? allItems
    : allItems.filter(i => i.category === activeCategory)

  // Count by category
  const counts = { all: allItems.length }
  for (const item of allItems) {
    counts[item.category] = (counts[item.category] || 0) + 1
  }

  const statusColor = (s) => {
    if (s === 'new') return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    if (s === 'reviewed' || s === 'approved') return 'text-green-400 bg-green-500/10 border-green-500/30'
    if (s === 'pending') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    if (s === 'rejected' || s === 'denied') return 'text-red-400 bg-red-500/10 border-red-500/30'
    return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <Head><title>Submissions | Admin</title></Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-gray-400 text-sm hover:text-white transition">&larr; Admin</Link>
              <span className="text-xl font-bold tracking-tight">Submissions</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-500 font-mono">
                {allItems.length} total
              </span>
              <span className="text-gray-600 font-mono">
                {allItems.filter(i => i.status === 'new' || i.status === 'pending').length} new
              </span>
              <button
                onClick={loadSubmissions}
                disabled={loading}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-gray-800 rounded hover:border-gray-600 transition disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              {lastRefresh && (
                <span className="text-gray-700 font-mono text-[10px]">
                  {formatTime(lastRefresh)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category tabs */}
      <nav className="sticky top-16 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex gap-0 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-5 py-3.5 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                activeCategory === 'all'
                  ? 'border-white text-white'
                  : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
              }`}
            >
              All ({counts.all || 0})
            </button>
            {Object.entries(FORM_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-5 py-3.5 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
                  activeCategory === key
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
                }`}
              >
                {cat.label} ({counts[key] || 0})
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm">No submissions yet in this category.</p>
            <p className="text-gray-700 text-xs mt-2">Form submissions from all resource pages will appear here automatically.</p>
          </div>
        )}

        {/* Loading */}
        {loading && submissions.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm animate-pulse">Loading submissions...</p>
          </div>
        )}

        {/* Submissions list */}
        <div className="space-y-2">
          {filtered.map((item) => {
            const catInfo = FORM_CATEGORIES[item.category] || { label: 'Other', color: 'text-gray-400 border-gray-500/30 bg-gray-500/10' }
            const isExpanded = expandedId === item.id

            return (
              <div
                key={`${item.type}-${item.id}`}
                className={`border rounded-lg transition-all ${
                  isExpanded ? 'border-gray-700 bg-white/[0.02]' : 'border-gray-900 hover:border-gray-800'
                }`}
              >
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-left"
                >
                  {/* Status dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === 'new' || item.status === 'pending' ? 'bg-blue-400 animate-pulse' :
                    item.status === 'reviewed' || item.status === 'approved' ? 'bg-green-400' :
                    item.status === 'denied' || item.status === 'rejected' ? 'bg-red-400' : 'bg-gray-600'
                  }`} />

                  {/* Category badge */}
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase shrink-0 ${catInfo.color}`}>
                    {catInfo.label}
                  </span>

                  {/* Form type */}
                  <span className="text-sm text-gray-300 font-medium truncate">
                    {getFormTypeLabel(item.formType)}
                  </span>

                  {/* Preview - first meaningful field */}
                  <span className="text-xs text-gray-600 truncate flex-1 min-w-0">
                    {item.data?.name || item.data?.organization || item.data?.email || item.data?.org || ''}
                    {item.data?.description ? ` — ${item.data.description.substring(0, 60)}` : ''}
                  </span>

                  {/* Status */}
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase shrink-0 ${statusColor(item.status)}`}>
                    {item.status}
                  </span>

                  {/* Date */}
                  <span className="text-xs text-gray-600 font-mono shrink-0 w-24 text-right">
                    {formatDate(item.submittedAt)}
                  </span>

                  {/* Expand arrow */}
                  <span className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    &#9656;
                  </span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-900">
                    <div className="grid lg:grid-cols-2 gap-6 pt-4">
                      {/* Left: form data */}
                      <div>
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-wider mb-3">Submission Data</p>
                        <DataFields data={item.data} />
                        {item.submittedAt && (
                          <p className="text-xs text-gray-600 mt-4 font-mono">
                            Submitted: {formatDate(item.submittedAt)} at {formatTime(item.submittedAt)}
                          </p>
                        )}
                      </div>

                      {/* Right: actions */}
                      <div>
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-wider mb-3">Actions</p>

                        {/* Context check (funding only) */}
                        {item.contextCheck && (
                          <div className={`p-3 rounded-lg border mb-4 ${
                            item.contextCheck.isRealistic
                              ? 'bg-green-500/5 border-green-500/20'
                              : 'bg-yellow-500/5 border-yellow-500/20'
                          }`}>
                            <p className="text-xs font-mono mb-1">
                              <span className={item.contextCheck.isRealistic ? 'text-green-400' : 'text-yellow-400'}>
                                {item.contextCheck.flag || 'CHECK'}
                              </span>
                              {item.contextCheck.typicalRange && (
                                <span className="text-gray-500 ml-2">Typical: {item.contextCheck.typicalRange}</span>
                              )}
                            </p>
                            {item.contextCheck.note && (
                              <p className="text-xs text-gray-400">{item.contextCheck.note}</p>
                            )}
                          </div>
                        )}

                        {/* Status update buttons */}
                        {item.type === 'form' && (
                          <div className="flex gap-2">
                            {item.status !== 'reviewed' && (
                              <button
                                onClick={() => updateStatus(item.id, 'reviewed')}
                                disabled={updatingId === item.id}
                                className="px-4 py-2 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30 rounded hover:bg-green-500/20 transition disabled:opacity-50"
                              >
                                Mark Reviewed
                              </button>
                            )}
                            {item.status !== 'archived' && (
                              <button
                                onClick={() => updateStatus(item.id, 'archived')}
                                disabled={updatingId === item.id}
                                className="px-4 py-2 text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/20 transition disabled:opacity-50"
                              >
                                Archive
                              </button>
                            )}
                            {item.status === 'archived' && (
                              <button
                                onClick={() => updateStatus(item.id, 'new')}
                                disabled={updatingId === item.id}
                                className="px-4 py-2 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/20 transition disabled:opacity-50"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        )}

                        {item.type === 'funding' && (
                          <p className="text-xs text-gray-500">
                            Manage funding requests in{' '}
                            <Link href="/admin" className="text-white underline hover:text-gray-300">
                              Admin Dashboard &rarr; Budget & Funding
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <AdminNav />
      <div className="h-12" />
    </div>
  )
}
