import { withAdminAuth } from '../../../lib/auth'
import { autoMigrateCodexTables, migrateWithConnectionString, getMigrationSQL } from '../../../lib/migrations'
import { resetCodexCache } from '../../../lib/codex'
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
    resetCodexCache()
    return res.status(200).json({
      status: 'already_configured',
      message: 'All tables already exist in Supabase.',
    })
  }

  const { connectionString } = req.body || {}

  // If connection string provided, use it directly
  if (connectionString) {
    const trimmed = connectionString.trim()
    if (!trimmed.startsWith('postgresql://') && !trimmed.startsWith('postgres://')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid connection string. It should start with postgresql:// or postgres://',
      })
    }

    try {
      const migrated = await migrateWithConnectionString(trimmed)
      if (migrated) {
        resetCodexCache()
        return res.status(200).json({
          status: 'migrated',
          message: 'Tables created successfully. Supabase is now active for permanent storage. Reload the page to start uploading.',
        })
      }
    } catch (err) {
      const msg = err.message || String(err)
      return res.status(400).json({
        status: 'error',
        message: `Migration failed: ${msg}`,
      })
    }
  }

  // Try auto-migration with env var
  const migrated = await autoMigrateCodexTables()

  if (migrated) {
    resetCodexCache()
    return res.status(200).json({
      status: 'migrated',
      message: 'Tables created successfully via DATABASE_URL.',
    })
  }

  // Auto-migration failed — return SQL for manual execution
  return res.status(200).json({
    status: 'manual_required',
    message: 'Paste your Supabase connection string above, or run the SQL below in Supabase SQL Editor.',
    sql: getMigrationSQL(),
  })
}

export default withAdminAuth(handler)
