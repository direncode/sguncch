import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'
import { getAuthHeaders } from '../../lib/adminSession'
import AdminNav from '../../components/AdminNav'

function GrokIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '  ')
    .replace(/^\s*\d+\.\s+/gm, '  ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Analysis templates for comprehensive Grok queries
const ANALYSIS_TEMPLATES = [
  {
    id: 'audit',
    label: 'Full Audit Report',
    icon: '1',
    description: 'Comprehensive audit across all departments',
    prompt: 'Generate a comprehensive audit report covering all policy progress across every department, budget utilization rates by category, operational metrics for tech loans and food pantry and training programs, and student feedback themes. For each department, assess whether they are on track, behind schedule, or ahead. Identify the top 3 areas of concern and top 3 areas of success. End with prioritized recommendations for the next 30 days.',
  },
  {
    id: 'department',
    label: 'Department Deep Dive',
    icon: '2',
    description: 'Detailed analysis of a specific department',
    prompt: null, // Dynamic — opens department selector
  },
  {
    id: 'budget',
    label: 'Budget Analysis',
    icon: '3',
    description: 'Budget utilization and funding gaps',
    prompt: 'Analyze the current budget in detail. Break down spending by category, identify which categories are underspent versus overspent, calculate the overall utilization rate, and assess whether current spending patterns align with policy priorities. Review any pending funding requests and flag items that need attention. Recommend specific budget adjustments or reallocations based on policy needs.',
  },
  {
    id: 'feedback',
    label: 'Feedback Analysis',
    icon: '4',
    description: 'Student feedback themes and actions',
    prompt: 'Analyze all student feedback comprehensively. Identify the most common themes and categories, highlight urgent or time-sensitive feedback, assess the resolution rate and response time trends, and cross-reference feedback themes with current policy initiatives. Recommend priority actions based on feedback patterns. Identify any gaps where student concerns are not addressed by current policies.',
  },
  {
    id: 'scroll',
    label: 'Scroll Coverage',
    icon: '5',
    description: 'Knowledge base gap analysis',
    prompt: 'Review all documents currently in The Scroll knowledge base. Assess coverage across governance areas — which topics are well-documented and which have gaps? Identify any documents that may be outdated or need revision. Cross-reference Scroll documents with current policy initiatives to identify where documentation supports or fails to support active work. Recommend specific new documents that should be added to strengthen the knowledge base.',
  },
  {
    id: 'progress',
    label: 'Progress Report',
    icon: '6',
    description: 'Presentation-ready progress summary',
    prompt: 'Generate a progress report suitable for presentation to student government leadership. Cover each department with its average progress, highlight completed initiatives and those nearing completion, flag any policies at 0% that need attention, summarize key operational achievements like students served through tech loans and food pantry visits, reference relevant governance documents from The Scroll, and provide an overall assessment of platform health and momentum.',
  },
]

const DEPARTMENTS = ['wellness', 'basic-needs', 'academic', 'communications', 'environmental']

export default function AdminAI() {
  const router = useRouter()
  const { isAdmin, isLoaded, accountInfo, policies, operationalData, budgetData, quickStats, announcements, feedback, fundingRequests } = useApp()

  const [messages, setMessages] = useState([])
  const [conversationHistory, setConversationHistory] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [scrollStats, setScrollStats] = useState(null)
  const [showTemplates, setShowTemplates] = useState(true)
  const [showDeptPicker, setShowDeptPicker] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)

  // Conversation persistence
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isLoaded && !isAdmin) router.push('/admin/login')
  }, [isLoaded, isAdmin, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetch('/api/codex/scroll')
      .then(r => r.json())
      .then(data => {
        if (data.documents) {
          setScrollStats({
            count: data.documents.length,
            categories: data.buckets?.length || 0,
            chars: data.documents.reduce((sum, d) => sum + (d.char_count || 0), 0),
          })
        }
      })
      .catch(() => {})
  }, [])

  // Load conversation history
  useEffect(() => {
    if (accountInfo?.id) {
      fetch(`/api/chat/history?userId=${accountInfo.id}`, { headers: getAuthHeaders() })
        .then(r => r.ok ? r.json() : { conversations: [] })
        .then(data => setConversations(data.conversations || []))
        .catch(() => {})
    }
  }, [accountInfo])

  const saveConversation = useCallback(async (msgs) => {
    if (!accountInfo?.id) return
    const title = msgs.find(m => m.role === 'user')?.content?.slice(0, 60) || 'New Conversation'
    try {
      const res = await fetch('/api/chat/history', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId: accountInfo.id,
          conversationId: activeConversationId,
          title,
          messages: msgs,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.conversation?.id && !activeConversationId) {
          setActiveConversationId(data.conversation.id)
        }
      }
    } catch { /* non-blocking */ }
  }, [accountInfo, activeConversationId])

  const sendMessage = async (questionText) => {
    const question = questionText || input.trim()
    if (!question) return
    setInput('')
    setError(null)
    setShowTemplates(false)
    setShowDeptPicker(false)

    const newUserMsg = { role: 'user', content: question }
    const updatedMessages = [...messages, newUserMsg]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const res = await fetch('/api/codex/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          platformData: { policies, operationalData, budgetData, quickStats, announcements, feedback, fundingRequests },
          isAdminMode: true,
          conversationHistory,
        }),
      })
      const data = await res.json()
      if (res.status === 429) { setError('Too many requests. Please wait a moment.'); setIsLoading(false); return }
      if (res.status === 503) { setError('AI service not configured. Contact an administrator.'); setIsLoading(false); return }
      if (res.status === 422 && data.error === 'scroll_empty') { setError('scroll_empty'); setIsLoading(false); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setIsLoading(false); return }

      const assistantMsg = {
        role: 'assistant',
        content: stripMarkdown(data.answer),
        sources: data.sources || [],
        webSearchUsed: data.webSearchUsed || false,
        analysisType: data.analysisType || 'general',
      }
      const allMessages = [...updatedMessages, assistantMsg]
      setMessages(allMessages)

      // Update conversation history for multi-turn
      setConversationHistory(prev => [...prev, newUserMsg, { role: 'assistant', content: data.answer }])

      // Save conversation
      saveConversation(allMessages)
    } catch {
      setError('Failed to connect. Please try again.')
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleTemplateClick = (template) => {
    if (template.id === 'department') {
      setShowDeptPicker(true)
      return
    }
    sendMessage(template.prompt)
  }

  const handleDeptSelect = (dept) => {
    const prompt = `Generate a comprehensive deep dive analysis of the ${dept} department. Cover every policy in this department with its current progress, status, priority, and metrics. Analyze budget allocations relevant to ${dept}, review any related student feedback, assess operational programs connected to this department, and reference any governance documents in The Scroll that apply. Identify what is working well, what needs attention, and provide specific, actionable recommendations.`
    setShowDeptPicker(false)
    sendMessage(prompt)
  }

  const copyResponse = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    })
  }

  const exportConversation = () => {
    const text = messages.map(m => `[${m.role === 'user' ? 'You' : 'Grok'}]\n${m.content}\n`).join('\n---\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grok-conversation-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const startNewConversation = () => {
    setMessages([])
    setConversationHistory([])
    setActiveConversationId(null)
    setShowTemplates(true)
    setError(null)
  }

  const loadConversation = (conv) => {
    setMessages(conv.messages || [])
    setConversationHistory((conv.messages || []).filter(m => m.role === 'user' || m.role === 'assistant'))
    setActiveConversationId(conv.id)
    setShowTemplates(false)
    setShowSidebar(false)
  }

  // Count data sources accessed
  const dataSources = []
  if (scrollStats?.count > 0) dataSources.push('Scroll')
  if (policies.length > 0) dataSources.push('Policies')
  if (budgetData?.total) dataSources.push('Budget')
  if (feedback.length > 0) dataSources.push('Feedback')

  if (!isLoaded) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Head><title>Grok Admin | Project Bold</title></Head>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-900 shrink-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-gray-400 text-sm hover:text-white transition">&larr; Admin</Link>
              <div className="flex items-center gap-2">
                <GrokIcon size={20} />
                <span className="text-xl font-bold tracking-tight">Grok Admin</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              {scrollStats && (
                <div className="flex items-center gap-3 text-gray-600 font-mono">
                  <span>{scrollStats.count} docs</span>
                  <span>{scrollStats.categories} categories</span>
                  <span>{(scrollStats.chars / 1000).toFixed(0)}K chars</span>
                </div>
              )}
              {messages.length > 0 && (
                <>
                  <button onClick={exportConversation} className="text-gray-500 hover:text-white transition text-xs" title="Export conversation">
                    Export
                  </button>
                  <button onClick={startNewConversation} className="text-gray-500 hover:text-white transition text-xs">
                    New Chat
                  </button>
                </>
              )}
              {accountInfo && conversations.length > 0 && (
                <button onClick={() => setShowSidebar(!showSidebar)} className="text-gray-500 hover:text-white transition text-xs">
                  History ({conversations.length})
                </button>
              )}
              <Link href="/chat" className="text-gray-500 hover:text-white transition">Public Chat &rarr;</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin mode indicator */}
      <div className="shrink-0 border-b border-gray-900 bg-yellow-500/[0.03]">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-4">
          <span className="text-xs text-yellow-400 font-mono uppercase tracking-wider">
            Admin Mode — full access to operational data, budget, feedback, and The Scroll
          </span>
          <div className="flex items-center gap-1.5">
            {dataSources.map(ds => (
              <span key={ds} className="px-1.5 py-0.5 bg-white/[0.03] border border-gray-800 rounded text-[9px] text-gray-500 font-mono">
                {ds}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-gray-950 border-r border-gray-800 h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Chat History</h3>
              <button onClick={() => setShowSidebar(false)} className="text-gray-500 hover:text-white text-sm">Close</button>
            </div>
            <button onClick={() => { startNewConversation(); setShowSidebar(false) }}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 bg-white/[0.03] border border-gray-800 rounded-lg mb-3 hover:bg-white/[0.06] transition">
              + New Conversation
            </button>
            {conversations.map(conv => (
              <button key={conv.id} onClick={() => loadConversation(conv)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg mb-1 transition ${activeConversationId === conv.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/[0.04]'}`}>
                <p className="truncate">{conv.title || 'Untitled'}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {new Date(conv.updated_at || conv.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
          <div className="flex-1" onClick={() => setShowSidebar(false)} />
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">

          {/* Scroll empty */}
          {messages.length === 0 && !isLoading && scrollStats && scrollStats.count === 0 && (
            <div className="flex flex-col items-center justify-center pt-[12vh]">
              <div className="mb-6 opacity-10"><GrokIcon size={48} /></div>
              <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">The Scroll Is Empty</h1>
              <p className="text-gray-500 text-sm text-center max-w-md mb-6">
                Upload governing documents as .txt to The Scroll before Grok can answer questions.
              </p>
              <Link href="/admin/scroll"
                className="px-6 py-3 bg-white text-black font-medium rounded-lg text-sm hover:bg-gray-200 transition">
                Go to The Scroll to Upload
              </Link>
            </div>
          )}

          {/* Welcome screen with templates */}
          {showTemplates && messages.length === 0 && !isLoading && (!scrollStats || scrollStats.count > 0) && (
            <div className="flex flex-col items-center justify-center pt-[6vh]">
              <div className="mb-6 opacity-20"><GrokIcon size={48} /></div>
              <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Grok Admin</h1>
              <p className="text-gray-500 text-sm text-center max-w-md mb-2">
                Hyper-tuned for comprehensive, data-driven analysis with full access to all platform data.
              </p>

              {scrollStats && (
                <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-white/[0.02] border border-gray-900 rounded-full">
                  <GrokIcon size={12} />
                  <span className="text-[11px] text-gray-500">
                    {scrollStats.count} documents | {dataSources.length} data sources | Enhanced depth mode
                  </span>
                </div>
              )}

              {/* Analysis Templates */}
              <div className="w-full max-w-lg">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-3 font-mono text-center">Analysis Templates</p>
                <div className="grid grid-cols-2 gap-2">
                  {ANALYSIS_TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => handleTemplateClick(t)}
                      className="text-left px-4 py-3 bg-white/[0.02] border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-white/[0.05] transition-all group">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded bg-white/[0.06] flex items-center justify-center text-[10px] text-gray-500 font-mono">{t.icon}</span>
                        <span className="text-sm text-gray-300 group-hover:text-white transition">{t.label}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-snug">{t.description}</p>
                    </button>
                  ))}
                </div>

                {/* Department Picker */}
                {showDeptPicker && (
                  <div className="mt-4 p-4 bg-white/[0.02] border border-gray-800 rounded-lg">
                    <p className="text-xs text-gray-400 mb-3">Select a department to analyze:</p>
                    <div className="flex flex-wrap gap-2">
                      {DEPARTMENTS.map(dept => (
                        <button key={dept} onClick={() => handleDeptSelect(dept)}
                          className="px-3 py-1.5 text-sm text-gray-300 bg-white/[0.04] border border-gray-700 rounded-full hover:text-white hover:border-gray-500 transition capitalize">
                          {dept.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-center text-[10px] text-gray-700 mt-4 font-mono">Or ask any question below</p>
              </div>
            </div>
          )}

          {/* Message thread */}
          {messages.map((msg, i) => (
            <div key={i} className={`mb-6 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
              {msg.role === 'assistant' ? (
                <div className="flex gap-3">
                  <div className="shrink-0 mt-1 opacity-40"><GrokIcon size={20} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Metadata bar */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {msg.webSearchUsed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-mono">
                          Web search used
                        </span>
                      )}
                      {msg.analysisType && msg.analysisType !== 'general' && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-purple-500/5 border border-purple-500/20 rounded-full text-[10px] text-purple-400 font-mono capitalize">
                          {msg.analysisType} analysis
                        </span>
                      )}
                      <button onClick={() => copyResponse(msg.content, i)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] text-gray-600 hover:text-white transition rounded">
                        <CopyIcon />
                        {copiedIdx === i ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2 font-mono">From The Scroll</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.filter((s, idx, arr) => arr.findIndex(x => x.document_id === s.document_id) === idx).map((source, j) => (
                            <Link key={j} href={`/knowledge-base/${source.document_id}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all">
                              <span className="w-1 h-1 rounded-full bg-gray-500" />
                              <span>{source.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="max-w-[80%] bg-white/[0.06] rounded-2xl px-4 py-3">
                  <p className="text-[15px] text-white leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="mb-6 flex gap-3">
              <div className="shrink-0 mt-1 opacity-40"><GrokIcon size={20} /></div>
              <div className="flex items-center gap-1.5 py-2">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 flex gap-3">
              <div className="shrink-0 mt-1 opacity-40"><GrokIcon size={20} /></div>
              {error === 'scroll_empty' ? (
                <div>
                  <p className="text-sm text-yellow-400 mb-2">The Scroll is empty. Upload governing documents first.</p>
                  <Link href="/admin/scroll" className="text-xs text-gray-400 hover:text-white underline transition">
                    Go to The Scroll
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-gray-900 bg-black/80 backdrop-blur-xl">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Grok anything about UNC governance..."
              disabled={isLoading || (scrollStats && scrollStats.count === 0)}
              className="w-full bg-white/[0.04] border border-gray-800 rounded-full pl-5 pr-12 py-3.5 text-[15px] text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none focus:bg-white/[0.06] transition-all disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim() || (scrollStats && scrollStats.count === 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
            >
              <SendIcon />
            </button>
          </div>
          <p className="text-center text-[11px] text-gray-600 mt-3 tracking-wide">
            Grok / The Scroll / Admin Data + Documents + Live Platform / Hyper-Tuned Analysis
          </p>
        </div>
      </div>
      <AdminNav />
      <div className="h-12" />
    </div>
  )
}
