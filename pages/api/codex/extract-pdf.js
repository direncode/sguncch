import { withAdminAuth } from '../../../lib/auth'
import { createLogger } from '../../../lib/logger'

const log = createLogger('API:extract-pdf')

// Increase body size limit for base64 PDF uploads
export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } },
}

async function handler(req, res) {
  const apiKey = process.env.XAI_API_KEY
  const isConfigured = apiKey && apiKey !== 'your-xai-api-key-here' && apiKey !== 'xai-placeholder-set-in-vercel'

  // GET: check if xAI is configured
  if (req.method === 'GET') {
    return res.status(200).json({ available: isConfigured })
  }

  // POST: extract PDF content via Grok
  if (req.method === 'POST') {
    if (!isConfigured) {
      return res.status(500).json({ error: 'XAI_API_KEY not configured on server' })
    }

    const { url, fileData, fileName, query } = req.body
    if (!url && !fileData) {
      return res.status(400).json({ error: 'Missing document URL or fileData' })
    }

    try {
      // 1. Get the PDF buffer
      let pdfBuffer, filename
      if (fileData) {
        // Base64-encoded file from client upload
        pdfBuffer = Buffer.from(fileData, 'base64')
        filename = fileName || 'document.pdf'
      } else {
        // Fetch from URL
        const pdfRes = await fetch(url)
        if (!pdfRes.ok) {
          return res.status(502).json({ error: `Failed to fetch PDF: ${pdfRes.status}` })
        }
        pdfBuffer = Buffer.from(await pdfRes.arrayBuffer())
        filename = url.split('/').pop() || 'document.pdf'
      }

      // 2. Upload to xAI Files API
      const formData = new FormData()
      formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), filename)
      formData.append('purpose', 'assistants')

      const uploadRes = await fetch('https://api.x.ai/v1/files', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData,
      })

      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => '')
        return res.status(502).json({ error: `File upload failed (${uploadRes.status}): ${errText.slice(0, 300)}` })
      }

      const { id: fileId } = await uploadRes.json()

      // 3. Chat with the uploaded file
      const prompt = query
        ? `Read this PDF document and answer the following question based on its contents:\n\n"${query}"\n\nProvide a clear, accurate answer citing specific sections when possible.`
        : 'Extract ALL text content from this PDF document. Return ONLY the raw text — no commentary, no formatting instructions, no summaries. Just the verbatim document text.'

      const chatRes = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-4',
          messages: [{
            role: 'user',
            content: [
              { type: 'file', file: { file_id: fileId } },
              { type: 'text', text: prompt },
            ],
          }],
          temperature: 0,
          max_tokens: 16000,
        }),
      })

      // 4. Clean up uploaded file (fire and forget)
      fetch(`https://api.x.ai/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${apiKey}` },
      }).catch(() => {})

      if (!chatRes.ok) {
        const errText = await chatRes.text().catch(() => '')
        return res.status(502).json({ error: `Grok API error (${chatRes.status}): ${errText.slice(0, 300)}` })
      }

      const data = await chatRes.json()
      const content = data.choices?.[0]?.message?.content?.trim()

      if (!content) {
        return res.status(502).json({ error: 'Grok returned no text content' })
      }

      return res.status(200).json({ content })
    } catch (err) {
      log.error('PDF extraction error', { error: err.message })
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withAdminAuth(handler)
