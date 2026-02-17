import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client (will be null if env vars not set)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null
}

// Normalize Supabase errors to strings (prevents React error #31 rendering crashes)
function normalizeError(error) {
  if (!error) return null
  if (typeof error === 'string') return error
  if (error.message) return error.message
  return JSON.stringify(error)
}

// ============================================
// FEEDBACK SUBMISSIONS (Public - students submit)
// ============================================
export async function submitFeedbackToSupabase(feedbackData) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('feedback')
    .insert([{
      message: feedbackData.message,
      email: feedbackData.email || null,
      category: feedbackData.category || 'general',
      status: 'new',
      submitted_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function getFeedback() {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('feedback')
    .select('*')
    .order('submitted_at', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

export async function updateFeedback(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('feedback')
    .update({
      ...updates,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

// ============================================
// POLICIES
// ============================================
export async function getPolicies() {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('policies')
    .select('*')
    .order('department', { ascending: true })

  return { data: data || [], error: normalizeError(error) }
}

export async function updatePolicyInSupabase(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('policies')
    .update({
      ...updates,
      last_updated: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

// ============================================
// ANNOUNCEMENTS
// ============================================
export async function getAnnouncements() {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

export async function createAnnouncement(announcement) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('announcements')
    .insert([{
      title: announcement.title,
      content: announcement.content,
      category: announcement.category || 'general',
      pinned: announcement.pinned || false,
      published: true,
      created_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function updateAnnouncementInSupabase(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('announcements')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function deleteAnnouncementFromSupabase(id) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  return { error: normalizeError(error) }
}

// ============================================
// ACTIVITY LOG
// ============================================
export async function logActivityToSupabase(action, category, details, metadata = {}) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('activity_log')
    .insert([{
      action,
      category,
      details,
      metadata,
      timestamp: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function getActivityLog(limit = 100) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('activity_log')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit)

  return { data: data || [], error: normalizeError(error) }
}

// ============================================
// BUDGET
// ============================================
export async function getBudget() {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('budget')
    .select('*')
    .single()

  return { data, error: normalizeError(error) }
}

export async function updateBudgetInSupabase(updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('budget')
    .update({
      ...updates,
      last_updated: new Date().toISOString(),
    })
    .eq('id', 1) // Single budget row
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function addTransactionToSupabase(transaction) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('transactions')
    .insert([{
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function getTransactions() {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

// ============================================
// QUICK STATS
// ============================================
export async function getQuickStats() {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('quick_stats')
    .select('*')
    .single()

  return { data, error: normalizeError(error) }
}

export async function updateQuickStatsInSupabase(updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('quick_stats')
    .update(updates)
    .eq('id', 1)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

// ============================================
// OPERATIONAL DATA
// ============================================
export async function getTechDevices() {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('tech_devices')
    .select('*')
    .order('created_at', { ascending: true })

  return { data: data || [], error: normalizeError(error) }
}

export async function addTechDeviceToSupabase(device) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('tech_devices')
    .insert([{
      type: device.type,
      name: device.name,
      total: device.total,
      available: device.available,
      on_loan: device.onLoan || 0,
      created_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function updateTechDeviceInSupabase(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('tech_devices')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function deleteTechDeviceFromSupabase(id) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { error } = await supabase
    .from('tech_devices')
    .delete()
    .eq('id', id)

  return { error: normalizeError(error) }
}

export async function getTechLoans() {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('tech_loans')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

export async function addTechLoanToSupabase(loan) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('tech_loans')
    .insert([{
      student_name: loan.studentName,
      student_email: loan.studentEmail,
      device_type: loan.deviceType,
      due_date: loan.dueDate,
      status: 'active',
      created_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function updateTechLoanInSupabase(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('tech_loans')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

// ============================================
// FOOD PANTRY
// ============================================
export async function getPantryLocations() {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('pantry_locations')
    .select('*')

  return { data: data || [], error: normalizeError(error) }
}

export async function updatePantryLocationInSupabase(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('pantry_locations')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function getPantryStats() {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('pantry_stats')
    .select('*')
    .single()

  return { data, error: normalizeError(error) }
}

export async function updatePantryStatsInSupabase(updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error: normalizeError(error) } = await supabase
    .from('pantry_stats')
    .update(updates)
    .eq('id', 1)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}
