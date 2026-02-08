import { withAdminAuth } from '../../../lib/auth'
import { createDocument, updateDocumentStatus, insertChunks, logApprovalAction } from '../../../lib/codex'
import { chunkText, generateEmbedding, isEmbeddingAvailable } from '../../../lib/embeddings'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { files } = req.body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'files array is required' })
    }

    const results = []
    const useEmbeddings = isEmbeddingAvailable()

    for (const file of files) {
      const { title, text_content, version, file_name, file_size, file_base64 } = file

      if (!title) {
        results.push({ file_name: file_name || 'unknown', status: 'error', error: 'Title is required' })
        continue
      }

      let textContent = text_content

      // Parse PDF if base64 provided
      if (file_base64 && file_name && file_name.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfParse = require('pdf-parse')
          const buffer = Buffer.from(file_base64, 'base64')
          const pdfData = await pdfParse(buffer)
          textContent = pdfData.text
        } catch (err) {
          results.push({ file_name, status: 'error', error: 'Failed to parse PDF' })
          continue
        }
      }

      if (!textContent || !textContent.trim()) {
        results.push({ file_name: file_name || title, status: 'error', error: 'No text content extracted' })
        continue
      }

      // Create document
      const { data: doc, error: createError } = await createDocument({
        title,
        version: version || '1.0',
        source_url: null,
        text_full: textContent,
        file_name,
        file_size,
      })

      if (createError) {
        results.push({ file_name: file_name || title, status: 'error', error: createError })
        continue
      }

      // Auto-approve
      const { error: approveError } = await updateDocumentStatus(doc.id, 'approved')
      if (approveError) {
        results.push({ file_name: file_name || title, status: 'error', error: 'Upload succeeded but auto-approve failed' })
        continue
      }

      // Chunk and embed
      const chunks = chunkText(textContent)
      for (const chunk of chunks) {
        if (useEmbeddings) {
          const embedding = await generateEmbedding(chunk.chunk_text)
          chunk.embedding = embedding
        }
      }

      // Insert chunks
      await insertChunks(doc.id, chunks)

      // Log
      await logApprovalAction(doc.id, 'uploaded', 'admin')
      await logApprovalAction(doc.id, 'approved', 'admin (auto)')

      results.push({
        file_name: file_name || title,
        status: 'approved',
        document_id: doc.id,
        chunk_count: chunks.length,
        embeddings: useEmbeddings,
      })
    }

    const succeeded = results.filter(r => r.status === 'approved').length
    const failed = results.filter(r => r.status === 'error').length

    return res.status(200).json({
      message: `${succeeded} file${succeeded !== 1 ? 's' : ''} uploaded and indexed${failed > 0 ? `, ${failed} failed` : ''}`,
      results,
      total: files.length,
      succeeded,
      failed,
    })
  } catch (err) {
    console.error('Batch upload error:', err)
    return res.status(500).json({ error: 'Batch upload failed' })
  }
}

export default withAdminAuth(handler)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
}
