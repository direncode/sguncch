import { withAdminAuth } from '../../../lib/auth'
import { scrapeAll, scrapeTarget, SCRAPE_TARGETS, getScrapeSources } from '../../../lib/scraper'
import { createDocument, updateDocumentStatus, insertChunks, logApprovalAction } from '../../../lib/codex'
import { chunkText, generateEmbedding, isEmbeddingAvailable } from '../../../lib/embeddings'

async function handler(req, res) {
  // GET — list available scrape sources
  if (req.method === 'GET') {
    return res.status(200).json({
      sources: getScrapeSources(),
      totalTargets: SCRAPE_TARGETS.length,
    })
  }

  // POST — run scraper and optionally ingest results into The Scroll
  if (req.method === 'POST') {
    const { targetIds, ingest = false } = req.body || {}

    // Select targets to scrape
    let targets = SCRAPE_TARGETS
    if (targetIds && Array.isArray(targetIds) && targetIds.length > 0) {
      targets = SCRAPE_TARGETS.filter(t => targetIds.includes(t.id))
      if (targets.length === 0) {
        return res.status(400).json({ error: 'No valid target IDs provided' })
      }
    }

    // Run scraper
    const results = await scrapeAll(targets)
    const succeeded = results.filter(r => !r.error)
    const failed = results.filter(r => r.error)

    // Optionally ingest scraped content into The Scroll
    let ingested = 0
    if (ingest && succeeded.length > 0) {
      const useEmbeddings = isEmbeddingAvailable()

      for (const result of succeeded) {
        if (!result.text || result.text.length < 100) continue

        try {
          const { data: doc, error: createError } = await createDocument({
            title: `[Scraped] ${result.title || result.label}`,
            version: new Date().toISOString().split('T')[0],
            source_url: result.url,
            text_full: result.text,
            file_name: `scrape-${result.id}.txt`,
            file_size: result.textLength,
          })

          if (createError) continue

          await updateDocumentStatus(doc.id, 'approved')

          const chunks = chunkText(result.text)
          if (useEmbeddings) {
            for (const chunk of chunks) {
              chunk.embedding = await generateEmbedding(chunk.chunk_text)
            }
          }
          await insertChunks(doc.id, chunks)
          await logApprovalAction(doc.id, 'uploaded', 'admin (scraper)')
          await logApprovalAction(doc.id, 'approved', 'admin (auto-scrape)')
          ingested++
        } catch {
          // non-blocking — continue with other results
        }
      }
    }

    return res.status(200).json({
      message: `Scraped ${succeeded.length}/${results.length} targets${ingest ? `, ingested ${ingested}` : ''}`,
      results: results.map(r => ({
        id: r.id,
        url: r.url,
        source: r.source,
        label: r.label,
        title: r.title,
        textLength: r.textLength || 0,
        error: r.error || null,
        scrapedAt: r.scrapedAt,
      })),
      succeeded: succeeded.length,
      failed: failed.length,
      ingested: ingest ? ingested : undefined,
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
