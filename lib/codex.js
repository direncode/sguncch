import { supabase } from './supabase'
import crypto from 'crypto'

// ============================================
// UTILITY
// ============================================
export function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

// ============================================
// GOVERNANCE DOCUMENTS
// ============================================
export async function createDocument({ title, version, source_url, text_full, file_name, file_size }) {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const hash = hashText(text_full)

  // Check for duplicate
  const { data: existing } = await supabase
    .from('governance_documents')
    .select('id')
    .eq('hash', hash)
    .limit(1)

  if (existing && existing.length > 0) {
    return { data: null, error: 'A document with identical content already exists' }
  }

  const { data, error } = await supabase
    .from('governance_documents')
    .insert([{
      title,
      version: version || '1.0',
      source_url: source_url || null,
      text_full,
      file_name: file_name || null,
      file_size: file_size || null,
      hash,
      status: 'pending',
    }])
    .select()

  return { data: data?.[0], error }
}

export async function getDocuments(status = null) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  let query = supabase
    .from('governance_documents')
    .select('id, title, version, source_url, file_name, file_size, hash, status, approved_by, approved_at, rejected_reason, created_at')

  if (status) query = query.eq('status', status)

  const { data, error } = await query.order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function getDocumentById(id) {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('governance_documents')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

export async function searchDocuments(searchTerm) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('governance_documents')
    .select('id, title, version, source_url, approved_by, approved_at, created_at')
    .eq('status', 'approved')
    .ilike('title', `%${searchTerm}%`)
    .order('approved_at', { ascending: false })

  return { data: data || [], error }
}

export async function updateDocumentStatus(id, status, approvedBy = 'admin', reason = null) {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const updates = { status }
  if (status === 'approved') {
    updates.approved_by = approvedBy
    updates.approved_at = new Date().toISOString()
  }
  if (status === 'rejected') {
    updates.rejected_reason = reason
  }

  const { data, error } = await supabase
    .from('governance_documents')
    .update(updates)
    .eq('id', id)
    .select()

  return { data: data?.[0], error }
}

// ============================================
// DOCUMENT CHUNKS
// ============================================
export async function insertChunks(documentId, chunks) {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const rows = chunks.map(c => ({
    document_id: documentId,
    chunk_text: c.chunk_text,
    chunk_index: c.chunk_index,
    section_hint: c.section_hint || null,
    embedding: c.embedding || null,
  }))

  const { data, error } = await supabase
    .from('document_chunks')
    .insert(rows)
    .select('id, chunk_index')

  return { data, error }
}

export async function searchChunksByVector(embedding, limit = 5) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await supabase
    .rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: limit,
    })

  return { data: data || [], error }
}

export async function searchChunksByText(query, limit = 5) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await supabase
    .rpc('search_document_chunks_fts', {
      query_text: query,
      match_count: limit,
    })

  return { data: data || [], error }
}

// ============================================
// APPROVAL LOG
// ============================================
export async function logApprovalAction(documentId, action, performedBy = 'admin', reason = null) {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('approval_log')
    .insert([{
      document_id: documentId,
      action,
      performed_by: performedBy,
      reason: reason || null,
      performed_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error }
}

export async function getApprovalLog(documentId = null) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  let query = supabase.from('approval_log').select('*')
  if (documentId) query = query.eq('document_id', documentId)

  const { data, error } = await query.order('performed_at', { ascending: false })
  return { data: data || [], error }
}
