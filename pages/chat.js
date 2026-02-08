import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Layout from '../components/Layout'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

export default function Chat() {
  const router = useRouter()
  const { doc: docId, title: docTitle } = router.query

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasAutoAsked, setHasAutoAsked] = useState(false)
  const messagesEndRef = useRef(null)

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
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      if (res.status === 429) { setError('Too many requests. Please wait a moment.'); setIsLoading(false); return }
      if (res.status === 503) { setError('AI service not configured. Contact an administrator.'); setIsLoading(false); return }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setIsLoading(false); return }
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, sources: data.sources || [] }])
    } catch {
      setError('Failed to connect. Please try again.')
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <Layout>
      <Head>
        <title>Ask AI | UNC Gov Codex</title>
      </Head>

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-28 pb-8 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>

        {/* Header */}
        <div className="mb-8 shrink-0">
          <p className="caption mb-3">AI Assistant</p>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Gov Codex</h1>
          <p className="text-gray-500 text-sm">Ask questions about approved UNC governance documents. All answers include citations.</p>
          {docTitle && (
            <div className="mt-3 inline-flex items-center gap-2 badge">
              Asking about: {decodeURIComponent(docTitle)}
              <button onClick={() => router.push('/chat', undefined, { shallow: true })} className="text-gray-400 hover:text-white ml-1">&times;</button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 min-h-0 pb-4">
          {/* Welcome */}
          {messages.length === 0 && !isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-white/10 border border-gray-800 rounded flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="card max-w-[80%]">
                <p className="body-text text-sm">
                  Welcome to UNC Gov Codex. I can answer questions about approved governance documents, policies, and procedures.
                </p>
                <p className="body-text text-sm mt-2">
                  All responses are grounded in officially approved documents, with citations for verification.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['What governance documents are available?', 'What is the student code of conduct?', 'How does the budget process work?'].map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 text-xs bg-white/5 border border-gray-800 rounded text-gray-400 hover:text-white hover:border-gray-600 transition">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-white/10 border border-gray-800 rounded flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              )}
              <div className={`max-w-[80%] ${
                msg.role === 'user' ? 'card !bg-white/5 !border-gray-700' : 'card'
              }`}>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-900">
                    <p className="caption mb-2">Sources</p>
                    <div className="space-y-1.5">
                      {msg.sources.filter((s, idx, arr) => arr.findIndex(x => x.document_id === s.document_id) === idx).map((source, j) => (
                        <Link key={j} href={`/knowledge-base/${source.document_id}`}
                          className="flex items-center gap-3 px-3 py-2 bg-black border border-gray-900 rounded text-xs group hover:border-gray-700 transition">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          <span className="text-gray-300 group-hover:text-white transition">{source.title}</span>
                          <span className="text-gray-600 font-mono">v{source.version}</span>
                          {source.section && source.section !== 'General' && (
                            <span className="text-gray-600">| {source.section}</span>
                          )}
                          <span className="text-gray-600 font-mono ml-auto">{formatDate(source.approved_at)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-white/10 border border-gray-800 rounded flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-white/10 border border-gray-800 rounded flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="card">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-500/5 border border-red-500/20 rounded px-4 py-3 max-w-[80%]">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-900 pt-4 shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about governance documents..."
              disabled={isLoading}
              className="flex-1 rounded disabled:opacity-50"
            />
            <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
              className="btn-primary py-3 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </div>
          <p className="caption text-center mt-3">
            Powered by Grok | Responses based on approved documents only | No chat data stored
          </p>
        </div>
      </div>
    </Layout>
  )
}
