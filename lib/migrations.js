// Auto-migration for codex tables (governance_documents, document_chunks, approval_log)
// Requires DATABASE_URL env var (get from Supabase Dashboard → Settings → Database → Connection String → URI)

import { createLogger } from './logger'

const log = createLogger('Migrations')
let _migrationAttempted = false
let _migrationSucceeded = false

const CODEX_TABLES_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Governance Documents
CREATE TABLE IF NOT EXISTS governance_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  source_url TEXT,
  text_full TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE governance_documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'governance_documents' AND policyname = 'Anyone can read approved governance docs') THEN
    CREATE POLICY "Anyone can read approved governance docs" ON governance_documents FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'governance_documents' AND policyname = 'Admins can manage governance docs') THEN
    CREATE POLICY "Admins can manage governance docs" ON governance_documents FOR ALL USING (true);
  END IF;
END $$;

-- Document Chunks (RAG retrieval) — no pgvector initially, just text search
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES governance_documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  section_hint TEXT,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_chunks' AND policyname = 'Anyone can read chunks') THEN
    CREATE POLICY "Anyone can read chunks" ON document_chunks FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'document_chunks' AND policyname = 'Admins can manage chunks') THEN
    CREATE POLICY "Admins can manage chunks" ON document_chunks FOR ALL USING (true);
  END IF;
END $$;

-- Approval Log (audit trail)
CREATE TABLE IF NOT EXISTS approval_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES governance_documents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by TEXT DEFAULT 'admin',
  reason TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE approval_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'approval_log' AND policyname = 'Anyone can read approval log') THEN
    CREATE POLICY "Anyone can read approval log" ON approval_log FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'approval_log' AND policyname = 'System can insert approval log') THEN
    CREATE POLICY "System can insert approval log" ON approval_log FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gov_docs_status ON governance_documents(status);
CREATE INDEX IF NOT EXISTS idx_gov_docs_hash ON governance_documents(hash);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_search ON document_chunks USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_approval_log_doc ON approval_log(document_id);
CREATE INDEX IF NOT EXISTS idx_approval_log_time ON approval_log(performed_at DESC);

-- Auto-populate search vector trigger
CREATE OR REPLACE FUNCTION update_chunk_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.section_hint, '') || ' ' || NEW.chunk_text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_chunk_search_vector ON document_chunks;
CREATE TRIGGER trigger_chunk_search_vector
  BEFORE INSERT OR UPDATE ON document_chunks
  FOR EACH ROW EXECUTE FUNCTION update_chunk_search_vector();

-- Full-text search function (fallback when pgvector not available)
CREATE OR REPLACE FUNCTION search_document_chunks_fts(
  query_text TEXT,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  chunk_index INTEGER,
  section_hint TEXT,
  rank float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id, dc.document_id, dc.chunk_text, dc.chunk_index, dc.section_hint,
    ts_rank(dc.search_vector, plainto_tsquery('english', query_text))::float AS rank
  FROM document_chunks dc
  JOIN governance_documents gd ON gd.id = dc.document_id
  WHERE gd.status = 'approved'
    AND dc.search_vector @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Also create form_submissions and funding_requests if missing
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'archived')),
  admin_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_submissions' AND policyname = 'Anyone can submit forms') THEN
    CREATE POLICY "Anyone can submit forms" ON form_submissions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_submissions' AND policyname = 'Admins can read form submissions') THEN
    CREATE POLICY "Admins can read form submissions" ON form_submissions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_submissions' AND policyname = 'Admins can update form submissions') THEN
    CREATE POLICY "Admins can update form submissions" ON form_submissions FOR UPDATE USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS funding_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  justification TEXT,
  students_impacted INTEGER DEFAULT 0,
  contact_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'needs-info', 'amendment-requested')),
  approved_amount DECIMAL(10,2),
  reviewer_notes TEXT,
  context_check JSONB DEFAULT '{}',
  amendment JSONB,
  amendment_history JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'funding_requests' AND policyname = 'Anyone can submit funding requests') THEN
    CREATE POLICY "Anyone can submit funding requests" ON funding_requests FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'funding_requests' AND policyname = 'Anyone can read funding requests') THEN
    CREATE POLICY "Anyone can read funding requests" ON funding_requests FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'funding_requests' AND policyname = 'Admins can update funding requests') THEN
    CREATE POLICY "Admins can update funding requests" ON funding_requests FOR UPDATE USING (true);
  END IF;
END $$;
`

export async function autoMigrateCodexTables() {
  if (_migrationAttempted) return _migrationSucceeded
  _migrationAttempted = true

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL
  if (!databaseUrl) {
    log.warn('No DATABASE_URL found. Set DATABASE_URL env var or use the admin setup wizard.')
    return false
  }

  try {
    const result = await runMigrationSQL(databaseUrl)
    _migrationSucceeded = result
    return result
  } catch (err) {
    log.error('Auto-migration failed', { error: err.message })
    return false
  }
}

// Run migration with an explicit connection string (used by admin setup wizard)
export async function migrateWithConnectionString(connectionString) {
  const result = await runMigrationSQL(connectionString)
  if (result) {
    _migrationAttempted = true
    _migrationSucceeded = true
  }
  return result
}

async function runMigrationSQL(connectionString) {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 5000,
      max: 1,
    })

    await pool.query(CODEX_TABLES_SQL)
    // Tell PostgREST to reload its schema cache so new tables are immediately available
    await pool.query("NOTIFY pgrst, 'reload schema'")
    await pool.end()

    log.info('Tables created successfully', { tables: 'governance_documents, document_chunks, approval_log, form_submissions, funding_requests' })
    return true
  } catch (err) {
    log.error('Migration failed', { error: err.message })
    throw err
  }
}

export function getMigrationSQL() {
  return CODEX_TABLES_SQL
}
