/**
 * Live Crawler for UNC Policy Portal & External Document Sources
 *
 * POST /api/codex/crawl
 * Body: { url, mode?, depth?, maxPages? }
 *
 * Modes:
 *   "discover"  — Crawl a category/listing page to find article links (default)
 *   "ingest"    — Fetch a single article page and ingest its content
 *   "full"      — Discover + ingest all found articles in one pass
 *
 * Supports:
 *   - UNC TeamDynamix KB (policies.unc.edu/TDClient/...)
 *   - UNC policy PDF landing pages (policies.unc.edu/files/...)
 *   - Town of Chapel Hill (townofchapelhill.org)
 *   - Generic pages with article-like content
 */

import { verifyAdmin } from '../../../lib/auth'
import { createDocument, updateDocumentStatus, getDocuments } from '../../../lib/codex'

// Generous timeout for slow institutional pages
export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = verifyAdmin(req)
  if (!auth.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { url, mode = 'discover', depth = 1, maxPages = 50 } = req.body

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' })
  }

  // Validate URL is from a trusted domain
  const allowed = isAllowedDomain(url)
  if (!allowed) {
    return res.status(400).json({ error: 'Domain not in allowlist. Supported: policies.unc.edu, studentgovernment.unc.edu, dos.unc.edu, eoc.unc.edu, townofchapelhill.org' })
  }

  try {
    if (mode === 'ingest') {
      const result = await ingestSinglePage(url)
      return res.status(200).json(result)
    }

    if (mode === 'discover') {
      const links = await discoverLinks(url, depth, maxPages)
      return res.status(200).json({ success: true, url, linksFound: links.length, links })
    }

    if (mode === 'full') {
      const links = await discoverLinks(url, depth, maxPages)
      const results = await ingestMultiple(links)
      return res.status(200).json({
        success: true,
        url,
        discovered: links.length,
        ...results,
      })
    }

    return res.status(400).json({ error: 'Invalid mode. Use: discover, ingest, or full' })
  } catch (err) {
    console.error('Crawl error:', err)
    return res.status(500).json({ error: 'Crawl failed: ' + (err.message || 'unknown error') })
  }
}

// ============================================
// DOMAIN ALLOWLIST
// ============================================
const ALLOWED_DOMAINS = [
  'policies.unc.edu',
  'studentgovernment.unc.edu',
  'dos.unc.edu',
  'eoc.unc.edu',
  'campushealth.unc.edu',
  'housing.unc.edu',
  'carolinadining.unc.edu',
  'safe.unc.edu',
  'caps.unc.edu',
  'studentwellness.unc.edu',
  'townofchapelhill.org',
  'www.townofchapelhill.org',
]

function isAllowedDomain(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))
  } catch {
    return false
  }
}

// ============================================
// FETCH WITH BROWSER-LIKE HEADERS
// ============================================
async function fetchPage(url, timeout = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    clearTimeout(timer)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`)
    }

    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/pdf')) {
      // PDF — can't extract text server-side without libs, return metadata
      return { type: 'pdf', url, text: null }
    }

    const html = await res.text()
    return { type: 'html', url, html }
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

// ============================================
// LINK DISCOVERY
// ============================================
async function discoverLinks(url, depth, maxPages) {
  const visited = new Set()
  const allLinks = []

  async function crawlPage(pageUrl, currentDepth) {
    if (visited.has(pageUrl) || allLinks.length >= maxPages || currentDepth > depth) return
    visited.add(pageUrl)

    let page
    try {
      page = await fetchPage(pageUrl)
    } catch (err) {
      console.error(`Failed to fetch ${pageUrl}:`, err.message)
      return
    }

    if (page.type !== 'html') return

    const links = extractLinks(page.html, pageUrl)

    for (const link of links) {
      if (allLinks.length >= maxPages) break

      if (isArticlePage(link.url)) {
        if (!allLinks.some(l => l.url === link.url)) {
          allLinks.push(link)
        }
      } else if (isCategoryPage(link.url) && currentDepth < depth) {
        // Recurse into subcategories
        await crawlPage(link.url, currentDepth + 1)
      }
    }
  }

  await crawlPage(url, 0)
  return allLinks
}

function extractLinks(html, baseUrl) {
  const links = []
  const base = new URL(baseUrl)

  // Match all <a> tags with href
  const anchorRegex = /<a\s[^>]*?href="([^"]*)"[^>]*?>([\s\S]*?)<\/a>/gi
  let match

  while ((match = anchorRegex.exec(html)) !== null) {
    let href = match[1]
    const rawLabel = match[2]
    const label = rawLabel.replace(/<[^>]*>/g, '').trim()

    if (!href || !label || label.length < 3) continue
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) continue

    // Resolve relative URLs
    try {
      if (href.startsWith('/')) {
        href = `${base.protocol}//${base.host}${href}`
      } else if (!href.startsWith('http')) {
        href = new URL(href, baseUrl).href
      }
    } catch {
      continue
    }

    // Only include links from allowed domains
    if (!isAllowedDomain(href)) continue

    links.push({ url: href, title: label })
  }

  return links
}

function isArticlePage(url) {
  // TeamDynamix article pattern
  if (/ArticleDet\?ID=\d+/i.test(url)) return true
  // Direct PDF links
  if (/\.pdf$/i.test(url)) return true
  // UNC policy files
  if (/policies\.unc\.edu\/files\//i.test(url)) return true
  // DOS pages
  if (/dos\.unc\.edu\/.*\//i.test(url) && !/dos\.unc\.edu\/?$/.test(url)) return true
  // Town of Chapel Hill ordinance/policy pages
  if (/townofchapelhill\.org\/.*(?:ordinance|policy|code|regulation)/i.test(url)) return true
  return false
}

function isCategoryPage(url) {
  // TeamDynamix category listings
  if (/Portal\/KB\/?\?CategoryID=\d+/i.test(url)) return true
  // Generic listing pages
  if (/\/KB\/?$/i.test(url)) return true
  return false
}

// ============================================
// CONTENT EXTRACTION
// ============================================
function extractArticleContent(html, url) {
  // Try to extract the main policy content from various page structures

  let title = ''
  let body = ''
  let category = ''
  let version = ''

  // 1. Extract <title>
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch) {
    title = titleMatch[1].replace(/\s*[-|].*$/, '').trim()
  }

  // 2. Try TeamDynamix KB article structure
  // Main content is typically in .kb-article-content or #divArticleBody or .article-body
  const contentPatterns = [
    // TeamDynamix patterns
    /id="divArticleBody"[^>]*>([\s\S]*?)<\/div>\s*(?:<div\s+(?:id|class)=)/i,
    /class="kb-article-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div\s+(?:id|class)=)/i,
    /class="article-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div\s+(?:id|class)=)/i,
    // Broader TeamDynamix body capture
    /id="divArticleBody"[^>]*>([\s\S]*?)(?:<\/div>\s*<\/div>\s*<\/div>)/i,
    /class="kb-article-content[^"]*"[^>]*>([\s\S]*?)(?:<\/div>\s*<\/div>\s*<\/div>)/i,
    // Generic main content
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /class="content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /id="content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /role="main"[^>]*>([\s\S]*?)<\/(?:div|main)>/i,
  ]

  for (const pattern of contentPatterns) {
    const m = html.match(pattern)
    if (m && m[1] && m[1].length > 200) {
      body = m[1]
      break
    }
  }

  // 3. Fallback: grab largest text block from <body>
  if (!body) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) {
      body = bodyMatch[1]
    }
  }

  // 4. Try to get better title from h1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1Match) {
    const h1Text = h1Match[1].replace(/<[^>]*>/g, '').trim()
    if (h1Text.length > 3 && h1Text.length < 300) {
      title = h1Text
    }
  }

  // 5. Extract category from breadcrumbs or metadata
  const breadcrumbMatch = html.match(/class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/(?:nav|ol|ul|div)>/i)
  if (breadcrumbMatch) {
    const crumbs = breadcrumbMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    category = crumbs
  }

  // 6. Extract version/date
  const datePatterns = [
    /(?:effective|updated|revised|approved|date)[:\s]*(\w+\s+\d{1,2},?\s+\d{4})/i,
    /(?:effective|updated|revised|approved|date)[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})/i,
    /(\w+\s+\d{4})\s*$/m,
  ]
  for (const dp of datePatterns) {
    const dm = body.match(dp) || html.match(dp)
    if (dm) {
      version = dm[1].trim()
      break
    }
  }

  // 7. Clean HTML to text
  const cleanText = htmlToText(body)

  return {
    title: title || 'Untitled Document',
    text: cleanText,
    category,
    version,
    sourceUrl: url,
  }
}

function htmlToText(html) {
  if (!html) return ''

  let text = html

  // Replace block elements with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<\/p>/gi, '\n\n')
  text = text.replace(/<\/div>/gi, '\n')
  text = text.replace(/<\/li>/gi, '\n')
  text = text.replace(/<\/tr>/gi, '\n')
  text = text.replace(/<\/h[1-6]>/gi, '\n\n')
  text = text.replace(/<h[1-6][^>]*>/gi, '\n\n')
  text = text.replace(/<li[^>]*>/gi, '  - ')
  text = text.replace(/<td[^>]*>/gi, '\t')
  text = text.replace(/<th[^>]*>/gi, '\t')

  // Remove script, style, nav, header, footer
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, '')
  text = text.replace(/<header[\s\S]*?<\/header>/gi, '')
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, '')

  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n[ \t]+/g, '\n')
  text = text.replace(/\n{3,}/g, '\n\n')
  text = text.trim()

  return text
}

// ============================================
// INGESTION
// ============================================
async function ingestSinglePage(url) {
  const page = await fetchPage(url)

  if (page.type === 'pdf') {
    return {
      success: true,
      status: 'skipped',
      reason: 'PDF files cannot be extracted server-side — upload the .txt version via Admin Scroll',
      url,
    }
  }

  const content = extractArticleContent(page.html, url)

  if (!content.text || content.text.length < 100) {
    return {
      success: false,
      status: 'empty',
      reason: 'Could not extract enough text content from this page',
      url,
      titleFound: content.title,
      textLength: content.text?.length || 0,
    }
  }

  // Check for duplicates
  const { data: existing } = await getDocuments('approved', { includeText: false })
  const existingTitles = new Set((existing || []).map(d => d.title.toLowerCase()))
  if (existingTitles.has(content.title.toLowerCase())) {
    return { success: true, status: 'skipped', reason: 'Document already exists', title: content.title, url }
  }

  // Create and auto-approve
  const { data: doc, error } = await createDocument({
    title: content.title,
    version: content.version || null,
    source_url: url,
    text_full: content.text,
    file_name: `crawled-${slugify(content.title)}.txt`,
    file_size: content.text.length,
  })

  if (error) {
    return { success: false, status: 'error', error, title: content.title, url }
  }

  if (doc) {
    await updateDocumentStatus(doc.id, 'approved', 'crawler')
  }

  return {
    success: true,
    status: 'ingested',
    title: content.title,
    id: doc?.id,
    textLength: content.text.length,
    version: content.version,
    url,
  }
}

async function ingestMultiple(links) {
  const results = { ingested: 0, skipped: 0, errors: 0, details: [] }

  // Get existing to avoid duplicates
  const { data: existing } = await getDocuments('approved', { includeText: false })
  const existingTitles = new Set((existing || []).map(d => d.title.toLowerCase()))

  for (const link of links) {
    try {
      const page = await fetchPage(link.url)

      if (page.type === 'pdf') {
        results.skipped++
        results.details.push({ title: link.title, url: link.url, status: 'skipped', reason: 'PDF' })
        continue
      }

      const content = extractArticleContent(page.html, link.url)

      if (!content.text || content.text.length < 100) {
        results.skipped++
        results.details.push({ title: link.title, url: link.url, status: 'skipped', reason: 'too short' })
        continue
      }

      if (existingTitles.has(content.title.toLowerCase())) {
        results.skipped++
        results.details.push({ title: content.title, url: link.url, status: 'skipped', reason: 'duplicate' })
        continue
      }

      const { data: doc, error } = await createDocument({
        title: content.title,
        version: content.version || null,
        source_url: link.url,
        text_full: content.text,
        file_name: `crawled-${slugify(content.title)}.txt`,
        file_size: content.text.length,
      })

      if (error) {
        results.errors++
        results.details.push({ title: content.title, url: link.url, status: 'error', error })
        continue
      }

      if (doc) {
        await updateDocumentStatus(doc.id, 'approved', 'crawler')
        existingTitles.add(content.title.toLowerCase())
      }

      results.ingested++
      results.details.push({
        title: content.title,
        url: link.url,
        status: 'ingested',
        id: doc?.id,
        textLength: content.text.length,
      })

      // Small delay to be respectful to the server
      await sleep(500)
    } catch (err) {
      results.errors++
      results.details.push({ title: link.title, url: link.url, status: 'error', error: err.message })
    }
  }

  return results
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
