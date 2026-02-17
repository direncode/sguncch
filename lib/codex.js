import { supabase } from './supabase'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// ============================================
// FILE-BASED FALLBACK STORAGE
// ============================================

// Seed file committed to the repo — survives deployments
const SEED_FILE = path.join(process.cwd(), 'data', 'codex-seed.json')

function resolveDataDir() {
  // Try process.cwd()/.data first (local dev), fall back to /tmp/.data (Vercel/serverless)
  const primary = path.join(process.cwd(), '.data')
  try {
    fs.mkdirSync(primary, { recursive: true })
    return primary
  } catch {
    const fallback = path.join('/tmp', '.data')
    fs.mkdirSync(fallback, { recursive: true })
    return fallback
  }
}

const DATA_DIR = resolveDataDir()
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json')
const CHUNKS_FILE = path.join(DATA_DIR, 'chunks.json')
const APPROVAL_LOG_FILE = path.join(DATA_DIR, 'approval_log.json')

let _seedLoaded = false

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// On first access, seed runtime storage from committed seed file if runtime is empty
function ensureSeedLoaded() {
  if (_seedLoaded) return
  _seedLoaded = true
  try {
    if (!fs.existsSync(SEED_FILE)) return
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'))
    if (!seed) return

    ensureDataDir()

    const safeRead = (f) => {
      try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [] }
      catch { return [] }
    }

    if (safeRead(DOCUMENTS_FILE).length === 0 && seed.documents?.length > 0) {
      fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(seed.documents, null, 2))
    }
    if (safeRead(CHUNKS_FILE).length === 0 && seed.chunks?.length > 0) {
      fs.writeFileSync(CHUNKS_FILE, JSON.stringify(seed.chunks, null, 2))
    }
    if (safeRead(APPROVAL_LOG_FILE).length === 0 && seed.approval_log?.length > 0) {
      fs.writeFileSync(APPROVAL_LOG_FILE, JSON.stringify(seed.approval_log, null, 2))
    }
  } catch {
    // Seed load failed — continue with empty data
  }
}

function readJsonFile(filePath) {
  ensureDataDir()
  ensureSeedLoaded()
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

// Normalize Supabase errors to strings
function normalizeError(error) {
  if (!error) return null
  if (typeof error === 'string') return error
  if (error.message) return error.message
  return JSON.stringify(error)
}

// ============================================
// SUPABASE TABLE AVAILABILITY CHECK
// ============================================
// Check once per cold start if governance_documents table exists.
// If not, skip all Supabase queries and use file storage.
let _codexTablesAvailable = null

async function useSupabaseCodex() {
  if (!supabase) return false
  if (_codexTablesAvailable !== null) return _codexTablesAvailable
  try {
    const { error } = await supabase
      .from('governance_documents')
      .select('id')
      .limit(1)
    _codexTablesAvailable = !error
    if (error) {
      console.warn('[Codex] governance_documents table not found in Supabase — using file-based storage. Run supabase-schema.sql to create tables.')
    }
  } catch {
    _codexTablesAvailable = false
  }
  return _codexTablesAvailable
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

  if (await useSupabaseCodex()) {
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

    return { data: data?.[0], error: normalizeError(error) }
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

export async function getDocuments(status = null, { includeText = false } = {}) {
  if (await useSupabaseCodex()) {
    const columns = includeText
      ? 'id, title, version, source_url, text_full, file_name, file_size, hash, status, approved_by, approved_at, rejected_reason, created_at'
      : 'id, title, version, source_url, file_name, file_size, hash, status, approved_by, approved_at, rejected_reason, created_at'

    let query = supabase
      .from('governance_documents')
      .select(columns)

    if (status) query = query.eq('status', status)

    const { data, error } = await query.order('created_at', { ascending: false })
    return { data: data || [], error: normalizeError(error) }
  }

  // File-based fallback
  let documents = readJsonFile(DOCUMENTS_FILE)
  if (status) documents = documents.filter(d => d.status === status)
  const result = documents
    .map(doc => {
      if (includeText) return doc
      const { text_full, ...rest } = doc
      return rest
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return { data: result, error: null }
}

export async function getDocumentById(id) {
  if (await useSupabaseCodex()) {
    const { data, error } = await supabase
      .from('governance_documents')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error: normalizeError(error) }
  }

  // File-based fallback
  const documents = readJsonFile(DOCUMENTS_FILE)
  const doc = documents.find(d => d.id === id)
  return { data: doc || null, error: doc ? null : 'Document not found' }
}

export async function searchDocuments(searchTerm) {
  if (await useSupabaseCodex()) {
    const { data, error } = await supabase
      .from('governance_documents')
      .select('id, title, version, source_url, approved_by, approved_at, created_at')
      .eq('status', 'approved')
      .ilike('title', `%${searchTerm}%`)
      .order('approved_at', { ascending: false })

    return { data: data || [], error: normalizeError(error) }
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

  if (await useSupabaseCodex()) {
    const { data, error } = await supabase
      .from('governance_documents')
      .update(updates)
      .eq('id', id)
      .select()

    return { data: data?.[0], error: normalizeError(error) }
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

  if (await useSupabaseCodex()) {
    const { data, error } = await supabase
      .from('document_chunks')
      .insert(rows)
      .select('id, chunk_index')

    return { data, error: normalizeError(error) }
  }

  // File-based fallback
  const allChunks = readJsonFile(CHUNKS_FILE)
  allChunks.push(...rows)
  writeJsonFile(CHUNKS_FILE, allChunks)
  return { data: rows.map(r => ({ id: r.id, chunk_index: r.chunk_index })), error: null }
}

export async function searchChunksByVector(embedding, limit = 5) {
  if (!(await useSupabaseCodex())) return { data: [], error: null }

  const { data, error } = await supabase
    .rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: limit,
    })

  return { data: data || [], error: normalizeError(error) }
}

export async function searchChunksByText(query, limit = 5) {
  if (await useSupabaseCodex()) {
    const { data, error } = await supabase
      .rpc('search_document_chunks_fts', {
        query_text: query,
        match_count: limit,
      })

    if (!error) return { data: data || [], error: null }
    // RPC might not exist even if table does — fall through to file search
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
// DELETE DOCUMENT + CHUNKS
// ============================================
export async function deleteDocument(id) {
  if (await useSupabaseCodex()) {
    await supabase.from('document_chunks').delete().eq('document_id', id)
    await supabase.from('approval_log').delete().eq('document_id', id)
    const { error } = await supabase.from('governance_documents').delete().eq('id', id)
    return { error: normalizeError(error) }
  }

  // File-based fallback
  const documents = readJsonFile(DOCUMENTS_FILE)
  const idx = documents.findIndex(d => d.id === id)
  if (idx === -1) return { error: 'Document not found' }

  documents.splice(idx, 1)
  writeJsonFile(DOCUMENTS_FILE, documents)

  // Remove associated chunks
  const allChunks = readJsonFile(CHUNKS_FILE)
  const filtered = allChunks.filter(c => c.document_id !== id)
  writeJsonFile(CHUNKS_FILE, filtered)

  // Remove approval log entries
  const log = readJsonFile(APPROVAL_LOG_FILE)
  const filteredLog = log.filter(e => e.document_id !== id)
  writeJsonFile(APPROVAL_LOG_FILE, filteredLog)

  return { error: null }
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

  if (await useSupabaseCodex()) {
    const { data, error } = await supabase
      .from('approval_log')
      .insert([entry])
      .select()

    return { data: data?.[0], error: normalizeError(error) }
  }

  // File-based fallback
  const log = readJsonFile(APPROVAL_LOG_FILE)
  log.push(entry)
  writeJsonFile(APPROVAL_LOG_FILE, log)
  return { data: entry, error: null }
}

export async function getApprovalLog(documentId = null) {
  if (await useSupabaseCodex()) {
    let query = supabase.from('approval_log').select('*')
    if (documentId) query = query.eq('document_id', documentId)

    const { data, error } = await query.order('performed_at', { ascending: false })
    return { data: data || [], error: normalizeError(error) }
  }

  // File-based fallback
  let log = readJsonFile(APPROVAL_LOG_FILE)
  if (documentId) log = log.filter(e => e.document_id === documentId)
  log.sort((a, b) => new Date(b.performed_at) - new Date(a.performed_at))
  return { data: log, error: null }
}
