/**
 * UNC Web Scraper
 *
 * Fetches and extracts text content from UNC-related web sources.
 * Used to feed Grok with current UNC news, policies, and governance info.
 */

import { UNC_NEWS_SOURCES } from './newsSources'

// Scraper targets — pages to pull content from
export const SCRAPE_TARGETS = [
  // UNC Official
  { id: 'unc-news-feed', url: 'https://news.unc.edu/', source: 'unc-news', label: 'UNC News Homepage' },
  { id: 'unc-sg-home', url: 'https://studentgovernment.unc.edu/', source: 'unc-sg', label: 'Student Government Homepage' },
  { id: 'unc-policies-home', url: 'https://policies.unc.edu/', source: 'unc-policies', label: 'UNC Policies Index' },
  // Student News
  { id: 'dth-home', url: 'https://www.dailytarheel.com/', source: 'dth', label: 'Daily Tar Heel Homepage' },
  { id: 'dth-university', url: 'https://www.dailytarheel.com/section/university', source: 'dth', label: 'DTH University Section' },
  { id: 'dth-city-state', url: 'https://www.dailytarheel.com/section/city-state', source: 'dth', label: 'DTH City & State' },
  // Local News
  { id: 'chapelboro-unc', url: 'https://chapelboro.com/tag/unc-chapel-hill', source: 'chapelboro', label: 'Chapelboro UNC Coverage' },
  // UNC Specific Pages
  { id: 'unc-chancellor', url: 'https://chancellor.unc.edu/', source: 'unc-news', label: 'Chancellor\'s Office' },
  { id: 'unc-trustees', url: 'https://bot.unc.edu/', source: 'unc-news', label: 'Board of Trustees' },
  { id: 'unc-budget', url: 'https://budget.unc.edu/', source: 'unc-news', label: 'UNC Budget Office' },
  { id: 'unc-dos', url: 'https://dos.unc.edu/', source: 'unc-news', label: 'Dean of Students' },
  { id: 'unc-eoc', url: 'https://eoc.unc.edu/', source: 'unc-news', label: 'Equal Opportunity & Compliance' },
]

const FETCH_TIMEOUT = 15000 // 15s timeout per request
const MAX_CONTENT_LENGTH = 50000 // 50KB max text per page

/**
 * Strip HTML to plain text
 */
function htmlToText(html) {
  return html
    // Remove script/style blocks
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove nav/header/footer blocks
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    // Convert headings to text with markers
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n## $1\n')
    // Convert paragraphs to text
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Convert list items
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Convert links — keep text and URL
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extract article-like content from HTML
 * Tries to find main content area, falls back to body
 */
function extractMainContent(html) {
  // Try to find main/article content
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i)

  const contentHtml = mainMatch ? mainMatch[1] : html
  return htmlToText(contentHtml).slice(0, MAX_CONTENT_LENGTH)
}

/**
 * Extract page title from HTML
 */
function extractTitle(html) {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i)
  return match ? match[1].replace(/\s*[|–-]\s*.*$/, '').trim() : ''
}

/**
 * Fetch a single URL with timeout
 */
async function fetchPage(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ProjectBold-UNC-Scraper/1.0 (Student Government Transparency Platform)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    return { ok: true, html }
  } catch (err) {
    return { ok: false, error: err.message || 'Fetch failed' }
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Scrape a single target URL
 * Returns { id, url, source, title, text, scrapedAt, error? }
 */
export async function scrapeTarget(target) {
  const result = await fetchPage(target.url)

  if (!result.ok) {
    return {
      id: target.id,
      url: target.url,
      source: target.source,
      label: target.label,
      error: result.error,
      scrapedAt: new Date().toISOString(),
    }
  }

  const title = extractTitle(result.html) || target.label
  const text = extractMainContent(result.html)

  return {
    id: target.id,
    url: target.url,
    source: target.source,
    label: target.label,
    title,
    text,
    textLength: text.length,
    scrapedAt: new Date().toISOString(),
  }
}

/**
 * Scrape all targets
 * Returns array of results (concurrently, max 3 at a time)
 */
export async function scrapeAll(targets = SCRAPE_TARGETS) {
  const results = []
  const batchSize = 3

  for (let i = 0; i < targets.length; i += batchSize) {
    const batch = targets.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(t => scrapeTarget(t)))
    results.push(...batchResults)
  }

  return results
}

/**
 * Get a summary of available scrape sources
 */
export function getScrapeSources() {
  const sources = {}
  for (const target of SCRAPE_TARGETS) {
    if (!sources[target.source]) {
      const newsSource = UNC_NEWS_SOURCES.find(s => s.id === target.source)
      sources[target.source] = {
        id: target.source,
        name: newsSource?.name || target.source,
        domain: newsSource?.domain || new URL(target.url).hostname,
        targets: [],
      }
    }
    sources[target.source].targets.push({ id: target.id, url: target.url, label: target.label })
  }
  return Object.values(sources)
}
