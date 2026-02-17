import { withAdminAuth } from '../../../lib/auth'
import fs from 'fs'
import path from 'path'

function resolveDataDir() {
  const primary = path.join(process.cwd(), '.data')
  if (fs.existsSync(primary)) return primary
  const fallback = path.join('/tmp', '.data')
  if (fs.existsSync(fallback)) return fallback
  return null
}

function safeRead(filePath) {
  try {
    if (!fs.existsSync(filePath)) return []
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return []
  }
}

async function handler(req, res) {
  if (req.method === 'GET') {
    // Return current runtime data as JSON (for preview/download)
    const dataDir = resolveDataDir()
    if (!dataDir) return res.status(200).json({ documents: [], chunks: [], approval_log: [] })

    const seed = {
      documents: safeRead(path.join(dataDir, 'documents.json')),
      chunks: safeRead(path.join(dataDir, 'chunks.json')),
      approval_log: safeRead(path.join(dataDir, 'approval_log.json')),
    }
    return res.status(200).json(seed)
  }

  if (req.method === 'POST') {
    // Write current runtime data to the committed seed file
    const dataDir = resolveDataDir()
    if (!dataDir) {
      return res.status(404).json({ error: 'No runtime data found to export' })
    }

    const seed = {
      documents: safeRead(path.join(dataDir, 'documents.json')),
      chunks: safeRead(path.join(dataDir, 'chunks.json')),
      approval_log: safeRead(path.join(dataDir, 'approval_log.json')),
    }

    const seedFile = path.join(process.cwd(), 'data', 'codex-seed.json')
    try {
      fs.mkdirSync(path.dirname(seedFile), { recursive: true })
      fs.writeFileSync(seedFile, JSON.stringify(seed, null, 2))
      return res.status(200).json({
        message: 'Seed file updated',
        documents: seed.documents.length,
        chunks: seed.chunks.length,
      })
    } catch (err) {
      return res.status(500).json({ error: `Failed to write seed file: ${err.message}` })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
