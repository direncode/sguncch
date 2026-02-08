import { supabase } from './supabase'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// ============================================
// FILE-BASED FALLBACK STORAGE
// ============================================
const DATA_DIR = path.join(process.cwd(), '.data')
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json')
const CHUNKS_FILE = path.join(DATA_DIR, 'chunks.json')
const APPROVAL_LOG_FILE = path.join(DATA_DIR, 'approval_log.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readJsonFile(filePath) {
  ensureDataDir()
  if (!fs.existsSync(filePath)) return []
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return []
  }
}

function writeJsonFile(filePath, data) {
  ensureDataDir()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function generateId() {
  return `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
}

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
  const hash = hashText(text_full)

  if (supabase) {
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

  // File-based fallback
  const documents = readJsonFile(DOCUMENTS_FILE)

  if (documents.some(d => d.hash === hash)) {
    return { data: null, error: 'A document with identical content already exists' }
  }

  const doc = {
    id: generateId(),
    title,
    version: version || '1.0',
    source_url: source_url || null,
    text_full,
    file_name: file_name || null,
    file_size: file_size || null,
    hash,
    status: 'pending',
    approved_by: null,
    approved_at: null,
    rejected_reason: null,
    created_at: new Date().toISOString(),
  }

  documents.push(doc)
  writeJsonFile(DOCUMENTS_FILE, documents)
  return { data: doc, error: null }
}

export async function getDocuments(status = null) {
  if (supabase) {
    let query = supabase
      .from('governance_documents')
      .select('id, title, version, source_url, file_name, file_size, hash, status, approved_by, approved_at, rejected_reason, created_at')

    if (status) query = query.eq('status', status)

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data: data || [], error }
  }

  // File-based fallback
  let documents = readJsonFile(DOCUMENTS_FILE)
  if (status) documents = documents.filter(d => d.status === status)
  // Return without text_full to keep response small
  const result = documents
    .map(({ text_full, ...rest }) => rest)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: result, error: null }
}

export async function getDocumentById(id) {
  if (supabase) {
    const { data, error } = await supabase
      .from('governance_documents')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  }

  // File-based fallback
  const documents = readJsonFile(DOCUMENTS_FILE)
  const doc = documents.find(d => d.id === id)
  return { data: doc || null, error: doc ? null : 'Document not found' }
}

export async function searchDocuments(searchTerm) {
  if (supabase) {
    const { data, error } = await supabase
      .from('governance_documents')
      .select('id, title, version, source_url, approved_by, approved_at, created_at')
      .eq('status', 'approved')
      .ilike('title', `%${searchTerm}%`)
      .order('approved_at', { ascending: false })

    return { data: data || [], error }
  }

  // File-based fallback
  const documents = readJsonFile(DOCUMENTS_FILE)
  const term = searchTerm.toLowerCase()
  const result = documents
    .filter(d => d.status === 'approved' && d.title.toLowerCase().includes(term))
    .map(({ text_full, ...rest }) => rest)
    .sort((a, b) => new Date(b.approved_at || b.created_at) - new Date(a.approved_at || a.created_at))
  return { data: result, error: null }
}

export async function updateDocumentStatus(id, status, approvedBy = 'admin', reason = null) {
  const updates = { status }
  if (status === 'approved') {
    updates.approved_by = approvedBy
    updates.approved_at = new Date().toISOString()
  }
  if (status === 'rejected') {
    updates.rejected_reason = reason
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('governance_documents')
      .update(updates)
      .eq('id', id)
      .select()

    return { data: data?.[0], error }
  }

  // File-based fallback
  const documents = readJsonFile(DOCUMENTS_FILE)
  const idx = documents.findIndex(d => d.id === id)
  if (idx === -1) return { data: null, error: 'Document not found' }

  Object.assign(documents[idx], updates)
  writeJsonFile(DOCUMENTS_FILE, documents)
  return { data: documents[idx], error: null }
}

// ============================================
// DOCUMENT CHUNKS
// ============================================
export async function insertChunks(documentId, chunks) {
  const rows = chunks.map(c => ({
    id: generateId(),
    document_id: documentId,
    chunk_text: c.chunk_text,
    chunk_index: c.chunk_index,
    section_hint: c.section_hint || null,
    embedding: c.embedding || null,
  }))

  if (supabase) {
    const { data, error } = await supabase
      .from('document_chunks')
      .insert(rows)
      .select('id, chunk_index')

    return { data, error }
  }

  // File-based fallback
  const allChunks = readJsonFile(CHUNKS_FILE)
  allChunks.push(...rows)
  writeJsonFile(CHUNKS_FILE, allChunks)
  return { data: rows.map(r => ({ id: r.id, chunk_index: r.chunk_index })), error: null }
}

export async function searchChunksByVector(embedding, limit = 5) {
  if (!supabase) return { data: [], error: null }

  const { data, error } = await supabase
    .rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: limit,
    })

  return { data: data || [], error }
}

export async function searchChunksByText(query, limit = 5) {
  if (supabase) {
    const { data, error } = await supabase
      .rpc('search_document_chunks_fts', {
        query_text: query,
        match_count: limit,
      })

    return { data: data || [], error }
  }

  // File-based fallback: simple text search
  const allChunks = readJsonFile(CHUNKS_FILE)
  const terms = query.toLowerCase().split(/\s+/)
  const scored = allChunks
    .map(chunk => {
      const text = chunk.chunk_text.toLowerCase()
      const score = terms.reduce((s, t) => s + (text.includes(t) ? 1 : 0), 0)
      return { ...chunk, score }
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
  return { data: scored, error: null }
}

// ============================================
// APPROVAL LOG
// ============================================
export async function logApprovalAction(documentId, action, performedBy = 'admin', reason = null) {
  const entry = {
    id: generateId(),
    document_id: documentId,
    action,
    performed_by: performedBy,
    reason: reason || null,
    performed_at: new Date().toISOString(),
  }

  if (supabase) {
    const { data, error } = await supabase
      .from('approval_log')
      .insert([entry])
      .select()

    return { data: data?.[0], error }
  }

  // File-based fallback
  const log = readJsonFile(APPROVAL_LOG_FILE)
  log.push(entry)
  writeJsonFile(APPROVAL_LOG_FILE, log)
  return { data: entry, error: null }
}

export async function getApprovalLog(documentId = null) {
  if (supabase) {
    let query = supabase.from('approval_log').select('*')
    if (documentId) query = query.eq('document_id', documentId)

    const { data, error } = await query.order('performed_at', { ascending: false })
    return { data: data || [], error }
  }

  // File-based fallback
  let log = readJsonFile(APPROVAL_LOG_FILE)
  if (documentId) log = log.filter(e => e.document_id === documentId)
  log.sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at))
  return { data: log, error: null }
}
