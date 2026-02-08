import { withAdminAuth } from '../../../lib/auth'
import { createDocument, logApprovalAction } from '../../../lib/codex'

function getRawBody(req, limit = 50 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error(`Request body too large (max ${Math.round(limit / 1024 / 1024)}MB)`))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let reqBody
    try {
      const rawBody = await getRawBody(req)
      reqBody = JSON.parse(rawBody.toString('utf8'))
    } catch (parseErr) {
      return res.status(400).json({ error: `Invalid request: ${parseErr.message}` })
    }

    const { title, text_content, source_url, version, file_name, file_size, file_base64 } = reqBody

    if (!title) {
      return res.status(400).json({ error: 'title is required' })
    }

    let textContent = text_content

    // If a base64-encoded PDF was sent, parse it server-side
    if (file_base64 && file_name && file_name.toLowerCase().endsWith('.pdf')) {
      const pdfParse = require('pdf-parse')
      const buffer = Buffer.from(file_base64, 'base64')
      const pdfData = await pdfParse(buffer)
      textContent = pdfData.text
    }

    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ error: 'No text content extracted — this PDF may be image-based or scanned.' })
    }

    const { data, error } = await createDocument({
      title,
      version,
      source_url,
      text_full: textContent,
      file_name,
      file_size,
    })

    if (error) {
      return res.status(400).json({ error })
    }

    // Log the upload action
    await logApprovalAction(data.id, 'uploaded', 'admin')

    return res.status(200).json({ document: data, message: 'Document uploaded for review' })
  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: `Failed to upload document: ${err.message || 'Unknown error'}` })
  }
}

export default withAdminAuth(handler)

export const config = {
  api: {
    bodyParser: false,
  },
}
