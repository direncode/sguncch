// ============================================
// BUDGET ENGINE - AI Scoring & Reallocation
// Rule-based MVP for funding optimization
// ============================================

import { quickPriceCheck } from './groq'

// Priority categories for SG alignment scoring
export const SG_PRIORITY_CATEGORIES = [
  'wellness',
  'basic-needs',
  'academic-support',
  'safety',
  'sustainability',
]

// Category definitions for line items
export const BUDGET_CATEGORIES = [
  { id: 'events', name: 'Events & Programming', color: '#a371f7' },
  { id: 'travel', name: 'Travel & Conferences', color: '#00d4ff' },
  { id: 'merch', name: 'Merchandise & Apparel', color: '#d29922' },
  { id: 'supplies', name: 'Supplies & Materials', color: '#6e7681' },
  { id: 'wellness', name: 'Wellness Initiatives', color: '#3fb950' },
  { id: 'food', name: 'Food & Catering', color: '#f85149' },
  { id: 'marketing', name: 'Marketing & Outreach', color: '#58a6ff' },
  { id: 'technology', name: 'Technology & Equipment', color: '#bc8cff' },
  { id: 'emergency', name: 'Emergency & Crisis', color: '#ff7b72' },
  { id: 'other', name: 'Other', color: '#8b949e' },
]

// Status definitions
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  REALLOCATED: 'reallocated',
  SPENT: 'spent',
}

// ============================================
// AI SCORING ENGINE (Rule-Based MVP)
// ============================================

/**
 * Calculate AI score for a funding request
 * Returns score 0-100 with recommendation
 */
export function calculateFundingScore(request, existingRequests, budgetData, lineItems) {
  let score = 50 // Base score
  const factors = []

  // Factor 1: Urgency (0-25 points)
  const urgencyScore = calculateUrgencyScore(request)
  score += urgencyScore.points
  factors.push(urgencyScore)

  // Factor 2: SG Priority Alignment (0-20 points)
  const alignmentScore = calculateAlignmentScore(request)
  score += alignmentScore.points
  factors.push(alignmentScore)

  // Factor 3: Budget Availability (0-20 points)
  const availabilityScore = calculateAvailabilityScore(request, budgetData, lineItems)
  score += availabilityScore.points
  factors.push(availabilityScore)

  // Factor 4: Duplicate Check (-30 to 0 points)
  const duplicateScore = checkDuplicates(request, existingRequests)
  score += duplicateScore.points
  factors.push(duplicateScore)

  // Factor 5: Impact Justification (0-15 points)
  const impactScore = calculateImpactScore(request)
  score += impactScore.points
  factors.push(impactScore)

  // Factor 6: Price Reasonableness (-20 to +10 points)
  const priceScore = calculatePriceReasonableness(request)
  score += priceScore.points
  factors.push(priceScore)

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  // Generate recommendation
  const recommendation = generateRecommendation(score, factors, request, budgetData)

  return {
    score,
    factors,
    recommendation,
    timestamp: new Date().toISOString(),
  }
}

function calculateUrgencyScore(request) {
  const urgencyKeywords = {
    high: ['emergency', 'crisis', 'urgent', 'immediate', 'safety', 'health', 'mental health', 'deadline'],
    medium: ['upcoming', 'soon', 'important', 'needed', 'required'],
    low: ['future', 'planning', 'optional', 'nice to have'],
  }

  const description = (request.description + ' ' + request.justification).toLowerCase()

  let points = 10 // Default medium
  let level = 'medium'

  for (const keyword of urgencyKeywords.high) {
    if (description.includes(keyword)) {
      points = 25
      level = 'high'
      break
    }
  }

  if (level === 'medium') {
    for (const keyword of urgencyKeywords.low) {
      if (description.includes(keyword)) {
        points = 5
        level = 'low'
        break
      }
    }
  }

  // Category-based urgency boost
  if (['emergency', 'wellness', 'safety'].includes(request.category)) {
    points = Math.min(25, points + 10)
    level = 'high'
  }

  return {
    name: 'Urgency',
    points,
    level,
    description: `${level.charAt(0).toUpperCase() + level.slice(1)} urgency detected`,
  }
}

function calculateAlignmentScore(request) {
  const priorityMapping = {
    'wellness': 20,
    'emergency': 20,
    'food': 15, // Basic needs
    'events': 12,
    'academic-support': 15,
    'sustainability': 12,
    'technology': 10,
    'marketing': 8,
    'travel': 8,
    'supplies': 8,
    'merch': 5,
    'other': 5,
  }

  const points = priorityMapping[request.category] || 5
  const aligned = points >= 12

  return {
    name: 'SG Priority Alignment',
    points,
    aligned,
    description: aligned ? 'Aligns with SG priorities' : 'Lower priority category',
  }
}

function calculateAvailabilityScore(request, budgetData, lineItems) {
  const totalBudget = budgetData?.total || 100000
  const totalSpent = budgetData?.spent || 0
  const remaining = totalBudget - totalSpent
  const requestAmount = request.amount || 0

  // Check category-specific availability
  const categoryItems = lineItems?.filter(item => item.category === request.category) || []
  const categoryAllocated = categoryItems.reduce((sum, item) => sum + (item.approved || 0), 0)
  const categorySpent = categoryItems.reduce((sum, item) => sum + (item.spent || 0), 0)
  const categoryRemaining = categoryAllocated - categorySpent

  let points = 0
  let status = 'unavailable'

  if (requestAmount <= remaining && requestAmount <= categoryRemaining) {
    points = 20
    status = 'available'
  } else if (requestAmount <= remaining) {
    points = 12
    status = 'reallocation-needed'
  } else if (requestAmount <= remaining * 1.1) {
    points = 5
    status = 'tight'
  }

  return {
    name: 'Budget Availability',
    points,
    status,
    remaining,
    categoryRemaining,
    description: status === 'available'
      ? 'Funds available in category'
      : status === 'reallocation-needed'
        ? 'May require reallocation'
        : 'Limited funds available',
  }
}

function checkDuplicates(request, existingRequests) {
  const recentRequests = existingRequests?.filter(r => {
    const daysDiff = (Date.now() - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff < 30 && r.orgName === request.orgName
  }) || []

  // Check for similar requests
  const similar = recentRequests.filter(r => {
    const sameCategory = r.category === request.category
    const similarAmount = Math.abs(r.amount - request.amount) < request.amount * 0.2
    const similarDesc = calculateTextSimilarity(r.description, request.description) > 0.5
    return sameCategory && (similarAmount || similarDesc)
  })

  if (similar.length > 0) {
    return {
      name: 'Duplicate Check',
      points: -30,
      isDuplicate: true,
      similarRequests: similar.length,
      description: `Potential duplicate: ${similar.length} similar request(s) in last 30 days`,
    }
  }

  return {
    name: 'Duplicate Check',
    points: 0,
    isDuplicate: false,
    description: 'No duplicates found',
  }
}

function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))
  const intersection = [...words1].filter(w => words2.has(w))
  return intersection.length / Math.max(words1.size, words2.size)
}

function calculateImpactScore(request) {
  const impactKeywords = {
    high: ['students', 'community', 'campus-wide', 'all students', 'mental health', 'safety', 'food insecurity', 'wellness'],
    medium: ['organization', 'members', 'department', 'program'],
    low: ['personal', 'individual', 'one-time'],
  }

  const justification = (request.justification || '').toLowerCase()
  const studentsImpacted = request.studentsImpacted || 0

  let points = 5 // Default
  let level = 'low'

  // Check keywords
  for (const keyword of impactKeywords.high) {
    if (justification.includes(keyword)) {
      points = 15
      level = 'high'
      break
    }
  }

  if (level !== 'high') {
    for (const keyword of impactKeywords.medium) {
      if (justification.includes(keyword)) {
        points = 10
        level = 'medium'
        break
      }
    }
  }

  // Boost for high student count
  if (studentsImpacted > 500) points = Math.min(15, points + 5)
  else if (studentsImpacted > 100) points = Math.min(15, points + 3)

  return {
    name: 'Impact Assessment',
    points,
    level,
    studentsImpacted,
    description: `${level.charAt(0).toUpperCase() + level.slice(1)} impact potential`,
  }
}

function calculatePriceReasonableness(request) {
  const priceCheck = quickPriceCheck(
    request.category || 'events',
    request.amount || 0,
    request.description || '',
    request.studentsImpacted || null
  )

  let points = 0
  let status = 'reasonable'

  if (priceCheck.severity === 'high') {
    points = -20
    status = 'unreasonable'
  } else if (priceCheck.severity === 'medium') {
    points = -10
    status = 'questionable'
  } else if (request.amount <= priceCheck.benchmark.typical) {
    points = 10
    status = 'below-average'
  }

  return {
    name: 'Price Reasonableness',
    points,
    status,
    flags: priceCheck.flags,
    benchmark: priceCheck.benchmark,
    requiresAiValidation: priceCheck.requiresDeepValidation,
    description: status === 'unreasonable'
      ? `Amount significantly exceeds typical range ($${priceCheck.benchmark.max.toLocaleString()} max)`
      : status === 'questionable'
        ? 'Amount may be above typical range - review recommended'
        : status === 'below-average'
          ? 'Amount is reasonable for this category'
          : 'Amount within expected range',
  }
}

function generateRecommendation(score, factors, request, budgetData) {
  const duplicateFactor = factors.find(f => f.name === 'Duplicate Check')
  const availabilityFactor = factors.find(f => f.name === 'Budget Availability')
  const priceFactor = factors.find(f => f.name === 'Price Reasonableness')

  // Check for unreasonable price first
  if (priceFactor?.status === 'unreasonable') {
    return {
      action: 'FLAG',
      reason: `Amount appears unreasonable: ${priceFactor.flags?.[0] || 'exceeds typical costs'}`,
      confidence: 'high',
      color: '#f85149',
      requiresAiValidation: true,
    }
  }

  if (duplicateFactor?.isDuplicate) {
    return {
      action: 'DENY',
      reason: 'Potential duplicate request detected',
      confidence: 'high',
      color: '#f85149',
    }
  }

  // Flag questionable prices even with good scores
  if (priceFactor?.status === 'questionable' && score >= 55) {
    return {
      action: 'REVIEW',
      reason: 'Good request but amount needs verification',
      confidence: 'medium',
      color: '#d29922',
      requiresAiValidation: priceFactor.requiresAiValidation,
    }
  }

  if (score >= 75) {
    return {
      action: 'APPROVE',
      reason: 'High impact, aligns with priorities',
      confidence: 'high',
      color: '#3fb950',
    }
  }

  if (score >= 55) {
    if (availabilityFactor?.status === 'reallocation-needed') {
      return {
        action: 'REALLOCATE',
        reason: 'Approve with reallocation from unused funds',
        confidence: 'medium',
        color: '#d29922',
      }
    }
    return {
      action: 'APPROVE',
      reason: 'Moderate impact, budget available',
      confidence: 'medium',
      color: '#3fb950',
    }
  }

  if (score >= 35) {
    return {
      action: 'REVIEW',
      reason: 'Needs additional justification',
      confidence: 'low',
      color: '#d29922',
    }
  }

  return {
    action: 'DENY',
    reason: 'Low priority or insufficient justification',
    confidence: 'medium',
    color: '#f85149',
  }
}

// ============================================
// REALLOCATION SUGGESTION ENGINE
// ============================================

/**
 * Analyze budget and suggest reallocations
 * Flags categories with >30% remaining funds
 */
export function generateReallocationSuggestions(lineItems, fundingRequests) {
  const suggestions = []

  // Group items by category
  const categoryStats = {}
  for (const item of lineItems) {
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = {
        category: item.category,
        allocated: 0,
        spent: 0,
        items: [],
      }
    }
    categoryStats[item.category].allocated += item.approved || 0
    categoryStats[item.category].spent += item.spent || 0
    categoryStats[item.category].items.push(item)
  }

  // Find underutilized categories (>30% remaining)
  const underutilized = []
  const overdemand = []

  for (const [category, stats] of Object.entries(categoryStats)) {
    const remaining = stats.allocated - stats.spent
    const utilizationRate = stats.allocated > 0 ? stats.spent / stats.allocated : 0

    if (utilizationRate < 0.7 && remaining > 500) {
      underutilized.push({
        ...stats,
        remaining,
        utilizationRate,
      })
    }
  }

  // Find high-demand categories (pending requests)
  const pendingByCategory = {}
  for (const request of fundingRequests.filter(r => r.status === REQUEST_STATUS.PENDING)) {
    if (!pendingByCategory[request.category]) {
      pendingByCategory[request.category] = {
        category: request.category,
        totalRequested: 0,
        count: 0,
      }
    }
    pendingByCategory[request.category].totalRequested += request.amount
    pendingByCategory[request.category].count++
  }

  // Generate suggestions
  for (const under of underutilized) {
    const categoryInfo = BUDGET_CATEGORIES.find(c => c.id === under.category)

    // Find matching high-demand category
    for (const [demandCat, demand] of Object.entries(pendingByCategory)) {
      if (demand.totalRequested > 0) {
        const demandInfo = BUDGET_CATEGORIES.find(c => c.id === demandCat)
        const suggestedAmount = Math.min(under.remaining * 0.5, demand.totalRequested)

        if (suggestedAmount >= 200) {
          suggestions.push({
            id: `realloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'reallocation',
            fromCategory: under.category,
            fromCategoryName: categoryInfo?.name || under.category,
            toCategory: demandCat,
            toCategoryName: demandInfo?.name || demandCat,
            amount: Math.round(suggestedAmount),
            reason: `${categoryInfo?.name || under.category} has ${Math.round((1 - under.utilizationRate) * 100)}% unused funds. ${demandInfo?.name || demandCat} has ${demand.count} pending request(s) totaling $${demand.totalRequested.toLocaleString()}.`,
            impact: `Could fund ${demand.count} pending request(s)`,
            status: 'suggested',
            createdAt: new Date().toISOString(),
          })
        }
      }
    }

    // Also suggest general wellness/emergency reallocation if no specific demand
    if (under.remaining > 1000 && !['wellness', 'emergency'].includes(under.category)) {
      suggestions.push({
        id: `realloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'reallocation',
        fromCategory: under.category,
        fromCategoryName: categoryInfo?.name || under.category,
        toCategory: 'wellness',
        toCategoryName: 'Wellness Initiatives',
        amount: Math.round(under.remaining * 0.3),
        reason: `${categoryInfo?.name || under.category} is underutilized at ${Math.round(under.utilizationRate * 100)}% spend rate. Wellness initiatives consistently have high demand.`,
        impact: 'Increase wellness program capacity',
        status: 'suggested',
        createdAt: new Date().toISOString(),
      })
    }
  }

  return suggestions
}

// ============================================
// CSV EXPORT UTILITIES
// ============================================

/**
 * Export line items to CSV format
 */
export function exportLineItemsToCSV(lineItems) {
  const headers = [
    'Organization',
    'Category',
    'Description',
    'Requested',
    'Approved',
    'Spent',
    'Remaining',
    'Status',
    'Receipts',
    'Impact Notes',
    'Last Updated',
  ]

  const rows = lineItems.map(item => [
    item.orgName || '',
    BUDGET_CATEGORIES.find(c => c.id === item.category)?.name || item.category,
    item.description || '',
    item.requested || 0,
    item.approved || 0,
    item.spent || 0,
    (item.approved || 0) - (item.spent || 0),
    item.status || '',
    item.receiptsLink || '',
    item.impactNotes || '',
    item.updatedAt || item.createdAt || '',
  ])

  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

/**
 * Export funding requests to CSV
 */
export function exportFundingRequestsToCSV(requests) {
  const headers = [
    'ID',
    'Organization',
    'Category',
    'Amount Requested',
    'Description',
    'Justification',
    'Students Impacted',
    'AI Score',
    'Recommendation',
    'Status',
    'Submitted',
    'Reviewed',
    'Reviewer Notes',
  ]

  const rows = requests.map(req => [
    req.id || '',
    req.orgName || '',
    BUDGET_CATEGORIES.find(c => c.id === req.category)?.name || req.category,
    req.amount || 0,
    req.description || '',
    req.justification || '',
    req.studentsImpacted || '',
    req.aiScore?.score || '',
    req.aiScore?.recommendation?.action || '',
    req.status || '',
    req.submittedAt || '',
    req.reviewedAt || '',
    req.reviewerNotes || '',
  ])

  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

/**
 * Generate audit report
 */
export function generateAuditReport(budgetData, lineItems, requests, reallocations) {
  const totalAllocated = lineItems.reduce((sum, item) => sum + (item.approved || 0), 0)
  const totalSpent = lineItems.reduce((sum, item) => sum + (item.spent || 0), 0)
  const totalReallocated = reallocations
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0)

  const categoryBreakdown = {}
  for (const item of lineItems) {
    if (!categoryBreakdown[item.category]) {
      categoryBreakdown[item.category] = { allocated: 0, spent: 0, count: 0 }
    }
    categoryBreakdown[item.category].allocated += item.approved || 0
    categoryBreakdown[item.category].spent += item.spent || 0
    categoryBreakdown[item.category].count++
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalBudget: budgetData?.total || 0,
      totalAllocated,
      totalSpent,
      totalRemaining: totalAllocated - totalSpent,
      utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated * 100).toFixed(1) : 0,
      totalReallocated,
      wasteReduction: totalReallocated, // Funds that would have been wasted
    },
    categoryBreakdown: Object.entries(categoryBreakdown).map(([cat, stats]) => ({
      category: BUDGET_CATEGORIES.find(c => c.id === cat)?.name || cat,
      ...stats,
      utilizationRate: stats.allocated > 0 ? (stats.spent / stats.allocated * 100).toFixed(1) : 0,
    })),
    requestStats: {
      total: requests.length,
      pending: requests.filter(r => r.status === REQUEST_STATUS.PENDING).length,
      approved: requests.filter(r => r.status === REQUEST_STATUS.APPROVED).length,
      denied: requests.filter(r => r.status === REQUEST_STATUS.DENIED).length,
      avgProcessingTime: calculateAvgProcessingTime(requests),
    },
    reallocationStats: {
      total: reallocations.length,
      approved: reallocations.filter(r => r.status === 'approved').length,
      totalAmount: totalReallocated,
    },
  }
}

function calculateAvgProcessingTime(requests) {
  const processed = requests.filter(r => r.reviewedAt && r.submittedAt)
  if (processed.length === 0) return 'N/A'

  const totalMs = processed.reduce((sum, r) => {
    return sum + (new Date(r.reviewedAt) - new Date(r.submittedAt))
  }, 0)

  const avgHours = totalMs / processed.length / (1000 * 60 * 60)
  if (avgHours < 24) return `${avgHours.toFixed(1)} hours`
  return `${(avgHours / 24).toFixed(1)} days`
}

// ============================================
// WASTE REDUCTION METRICS
// ============================================

/**
 * Calculate waste reduction statistics
 */
export function calculateWasteReductionStats(lineItems, reallocations, historicalData = null) {
  const currentUtilization = lineItems.reduce((sum, item) => sum + (item.spent || 0), 0)
  const currentAllocated = lineItems.reduce((sum, item) => sum + (item.approved || 0), 0)
  const reallocatedFunds = reallocations
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0)

  // Estimate waste reduction (funds that would have gone unused)
  const underutilizedFunds = lineItems
    .filter(item => {
      const utilRate = item.approved > 0 ? item.spent / item.approved : 0
      return utilRate < 0.5 && (item.approved - item.spent) > 500
    })
    .reduce((sum, item) => sum + (item.approved - item.spent), 0)

  // Historical comparison (placeholder - would need actual historical data)
  const previousWasteRate = historicalData?.wasteRate || 0.25 // 25% default historical waste
  const currentWasteRate = currentAllocated > 0
    ? (currentAllocated - currentUtilization) / currentAllocated
    : 0

  return {
    totalAllocated: currentAllocated,
    totalSpent: currentUtilization,
    utilizationRate: currentAllocated > 0 ? (currentUtilization / currentAllocated * 100).toFixed(1) : 0,
    fundsReallocated: reallocatedFunds,
    potentialWaste: underutilizedFunds,
    wasteReduced: reallocatedFunds,
    wasteReductionPercent: previousWasteRate > 0
      ? (((previousWasteRate - currentWasteRate) / previousWasteRate) * 100).toFixed(0)
      : 0,
    efficiency: {
      current: (100 - currentWasteRate * 100).toFixed(1),
      previous: (100 - previousWasteRate * 100).toFixed(1),
      improvement: ((previousWasteRate - currentWasteRate) * 100).toFixed(1),
    },
  }
}
