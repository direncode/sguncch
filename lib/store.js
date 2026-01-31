import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { initialPolicies, initialOperationalData, initialBudgetData, ADMIN_KEY, budgetCategories, sgPriorities } from './data'
import {
  supabase,
  isSupabaseConfigured,
  submitFeedbackToSupabase,
  getFeedback as getSupabaseFeedback,
  updateFeedback as updateSupabaseFeedback,
  logActivityToSupabase,
  getActivityLog as getSupabaseActivityLog,
  getAnnouncements as getSupabaseAnnouncements,
  createAnnouncement as createSupabaseAnnouncement,
  updateAnnouncementInSupabase,
  deleteAnnouncementFromSupabase,
} from './supabase'

const AppContext = createContext()

// Check if Supabase is available
const useSupabase = isSupabaseConfigured()

// Initial announcements structure
const initialAnnouncements = []

// Initial activity log
const initialActivityLog = []

// Initial feedback submissions
const initialFeedback = []

// Initial quick stats for dashboard
const initialQuickStats = {
  totalStudentsReached: 0,
  activeInitiatives: 0,
  eventsThisMonth: 0,
  feedbackReceived: 0,
}

export function AppProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [policies, setPolicies] = useState(initialPolicies)
  const [operationalData, setOperationalData] = useState(initialOperationalData)
  const [budgetData, setBudgetData] = useState(initialBudgetData)
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [activityLog, setActivityLog] = useState(initialActivityLog)
  const [feedback, setFeedback] = useState(initialFeedback)
  const [quickStats, setQuickStats] = useState(initialQuickStats)
  const [isLoaded, setIsLoaded] = useState(false)

  // Track if using Supabase backend
  const [dataSource, setDataSource] = useState('localStorage')

  // ============================================
  // ACTIVITY LOGGING SYSTEM
  // ============================================
  const logActivity = useCallback((action, category, details, metadata = {}) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      category,
      details,
      metadata,
    }
    setActivityLog(prev => [entry, ...prev].slice(0, 500)) // Keep last 500 entries

    // Also log to Supabase if configured
    if (useSupabase) {
      logActivityToSupabase(action, category, details, metadata).catch(console.error)
    }
  }, [])

  // ============================================
  // LOAD DATA (Supabase first, fallback to localStorage)
  // ============================================
  useEffect(() => {
    async function loadData() {
      if (typeof window === 'undefined') return

      // Try Supabase first if configured
      if (useSupabase) {
        try {
          console.log('Loading data from Supabase...')
          setDataSource('supabase')

          // Load feedback from Supabase
          const { data: supabaseFeedback } = await getSupabaseFeedback()
          if (supabaseFeedback?.length) {
            setFeedback(supabaseFeedback.map(f => ({
              id: f.id,
              message: f.message,
              email: f.email,
              category: f.category,
              status: f.status,
              adminNote: f.admin_note,
              submittedAt: f.submitted_at,
              reviewedAt: f.reviewed_at,
            })))
          }

          // Load activity log from Supabase
          const { data: supabaseActivity } = await getSupabaseActivityLog()
          if (supabaseActivity?.length) {
            setActivityLog(supabaseActivity.map(a => ({
              id: a.id,
              action: a.action,
              category: a.category,
              details: a.details,
              metadata: a.metadata,
              timestamp: a.timestamp,
            })))
          }

          // Load announcements from Supabase
          const { data: supabaseAnnouncements } = await getSupabaseAnnouncements()
          if (supabaseAnnouncements?.length) {
            setAnnouncements(supabaseAnnouncements.map(a => ({
              id: a.id,
              title: a.title,
              content: a.content,
              category: a.category,
              pinned: a.pinned,
              published: a.published,
              createdAt: a.created_at,
              updatedAt: a.updated_at,
            })))
          }

          // Still load policies/operational/budget from localStorage for now
          // (full migration would require seeding Supabase with initial data)
          const savedPolicies = localStorage.getItem('projectbold_policies')
          const savedOperational = localStorage.getItem('projectbold_operational')
          const savedBudget = localStorage.getItem('projectbold_budget')
          const savedQuickStats = localStorage.getItem('projectbold_quickstats')

          if (savedPolicies) setPolicies(JSON.parse(savedPolicies))
          if (savedOperational) setOperationalData(JSON.parse(savedOperational))
          if (savedBudget) setBudgetData(JSON.parse(savedBudget))
          if (savedQuickStats) setQuickStats(JSON.parse(savedQuickStats))

        } catch (e) {
          console.error('Error loading from Supabase, falling back to localStorage:', e)
          setDataSource('localStorage')
        }
      } else {
        setDataSource('localStorage')
      }

      // Load from localStorage (fallback or if Supabase not configured)
      try {
        const savedAdmin = localStorage.getItem('projectbold_admin')
        if (savedAdmin === 'true') setIsAdmin(true)

        // Only load from localStorage if not using Supabase or as fallback
        if (!useSupabase || dataSource === 'localStorage') {
          const savedPolicies = localStorage.getItem('projectbold_policies')
          const savedOperational = localStorage.getItem('projectbold_operational')
          const savedBudget = localStorage.getItem('projectbold_budget')
          const savedAnnouncements = localStorage.getItem('projectbold_announcements')
          const savedActivityLog = localStorage.getItem('projectbold_activity')
          const savedFeedback = localStorage.getItem('projectbold_feedback')
          const savedQuickStats = localStorage.getItem('projectbold_quickstats')

          if (savedPolicies) setPolicies(JSON.parse(savedPolicies))
          if (savedOperational) setOperationalData(JSON.parse(savedOperational))
          if (savedBudget) setBudgetData(JSON.parse(savedBudget))
          if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements))
          if (savedActivityLog) setActivityLog(JSON.parse(savedActivityLog))
          if (savedFeedback) setFeedback(JSON.parse(savedFeedback))
          if (savedQuickStats) setQuickStats(JSON.parse(savedQuickStats))
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e)
      }

      setIsLoaded(true)
    }

    loadData()
  }, [])

  // ============================================
  // PERSIST TO LOCALSTORAGE
  // ============================================
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_policies', JSON.stringify(policies))
    }
  }, [policies, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_operational', JSON.stringify(operationalData))
    }
  }, [operationalData, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_budget', JSON.stringify(budgetData))
    }
  }, [budgetData, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_announcements', JSON.stringify(announcements))
    }
  }, [announcements, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_activity', JSON.stringify(activityLog))
    }
  }, [activityLog, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_feedback', JSON.stringify(feedback))
    }
  }, [feedback, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_quickstats', JSON.stringify(quickStats))
    }
  }, [quickStats, isLoaded])

  // ============================================
  // ADMIN AUTHENTICATION
  // ============================================
  const loginAdmin = (key) => {
    if (key === ADMIN_KEY) {
      setIsAdmin(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('projectbold_admin', 'true')
      }
      logActivity('LOGIN', 'auth', 'Admin logged in')
      return true
    }
    logActivity('LOGIN_FAILED', 'auth', 'Failed login attempt')
    return false
  }

  const logoutAdmin = () => {
    logActivity('LOGOUT', 'auth', 'Admin logged out')
    setIsAdmin(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('projectbold_admin')
    }
  }

  // ============================================
  // POLICY MANAGEMENT
  // ============================================
  const updatePolicy = (policyId, updates) => {
    setPolicies(prev => prev.map(p =>
      p.id === policyId ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p
    ))
    const policy = policies.find(p => p.id === policyId)
    logActivity('UPDATE_POLICY', 'policy', `Updated policy: ${policy?.title || policyId}`, { policyId, updates })
  }

  const updatePolicyMetrics = (policyId, metrics) => {
    setPolicies(prev => prev.map(p =>
      p.id === policyId ? { ...p, metrics: { ...p.metrics, ...metrics }, lastUpdated: new Date().toISOString() } : p
    ))
    const policy = policies.find(p => p.id === policyId)
    logActivity('UPDATE_METRICS', 'policy', `Updated metrics for: ${policy?.title || policyId}`, { policyId, metrics })
  }

  const logPolicyProgress = (policyId, progress, note = '') => {
    const policy = policies.find(p => p.id === policyId)
    if (!policy) return

    // Update the policy progress
    setPolicies(prev => prev.map(p =>
      p.id === policyId ? { ...p, progress, lastUpdated: new Date().toISOString() } : p
    ))

    // Log with detailed metadata including department and progress
    logActivity(
      'LOG_PROGRESS',
      policy.department,
      note || `Progress updated to ${progress}% for: ${policy.title}`,
      {
        policyId,
        policyTitle: policy.title,
        department: policy.department,
        progress,
        previousProgress: policy.progress,
        note
      }
    )
  }

  const batchUpdatePolicies = (updates) => {
    // updates is array of { id, ...changes }
    setPolicies(prev => prev.map(p => {
      const update = updates.find(u => u.id === p.id)
      return update ? { ...p, ...update, lastUpdated: new Date().toISOString() } : p
    }))
    logActivity('BATCH_UPDATE', 'policy', `Batch updated ${updates.length} policies`, { count: updates.length })
  }

  // ============================================
  // ANNOUNCEMENTS SYSTEM (SBP → Students)
  // ============================================
  const addAnnouncement = async (announcement) => {
    // Try Supabase first
    if (useSupabase) {
      try {
        const { data, error } = await createSupabaseAnnouncement(announcement)
        if (!error && data) {
          const newAnnouncement = {
            id: data.id,
            title: data.title,
            content: data.content,
            category: data.category,
            pinned: data.pinned,
            published: data.published,
            createdAt: data.created_at,
          }
          setAnnouncements(prev => [newAnnouncement, ...prev])
          logActivity('CREATE_ANNOUNCEMENT', 'communication', `Created announcement: ${announcement.title}`, { announcementId: newAnnouncement.id })
          return newAnnouncement
        }
      } catch (e) {
        console.error('Supabase announcement creation failed:', e)
      }
    }

    // Fallback to localStorage
    const newAnnouncement = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...announcement,
      pinned: announcement.pinned || false,
      published: true,
    }
    setAnnouncements(prev => [newAnnouncement, ...prev])
    logActivity('CREATE_ANNOUNCEMENT', 'communication', `Created announcement: ${announcement.title}`, { announcementId: newAnnouncement.id })
    return newAnnouncement
  }

  const updateAnnouncement = async (id, updates) => {
    // Try Supabase first
    if (useSupabase) {
      try {
        await updateAnnouncementInSupabase(id, updates)
      } catch (e) {
        console.error('Supabase announcement update failed:', e)
      }
    }

    // Update local state
    setAnnouncements(prev => prev.map(a =>
      a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    ))
    logActivity('UPDATE_ANNOUNCEMENT', 'communication', `Updated announcement ID: ${id}`, { announcementId: id, updates })
  }

  const deleteAnnouncement = async (id) => {
    const announcement = announcements.find(a => a.id === id)

    // Try Supabase first
    if (useSupabase) {
      try {
        await deleteAnnouncementFromSupabase(id)
      } catch (e) {
        console.error('Supabase announcement deletion failed:', e)
      }
    }

    // Update local state
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    logActivity('DELETE_ANNOUNCEMENT', 'communication', `Deleted announcement: ${announcement?.title || id}`, { announcementId: id })
  }

  const pinAnnouncement = async (id, pinned) => {
    await updateAnnouncement(id, { pinned })
    logActivity('PIN_ANNOUNCEMENT', 'communication', `${pinned ? 'Pinned' : 'Unpinned'} announcement ID: ${id}`)
  }

  // ============================================
  // STUDENT FEEDBACK SYSTEM
  // ============================================
  const submitFeedback = async (feedbackData) => {
    // Try Supabase first
    if (useSupabase) {
      try {
        const { data, error } = await submitFeedbackToSupabase(feedbackData)
        if (!error && data) {
          const newFeedback = {
            id: data.id,
            message: data.message,
            email: data.email,
            category: data.category,
            status: data.status,
            submittedAt: data.submitted_at,
          }
          setFeedback(prev => [newFeedback, ...prev])
          setQuickStats(prev => ({ ...prev, feedbackReceived: prev.feedbackReceived + 1 }))
          logActivity('FEEDBACK_RECEIVED', 'engagement', `New feedback: ${feedbackData.category}`, { feedbackId: newFeedback.id })
          return newFeedback
        }
      } catch (e) {
        console.error('Supabase feedback submission failed, using localStorage:', e)
      }
    }

    // Fallback to localStorage
    const newFeedback = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      status: 'new',
      ...feedbackData,
    }
    setFeedback(prev => [newFeedback, ...prev])
    setQuickStats(prev => ({ ...prev, feedbackReceived: prev.feedbackReceived + 1 }))
    logActivity('FEEDBACK_RECEIVED', 'engagement', `New feedback: ${feedbackData.category}`, { feedbackId: newFeedback.id })
    return newFeedback
  }

  const updateFeedbackStatus = async (id, status, adminNote = '') => {
    // Try Supabase first
    if (useSupabase) {
      try {
        await updateSupabaseFeedback(id, { status, admin_note: adminNote })
      } catch (e) {
        console.error('Supabase feedback update failed:', e)
      }
    }

    // Update local state
    setFeedback(prev => prev.map(f =>
      f.id === id ? { ...f, status, adminNote, reviewedAt: new Date().toISOString() } : f
    ))
    logActivity('UPDATE_FEEDBACK', 'engagement', `Updated feedback status to: ${status}`, { feedbackId: id, status })
  }

  // ============================================
  // OPERATIONAL DATA MANAGEMENT
  // ============================================
  const updateOperational = (section, data) => {
    setOperationalData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
    logActivity('UPDATE_OPERATIONAL', 'operations', `Updated ${section} data`, { section })
  }

  // Tech Loaner Management
  const addTechDevice = (device) => {
    const newDevice = { ...device, id: Date.now(), createdAt: new Date().toISOString() }
    setOperationalData(prev => ({
      ...prev,
      techLoaners: {
        ...prev.techLoaners,
        devices: [...prev.techLoaners.devices, newDevice]
      }
    }))
    logActivity('ADD_DEVICE', 'tech-loaner', `Added device: ${device.name}`, { deviceId: newDevice.id })
  }

  const updateTechDevice = (deviceId, updates) => {
    setOperationalData(prev => ({
      ...prev,
      techLoaners: {
        ...prev.techLoaners,
        devices: prev.techLoaners.devices.map(d =>
          d.id === deviceId ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
        )
      }
    }))
    logActivity('UPDATE_DEVICE', 'tech-loaner', `Updated device ID: ${deviceId}`, { deviceId, updates })
  }

  const deleteTechDevice = (deviceId) => {
    const device = operationalData.techLoaners.devices.find(d => d.id === deviceId)
    setOperationalData(prev => ({
      ...prev,
      techLoaners: {
        ...prev.techLoaners,
        devices: prev.techLoaners.devices.filter(d => d.id !== deviceId)
      }
    }))
    logActivity('DELETE_DEVICE', 'tech-loaner', `Deleted device: ${device?.name || deviceId}`, { deviceId })
  }

  const addTechLoan = (loan) => {
    const newLoan = { ...loan, id: Date.now(), createdAt: new Date().toISOString(), status: 'active' }
    setOperationalData(prev => ({
      ...prev,
      techLoaners: {
        ...prev.techLoaners,
        loans: [...prev.techLoaners.loans, newLoan]
      }
    }))
    logActivity('CREATE_LOAN', 'tech-loaner', `New loan created for device: ${loan.deviceType}`, { loanId: newLoan.id })
  }

  const updateTechLoan = (loanId, updates) => {
    setOperationalData(prev => ({
      ...prev,
      techLoaners: {
        ...prev.techLoaners,
        loans: prev.techLoaners.loans.map(l =>
          l.id === loanId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        )
      }
    }))
    logActivity('UPDATE_LOAN', 'tech-loaner', `Updated loan ID: ${loanId}`, { loanId, updates })
  }

  // Food Pantry Management
  const updatePantryLocation = (locationId, updates) => {
    setOperationalData(prev => ({
      ...prev,
      foodPantry: {
        ...prev.foodPantry,
        locations: prev.foodPantry.locations.map(l =>
          l.id === locationId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        )
      }
    }))
    logActivity('UPDATE_PANTRY', 'food-pantry', `Updated pantry location ID: ${locationId}`, { locationId, updates })
  }

  const logPantryVisit = (locationId, count = 1) => {
    setOperationalData(prev => ({
      ...prev,
      foodPantry: {
        ...prev.foodPantry,
        totalVisits: prev.foodPantry.totalVisits + count,
        locations: prev.foodPantry.locations.map(l =>
          l.id === locationId ? { ...l, visits: (l.visits || 0) + count } : l
        )
      }
    }))
    logActivity('LOG_VISIT', 'food-pantry', `Logged ${count} visit(s) at location ${locationId}`, { locationId, count })
  }

  const logPantryDonation = (amount, donor = 'Anonymous') => {
    setOperationalData(prev => ({
      ...prev,
      foodPantry: {
        ...prev.foodPantry,
        donations: prev.foodPantry.donations + amount,
        donationLog: [...(prev.foodPantry.donationLog || []), {
          id: Date.now(),
          amount,
          donor,
          date: new Date().toISOString()
        }]
      }
    }))
    logActivity('LOG_DONATION', 'food-pantry', `Logged donation: $${amount} from ${donor}`, { amount, donor })
  }

  // Training Session Management
  const addTrainingSession = (type, session) => {
    const newSession = { ...session, id: Date.now(), createdAt: new Date().toISOString() }
    setOperationalData(prev => ({
      ...prev,
      trainings: {
        ...prev.trainings,
        [type]: {
          ...prev.trainings[type],
          sessions: [...prev.trainings[type].sessions, newSession]
        }
      }
    }))
    logActivity('ADD_TRAINING', 'training', `Added ${type} session: ${session.title || session.date}`, { type, sessionId: newSession.id })
  }

  const logTrainingAttendance = (type, sessionId, attendees) => {
    setOperationalData(prev => ({
      ...prev,
      trainings: {
        ...prev.trainings,
        [type]: {
          ...prev.trainings[type],
          totalTrained: prev.trainings[type].totalTrained + attendees,
          sessions: prev.trainings[type].sessions.map(s =>
            s.id === sessionId ? { ...s, attendees: (s.attendees || 0) + attendees } : s
          )
        }
      }
    }))
    logActivity('LOG_ATTENDANCE', 'training', `Logged ${attendees} attendees for ${type}`, { type, sessionId, attendees })
  }

  // Event Management
  const addEvent = (eventType, event) => {
    const newEvent = { ...event, id: Date.now(), createdAt: new Date().toISOString() }
    setOperationalData(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [eventType]: [...(prev.events[eventType] || []), newEvent]
      }
    }))
    logActivity('ADD_EVENT', 'events', `Added ${eventType}: ${event.title}`, { eventType, eventId: newEvent.id })
  }

  const updateEvent = (eventType, eventId, updates) => {
    setOperationalData(prev => ({
      ...prev,
      events: {
        ...prev.events,
        [eventType]: prev.events[eventType].map(e =>
          e.id === eventId ? { ...e, ...updates } : e
        )
      }
    }))
    logActivity('UPDATE_EVENT', 'events', `Updated ${eventType} ID: ${eventId}`, { eventType, eventId, updates })
  }

  // Petition/Advocacy Management
  const updatePetitionSignatures = (petitionKey, count) => {
    setOperationalData(prev => ({
      ...prev,
      advocacy: {
        ...prev.advocacy,
        [petitionKey]: {
          ...prev.advocacy[petitionKey],
          signatures: count,
          lastUpdated: new Date().toISOString()
        }
      }
    }))
    logActivity('UPDATE_PETITION', 'advocacy', `Updated ${petitionKey} signatures to ${count}`, { petitionKey, count })
  }

  // ============================================
  // BUDGET MANAGEMENT
  // ============================================
  const updateBudget = (updates) => {
    setBudgetData(prev => ({ ...prev, ...updates, lastUpdated: new Date().toISOString() }))
    logActivity('UPDATE_BUDGET', 'budget', 'Updated overall budget', { updates })
  }

  const updateBudgetCategory = (categoryName, updates) => {
    setBudgetData(prev => ({
      ...prev,
      categories: prev.categories.map(c =>
        c.name === categoryName ? { ...c, ...updates } : c
      ),
      lastUpdated: new Date().toISOString()
    }))
    logActivity('UPDATE_BUDGET_CATEGORY', 'budget', `Updated category: ${categoryName}`, { categoryName, updates })
  }

  const addBudgetTransaction = (transaction) => {
    const newTransaction = { ...transaction, id: Date.now(), date: new Date().toISOString() }
    setBudgetData(prev => ({
      ...prev,
      transactions: [...(prev.transactions || []), newTransaction],
      spent: prev.spent + (transaction.type === 'expense' ? transaction.amount : 0),
      lastUpdated: new Date().toISOString()
    }))
    logActivity('ADD_TRANSACTION', 'budget', `${transaction.type}: $${transaction.amount} - ${transaction.description}`, { transactionId: newTransaction.id })
  }

  // ============================================
  // LINE-ITEM FUNDING TRACKER
  // ============================================
  const addLineItem = (lineItem) => {
    const newItem = {
      ...lineItem,
      id: Date.now(),
      spent: 0,
      status: 'pending',
      semester: budgetData.semester || 'Spring 2026',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setBudgetData(prev => ({
      ...prev,
      lineItems: [...(prev.lineItems || []), newItem],
      lastUpdated: new Date().toISOString()
    }))
    logActivity('ADD_LINE_ITEM', 'budget', `Added line item: ${lineItem.orgName} - ${lineItem.category} ($${lineItem.requested})`, { lineItemId: newItem.id })
    return newItem
  }

  const updateLineItem = (id, updates) => {
    setBudgetData(prev => ({
      ...prev,
      lineItems: (prev.lineItems || []).map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      ),
      lastUpdated: new Date().toISOString()
    }))
    logActivity('UPDATE_LINE_ITEM', 'budget', `Updated line item ID: ${id}`, { lineItemId: id, updates })
  }

  const deleteLineItem = (id) => {
    const item = (budgetData.lineItems || []).find(i => i.id === id)
    setBudgetData(prev => ({
      ...prev,
      lineItems: (prev.lineItems || []).filter(i => i.id !== id),
      lastUpdated: new Date().toISOString()
    }))
    logActivity('DELETE_LINE_ITEM', 'budget', `Deleted line item: ${item?.orgName || id}`, { lineItemId: id })
  }

  // ============================================
  // AI-ASSISTED FUNDING REQUEST SYSTEM
  // ============================================

  // Check rate limit (10 requests per org per week)
  const checkRateLimit = (orgName) => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0]
    const limits = budgetData.requestRateLimits || {}
    const orgLimits = limits[orgName] || {}
    const weekCount = orgLimits[weekStart] || 0
    return weekCount < 10
  }

  const incrementRateLimit = (orgName) => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0]
    setBudgetData(prev => {
      const limits = { ...(prev.requestRateLimits || {}) }
      limits[orgName] = { ...(limits[orgName] || {}), [weekStart]: ((limits[orgName] || {})[weekStart] || 0) + 1 }
      return { ...prev, requestRateLimits: limits }
    })
  }

  // AI Scoring function (rule-based MVP)
  const calculateAIScore = (request) => {
    let score = 50 // Base score
    const reasons = []

    // Urgency boost (crisis/wellness = high priority)
    if (request.urgency === 'high' || request.priority === 'Student Wellness' || request.priority === 'Crisis Response') {
      score += 25
      reasons.push('High urgency/wellness priority')
    }

    // Alignment with SG priorities
    if (sgPriorities.includes(request.priority)) {
      score += 15
      reasons.push('Aligns with SG priorities')
    }

    // Budget availability check
    const categoryData = (budgetData.categories || []).find(c =>
      c.name.toLowerCase().includes(request.category?.toLowerCase() || '')
    )
    if (categoryData && (categoryData.allocated - categoryData.spent) >= request.amount) {
      score += 10
      reasons.push('Budget available')
    } else {
      score -= 10
      reasons.push('Limited budget availability')
    }

    // Impact justification quality (simple word count heuristic)
    const justificationWords = (request.impactJustification || '').split(' ').filter(w => w.length > 0).length
    if (justificationWords >= 20) {
      score += 10
      reasons.push('Detailed impact justification')
    } else if (justificationWords < 10) {
      score -= 5
      reasons.push('Weak impact justification')
    }

    // Duplicate check (same org, similar amount, same category in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const recentDuplicates = (budgetData.fundingRequests || []).filter(r =>
      r.orgName === request.orgName &&
      r.category === request.category &&
      Math.abs(r.amount - request.amount) < request.amount * 0.2 &&
      r.submittedAt > thirtyDaysAgo &&
      r.status !== 'denied'
    )
    if (recentDuplicates.length > 0) {
      score -= 20
      reasons.push('Potential duplicate request')
    }

    // Generate recommendation
    let recommendation = ''
    if (score >= 80) {
      recommendation = 'Approve — high impact'
    } else if (score >= 60) {
      recommendation = 'Approve — moderate impact'
    } else if (score >= 40) {
      recommendation = 'Review — needs clarification'
    } else if (recentDuplicates.length > 0) {
      recommendation = 'Deny — duplicate request'
    } else {
      recommendation = 'Deny — low priority or insufficient justification'
    }

    // Check for reallocation opportunity
    const unusedCategories = (budgetData.categories || []).filter(c =>
      c.allocated > 0 && (c.spent / c.allocated) < 0.3
    )
    if (unusedCategories.length > 0 && score >= 40) {
      recommendation = `Reallocate from unused funds (${unusedCategories[0].name})`
    }

    return { score: Math.min(100, Math.max(0, score)), recommendation, reasons }
  }

  const submitFundingRequest = (request) => {
    // Check rate limit
    if (!checkRateLimit(request.orgName)) {
      return { success: false, error: 'Rate limit exceeded. Maximum 10 requests per organization per week.' }
    }

    // Calculate AI score
    const { score, recommendation, reasons } = calculateAIScore(request)

    const newRequest = {
      ...request,
      id: Date.now(),
      aiScore: score,
      aiRecommendation: recommendation,
      aiReasons: reasons,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewerNote: ''
    }

    setBudgetData(prev => ({
      ...prev,
      fundingRequests: [...(prev.fundingRequests || []), newRequest],
      lastUpdated: new Date().toISOString()
    }))

    incrementRateLimit(request.orgName)
    logActivity('SUBMIT_FUNDING_REQUEST', 'budget', `New funding request: ${request.orgName} - $${request.amount} (AI Score: ${score})`, { requestId: newRequest.id, aiScore: score })
    return { success: true, request: newRequest }
  }

  const reviewFundingRequest = (id, decision, reviewerNote = '') => {
    const request = (budgetData.fundingRequests || []).find(r => r.id === id)
    if (!request) return

    const processingTime = (Date.now() - new Date(request.submittedAt).getTime()) / (1000 * 60 * 60) // hours

    setBudgetData(prev => {
      const updatedRequests = (prev.fundingRequests || []).map(r =>
        r.id === id ? { ...r, status: decision, reviewerNote, reviewedAt: new Date().toISOString() } : r
      )

      // Update waste metrics
      const withinDay = processingTime <= 24 ? 1 : 0
      const wasteMetrics = { ...(prev.wasteMetrics || {}) }
      wasteMetrics.requestsProcessedWithinDay = (wasteMetrics.requestsProcessedWithinDay || 0) + withinDay

      // Calculate average processing time
      const processedRequests = updatedRequests.filter(r => r.reviewedAt)
      if (processedRequests.length > 0) {
        const totalTime = processedRequests.reduce((sum, r) => {
          return sum + (new Date(r.reviewedAt).getTime() - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60)
        }, 0)
        wasteMetrics.averageProcessingTime = Math.round(totalTime / processedRequests.length * 10) / 10
      }

      // Track duplicate prevention
      if (decision === 'denied' && request.aiReasons?.includes('Potential duplicate request')) {
        wasteMetrics.duplicateRequestsPrevented = (wasteMetrics.duplicateRequestsPrevented || 0) + 1
        wasteMetrics.costSavingsFromAI = (wasteMetrics.costSavingsFromAI || 0) + request.amount
      }

      return { ...prev, fundingRequests: updatedRequests, wasteMetrics, lastUpdated: new Date().toISOString() }
    })

    // If approved, create a line item
    if (decision === 'approved') {
      addLineItem({
        orgName: request.orgName,
        category: request.category,
        requested: request.amount,
        approved: request.amount,
        impactNotes: request.impactJustification
      })
    }

    logActivity('REVIEW_FUNDING_REQUEST', 'budget', `${decision.toUpperCase()} funding request: ${request.orgName} - $${request.amount}`, { requestId: id, decision, processingTime: Math.round(processingTime * 10) / 10 })
  }

  // ============================================
  // REALLOCATION SUGGESTION ENGINE
  // ============================================
  const scanForReallocations = () => {
    const suggestions = []
    const categories = budgetData.categories || []
    const lineItems = budgetData.lineItems || []

    // Find categories with >30% remaining (underutilized)
    const underutilized = categories.filter(c =>
      c.allocated > 0 && ((c.allocated - c.spent) / c.allocated) > 0.3
    )

    // Find categories with high demand (>70% spent)
    const highDemand = categories.filter(c =>
      c.allocated > 0 && (c.spent / c.allocated) > 0.7
    )

    // Find line items with unused funds
    const unusedLineItems = lineItems.filter(item =>
      item.status === 'approved' && item.approved > 0 &&
      ((item.approved - (item.spent || 0)) / item.approved) > 0.5
    )

    // Generate suggestions
    underutilized.forEach(fromCat => {
      highDemand.forEach(toCat => {
        if (fromCat.name !== toCat.name) {
          const availableAmount = Math.round((fromCat.allocated - fromCat.spent) * 0.5) // Suggest moving 50% of unused
          if (availableAmount >= 100) { // Only suggest if >= $100
            suggestions.push({
              id: Date.now() + Math.random(),
              type: 'category',
              fromCategory: fromCat.name,
              toCategory: toCat.name,
              amount: availableAmount,
              reason: `${fromCat.name} has ${Math.round((1 - fromCat.spent / fromCat.allocated) * 100)}% unused. ${toCat.name} is at ${Math.round(toCat.spent / toCat.allocated * 100)}% utilization.`,
              status: 'pending',
              createdAt: new Date().toISOString()
            })
          }
        }
      })
    })

    // Add line-item level suggestions
    unusedLineItems.forEach(item => {
      const unusedAmount = item.approved - (item.spent || 0)
      if (unusedAmount >= 50) {
        suggestions.push({
          id: Date.now() + Math.random(),
          type: 'line-item',
          fromOrg: item.orgName,
          fromCategory: item.category,
          amount: Math.round(unusedAmount * 0.7), // Suggest reallocating 70%
          reason: `${item.orgName} has $${unusedAmount} unused in ${item.category}`,
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      }
    })

    // Store suggestions
    setBudgetData(prev => ({
      ...prev,
      reallocationSuggestions: suggestions,
      lastUpdated: new Date().toISOString()
    }))

    logActivity('SCAN_REALLOCATIONS', 'budget', `Generated ${suggestions.length} reallocation suggestions`, { count: suggestions.length })
    return suggestions
  }

  const reviewReallocation = (id, decision, note = '') => {
    const suggestion = (budgetData.reallocationSuggestions || []).find(s => s.id === id)
    if (!suggestion) return

    setBudgetData(prev => {
      const updated = {
        ...prev,
        reallocationSuggestions: (prev.reallocationSuggestions || []).map(s =>
          s.id === id ? { ...s, status: decision, reviewerNote: note, reviewedAt: new Date().toISOString() } : s
        ),
        lastUpdated: new Date().toISOString()
      }

      if (decision === 'approved') {
        // Add to approved reallocations for public display
        updated.approvedReallocations = [...(prev.approvedReallocations || []), {
          ...suggestion,
          status: 'approved',
          reviewerNote: note,
          reviewedAt: new Date().toISOString()
        }]

        // Update waste metrics
        updated.wasteMetrics = {
          ...(prev.wasteMetrics || {}),
          totalReallocated: (prev.wasteMetrics?.totalReallocated || 0) + suggestion.amount,
          unusedFundsRecovered: (prev.wasteMetrics?.unusedFundsRecovered || 0) + suggestion.amount
        }
      }

      return updated
    })

    logActivity('REVIEW_REALLOCATION', 'budget', `${decision.toUpperCase()} reallocation: $${suggestion.amount} from ${suggestion.fromCategory || suggestion.fromOrg}`, { suggestionId: id, decision, amount: suggestion.amount })
  }

  // ============================================
  // BUDGET TRANSPARENCY & EXPORT
  // ============================================
  const exportBudgetCSV = () => {
    const lineItems = budgetData.lineItems || []
    if (lineItems.length === 0) {
      return 'Organization,Category,Requested,Approved,Spent,Status,Impact Notes,Semester\nNo data available'
    }

    const headers = ['Organization', 'Category', 'Requested', 'Approved', 'Spent', 'Status', 'Impact Notes', 'Semester', 'Receipts Link']
    const rows = lineItems.map(item => [
      item.orgName || '',
      item.category || '',
      item.requested || 0,
      item.approved || 0,
      item.spent || 0,
      item.status || '',
      (item.impactNotes || '').replace(/,/g, ';').replace(/\n/g, ' '),
      item.semester || '',
      item.receiptsLink || ''
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    logActivity('EXPORT_BUDGET_CSV', 'budget', `Exported ${lineItems.length} line items to CSV`, { count: lineItems.length })
    return csv
  }

  const getBudgetSummaryStats = () => {
    const lineItems = budgetData.lineItems || []
    const categories = budgetData.categories || []
    const wasteMetrics = budgetData.wasteMetrics || {}

    // Calculate category-level stats
    const categoryStats = {}
    budgetCategories.forEach(cat => {
      const items = lineItems.filter(i => i.category === cat)
      categoryStats[cat] = {
        totalRequested: items.reduce((s, i) => s + (i.requested || 0), 0),
        totalApproved: items.reduce((s, i) => s + (i.approved || 0), 0),
        totalSpent: items.reduce((s, i) => s + (i.spent || 0), 0),
        itemCount: items.length
      }
    })

    // Overall stats
    const totalRequested = lineItems.reduce((s, i) => s + (i.requested || 0), 0)
    const totalApproved = lineItems.reduce((s, i) => s + (i.approved || 0), 0)
    const totalSpent = lineItems.reduce((s, i) => s + (i.spent || 0), 0)
    const utilizationRate = totalApproved > 0 ? Math.round((totalSpent / totalApproved) * 100) : 0

    return {
      totalRequested,
      totalApproved,
      totalSpent,
      utilizationRate,
      categoryStats,
      wasteReduction: {
        reallocatedFunds: wasteMetrics.totalReallocated || 0,
        unusedRecovered: wasteMetrics.unusedFundsRecovered || 0,
        duplicatesPrevented: wasteMetrics.duplicateRequestsPrevented || 0,
        aiSavings: wasteMetrics.costSavingsFromAI || 0,
        avgProcessingHours: wasteMetrics.averageProcessingTime || 0,
        fastProcessed: wasteMetrics.requestsProcessedWithinDay || 0
      },
      orgCount: [...new Set(lineItems.map(i => i.orgName))].length,
      pendingRequests: (budgetData.fundingRequests || []).filter(r => r.status === 'pending').length
    }
  }

  // ============================================
  // QUICK STATS MANAGEMENT
  // ============================================
  const updateQuickStats = (updates) => {
    setQuickStats(prev => ({ ...prev, ...updates }))
    logActivity('UPDATE_STATS', 'analytics', 'Updated quick stats', { updates })
  }

  // ============================================
  // DATA EXPORT/IMPORT
  // ============================================
  const exportAllData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      policies,
      operationalData,
      budgetData,
      announcements,
      feedback,
      quickStats,
      activityLog: activityLog.slice(0, 100), // Only last 100 entries
    }
    logActivity('EXPORT_DATA', 'system', 'Exported all platform data')
    return data
  }

  const importData = (data) => {
    try {
      if (data.policies) setPolicies(data.policies)
      if (data.operationalData) setOperationalData(data.operationalData)
      if (data.budgetData) setBudgetData(data.budgetData)
      if (data.announcements) setAnnouncements(data.announcements)
      if (data.feedback) setFeedback(data.feedback)
      if (data.quickStats) setQuickStats(data.quickStats)
      logActivity('IMPORT_DATA', 'system', 'Imported platform data', { importedAt: data.exportedAt })
      return { success: true }
    } catch (e) {
      logActivity('IMPORT_FAILED', 'system', 'Failed to import data', { error: e.message })
      return { success: false, error: e.message }
    }
  }

  // ============================================
  // RESET FUNCTIONS
  // ============================================
  const resetAllData = () => {
    setPolicies(initialPolicies)
    setOperationalData(initialOperationalData)
    setBudgetData(initialBudgetData)
    setAnnouncements(initialAnnouncements)
    setFeedback(initialFeedback)
    setQuickStats(initialQuickStats)
    // Keep activity log to track the reset
    logActivity('RESET_ALL', 'system', 'Reset all platform data to initial state')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('projectbold_policies')
      localStorage.removeItem('projectbold_operational')
      localStorage.removeItem('projectbold_budget')
      localStorage.removeItem('projectbold_announcements')
      localStorage.removeItem('projectbold_feedback')
      localStorage.removeItem('projectbold_quickstats')
    }
  }

  const clearActivityLog = () => {
    setActivityLog([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('projectbold_activity')
    }
  }

  return (
    <AppContext.Provider value={{
      // State
      isAdmin,
      isLoaded,
      dataSource, // 'localStorage' or 'supabase'
      policies,
      operationalData,
      budgetData,
      announcements,
      activityLog,
      feedback,
      quickStats,

      // Auth
      loginAdmin,
      logoutAdmin,

      // Policy Management
      updatePolicy,
      updatePolicyMetrics,
      logPolicyProgress,
      batchUpdatePolicies,

      // Announcements (SBP → Students)
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      pinAnnouncement,

      // Student Feedback
      submitFeedback,
      updateFeedbackStatus,

      // Operational Data
      updateOperational,
      addTechDevice,
      updateTechDevice,
      deleteTechDevice,
      addTechLoan,
      updateTechLoan,
      updatePantryLocation,
      logPantryVisit,
      logPantryDonation,
      addTrainingSession,
      logTrainingAttendance,
      addEvent,
      updateEvent,
      updatePetitionSignatures,

      // Budget
      updateBudget,
      updateBudgetCategory,
      addBudgetTransaction,

      // Line-Item Tracker
      addLineItem,
      updateLineItem,
      deleteLineItem,

      // Funding Requests (AI-Assisted)
      submitFundingRequest,
      reviewFundingRequest,
      checkRateLimit,

      // Reallocation Engine
      scanForReallocations,
      reviewReallocation,

      // Budget Transparency
      exportBudgetCSV,
      getBudgetSummaryStats,

      // Quick Stats
      updateQuickStats,

      // Data Management
      exportAllData,
      importData,
      resetAllData,
      clearActivityLog,

      // Activity Logging
      logActivity,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
