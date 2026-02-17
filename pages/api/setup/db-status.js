import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const hasSupabaseConfig = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (!hasSupabaseConfig || !supabase) {
    return res.status(200).json({
      supabaseConfigured: false,
      tablesExist: false,
      message: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    })
  }

  // Check if governance_documents table exists
  try {
    const { error } = await supabase
      .from('governance_documents')
      .select('id')
      .limit(1)

    if (!error) {
      return res.status(200).json({
        supabaseConfigured: true,
        tablesExist: true,
        message: 'Database fully configured.',
      })
    }

    return res.status(200).json({
      supabaseConfigured: true,
      tablesExist: false,
      message: 'Supabase connected but tables not created yet.',
    })
  } catch {
    return res.status(200).json({
      supabaseConfigured: true,
      tablesExist: false,
      message: 'Supabase connected but tables not created yet.',
    })
  }
}
