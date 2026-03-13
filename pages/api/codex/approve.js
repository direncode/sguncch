import { withAdminAuth } from '../../../lib/auth'
import { getDocumentById, updateDocumentStatus, insertChunks, logApprovalAction } from '../../../lib/codex'
import { chunkText, generateEmbedding, isEmbeddingAvailable } from '../../../lib/embeddings'
import { createLogger } from '../../../lib/logger'

const log = createLogger('API:approve')

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { document_id } = req.body

    if (!document_id) {
      return res.status(400).json({ error: 'document_id is required' })
    }

    // Fetch the document
    const { data: doc, error: fetchError } = await getDocumentById(document_id)
    if (fetchError || !doc) {
      return res.status(404).json({ error: 'Document not found' })
    }

    if (doc.status !== 'pending') {
      return res.status(400).json({ error: `Document is already ${doc.status}` })
    }

    // Update status to approved
    const { error: updateError } = await updateDocumentStatus(document_id, 'approved')
    if (updateError) {
      return res.status(500).json({ error: 'Failed to approve document' })
    }

    // Chunk the document text
    const chunks = chunkText(doc.text_full)

    // Generate embeddings for each chunk (if xAI available)
    const useEmbeddings = isEmbeddingAvailable()
    for (const chunk of chunks) {
      if (useEmbeddings) {
        const embedding = await generateEmbedding(chunk.chunk_text)
        chunk.embedding = embedding
      }
    }

    // Insert chunks
    const { error: chunkError } = await insertChunks(document_id, chunks)
    if (chunkError) {
      log.error('Chunk insert error', { error: String(chunkError) })
    }

    // Log approval
    await logApprovalAction(document_id, 'approved', 'admin')

    return res.status(200).json({
      message: 'Document approved and indexed',
      chunk_count: chunks.length,
      embeddings_generated: useEmbeddings,
    })
  } catch (err) {
    log.error('Approve error', { error: err.message })
    return res.status(500).json({ error: 'Failed to approve document' })
  }
}

export default withAdminAuth(handler)
