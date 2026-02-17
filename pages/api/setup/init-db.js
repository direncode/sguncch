import { withAdminAuth } from '../../../lib/auth'
import { autoMigrateCodexTables, migrateWithConnectionString, getMigrationSQL } from '../../../lib/migrations'
import { resetCodexCache } from '../../../lib/codex'
import { supabase } from '../../../lib/supabase'

function deriveConnectionString(supabaseUrl, password) {
  // Extract project ref from https://[ref].supabase.co
  const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)
  if (!match) return null
  const ref = match[1]
  // Direct connection format for Supabase
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
}

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

  const { password } = req.body || {}

  // If password provided, derive connection string from Supabase URL
  if (password) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'NEXT_PUBLIC_SUPABASE_URL is not set. Configure it first.',
      })
    }

    const connectionString = deriveConnectionString(supabaseUrl, password)
    if (!connectionString) {
      return res.status(400).json({
        status: 'error',
        message: 'Could not derive connection string from Supabase URL. Expected format: https://[ref].supabase.co',
      })
    }

    try {
      const migrated = await migrateWithConnectionString(connectionString)
      if (migrated) {
        resetCodexCache()
        return res.status(200).json({
          status: 'migrated',
          message: 'Tables created successfully. Supabase is now active for permanent storage. Reload the page to start uploading.',
        })
      }
    } catch (err) {
      return res.status(400).json({
        status: 'error',
        message: `Migration failed: ${err.message}. Check your database password.`,
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
    message: 'Enter your Supabase database password above, or run the SQL below in Supabase SQL Editor.',
    sql: getMigrationSQL(),
  })
}

export default withAdminAuth(handler)
