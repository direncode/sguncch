import { createClient } from '@supabase/supabase-js'
import { registerLogWriter } from './logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client (will be null if env vars not set)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Register the log writer so logger.js can persist critical logs to Supabase
// (deferred to avoid circular dependency issues)
if (typeof window === 'undefined' && supabase) {
  // Register after module init to ensure writeAppLog is defined
  setTimeout(() => {
    registerLogWriter(async (level, module, message, metadata, correlationId) => {
      try {
        await supabase.from('app_logs').insert([{
          level, module, message, metadata,
          correlation_id: correlationId,
          created_at: new Date().toISOString(),
        }])
      } catch {
        // Silent fail — don't recurse
      }
    })
  }, 0)
}

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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('submitted_at', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

export async function updateFeedback(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .order('department', { ascending: true })

  return { data: data || [], error: normalizeError(error) }
}

export async function updatePolicyInSupabase(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

export async function createAnnouncement(announcement) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('budget')
    .select('*')
    .single()

  return { data, error: normalizeError(error) }
}

export async function updateBudgetInSupabase(updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('quick_stats')
    .select('*')
    .single()

  return { data, error: normalizeError(error) }
}

export async function updateQuickStatsInSupabase(updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('tech_devices')
    .select('*')
    .order('created_at', { ascending: true })

  return { data: data || [], error: normalizeError(error) }
}

export async function addTechDeviceToSupabase(device) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('tech_loans')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

export async function addTechLoanToSupabase(loan) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('pantry_locations')
    .select('*')

  return { data: data || [], error: normalizeError(error) }
}

export async function updatePantryLocationInSupabase(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
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

  const { data, error } = await supabase
    .from('pantry_stats')
    .select('*')
    .single()

  return { data, error: normalizeError(error) }
}

export async function updatePantryStatsInSupabase(updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('pantry_stats')
    .update(updates)
    .eq('id', 1)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

// ============================================
// FORM SUBMISSIONS (All resource forms)
// ============================================
export async function submitFormToSupabase(formType, formData) {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('form_submissions')
    .insert([{
      form_type: formType,
      data: formData,
      status: 'new',
      submitted_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function getFormSubmissions(formType = null) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  let query = supabase
    .from('form_submissions')
    .select('*')

  if (formType) query = query.eq('form_type', formType)

  const { data, error } = await query.order('submitted_at', { ascending: false })
  return { data: data || [], error: normalizeError(error) }
}

export async function updateFormSubmission(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('form_submissions')
    .update({
      ...updates,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

// ============================================
// FUNDING REQUESTS
// ============================================
export async function submitFundingRequestToSupabase(request) {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('funding_requests')
    .insert([{
      org_name: request.orgName,
      category: request.category,
      amount: request.amount,
      description: request.description,
      justification: request.justification,
      students_impacted: request.studentsImpacted || 0,
      contact_email: request.contactEmail,
      status: 'pending',
      context_check: request.contextCheck || {},
      submitted_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function getFundingRequests() {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('funding_requests')
    .select('*')
    .order('submitted_at', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

export async function updateFundingRequestInSupabase(id, updates) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('funding_requests')
    .update({
      ...updates,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

// ============================================
// APP LOGS (Centralized application logging)
// ============================================
export async function writeAppLog(level, module, message, metadata = {}, correlationId = null) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('app_logs')
    .insert([{
      level,
      module,
      message,
      metadata,
      correlation_id: correlationId,
      created_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function getAppLogs(filters = {}) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  let query = supabase
    .from('app_logs')
    .select('*')

  if (filters.level) query = query.eq('level', filters.level)
  if (filters.module) query = query.eq('module', filters.module)
  if (filters.since) query = query.gte('created_at', filters.since)

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(filters.limit || 200)

  return { data: data || [], error: normalizeError(error) }
}

// ============================================
// NEWS FEED CACHE
// ============================================
export async function cacheNewsArticles(articles) {
  if (!supabase) return { error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('news_feed_cache')
    .upsert(
      articles.map(a => ({
        source_id: a.sourceId,
        title: a.title,
        description: a.description || null,
        link: a.link,
        pub_date: a.pubDate || null,
        source_name: a.sourceName,
        category: a.category,
        cached_at: new Date().toISOString(),
      })),
      { onConflict: 'link' }
    )
    .select()

  return { data: data || [], error: normalizeError(error) }
}

export async function getCachedNews(maxAgeMinutes = 5) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('news_feed_cache')
    .select('*')
    .gte('cached_at', cutoff)
    .order('pub_date', { ascending: false })
    .limit(50)

  return { data: data || [], error: normalizeError(error) }
}

export async function clearExpiredNewsCache(maxAgeHours = 24) {
  if (!supabase) return { error: 'Supabase not configured' }

  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('news_feed_cache')
    .delete()
    .lt('cached_at', cutoff)

  return { error: normalizeError(error) }
}

// ============================================
// POLICY UPDATES (Narrative progress tracking)
// ============================================
export async function addPolicyUpdateToSupabase(update) {
  if (!supabase) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('policy_updates')
    .insert([{
      policy_id: update.policyId,
      phase: update.phase,
      title: update.title,
      narrative: update.narrative,
      evidence: update.evidence || [],
      impact: update.impact || null,
      author: update.author || 'Admin',
      created_at: new Date().toISOString(),
    }])
    .select()

  return { data: data?.[0], error: normalizeError(error) }
}

export async function getPolicyUpdates(policyId = null) {
  if (!supabase) return { data: [], error: 'Supabase not configured' }

  let query = supabase
    .from('policy_updates')
    .select('*')

  if (policyId) query = query.eq('policy_id', policyId)

  const { data, error } = await query
    .order('created_at', { ascending: false })

  return { data: data || [], error: normalizeError(error) }
}

// ============================================
// CONNECTION HEALTH CHECK
// ============================================
export async function checkSupabaseHealth() {
  if (!supabase) return { healthy: false, reason: 'Not configured' }

  try {
    const { error } = await supabase
      .from('quick_stats')
      .select('id')
      .limit(1)

    return { healthy: !error, reason: error ? normalizeError(error) : 'OK' }
  } catch (err) {
    return { healthy: false, reason: err.message || 'Connection failed' }
  }
}
