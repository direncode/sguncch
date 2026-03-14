import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import { NEWS_CATEGORIES } from '../lib/newsSources'

export default function NewsPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [diagnostics, setDiagnostics] = useState(null)
  const [feedSource, setFeedSource] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news/feed')
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
          setDiagnostics(data.diagnostics || null)
          setFeedSource(data.source || null)
        } else {
          const errData = await res.json().catch(() => ({}))
          setError(errData.detail || errData.error || `HTTP ${res.status}`)
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch news')
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [])

  const categories = ['all', ...new Set(articles.map(a => a.category).filter(Boolean))]
  const filtered = filter === 'all' ? articles : articles.filter(a => a.category === filter)

  // Group sources for the stats bar
  const sourceGroups = {}
  articles.forEach(a => {
    if (!sourceGroups[a.sourceName]) sourceGroups[a.sourceName] = 0
    sourceGroups[a.sourceName]++
  })

  return (
    <Layout>
      <Head>
        <title>UNC News | Project Bold</title>
      </Head>

      <div className="pt-40 pb-24 px-6 lg:px-12 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-xs text-[#4B9CD3] font-mono tracking-widest uppercase">Live Feed</span>
            {feedSource && (
              <span className="text-[10px] text-gray-600 font-mono">({feedSource})</span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">UNC News</h1>
          <p className="text-gray-400 max-w-2xl">
            Aggregated from official UNC-Chapel Hill sources — campus news, athletics, research, health, arts, and student media.
          </p>
        </div>

        {/* Source Stats */}
        {Object.keys(sourceGroups).length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(sourceGroups)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <span key={name} className="text-[11px] text-gray-500 font-mono bg-white/[0.03] border border-gray-800 rounded-lg px-3 py-1">
                  {name} <span className="text-gray-600">({count})</span>
                </span>
              ))
            }
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => {
            const catInfo = NEWS_CATEGORIES[cat]
            const label = cat === 'all' ? 'All' : catInfo?.label || cat
            const count = cat === 'all' ? articles.length : articles.filter(a => a.category === cat).length
            const isActive = filter === cat
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all ${
                  isActive
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {label} <span className={isActive ? 'text-black/50' : 'text-gray-600'}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/[0.02] border border-gray-900 rounded-xl p-6 animate-pulse">
                <div className="h-4 w-24 bg-white/5 rounded mb-3" />
                <div className="h-5 w-3/4 bg-white/5 rounded mb-2" />
                <div className="h-3 w-full bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
            <p className="text-red-400 text-sm font-mono">Feed error: {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg mb-2">No articles available</p>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Unable to reach UNC news feeds. Articles will appear once the feeds respond.
            </p>
            {diagnostics?.failed?.length > 0 && (
              <div className="mt-6 text-left max-w-md mx-auto">
                <p className="text-[11px] text-gray-600 font-mono mb-2">Failed sources:</p>
                {diagnostics.failed.map(f => (
                  <p key={f.id} className="text-[11px] text-gray-700 font-mono">{f.name}: {f.error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No results for filter */}
        {!loading && articles.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No articles in this category.</p>
            <button onClick={() => setFilter('all')} className="text-[#4B9CD3] text-sm mt-2 hover:underline">
              Show all articles
            </button>
          </div>
        )}

        {/* Article List */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((article, i) => {
              const cat = NEWS_CATEGORIES[article.category] || { label: article.category, color: 'bg-gray-600' }
              return (
                <a
                  key={`${article.link}-${i}`}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white/[0.02] border border-gray-900 rounded-xl p-6 hover:bg-white/[0.04] hover:border-gray-700 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono text-white ${cat.color} flex-shrink-0`}>
                          {cat.label}
                        </span>
                        {article.sourceName && (
                          <span className="text-[11px] text-gray-500 font-mono">{article.sourceName}</span>
                        )}
                      </div>
                      <h3 className="text-white font-medium text-lg group-hover:text-[#4B9CD3] transition-colors mb-1">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                          {article.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {article.pubDate && (
                        <time className="text-xs text-gray-500 font-mono">
                          {formatDate(article.pubDate)}
                        </time>
                      )}
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {/* Article count */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-xs text-gray-600 font-mono mt-8">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            {filter !== 'all' && ` of ${articles.length} total`}
          </p>
        )}
      </div>
    </Layout>
  )
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 1) return `${Math.floor(diff / 60000)}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
