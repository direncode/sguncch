-- ============================================
-- PROJECT BOLD POLICY PLATFORM - SUPABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FEEDBACK TABLE (Student submissions)
-- ============================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message TEXT NOT NULL,
  email TEXT,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'archived')),
  admin_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (public submissions)
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins can read feedback
CREATE POLICY "Admins can read feedback" ON feedback
  FOR SELECT USING (true); -- Adjust based on your auth setup

-- Only admins can update feedback
CREATE POLICY "Admins can update feedback" ON feedback
  FOR UPDATE USING (true);

-- ============================================
-- POLICIES TABLE (40 policy initiatives)
-- ============================================
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  metrics JSONB DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read policies" ON policies
  FOR SELECT USING (true);

CREATE POLICY "Admins can update policies" ON policies
  FOR UPDATE USING (true);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'policy', 'event', 'urgent', 'milestone')),
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read announcements" ON announcements
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (true);

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read activity" ON activity_log
  FOR SELECT USING (true);

CREATE POLICY "System can insert activity" ON activity_log
  FOR INSERT WITH CHECK (true);

-- ============================================
-- BUDGET TABLE (Single row)
-- ============================================
CREATE TABLE IF NOT EXISTS budget (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total DECIMAL(10,2) DEFAULT 0,
  allocated DECIMAL(10,2) DEFAULT 0,
  spent DECIMAL(10,2) DEFAULT 0,
  categories JSONB DEFAULT '[]',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_budget CHECK (id = 1)
);

ALTER TABLE budget ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read budget" ON budget
  FOR SELECT USING (true);

CREATE POLICY "Admins can update budget" ON budget
  FOR UPDATE USING (true);

-- Insert initial budget row
INSERT INTO budget (id, total, allocated, spent, categories)
VALUES (1, 50000, 35000, 12500, '[
  {"name": "Events & Programs", "allocated": 15000, "spent": 5200},
  {"name": "Marketing & Outreach", "allocated": 8000, "spent": 3100},
  {"name": "Technology", "allocated": 5000, "spent": 2400},
  {"name": "Emergency Fund", "allocated": 7000, "spent": 1800}
]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  category TEXT,
  date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage transactions" ON transactions
  FOR ALL USING (true);

-- ============================================
-- QUICK STATS TABLE (Single row)
-- ============================================
CREATE TABLE IF NOT EXISTS quick_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_students_reached INTEGER DEFAULT 0,
  active_initiatives INTEGER DEFAULT 0,
  events_this_month INTEGER DEFAULT 0,
  feedback_received INTEGER DEFAULT 0,
  CONSTRAINT single_stats CHECK (id = 1)
);

ALTER TABLE quick_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stats" ON quick_stats
  FOR SELECT USING (true);

CREATE POLICY "Admins can update stats" ON quick_stats
  FOR UPDATE USING (true);

-- Insert initial stats row
INSERT INTO quick_stats (id, total_students_reached, active_initiatives, events_this_month, feedback_received)
VALUES (1, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TECH DEVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tech_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  total INTEGER DEFAULT 0,
  available INTEGER DEFAULT 0,
  on_loan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

ALTER TABLE tech_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read devices" ON tech_devices
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage devices" ON tech_devices
  FOR ALL USING (true);

-- Insert initial devices
INSERT INTO tech_devices (type, name, total, available, on_loan) VALUES
  ('laptop-windows', 'Windows Laptops', 25, 18, 7),
  ('laptop-mac', 'MacBook Air', 15, 12, 3),
  ('hotspot', 'Wi-Fi Hotspots', 30, 22, 8),
  ('charger', 'Universal Chargers', 50, 45, 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- TECH LOANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tech_loans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  device_type TEXT NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

ALTER TABLE tech_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage loans" ON tech_loans
  FOR ALL USING (true);

-- ============================================
-- PANTRY LOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pantry_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  hours TEXT,
  visits INTEGER DEFAULT 0,
  inventory TEXT DEFAULT 'unknown' CHECK (inventory IN ('well-stocked', 'moderate', 'low', 'critical', 'unknown')),
  updated_at TIMESTAMPTZ
);

ALTER TABLE pantry_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pantry locations" ON pantry_locations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage pantry" ON pantry_locations
  FOR ALL USING (true);

-- Insert initial pantry locations
INSERT INTO pantry_locations (name, hours, visits, inventory) VALUES
  ('Davis Library Pantry', 'Mon-Fri 9am-5pm', 0, 'well-stocked'),
  ('Student Union Pantry', 'Mon-Sat 8am-8pm', 0, 'moderate'),
  ('Morrison Residence Hall', 'Daily 7am-11pm', 0, 'well-stocked')
ON CONFLICT DO NOTHING;

-- ============================================
-- PANTRY STATS TABLE (Single row)
-- ============================================
CREATE TABLE IF NOT EXISTS pantry_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_visits INTEGER DEFAULT 0,
  donations DECIMAL(10,2) DEFAULT 0,
  CONSTRAINT single_pantry_stats CHECK (id = 1)
);

ALTER TABLE pantry_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pantry stats" ON pantry_stats
  FOR SELECT USING (true);

CREATE POLICY "Admins can update pantry stats" ON pantry_stats
  FOR UPDATE USING (true);

INSERT INTO pantry_stats (id, total_visits, donations)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TRAINING SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('mentalHealthFirstAid')),
  title TEXT,
  date DATE,
  location TEXT,
  capacity INTEGER DEFAULT 0,
  attendees INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read training sessions" ON training_sessions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage training" ON training_sessions
  FOR ALL USING (true);

-- ============================================
-- TRAINING STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS training_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  mental_health_trained INTEGER DEFAULT 0,
  CONSTRAINT single_training_stats CHECK (id = 1)
);

ALTER TABLE training_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read training stats" ON training_stats
  FOR SELECT USING (true);

CREATE POLICY "Admins can update training stats" ON training_stats
  FOR UPDATE USING (true);

INSERT INTO training_stats (id, mental_health_trained)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_submitted_at ON feedback(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_policies_department ON policies(department);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_tech_loans_status ON tech_loans(status);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View: Feedback summary by status
CREATE OR REPLACE VIEW feedback_summary AS
SELECT
  status,
  COUNT(*) as count,
  MAX(submitted_at) as latest
FROM feedback
GROUP BY status;

-- View: Department progress overview
CREATE OR REPLACE VIEW department_progress AS
SELECT
  department,
  COUNT(*) as total_policies,
  AVG(progress) as avg_progress,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress
FROM policies
GROUP BY department;

-- View: Recent activity with readable timestamps
CREATE OR REPLACE VIEW recent_activity AS
SELECT
  id,
  action,
  category,
  details,
  metadata,
  timestamp,
  TO_CHAR(timestamp, 'Mon DD, YYYY HH12:MI AM') as formatted_time
FROM activity_log
ORDER BY timestamp DESC
LIMIT 50;

-- ============================================
-- UNC GOV CODEX - GOVERNANCE DOCUMENT RAG SYSTEM
-- ============================================

-- Enable pgvector extension (optional - falls back to FTS if unavailable)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- GOVERNANCE DOCUMENTS TABLE
-- ============================================
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

CREATE POLICY "Anyone can read approved governance docs" ON governance_documents
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage governance docs" ON governance_documents
  FOR ALL USING (true);

-- ============================================
-- DOCUMENT CHUNKS TABLE (for RAG retrieval)
-- ============================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES governance_documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  section_hint TEXT,
  embedding vector(1536),
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chunks" ON document_chunks
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage chunks" ON document_chunks
  FOR ALL USING (true);

-- ============================================
-- APPROVAL LOG TABLE (audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS approval_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES governance_documents(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('uploaded', 'approved', 'rejected')),
  performed_by TEXT DEFAULT 'admin',
  reason TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE approval_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approval log" ON approval_log
  FOR SELECT USING (true);

CREATE POLICY "System can insert approval log" ON approval_log
  FOR INSERT WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_gov_docs_status ON governance_documents(status);
CREATE INDEX IF NOT EXISTS idx_gov_docs_hash ON governance_documents(hash);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_search ON document_chunks USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_approval_log_doc ON approval_log(document_id);
CREATE INDEX IF NOT EXISTS idx_approval_log_time ON approval_log(performed_at DESC);

-- ============================================
-- AUTO-POPULATE SEARCH VECTOR TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_chunk_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.section_hint, '') || ' ' || NEW.chunk_text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chunk_search_vector
  BEFORE INSERT OR UPDATE ON document_chunks
  FOR EACH ROW EXECUTE FUNCTION update_chunk_search_vector();

-- ============================================
-- VECTOR SIMILARITY SEARCH FUNCTION (pgvector)
-- ============================================
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  chunk_index INTEGER,
  section_hint TEXT,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id, dc.document_id, dc.chunk_text, dc.chunk_index, dc.section_hint,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN governance_documents gd ON gd.id = dc.document_id
  WHERE gd.status = 'approved'
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FULL-TEXT SEARCH FUNCTION (fallback)
-- ============================================
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

-- ============================================
-- FORM SUBMISSIONS TABLE (All resource forms)
-- ============================================
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

CREATE POLICY "Anyone can submit forms" ON form_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read form submissions" ON form_submissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can update form submissions" ON form_submissions
  FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted ON form_submissions(submitted_at DESC);

-- ============================================
-- FUNDING REQUESTS TABLE
-- ============================================
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

CREATE POLICY "Anyone can submit funding requests" ON funding_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read funding requests" ON funding_requests
  FOR SELECT USING (true);

CREATE POLICY "Admins can update funding requests" ON funding_requests
  FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_funding_requests_status ON funding_requests(status);
CREATE INDEX IF NOT EXISTS idx_funding_requests_submitted ON funding_requests(submitted_at DESC);

-- ============================================
-- ADMIN ACCOUNTS TABLE (Persistent user accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  team_role TEXT NOT NULL CHECK (team_role IN ('leads', 'outreach', 'comms', 'strategy')),
  password_hash TEXT NOT NULL,
  avatar_color TEXT DEFAULT '#4B9CD3',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read accounts" ON admin_accounts
  FOR SELECT USING (true);

CREATE POLICY "System can insert accounts" ON admin_accounts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update accounts" ON admin_accounts
  FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_admin_accounts_username ON admin_accounts(username);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_role ON admin_accounts(team_role);

-- ============================================
-- POLICY DISCUSSIONS TABLE (Forum-style messaging)
-- ============================================
CREATE TABLE IF NOT EXISTS policy_discussions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_id TEXT NOT NULL,
  user_id UUID REFERENCES admin_accounts(id),
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  team_role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE policy_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read discussions" ON policy_discussions
  FOR SELECT USING (true);

CREATE POLICY "Admins can post discussions" ON policy_discussions
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_policy_discussions_policy ON policy_discussions(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_discussions_created ON policy_discussions(created_at ASC);

-- ============================================
-- CHAT HISTORY TABLE (Grok conversation persistence)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES admin_accounts(id),
  title TEXT DEFAULT 'New Conversation',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own chat history" ON chat_history
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert chat history" ON chat_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update own chat history" ON chat_history
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete own chat history" ON chat_history
  FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_updated ON chat_history(updated_at DESC);

-- ============================================
-- ALTER governance_documents for Scroll enhancements
-- ============================================
ALTER TABLE governance_documents ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE governance_documents ADD COLUMN IF NOT EXISTS key_provisions JSONB DEFAULT '[]';
ALTER TABLE governance_documents ADD COLUMN IF NOT EXISTS query_count INTEGER DEFAULT 0;
ALTER TABLE governance_documents ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
