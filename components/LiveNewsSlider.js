import { useState, useEffect, useRef } from 'react'
import { NEWS_CATEGORIES } from '../lib/newsSources'

/**
 * LiveNewsSlider — Continuous auto-scrolling marquee ticker for UNC news
 * Displays on every page via Layout. Compact (~40px height).
 */
export default function LiveNewsSlider() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [paused, setPaused] = useState(false)
  const marqueeRef = useRef(null)

  // Load collapsed preference
  useEffect(() => {
    try {
      const pref = localStorage.getItem('projectbold_news_collapsed')
      if (pref === 'true') setCollapsed(true)
    } catch {}
  }, [])

  // Fetch news
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news/feed')
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
        }
      } catch {
        // Silent fail — news is supplementary
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem('projectbold_news_collapsed', String(next))
    } catch {}
  }

  if (collapsed) {
    return (
      <div className="bg-[#13294B] border-b border-[#4B9CD3]/20">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-7">
          <span className="text-[10px] text-[#4B9CD3] font-mono tracking-widest uppercase">UNC Live News</span>
          <button
            onClick={toggleCollapsed}
            className="text-[10px] text-gray-400 hover:text-white transition-colors font-mono"
          >
            Show
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-[#13294B] border-b border-[#4B9CD3]/20">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-10">
          <span className="text-[10px] text-[#4B9CD3] font-mono tracking-widest uppercase mr-4">Live</span>
          <div className="flex-1 flex gap-8 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-3 w-48 bg-white/5 rounded animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (articles.length === 0) return null

  // Duplicate articles for seamless loop
  const displayArticles = [...articles, ...articles]

  return (
    <div className="bg-[#13294B] border-b border-[#4B9CD3]/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-10">
        {/* Label */}
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-[10px] text-[#4B9CD3] font-mono tracking-widest uppercase">Live</span>
        </div>

        {/* Marquee */}
        <div
          className="flex-1 overflow-hidden relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={marqueeRef}
            className="flex items-center gap-8 whitespace-nowrap"
            style={{
              animation: `marquee ${Math.max(30, articles.length * 5)}s linear infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          >
            {displayArticles.map((article, i) => {
              const cat = NEWS_CATEGORIES[article.category] || NEWS_CATEGORIES['student-news']
              return (
                <a
                  key={`${article.link}-${i}`}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 flex-shrink-0 group"
                >
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono text-white ${cat.color} flex-shrink-0`}>
                    {cat.label}
                  </span>
                  <span className="text-xs text-gray-300 group-hover:text-white transition-colors truncate max-w-[300px]">
                    {article.title}
                  </span>
                  {article.pubDate && (
                    <span className="text-[10px] text-gray-500 flex-shrink-0">
                      {formatTimeAgo(article.pubDate)}
                    </span>
                  )}
                </a>
              )
            })}
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={toggleCollapsed}
          className="ml-2 text-gray-500 hover:text-white transition-colors flex-shrink-0"
          title="Hide news ticker"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
