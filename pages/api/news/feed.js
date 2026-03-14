import { createLogger } from '../../../lib/logger'
import { UNC_FEED_SOURCES } from '../../../lib/newsSources'
import { cacheNewsArticles, getCachedNews } from '../../../lib/supabase'

const log = createLogger('API:news-feed')

// In-memory cache fallback when Supabase unavailable
let memoryCache = { articles: [], cachedAt: 0, diagnostics: null }
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Simple rate limiter
const rateLimitMap = new Map()
const RATE_LIMIT = 15
const RATE_WINDOW_MS = 60000

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

/**
 * Parse RSS/Atom XML feed using regex (no dependency needed)
 */
function parseRSSFeed(xml, source) {
  const articles = []

  // Match <item> blocks (RSS) or <entry> blocks (Atom)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi

  const blocks = [...xml.matchAll(itemRegex), ...xml.matchAll(entryRegex)]

  for (const match of blocks.slice(0, 15)) {
    const block = match[1]

    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link') || extractAttr(block, 'link', 'href')
    const description = stripHtml(extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content') || '')
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated') || extractTag(block, 'dc:date')

    if (title && link) {
      articles.push({
        title: decodeEntities(title).trim(),
        link: link.trim(),
        description: description.substring(0, 300),
        pubDate: pubDate ? new Date(pubDate).toISOString() : null,
        sourceId: source.id,
        sourceName: source.name,
        category: source.category,
      })
    }
  }

  return articles
}

function extractTag(xml, tag) {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i')
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1]

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : null
}

function extractAttr(xml, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : null
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
}

/**
 * Fetch a single feed with direct fetch + proxy fallback
 */
async function fetchSingleFeed(source) {
  const methods = [
    // Method 1: Direct fetch
    async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const response = await fetch(source.feedUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ProjectBold/1.0; +https://projectbold.org)',
            'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
          },
        })
        clearTimeout(timeout)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return await response.text()
      } catch (err) {
        clearTimeout(timeout)
        throw err
      }
    },
    // Method 2: RSS2JSON public proxy
    async () => {
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.feedUrl)}`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const response = await fetch(proxyUrl, { signal: controller.signal })
        clearTimeout(timeout)
        if (!response.ok) throw new Error(`Proxy HTTP ${response.status}`)
        const json = await response.json()
        if (json.status !== 'ok') throw new Error(json.message || 'Proxy error')
        // Convert rss2json format to our article format directly
        return json.items?.map(item => ({
          title: decodeEntities(item.title || '').trim(),
          link: item.link || item.guid || '',
          description: stripHtml(item.description || item.content || '').substring(0, 300),
          pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          sourceId: source.id,
          sourceName: source.name,
          category: source.category,
        })).filter(a => a.title && a.link) || []
      } catch (err) {
        clearTimeout(timeout)
        throw err
      }
    },
  ]

  let lastError = null

  // Try direct fetch first
  try {
    const xml = await methods[0]()
    const articles = parseRSSFeed(xml, source)
    if (articles.length > 0) return { articles, method: 'direct' }
  } catch (err) {
    lastError = err
  }

  // Try proxy fallback — returns articles directly, not XML
  try {
    const result = await methods[1]()
    if (Array.isArray(result) && result.length > 0) return { articles: result, method: 'proxy' }
  } catch (err) {
    lastError = err
  }

  throw lastError || new Error('No articles found')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded' })
  }

  try {
    // Try Supabase cache first
    const { data: cached } = await getCachedNews(5)
    if (cached && cached.length > 0) {
      log.info('Serving from Supabase cache', { count: cached.length })
      return res.status(200).json({
        articles: cached.map(a => ({
          title: a.title,
          link: a.link,
          description: a.description,
          pubDate: a.pub_date,
          sourceId: a.source_id,
          sourceName: a.source_name,
          category: a.category,
        })),
        source: 'supabase-cache',
      })
    }

    // Try memory cache
    if (Date.now() - memoryCache.cachedAt < CACHE_TTL_MS && memoryCache.articles.length > 0) {
      log.info('Serving from memory cache', { count: memoryCache.articles.length })
      return res.status(200).json({
        articles: memoryCache.articles,
        source: 'memory-cache',
        diagnostics: memoryCache.diagnostics,
      })
    }

    // Fetch all feeds in parallel
    log.info('Fetching fresh feeds', { sourceCount: UNC_FEED_SOURCES.length, sources: UNC_FEED_SOURCES.map(s => s.id) })

    const diagnostics = { succeeded: [], failed: [], totalSources: UNC_FEED_SOURCES.length }

    const feedPromises = UNC_FEED_SOURCES.map(async (source) => {
      try {
        const result = await fetchSingleFeed(source)
        diagnostics.succeeded.push({ id: source.id, name: source.name, count: result.articles.length, method: result.method })
        log.info('Feed OK', { source: source.id, count: result.articles.length, method: result.method })
        return result.articles
      } catch (err) {
        const errorMsg = err?.message || String(err)
        diagnostics.failed.push({ id: source.id, name: source.name, error: errorMsg })
        log.warn('Feed failed', { source: source.id, url: source.feedUrl, error: errorMsg })
        return []
      }
    })

    const results = await Promise.allSettled(feedPromises)
    const allArticles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
      .slice(0, 100)

    log.info('Feeds complete', {
      totalArticles: allArticles.length,
      succeeded: diagnostics.succeeded.length,
      failed: diagnostics.failed.length,
    })

    // Cache to Supabase (async, don't block response)
    if (allArticles.length > 0) {
      cacheNewsArticles(allArticles).catch(err => {
        log.warn('Failed to cache to Supabase', { error: err.message })
      })
    }

    // Update memory cache
    memoryCache = { articles: allArticles, cachedAt: Date.now(), diagnostics }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return res.status(200).json({ articles: allArticles, source: 'fresh', diagnostics })
  } catch (err) {
    log.error('News feed error', { error: err.message, stack: err.stack })
    return res.status(500).json({ error: 'Failed to fetch news feeds', detail: err.message })
  }
}
