#!/usr/bin/env node
/**
 * Bulk ingest .txt files into the Project Bold knowledge base.
 *
 * Usage:
 *   node scripts/bulk-ingest.js <folder-or-file> [--url http://localhost:3000]
 *
 * Examples:
 *   node scripts/bulk-ingest.js ./docs/                    # all .txt/.md/.csv in folder
 *   node scripts/bulk-ingest.js ./policies/ferpa.txt       # single file
 *   node scripts/bulk-ingest.js ./docs/ --url https://your-app.vercel.app
 *
 * Accepts: .txt, .md, .csv files
 * Files are sent in batches of 5 for speed.
 */

const fs = require('fs')
const path = require('path')

const BATCH_SIZE = 5
const ACCEPTED = ['.txt', '.md', '.csv']

async function main() {
  const args = process.argv.slice(2)
  const target = args.find(a => !a.startsWith('--'))
  const urlFlag = args.indexOf('--url')
  const baseUrl = urlFlag !== -1 ? args[urlFlag + 1] : 'http://localhost:3000'

  if (!target) {
    console.log('Usage: node scripts/bulk-ingest.js <folder-or-file> [--url http://localhost:3000]')
    process.exit(1)
  }

  // Resolve admin key (same logic as lib/data.js)
  const adminKey = process.env.ADMIN_KEY || process.env.NEXT_PUBLIC_ADMIN_KEY || 'dev-only-change-in-production'

  // Collect files
  const resolved = path.resolve(target)
  let files = []

  const stat = fs.statSync(resolved)
  if (stat.isDirectory()) {
    const entries = fs.readdirSync(resolved)
    files = entries
      .filter(f => ACCEPTED.includes(path.extname(f).toLowerCase()))
      .map(f => path.join(resolved, f))
  } else if (stat.isFile()) {
    files = [resolved]
  }

  if (files.length === 0) {
    console.log('No .txt, .md, or .csv files found.')
    process.exit(0)
  }

  console.log(`Found ${files.length} file(s) to ingest → ${baseUrl}`)
  console.log()

  let succeeded = 0
  let failed = 0

  // Process in batches
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    const payload = batch.map(filepath => {
      const content = fs.readFileSync(filepath, 'utf8')
      const filename = path.basename(filepath)
      const title = filename.replace(/\.[^.]+$/, '')
      return {
        title,
        text_content: content,
        version: '1.0',
        file_name: filename,
        file_size: Buffer.byteLength(content),
      }
    })

    try {
      const res = await fetch(`${baseUrl}/api/codex/batch-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ files: payload }),
      })

      const data = await res.json()

      for (const result of (data.results || [])) {
        if (result.status === 'approved') {
          succeeded++
          console.log(`  ✓ ${result.file_name} — ${result.chunk_count} chunks`)
        } else {
          failed++
          console.log(`  ✗ ${result.file_name} — ${result.error}`)
        }
      }
    } catch (err) {
      failed += batch.length
      console.log(`  ✗ Batch failed: ${err.message}`)
    }
  }

  console.log()
  console.log(`Done: ${succeeded} ingested, ${failed} failed, ${files.length} total`)
}

main().catch(err => { console.error(err); process.exit(1) })
