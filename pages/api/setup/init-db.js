import { withAdminAuth } from '../../../lib/auth'
import { autoMigrateCodexTables, getMigrationSQL } from '../../../lib/migrations'
import { supabase } from '../../../lib/supabase'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check current state
  let tablesExist = false
  if (supabase) {
    try {
      const { error } = await supabase
        .from('governance_documents')
        .select('id')
        .limit(1)
      tablesExist = !error
    } catch {
      tablesExist = false
    }
  }

  if (tablesExist) {
    return res.status(200).json({
      status: 'already_configured',
      message: 'All codex tables already exist in Supabase.',
    })
  }

  // Try auto-migration
  const migrated = await autoMigrateCodexTables()

  if (migrated) {
    return res.status(200).json({
      status: 'migrated',
      message: 'Tables created successfully. Supabase is now active for permanent document storage.',
    })
  }

  // Auto-migration failed — return SQL for manual execution
  return res.status(200).json({
    status: 'manual_required',
    message: 'Auto-migration failed. Add DATABASE_URL to your env vars, or run the SQL below in Supabase SQL Editor.',
    sql: getMigrationSQL(),
  })
}

export default withAdminAuth(handler)
