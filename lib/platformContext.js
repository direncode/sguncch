/**
 * Platform Context Builder
 *
 * Assembles a dynamic snapshot of ALL platform data into a structured context
 * that gets injected into every Grok API call. This means every AI response
 * is informed by real-time policies, budget, operations, feedback, and uploaded documents.
 */

// Build a comprehensive platform context string from all available data
export function buildPlatformContext(platformData) {
  const {
    policies = [],
    operationalData = {},
    budgetData = {},
    quickStats = {},
    announcements = [],
    feedback = [],
  } = platformData

  const sections = []

  // === Quick Stats Summary ===
  sections.push(`## PLATFORM METRICS (Live)
- Students Reached: ${quickStats.totalStudentsReached || 0}
- Active Initiatives: ${quickStats.activeInitiatives || 0}
- Events This Month: ${quickStats.eventsThisMonth || 0}
- Feedback Received: ${quickStats.feedbackReceived || 0}`)

  // === Policy Overview ===
  if (policies.length > 0) {
    const departments = {}
    for (const p of policies) {
      if (!departments[p.department]) departments[p.department] = []
      departments[p.department].push(p)
    }

    const totalProgress = policies.reduce((sum, p) => sum + (p.progress || 0), 0)
    const avgProgress = Math.round(totalProgress / policies.length)
    const completed = policies.filter(p => p.status === 'completed').length
    const inProgress = policies.filter(p => p.status === 'in_progress').length
    const planned = policies.filter(p => p.status === 'planned').length

    let policySection = `## POLICY INITIATIVES (${policies.length} total)
- Overall Progress: ${avgProgress}%
- Completed: ${completed} | In Progress: ${inProgress} | Planned: ${planned}\n`

    for (const [dept, deptPolicies] of Object.entries(departments)) {
      const deptAvg = Math.round(deptPolicies.reduce((s, p) => s + (p.progress || 0), 0) / deptPolicies.length)
      policySection += `\n### ${dept} (${deptAvg}% avg)\n`
      for (const p of deptPolicies) {
        policySection += `- [${p.status}] ${p.title}: ${p.progress}%`
        if (p.metrics && Object.keys(p.metrics).length > 0) {
          const metricStr = Object.entries(p.metrics).map(([k, v]) => `${k}=${v}`).join(', ')
          policySection += ` (${metricStr})`
        }
        policySection += '\n'
      }
    }
    sections.push(policySection.trim())
  }

  // === Budget Overview ===
  if (budgetData.total || budgetData.allocated || budgetData.spent) {
    let budgetSection = `## BUDGET
- Total: $${(budgetData.total || 0).toLocaleString()}
- Allocated: $${(budgetData.allocated || 0).toLocaleString()}
- Spent: $${(budgetData.spent || 0).toLocaleString()}
- Remaining: $${((budgetData.total || 0) - (budgetData.spent || 0)).toLocaleString()}`

    if (budgetData.categories?.length > 0) {
      budgetSection += '\n\nCategories:'
      for (const cat of budgetData.categories) {
        const pct = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0
        budgetSection += `\n- ${cat.name}: $${cat.spent}/$${cat.allocated} spent (${pct}%)`
      }
    }
    sections.push(budgetSection)
  }

  // === Operations Summary ===
  if (operationalData.techLoaners || operationalData.foodPantry || operationalData.trainings) {
    let opsSection = '## OPERATIONS\n'

    if (operationalData.techLoaners?.devices?.length > 0) {
      const totalDevices = operationalData.techLoaners.devices.reduce((s, d) => s + (d.total || 0), 0)
      const available = operationalData.techLoaners.devices.reduce((s, d) => s + (d.available || 0), 0)
      const onLoan = operationalData.techLoaners.devices.reduce((s, d) => s + (d.onLoan || 0), 0)
      opsSection += `\n### Tech Loaner Program
- Total Devices: ${totalDevices} | Available: ${available} | On Loan: ${onLoan}`
      for (const d of operationalData.techLoaners.devices) {
        opsSection += `\n  - ${d.name}: ${d.available}/${d.total} available`
      }
      const activeLoans = (operationalData.techLoaners.loans || []).filter(l => l.status === 'active')
      if (activeLoans.length > 0) {
        opsSection += `\n- Active Loans: ${activeLoans.length}`
      }
    }

    if (operationalData.foodPantry) {
      opsSection += `\n\n### Food Pantry
- Total Visits: ${operationalData.foodPantry.totalVisits || 0}
- Donations: $${operationalData.foodPantry.donations || 0}
- Locations: ${operationalData.foodPantry.locations?.length || 0}`
      for (const loc of (operationalData.foodPantry.locations || [])) {
        opsSection += `\n  - ${loc.name}: ${loc.visits || 0} visits, inventory: ${loc.inventory || 'unknown'}`
      }
    }

    if (operationalData.trainings?.mentalHealthFirstAid) {
      const mhfa = operationalData.trainings.mentalHealthFirstAid
      opsSection += `\n\n### Training Programs
- Mental Health First Aid: ${mhfa.totalTrained || 0} trained across ${mhfa.sessions?.length || 0} sessions`
    }

    sections.push(opsSection.trim())
  }

  // === Recent Announcements ===
  if (announcements.length > 0) {
    const recent = announcements.slice(0, 5)
    let annSection = `## RECENT ANNOUNCEMENTS (${announcements.length} total)\n`
    for (const a of recent) {
      annSection += `- [${a.category}] ${a.title}${a.pinned ? ' (PINNED)' : ''}\n`
    }
    sections.push(annSection.trim())
  }

  // === Student Feedback Summary ===
  if (feedback.length > 0) {
    const newCount = feedback.filter(f => f.status === 'new').length
    const reviewedCount = feedback.filter(f => f.status === 'reviewed').length
    const resolvedCount = feedback.filter(f => f.status === 'resolved').length
    let fbSection = `## STUDENT FEEDBACK (${feedback.length} total)
- New: ${newCount} | Reviewed: ${reviewedCount} | Resolved: ${resolvedCount}`

    const recentFb = feedback.filter(f => f.status === 'new').slice(0, 3)
    if (recentFb.length > 0) {
      fbSection += '\n\nRecent unread feedback:'
      for (const f of recentFb) {
        const preview = (f.message || '').slice(0, 100)
        fbSection += `\n- "${preview}${f.message?.length > 100 ? '...' : ''}" (${f.category || 'general'})`
      }
    }
    sections.push(fbSection)
  }

  return sections.join('\n\n---\n\n')
}

// Build the enhanced system prompt that includes platform context
export function buildEnhancedSystemPrompt(documentContext, platformContext) {
  return `You are the UNC Gov Codex Assistant — an AI that helps with UNC Student Government governance, policies, operations, and decision-making.

You have access to TWO types of context:
1. APPROVED GOVERNANCE DOCUMENTS — Official policies, codes, and procedures
2. LIVE PLATFORM DATA — Real-time metrics, budget, operations, feedback, and policy progress

RULES:
- NEVER use markdown formatting. No headers (#), no bold (**), no italic (*), no bullet points (- or *), no numbered lists (1.), no code blocks, no links. Write in clean, natural prose with paragraph breaks only.
- Use BOTH document context and platform data to give comprehensive, informed answers
- When citing documents, mention them naturally in text like: according to the Student Fee Transparency Act v1.0
- When referencing platform data, weave it naturally into your response
- Be concise, accurate, and actionable
- If you don't have enough information, say so clearly
- You can make connections between documents and live data
- Write in a conversational, direct tone

${documentContext ? `APPROVED DOCUMENT CONTEXT:
${documentContext}

---

` : ''}LIVE PLATFORM DATA:
${platformContext || 'No platform data available.'}`
}
