import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { initialPolicies, initialOperationalData, initialBudgetData } from './data'
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
  getPolicies as getSupabasePolicies,
  getBudget as getSupabaseBudget,
  getTransactions as getSupabaseTransactions,
  getQuickStats as getSupabaseQuickStats,
  getTechDevices as getSupabaseTechDevices,
  getTechLoans as getSupabaseTechLoans,
  getPantryLocations as getSupabasePantryLocations,
  getPantryStats as getSupabasePantryStats,
  getFundingRequests as getSupabaseFundingRequests,
  submitFundingRequestToSupabase,
  updateFundingRequestInSupabase,
} from './supabase'
import {
  createSessionHash,
  storeSession,
  validateSession,
  clearSession,
  extendSession,
  checkRateLimit,
  sanitizeText,
  sanitizeObject,
} from './security'
import { setAdminToken, clearAdminToken } from './adminSession'

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

// Universal site content - stores overrides for ANY text on the site
// Key format: "page.section.element" (e.g., "wellness.hero.title")
const initialSiteContent = {}

// Initial page content - editable static content for department pages
const initialPageContent = {
  wellness: {
    // CAPS Drop-In Locations
    capsLocations: [
      { id: 1, name: 'CAPS Main Office', location: 'Campus Health Building', hours: 'Mon-Wed 2-4pm', status: 'active' },
      { id: 2, name: 'Student Union', location: 'Room 3205', hours: 'Tue-Thu 1-3pm', status: 'active' },
      { id: 3, name: 'South Campus Hub', location: 'Ram Village Community Center', hours: 'Wed-Fri 3-5pm', status: 'coming' },
    ],
    // Plan B & Narcan Distribution Locations
    distributionLocations: [
      { id: 1, name: 'Campus Health', address: 'James A. Taylor Building', planb: true, narcan: true, hours: 'M-F 8am-5pm' },
      { id: 2, name: 'Student Union', address: 'Room 1301 (Info Desk)', planb: true, narcan: true, hours: 'Daily 8am-10pm' },
      { id: 3, name: 'Hinton James', address: 'Front Desk', planb: false, narcan: true, hours: '24/7' },
      { id: 4, name: 'Granville Towers', address: 'RA Office', planb: false, narcan: true, hours: '24/7' },
      { id: 5, name: 'Morrison Residence', address: 'Community Office', planb: false, narcan: true, hours: 'M-F 9am-5pm' },
      { id: 6, name: 'Rams Head', address: 'Recreation Desk', planb: true, narcan: true, hours: 'Daily 6am-11pm' },
    ],
    // About Sections
    aboutPlanB: {
      title: 'About Plan B',
      description: 'Plan B (levonorgestrel) is emergency contraception that can prevent pregnancy when taken within 72 hours of unprotected sex. It\'s most effective when taken as soon as possible.',
      bullets: [
        'Available free to all UNC students',
        'No appointment or ID needed at most locations',
        'Confidential - no questions asked',
      ],
    },
    aboutNarcan: {
      title: 'About Narcan (Naloxone)',
      description: 'Narcan is a life-saving medication that can reverse an opioid overdose. It\'s safe, easy to use, and can be the difference between life and death.',
      bullets: [
        'Free training available monthly',
        'Nasal spray - no needles required',
        'Good Samaritan law protects you',
      ],
    },
    // Ride Stats
    rideStats: {
      ridesGiven: 247,
      volunteers: 32,
      avgRating: 4.9,
    },
    // Crisis Hotlines
    crisisHotlines: {
      national: '988',
      textLine: '741741',
      caps: '919-966-3658',
    },
  },
  basicNeeds: {
    // Food Pantry Locations
    pantryLocations: [],
    // Tech Loaner Info
    techLoanerInfo: {},
  },
  academic: {
    // Tutoring Locations
    tutoringLocations: [],
    // Study Spaces
    studySpaces: [],
  },
}

export function AppProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [policies, setPolicies] = useState(initialPolicies)
  const [operationalData, setOperationalData] = useState(initialOperationalData)
  const [budgetData, setBudgetData] = useState(initialBudgetData)
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [activityLog, setActivityLog] = useState(initialActivityLog)
  const [feedback, setFeedback] = useState(initialFeedback)
  const [quickStats, setQuickStats] = useState(initialQuickStats)
  const [pageContent, setPageContent] = useState(initialPageContent)
  const [siteContent, setSiteContent] = useState(initialSiteContent)
  const [isLoaded, setIsLoaded] = useState(false)

  // Budget Enhancement State
  const [budgetLineItems, setBudgetLineItems] = useState([])
  const [fundingRequests, setFundingRequests] = useState([])
  const [reallocations, setReallocations] = useState([])

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

          // Load feedback from Supabase (continue on error — tables may not exist yet)
          try {
            const { data: supabaseFeedback } = await getSupabaseFeedback()
            if (Array.isArray(supabaseFeedback) && supabaseFeedback.length) {
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
          } catch (e) { console.warn('Supabase feedback load failed:', e) }

          // Load activity log from Supabase
          try {
            const { data: supabaseActivity } = await getSupabaseActivityLog()
            if (Array.isArray(supabaseActivity) && supabaseActivity.length) {
              setActivityLog(supabaseActivity.map(a => ({
                id: a.id,
                action: a.action,
                category: a.category,
                details: a.details,
                metadata: a.metadata,
                timestamp: a.timestamp,
              })))
            }
          } catch (e) { console.warn('Supabase activity load failed:', e) }

          // Load announcements from Supabase
          try {
            const { data: supabaseAnnouncements } = await getSupabaseAnnouncements()
            if (Array.isArray(supabaseAnnouncements) && supabaseAnnouncements.length) {
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
          } catch (e) { console.warn('Supabase announcements load failed:', e) }

          // Load policies from Supabase
          try {
            const { data: supabasePolicies } = await getSupabasePolicies()
            if (Array.isArray(supabasePolicies) && supabasePolicies.length) {
              setPolicies(supabasePolicies.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                department: p.department,
                status: p.status,
                progress: p.progress,
                priority: p.priority,
                metrics: p.metrics || {},
                lastUpdated: p.last_updated,
                createdAt: p.created_at,
              })))
            }
          } catch (e) { console.warn('Supabase policies load failed:', e) }

          // Load budget from Supabase
          try {
            const { data: supabaseBudget } = await getSupabaseBudget()
            if (supabaseBudget) {
              setBudgetData({
                total: parseFloat(supabaseBudget.total) || 0,
                allocated: parseFloat(supabaseBudget.allocated) || 0,
                spent: parseFloat(supabaseBudget.spent) || 0,
                categories: supabaseBudget.categories || [],
                lastUpdated: supabaseBudget.last_updated,
              })
            }
          } catch (e) { console.warn('Supabase budget load failed:', e) }

          // Load quick stats from Supabase
          try {
            const { data: supabaseStats } = await getSupabaseQuickStats()
            if (supabaseStats) {
              setQuickStats({
                totalStudentsReached: supabaseStats.total_students_reached || 0,
                activeInitiatives: supabaseStats.active_initiatives || 0,
                eventsThisMonth: supabaseStats.events_this_month || 0,
                feedbackReceived: supabaseStats.feedback_received || 0,
              })
            }
          } catch (e) { console.warn('Supabase quick stats load failed:', e) }

          // Load funding requests from Supabase
          try {
            const { data: supabaseFunding } = await getSupabaseFundingRequests()
            if (Array.isArray(supabaseFunding) && supabaseFunding.length) {
              setFundingRequests(supabaseFunding.map(r => ({
                id: r.id,
                orgName: r.org_name,
                category: r.category,
                amount: parseFloat(r.amount),
                description: r.description,
                justification: r.justification,
                studentsImpacted: r.students_impacted,
                contactEmail: r.contact_email,
                status: r.status,
                approvedAmount: r.approved_amount ? parseFloat(r.approved_amount) : null,
                reviewerNotes: r.reviewer_notes,
                contextCheck: r.context_check || {},
                amendment: r.amendment,
                amendmentHistory: r.amendment_history || [],
                submittedAt: r.submitted_at,
                reviewedAt: r.reviewed_at,
              })))
            }
          } catch (e) { console.warn('Supabase funding requests load failed:', e) }

          // Load tech devices into operational data
          try {
            const { data: devices } = await getSupabaseTechDevices()
            const { data: loans } = await getSupabaseTechLoans()
            if (Array.isArray(devices) && devices.length) {
              setOperationalData(prev => ({
                ...prev,
                techLoaners: {
                  ...prev.techLoaners,
                  devices: devices.map(d => ({
                    id: d.id,
                    type: d.type,
                    name: d.name,
                    total: d.total,
                    available: d.available,
                    onLoan: d.on_loan,
                    createdAt: d.created_at,
                  })),
                  loans: Array.isArray(loans) ? loans.map(l => ({
                    id: l.id,
                    studentName: l.student_name,
                    studentEmail: l.student_email,
                    deviceType: l.device_type,
                    dueDate: l.due_date,
                    status: l.status,
                    createdAt: l.created_at,
                  })) : prev.techLoaners?.loans || [],
                }
              }))
            }
          } catch (e) { console.warn('Supabase tech devices load failed:', e) }

          // Load pantry data into operational data
          try {
            const { data: locations } = await getSupabasePantryLocations()
            const { data: pantryStats } = await getSupabasePantryStats()
            if (Array.isArray(locations) && locations.length) {
              setOperationalData(prev => ({
                ...prev,
                foodPantry: {
                  ...prev.foodPantry,
                  locations: locations.map(l => ({
                    id: l.id,
                    name: l.name,
                    hours: l.hours,
                    visits: l.visits,
                    inventory: l.inventory,
                    updatedAt: l.updated_at,
                  })),
                  totalVisits: pantryStats?.total_visits || prev.foodPantry?.totalVisits || 0,
                  donations: pantryStats?.donations ? parseFloat(pantryStats.donations) : prev.foodPantry?.donations || 0,
                }
              }))
            }
          } catch (e) { console.warn('Supabase pantry load failed:', e) }

          // Load remaining data from localStorage (page content, site content, line items, etc.)
          const savedPageContent = localStorage.getItem('projectbold_pagecontent')
          if (savedPageContent) setPageContent(JSON.parse(savedPageContent))

          const savedSiteContent = localStorage.getItem('projectbold_sitecontent')
          if (savedSiteContent) setSiteContent(JSON.parse(savedSiteContent))

          const savedLineItems = localStorage.getItem('projectbold_lineitems')
          if (savedLineItems) setBudgetLineItems(JSON.parse(savedLineItems))

          const savedReallocations = localStorage.getItem('projectbold_reallocations')
          if (savedReallocations) setReallocations(JSON.parse(savedReallocations))

        } catch (e) {
          console.error('Error loading from Supabase, falling back to localStorage:', e)
          setDataSource('localStorage')
        }
      } else {
        setDataSource('localStorage')
      }

      // Load from localStorage (fallback or if Supabase not configured)
      try {
        // Validate session instead of just checking localStorage
        // This ensures sessions expire properly
        if (validateSession()) {
          setIsAdmin(true)
        } else {
          // Clear stale admin state
          localStorage.removeItem('projectbold_admin')
        }

        // Only load from localStorage if not using Supabase or as fallback
        if (!useSupabase || dataSource === 'localStorage') {
          const savedPolicies = localStorage.getItem('projectbold_policies')
          const savedOperational = localStorage.getItem('projectbold_operational')
          const savedBudget = localStorage.getItem('projectbold_budget')
          const savedAnnouncements = localStorage.getItem('projectbold_announcements')
          const savedActivityLog = localStorage.getItem('projectbold_activity')
          const savedFeedback = localStorage.getItem('projectbold_feedback')
          const savedQuickStats = localStorage.getItem('projectbold_quickstats')
          const savedPageContent = localStorage.getItem('projectbold_pagecontent')
          const savedSiteContent = localStorage.getItem('projectbold_sitecontent')
          const savedLineItems = localStorage.getItem('projectbold_lineitems')
          const savedFundingRequests = localStorage.getItem('projectbold_fundingrequests')
          const savedReallocations = localStorage.getItem('projectbold_reallocations')

          if (savedPolicies) setPolicies(JSON.parse(savedPolicies))
          if (savedOperational) setOperationalData(JSON.parse(savedOperational))
          if (savedBudget) setBudgetData(JSON.parse(savedBudget))
          if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements))
          if (savedActivityLog) setActivityLog(JSON.parse(savedActivityLog))
          if (savedFeedback) setFeedback(JSON.parse(savedFeedback))
          if (savedQuickStats) setQuickStats(JSON.parse(savedQuickStats))
          if (savedPageContent) setPageContent(JSON.parse(savedPageContent))
          if (savedSiteContent) setSiteContent(JSON.parse(savedSiteContent))
          if (savedLineItems) setBudgetLineItems(JSON.parse(savedLineItems))
          if (savedFundingRequests) setFundingRequests(JSON.parse(savedFundingRequests))
          if (savedReallocations) setReallocations(JSON.parse(savedReallocations))
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

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_pagecontent', JSON.stringify(pageContent))
    }
  }, [pageContent, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_sitecontent', JSON.stringify(siteContent))
    }
  }, [siteContent, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_lineitems', JSON.stringify(budgetLineItems))
    }
  }, [budgetLineItems, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_fundingrequests', JSON.stringify(fundingRequests))
    }
  }, [fundingRequests, isLoaded])

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('projectbold_reallocations', JSON.stringify(reallocations))
    }
  }, [reallocations, isLoaded])

  // ============================================
  // ADMIN AUTHENTICATION (Secure)
  // ============================================
  const loginAdmin = async (key) => {
    // Client-side rate limit (server also enforces its own)
    const rateLimitResult = checkRateLimit('admin_login', { maxAttempts: 5, windowMs: 15 * 60 * 1000 })
    if (!rateLimitResult.allowed) {
      logActivity('LOGIN_RATE_LIMITED', 'auth', `Login rate limited. Try again in ${rateLimitResult.resetIn}s`)
      return { success: false, error: `Too many login attempts. Please wait ${rateLimitResult.resetIn} seconds.` }
    }

    // Validate key server-side (never compare on client)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
      })

      if (res.ok) {
        setIsAdmin(true)

        // Store the entered key for use in admin API calls
        setAdminToken(key)

        // Create secure session
        if (typeof window !== 'undefined') {
          const session = createSessionHash(key)
          storeSession(session)
        }

        logActivity('LOGIN', 'auth', 'Admin logged in')
        return { success: true }
      }

      logActivity('LOGIN_FAILED', 'auth', 'Failed login attempt')
      return { success: false, error: 'Invalid admin key' }
    } catch {
      return { success: false, error: 'Login failed. Check your connection.' }
    }
  }

  const tempLoginAdmin = () => {
    setIsAdmin(true)
    if (typeof window !== 'undefined') {
      setAdminToken('dev-only-change-in-production')
      const session = createSessionHash('temp-access')
      storeSession(session)
    }
    logActivity('TEMP_LOGIN', 'auth', 'Admin logged in via temp access')
    return { success: true }
  }

  const logoutAdmin = () => {
    logActivity('LOGOUT', 'auth', 'Admin logged out')
    setIsAdmin(false)
    setEditMode(false)

    // Clear secure session and admin token
    if (typeof window !== 'undefined') {
      clearSession()
      clearAdminToken()
      localStorage.removeItem('projectbold_admin')
    }
  }

  // Extend session on activity (call this periodically)
  const refreshSession = useCallback(() => {
    if (isAdmin && typeof window !== 'undefined') {
      extendSession()
    }
  }, [isAdmin])

  const toggleEditMode = () => {
    if (!isAdmin) return
    setEditMode(prev => !prev)
    logActivity('TOGGLE_EDIT_MODE', 'system', editMode ? 'Disabled edit mode' : 'Enabled edit mode')
  }

  // ============================================
  // POLICY MANAGEMENT
  // ============================================
  const addPolicy = (policyData) => {
    const newPolicy = {
      id: policyData.id || `policy-${Date.now()}`,
      department: policyData.department || 'wellness',
      title: policyData.title || 'New Policy',
      description: policyData.description || '',
      status: policyData.status || 'planned',
      priority: policyData.priority || 'medium',
      progress: policyData.progress || 0,
      milestones: policyData.milestones || [],
      digitalFeatures: policyData.digitalFeatures || [],
      metrics: policyData.metrics || {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }
    setPolicies(prev => [...prev, newPolicy])
    logActivity('CREATE_POLICY', newPolicy.department, `Created new policy: ${newPolicy.title}`, { policyId: newPolicy.id })
    return newPolicy
  }

  const deletePolicy = (policyId) => {
    const policy = policies.find(p => p.id === policyId)
    setPolicies(prev => prev.filter(p => p.id !== policyId))
    logActivity('DELETE_POLICY', policy?.department || 'policy', `Deleted policy: ${policy?.title || policyId}`, { policyId })
  }

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
  // BUDGET LINE ITEM MANAGEMENT
  // ============================================
  const addBudgetLineItem = (lineItem) => {
    const newItem = {
      id: Date.now(),
      ...lineItem,
      requested: lineItem.requested || 0,
      approved: lineItem.approved || 0,
      spent: lineItem.spent || 0,
      status: lineItem.status || 'pending',
      receiptsLink: lineItem.receiptsLink || '',
      impactNotes: lineItem.impactNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setBudgetLineItems(prev => [...prev, newItem])
    logActivity('ADD_LINE_ITEM', 'budget', `Added line item: ${lineItem.orgName} - ${lineItem.description}`, { lineItemId: newItem.id })
    return newItem
  }

  const updateBudgetLineItem = (itemId, updates) => {
    setBudgetLineItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    ))
    logActivity('UPDATE_LINE_ITEM', 'budget', `Updated line item ID: ${itemId}`, { lineItemId: itemId, updates })
  }

  const deleteBudgetLineItem = (itemId) => {
    const item = budgetLineItems.find(i => i.id === itemId)
    setBudgetLineItems(prev => prev.filter(i => i.id !== itemId))
    logActivity('DELETE_LINE_ITEM', 'budget', `Deleted line item: ${item?.orgName} - ${item?.description}`, { lineItemId: itemId })
  }

  const recordLineItemSpending = (itemId, amount, note = '') => {
    setBudgetLineItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newSpent = (item.spent || 0) + amount
        return {
          ...item,
          spent: newSpent,
          status: newSpent >= (item.approved || 0) ? 'spent' : 'approved',
          spendingLog: [...(item.spendingLog || []), {
            amount,
            note,
            date: new Date().toISOString(),
          }],
          updatedAt: new Date().toISOString(),
        }
      }
      return item
    }))
    logActivity('RECORD_SPENDING', 'budget', `Recorded $${amount} spending for item ID: ${itemId}`, { lineItemId: itemId, amount, note })
  }

  // ============================================
  // FUNDING REQUEST MANAGEMENT
  // ============================================
  const submitFundingRequest = async (request) => {
    // Rate limit: 10 requests per org per week
    const rateLimitResult = checkRateLimit(`funding_request_${request.orgName}`, { maxAttempts: 10, windowMs: 7 * 24 * 60 * 60 * 1000 })
    if (!rateLimitResult.allowed) {
      logActivity('FUNDING_REQUEST_RATE_LIMITED', 'budget', `Funding request rate limited for ${request.orgName}`)
      return { success: false, error: `Request limit reached. Try again in ${Math.ceil(rateLimitResult.resetIn / 3600)} hours.` }
    }

    // Use GROQ for context check - verify if amount is realistic
    const { quickPriceCheck } = require('./groq')
    const localCheck = quickPriceCheck(
      request.category,
      request.amount,
      request.description,
      request.studentsImpacted
    )

    // Try GROQ API validation (async, but don't block submission)
    let contextCheck = {
      isRealistic: localCheck.isRealistic,
      note: localCheck.note,
      typicalRange: localCheck.typicalRange,
      flag: localCheck.isRealistic ? 'PASS' : 'FLAG',
      source: 'local',
    }

    // Attempt API validation in background (non-blocking)
    try {
      const { validateFundingRequest: groqValidate } = require('./groq')
      const apiCheck = await groqValidate(request)
      if (!apiCheck.skipped) {
        contextCheck = {
          isRealistic: apiCheck.isRealistic,
          marketContext: apiCheck.marketContext,
          typicalRange: apiCheck.typicalRange,
          flag: apiCheck.flag,
          note: apiCheck.note,
          source: 'groq',
        }
      }
    } catch (e) {
      console.log('[Store] GROQ validation skipped:', e.message)
    }

    const sanitized = sanitizeObject(request)

    // Try Supabase first
    if (useSupabase) {
      try {
        const { data, error } = await submitFundingRequestToSupabase({ ...sanitized, contextCheck })
        if (!error && data) {
          const newRequest = {
            id: data.id,
            orgName: data.org_name,
            category: data.category,
            amount: parseFloat(data.amount),
            description: data.description,
            justification: data.justification,
            studentsImpacted: data.students_impacted,
            contactEmail: data.contact_email,
            contextCheck: data.context_check || contextCheck,
            status: 'pending',
            submittedAt: data.submitted_at,
          }
          setFundingRequests(prev => [...prev, newRequest])
          logActivity('SUBMIT_FUNDING_REQUEST', 'budget', `New funding request: ${request.orgName} - $${request.amount}`, {
            requestId: newRequest.id,
            contextFlag: contextCheck.flag,
            isRealistic: contextCheck.isRealistic
          })
          return { success: true, request: newRequest }
        }
      } catch (e) {
        console.warn('Supabase funding request save failed, using localStorage:', e)
      }
    }

    // Fallback to localStorage
    const newRequest = {
      id: Date.now(),
      ...sanitized,
      contextCheck,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }

    setFundingRequests(prev => [...prev, newRequest])
    logActivity('SUBMIT_FUNDING_REQUEST', 'budget', `New funding request: ${request.orgName} - $${request.amount}`, {
      requestId: newRequest.id,
      contextFlag: contextCheck.flag,
      isRealistic: contextCheck.isRealistic
    })
    return { success: true, request: newRequest }
  }

  const approveFundingRequest = async (requestId, approvedAmount, reviewerNotes = '') => {
    // Update Supabase if available
    if (useSupabase) {
      try {
        await updateFundingRequestInSupabase(requestId, {
          status: 'approved',
          approved_amount: approvedAmount,
          reviewer_notes: reviewerNotes,
        })
      } catch (e) { console.warn('Supabase funding request update failed:', e) }
    }

    setFundingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved',
          approvedAmount: approvedAmount || req.amount,
          reviewerNotes,
          reviewedAt: new Date().toISOString(),
        }
      }
      return req
    }))

    // Create corresponding line item
    const request = fundingRequests.find(r => r.id === requestId)
    if (request) {
      addBudgetLineItem({
        orgName: request.orgName,
        category: request.category,
        description: request.description,
        requested: request.amount,
        approved: approvedAmount || request.amount,
        spent: 0,
        status: 'approved',
        impactNotes: request.justification,
        fundingRequestId: requestId,
      })
    }

    logActivity('APPROVE_FUNDING_REQUEST', 'budget', `Approved funding request ID: ${requestId} for $${approvedAmount || request?.amount}`, { requestId, approvedAmount, reviewerNotes })
  }

  const denyFundingRequest = async (requestId, reviewerNotes = '') => {
    // Update Supabase if available
    if (useSupabase) {
      try {
        await updateFundingRequestInSupabase(requestId, {
          status: 'denied',
          reviewer_notes: reviewerNotes,
        })
      } catch (e) { console.warn('Supabase funding request update failed:', e) }
    }

    setFundingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'denied',
          reviewerNotes,
          reviewedAt: new Date().toISOString(),
        }
      }
      return req
    }))
    logActivity('DENY_FUNDING_REQUEST', 'budget', `Denied funding request ID: ${requestId}`, { requestId, reviewerNotes })
  }

  const requestMoreInfo = (requestId, questions) => {
    setFundingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'needs-info',
          infoRequested: questions,
          infoRequestedAt: new Date().toISOString(),
        }
      }
      return req
    }))
    logActivity('REQUEST_MORE_INFO', 'budget', `Requested more info for request ID: ${requestId}`, { requestId, questions })
  }

  const amendFundingRequest = (requestId, amendment) => {
    setFundingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'amendment-requested',
          amendment: {
            suggestedAmount: amendment.suggestedAmount,
            reason: amendment.reason,
            conditions: amendment.conditions || '',
            requestedAt: new Date().toISOString(),
            reviewerName: amendment.reviewerName || 'Admin',
          },
          amendmentHistory: [
            ...(req.amendmentHistory || []),
            {
              originalAmount: req.amount,
              suggestedAmount: amendment.suggestedAmount,
              reason: amendment.reason,
              conditions: amendment.conditions || '',
              requestedAt: new Date().toISOString(),
            }
          ],
        }
      }
      return req
    }))
    logActivity('AMEND_FUNDING_REQUEST', 'budget', `Requested amendment for request ID: ${requestId} - suggested $${amendment.suggestedAmount}`, {
      requestId,
      originalAmount: fundingRequests.find(r => r.id === requestId)?.amount,
      suggestedAmount: amendment.suggestedAmount,
      reason: amendment.reason
    })
  }

  const resubmitAmendedRequest = (requestId, acceptAmendment, newAmount, response) => {
    const { quickPriceCheck } = require('./groq')

    setFundingRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedAmount = acceptAmendment ? req.amendment?.suggestedAmount : newAmount
        const updatedRequest = {
          ...req,
          amount: updatedAmount || req.amount,
          status: 'pending',
          amendmentResponse: {
            accepted: acceptAmendment,
            newAmount: updatedAmount,
            response: response || '',
            submittedAt: new Date().toISOString(),
          },
          resubmittedAt: new Date().toISOString(),
        }
        // Recalculate context check with new amount
        const localCheck = quickPriceCheck(
          updatedRequest.category,
          updatedRequest.amount,
          updatedRequest.description,
          updatedRequest.studentsImpacted
        )
        updatedRequest.contextCheck = {
          isRealistic: localCheck.isRealistic,
          note: localCheck.note,
          typicalRange: localCheck.typicalRange,
          flag: localCheck.isRealistic ? 'PASS' : 'FLAG',
          source: 'local',
        }
        return updatedRequest
      }
      return req
    }))
    logActivity('RESUBMIT_AMENDED_REQUEST', 'budget', `Resubmitted amended request ID: ${requestId}`, { requestId, acceptAmendment, newAmount })
  }

  // ============================================
  // REALLOCATION MANAGEMENT
  // ============================================
  const generateReallocations = () => {
    const { generateReallocationSuggestions } = require('./budgetEngine')
    const suggestions = generateReallocationSuggestions(budgetLineItems, fundingRequests)

    // Only add new suggestions (avoid duplicates)
    const existingIds = new Set(reallocations.map(r => r.id))
    const newSuggestions = suggestions.filter(s => !existingIds.has(s.id))

    if (newSuggestions.length > 0) {
      setReallocations(prev => [...prev, ...newSuggestions])
      logActivity('GENERATE_REALLOCATIONS', 'budget', `Generated ${newSuggestions.length} reallocation suggestion(s)`)
    }
    return newSuggestions
  }

  const approveReallocation = (reallocationId) => {
    const reallocation = reallocations.find(r => r.id === reallocationId)
    if (!reallocation) return

    // Update reallocation status
    setReallocations(prev => prev.map(r =>
      r.id === reallocationId ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r
    ))

    // Update line items - reduce from source category, add to target
    // This is a simplified version - actual implementation would be more complex
    logActivity('APPROVE_REALLOCATION', 'budget', `Approved reallocation: $${reallocation.amount} from ${reallocation.fromCategoryName} to ${reallocation.toCategoryName}`, { reallocationId, amount: reallocation.amount })
  }

  const rejectReallocation = (reallocationId, reason = '') => {
    setReallocations(prev => prev.map(r =>
      r.id === reallocationId ? { ...r, status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason } : r
    ))
    const reallocation = reallocations.find(r => r.id === reallocationId)
    logActivity('REJECT_REALLOCATION', 'budget', `Rejected reallocation ID: ${reallocationId}`, { reallocationId, reason })
  }

  const dismissReallocation = (reallocationId) => {
    setReallocations(prev => prev.filter(r => r.id !== reallocationId))
    logActivity('DISMISS_REALLOCATION', 'budget', `Dismissed reallocation suggestion ID: ${reallocationId}`, { reallocationId })
  }

  // ============================================
  // QUICK STATS MANAGEMENT
  // ============================================
  const updateQuickStats = (updates) => {
    setQuickStats(prev => ({ ...prev, ...updates }))
    logActivity('UPDATE_STATS', 'analytics', 'Updated quick stats', { updates })
  }

  // ============================================
  // PAGE CONTENT MANAGEMENT (Static Text/Locations)
  // ============================================
  const updatePageContent = (department, section, content) => {
    setPageContent(prev => ({
      ...prev,
      [department]: {
        ...prev[department],
        [section]: content,
      },
    }))
    logActivity('UPDATE_CONTENT', department, `Updated ${section} content`, { department, section })
  }

  const updatePageContentItem = (department, section, itemId, updates) => {
    setPageContent(prev => ({
      ...prev,
      [department]: {
        ...prev[department],
        [section]: prev[department][section].map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      },
    }))
    logActivity('UPDATE_CONTENT_ITEM', department, `Updated item in ${section}`, { department, section, itemId })
  }

  const addPageContentItem = (department, section, item) => {
    const newItem = { ...item, id: Date.now() }
    setPageContent(prev => ({
      ...prev,
      [department]: {
        ...prev[department],
        [section]: [...(prev[department][section] || []), newItem],
      },
    }))
    logActivity('ADD_CONTENT_ITEM', department, `Added item to ${section}`, { department, section })
    return newItem
  }

  const deletePageContentItem = (department, section, itemId) => {
    setPageContent(prev => ({
      ...prev,
      [department]: {
        ...prev[department],
        [section]: prev[department][section].filter(item => item.id !== itemId),
      },
    }))
    logActivity('DELETE_CONTENT_ITEM', department, `Deleted item from ${section}`, { department, section, itemId })
  }

  // ============================================
  // UNIVERSAL SITE CONTENT MANAGEMENT
  // Allows editing ANY text on the site by key
  // ============================================
  const getSiteContent = (key, defaultValue) => {
    return siteContent[key] !== undefined ? siteContent[key] : defaultValue
  }

  const setSiteContentValue = (key, value) => {
    setSiteContent(prev => ({
      ...prev,
      [key]: value,
    }))
    // Don't log every character change - only significant updates
  }

  const resetSiteContentKey = (key) => {
    setSiteContent(prev => {
      const newContent = { ...prev }
      delete newContent[key]
      return newContent
    })
    logActivity('RESET_CONTENT', 'content', `Reset content: ${key}`, { key })
  }

  const resetAllSiteContent = () => {
    setSiteContent({})
    logActivity('RESET_ALL_CONTENT', 'content', 'Reset all site content to defaults')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('projectbold_sitecontent')
    }
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
    setPageContent(initialPageContent)
    setSiteContent(initialSiteContent)
    // Keep activity log to track the reset
    logActivity('RESET_ALL', 'system', 'Reset all platform data to initial state')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('projectbold_policies')
      localStorage.removeItem('projectbold_operational')
      localStorage.removeItem('projectbold_budget')
      localStorage.removeItem('projectbold_announcements')
      localStorage.removeItem('projectbold_feedback')
      localStorage.removeItem('projectbold_quickstats')
      localStorage.removeItem('projectbold_pagecontent')
      localStorage.removeItem('projectbold_sitecontent')
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
      editMode,
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
      tempLoginAdmin,
      logoutAdmin,
      toggleEditMode,
      refreshSession,

      // Policy Management
      addPolicy,
      deletePolicy,
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

      // Budget Enhancement - Line Items
      budgetLineItems,
      addBudgetLineItem,
      updateBudgetLineItem,
      deleteBudgetLineItem,
      recordLineItemSpending,

      // Budget Enhancement - Funding Requests
      fundingRequests,
      submitFundingRequest,
      approveFundingRequest,
      denyFundingRequest,
      requestMoreInfo,
      amendFundingRequest,
      resubmitAmendedRequest,

      // Budget Enhancement - Reallocations
      reallocations,
      generateReallocations,
      approveReallocation,
      rejectReallocation,
      dismissReallocation,

      // Quick Stats
      updateQuickStats,

      // Page Content (Static Text/Locations)
      pageContent,
      updatePageContent,
      updatePageContentItem,
      addPageContentItem,
      deletePageContentItem,

      // Universal Site Content (edit any text)
      siteContent,
      getSiteContent,
      setSiteContentValue,
      resetSiteContentKey,
      resetAllSiteContent,

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
