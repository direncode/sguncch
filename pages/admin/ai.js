import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useApp } from '../../lib/store'

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

export default function AdminAI() {
  const router = useRouter()
  const { isAdmin, isLoaded, policies, operationalData, budgetData, quickStats, announcements, feedback } = useApp()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [scrollStats, setScrollStats] = useState(null)
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

  const sendMessage = async (questionText) => {
    const question = questionText || input.trim()
    if (!question) return
    setInput('')
    setError(null)
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setIsLoading(true)
    try {
      const res = await fetch('/api/codex/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          platformData: { policies, operationalData, budgetData, quickStats, announcements, feedback },
          isAdminMode: true,
        }),
      })
      const data = await res.json()
      if (res.status === 429) { setError('Too many requests. Please wait a moment.'); setIsLoading(false); return }
      if (res.status === 503) { setError('AI service not configured. Contact an administrator.'); setIsLoading(false); return }
      if (res.status === 422 && data.error === 'scroll_empty') { setError('scroll_empty'); setIsLoading(false); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setIsLoading(false); return }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: stripMarkdown(data.answer),
        sources: data.sources || [],
        webSearchUsed: data.webSearchUsed || false,
      }])
    } catch {
      setError('Failed to connect. Please try again.')
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const suggestedQuestions = [
    'Summarize all pending budget requests',
    'What documents are in The Scroll knowledge base?',
    'Audit report: policy progress across departments',
    'Summarize recent student feedback and action items',
    'What funding requests have been flagged?',
    'Which departments are behind on milestones?',
  ]

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
              <Link href="/chat" className="text-gray-500 hover:text-white transition">Public Chat &rarr;</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin mode indicator */}
      <div className="shrink-0 border-b border-gray-900 bg-yellow-500/[0.03]">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-2 flex items-center justify-center">
          <span className="text-xs text-yellow-400 font-mono uppercase tracking-wider">
            Admin Mode — full access to operational data, budget, feedback, and The Scroll
          </span>
        </div>
      </div>

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

          {/* Welcome screen */}
          {messages.length === 0 && !isLoading && (!scrollStats || scrollStats.count > 0) && (
            <div className="flex flex-col items-center justify-center pt-[12vh]">
              <div className="mb-6 opacity-20"><GrokIcon size={48} /></div>
              <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Grok Admin</h1>
              <p className="text-gray-500 text-sm text-center max-w-md mb-6">
                Full admin context: The Scroll knowledge base, budget data, operational metrics, student feedback, and all governance documents.
              </p>

              {scrollStats && (
                <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/[0.02] border border-gray-900 rounded-full">
                  <GrokIcon size={12} />
                  <span className="text-[11px] text-gray-500">
                    Sourcing from The Scroll: {scrollStats.count} documents across {scrollStats.categories} categories
                  </span>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {suggestedQuestions.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="px-4 py-2 text-sm text-gray-400 bg-white/[0.03] border border-gray-800 rounded-full hover:text-white hover:border-gray-600 hover:bg-white/[0.06] transition-all">
                    {q}
                  </button>
                ))}
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
                    {msg.webSearchUsed && (
                      <div className="mt-3 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-mono">
                          Web search used
                        </span>
                      </div>
                    )}
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
              placeholder="Ask Grok (admin context)..."
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
            Grok / The Scroll / Admin Data + Documents + Live Platform
          </p>
        </div>
      </div>
    </div>
  )
}
