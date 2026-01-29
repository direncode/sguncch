/**
 * UFE State Export API
 *
 * Exports current Project Bold state for UFE analysis.
 * Used by ufe_hook.py to fetch real-time data.
 *
 * GET /api/ufe/state
 *
 * Returns:
 * {
 *   policies: [...],
 *   quickStats: {...},
 *   budget: {...},
 *   operational: {...},
 *   timestamp: "ISO8601"
 * }
 */

import { initialPolicies, initialOperationalData, initialBudgetData } from '../../../lib/data'

// Default quick stats
const defaultQuickStats = {
  totalStudentsReached: 0,
  activeInitiatives: 0,
  eventsThisMonth: 0,
  feedbackReceived: 0,
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // In a real deployment, this would read from the database
    // For now, we return the initial data structure
    // The actual state is managed client-side in localStorage/Supabase

    const state = {
      policies: initialPolicies,
      quickStats: defaultQuickStats,
      budget: initialBudgetData,
      operational: {
        techLoaners: initialOperationalData.techLoaners,
        foodPantry: initialOperationalData.foodPantry,
      },
      timestamp: new Date().toISOString(),
      source: 'api',
    }

    // Add CORS headers for local development
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')

    return res.status(200).json(state)
  } catch (error) {
    console.error('UFE state export error:', error)
    return res.status(500).json({ error: 'Failed to export state' })
  }
}
