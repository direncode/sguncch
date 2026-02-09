import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Layout from '../components/Layout'
import { useApp } from '../lib/store'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

// Strip any markdown that slips through from Grok
function stripMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/^#{1,6}\s+/gm, '')           // # headers
    .replace(/\*\*(.+?)\*\*/g, '$1')       // **bold**
    .replace(/\*(.+?)\*/g, '$1')           // *italic*
    .replace(/__(.+?)__/g, '$1')           // __bold__
    .replace(/_(.+?)_/g, '$1')             // _italic_
    .replace(/~~(.+?)~~/g, '$1')           // ~~strikethrough~~
    .replace(/`{3}[\s\S]*?`{3}/g, '')      // ```code blocks```
    .replace(/`(.+?)`/g, '$1')             // `inline code`
    .replace(/^\s*[-*+]\s+/gm, '  ')       // bullet lists → indented
    .replace(/^\s*\d+\.\s+/gm, '  ')       // numbered lists → indented
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [links](url) → text
    .replace(/^>\s+/gm, '')                // > blockquotes
    .replace(/^---+$/gm, '')               // horizontal rules
    .replace(/\n{3,}/g, '\n\n')            // collapse extra newlines
    .trim()
}

// Grok sparkle icon
function GrokIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white" />
    </svg>
  )
}

// Arrow send icon
function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export default function Chat() {
  const router = useRouter()
  const { doc: docId, title: docTitle } = router.query

  const { policies, operationalData, budgetData, quickStats, announcements, feedback } = useApp()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasAutoAsked, setHasAutoAsked] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (docTitle && !hasAutoAsked && messages.length === 0) {
      const question = `Tell me about ${decodeURIComponent(docTitle)}`
      setHasAutoAsked(true)
      sendMessage(question)
    }
  }, [docTitle, hasAutoAsked])

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
        }),
      })
      const data = await res.json()
      if (res.status === 429) { setError('Too many requests. Please wait a moment.'); setIsLoading(false); return }
      if (res.status === 503) { setError('AI service not configured. Contact an administrator.'); setIsLoading(false); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setIsLoading(false); return }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: stripMarkdown(data.answer),
        sources: data.sources || [],
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
    'What governance documents are available?',
    'How are policy initiatives progressing?',
    'What is the current budget status?',
    'Summarize recent student feedback',
  ]

  return (
    <Layout>
      <Head>
        <title>Grok | Gov Codex</title>
      </Head>

      <div className="flex flex-col" style={{ height: '100vh' }}>
        {/* Spacer for nav */}
        <div className="h-20 shrink-0" />

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">

            {/* Welcome screen */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center pt-[15vh]">
                <div className="mb-6 opacity-20">
                  <GrokIcon size={48} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Gov Codex</h1>
                <p className="text-gray-500 text-sm text-center max-w-md mb-10">
                  Ask anything about UNC governance, policies, budget, or student services. Powered by Grok with access to approved documents and live platform data.
                </p>
                {docTitle && (
                  <div className="mb-6 flex items-center gap-2 text-sm text-gray-400 bg-white/[0.03] border border-gray-800 rounded-full px-4 py-2">
                    <span>Context: {decodeURIComponent(docTitle)}</span>
                    <button onClick={() => router.push('/chat', undefined, { shallow: true })} className="text-gray-500 hover:text-white ml-1">&times;</button>
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
                    <div className="shrink-0 mt-1 opacity-40">
                      <GrokIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {msg.sources.filter((s, idx, arr) => arr.findIndex(x => x.document_id === s.document_id) === idx).map((source, j) => (
                            <Link key={j} href={`/knowledge-base/${source.document_id}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-gray-800 rounded-full text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all">
                              <span className="w-1 h-1 rounded-full bg-gray-500" />
                              <span>{source.title}</span>
                              {source.section && source.section !== 'General' && (
                                <span className="text-gray-600">{source.section}</span>
                              )}
                            </Link>
                          ))}
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
                <div className="shrink-0 mt-1 opacity-40">
                  <GrokIcon size={20} />
                </div>
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
                <div className="shrink-0 mt-1 opacity-40">
                  <GrokIcon size={20} />
                </div>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar — fixed at bottom */}
        <div className="shrink-0 border-t border-white/[0.06] bg-black/80 backdrop-blur-xl">
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="w-full bg-white/[0.04] border border-gray-800 rounded-full pl-5 pr-12 py-3.5 text-[15px] text-white placeholder-gray-600 focus:border-gray-600 focus:outline-none focus:bg-white/[0.06] transition-all disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-gray-500"
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-600 mt-3 tracking-wide">
              Grok  /  Gov Codex  /  Documents + Live Data
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
