/**
 * Platform Context Builder — Hyper-Tuned Edition
 *
 * Assembles a comprehensive, granular snapshot of ALL platform data into context
 * that gets injected into every Grok API call. Every AI response is informed by
 * real-time policies (with full descriptions and metrics), budget details,
 * operations, feedback, and governance documents.
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
    fundingRequests = [],
  } = platformData

  const sections = []

  // === Quick Stats Summary ===
  sections.push(`## PLATFORM METRICS (Live)
- Students Reached: ${quickStats.totalStudentsReached || 0}
- Active Initiatives: ${quickStats.activeInitiatives || 0}
- Events This Month: ${quickStats.eventsThisMonth || 0}
- Feedback Received: ${quickStats.feedbackReceived || 0}`)

  // === Detailed Policy Overview ===
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
    const atZero = policies.filter(p => (p.progress || 0) === 0).length
    const above50 = policies.filter(p => (p.progress || 0) >= 50).length
    const at100 = policies.filter(p => (p.progress || 0) === 100).length

    let policySection = `## POLICY INITIATIVES (${policies.length} total)
- Overall Progress: ${avgProgress}%
- Status Breakdown: Completed: ${completed} | In Progress: ${inProgress} | Planned: ${planned}
- Milestone Tracking: ${atZero} at 0% (not started) | ${above50} at 50%+ (halfway+) | ${at100} at 100% (complete)
- High Priority: ${policies.filter(p => p.priority === 'high').length} | Medium: ${policies.filter(p => p.priority === 'medium').length} | Low: ${policies.filter(p => p.priority === 'low').length}\n`

    // Cross-department analysis
    const deptAnalysis = Object.entries(departments).map(([dept, pols]) => {
      const avg = Math.round(pols.reduce((s, p) => s + (p.progress || 0), 0) / pols.length)
      return { dept, avg, count: pols.length }
    }).sort((a, b) => b.avg - a.avg)

    policySection += `\nDepartment Rankings (by avg progress):\n`
    for (const d of deptAnalysis) {
      policySection += `- ${d.dept}: ${d.avg}% avg (${d.count} policies)\n`
    }

    // Per-department details with full descriptions and metrics
    for (const [dept, deptPolicies] of Object.entries(departments)) {
      const deptAvg = Math.round(deptPolicies.reduce((s, p) => s + (p.progress || 0), 0) / deptPolicies.length)
      policySection += `\n### ${dept} Department (${deptAvg}% avg, ${deptPolicies.length} policies)\n`
      for (const p of deptPolicies) {
        policySection += `- [${p.status}/${p.priority}] ${p.title}: ${p.progress}%\n`
        if (p.description) {
          policySection += `  Description: ${p.description.slice(0, 200)}${p.description.length > 200 ? '...' : ''}\n`
        }
        if (p.metrics && Object.keys(p.metrics).length > 0) {
          const metricStr = Object.entries(p.metrics).map(([k, v]) => `${k}=${v}`).join(', ')
          policySection += `  Metrics: ${metricStr}\n`
        }
      }
    }
    sections.push(policySection.trim())
  }

  // === Detailed Budget Overview ===
  if (budgetData.total || budgetData.allocated || budgetData.spent) {
    const remaining = (budgetData.total || 0) - (budgetData.spent || 0)
    const utilization = budgetData.total > 0 ? Math.round((budgetData.spent / budgetData.total) * 100) : 0

    let budgetSection = `## BUDGET (Detailed)
- Total Budget: $${(budgetData.total || 0).toLocaleString()}
- Allocated: $${(budgetData.allocated || 0).toLocaleString()}
- Spent: $${(budgetData.spent || 0).toLocaleString()}
- Remaining: $${remaining.toLocaleString()}
- Overall Utilization: ${utilization}%`

    if (budgetData.categories?.length > 0) {
      budgetSection += '\n\nCategory Breakdown:'
      const sorted = [...budgetData.categories].sort((a, b) => (b.spent || 0) - (a.spent || 0))
      for (const cat of sorted) {
        const pct = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0
        const status = pct >= 90 ? ' (NEAR LIMIT)' : pct >= 75 ? ' (HIGH)' : pct < 25 ? ' (UNDERSPENT)' : ''
        budgetSection += `\n- ${cat.name}: $${cat.spent?.toLocaleString() || 0} of $${cat.allocated?.toLocaleString() || 0} spent (${pct}%)${status}`
      }
    }
    sections.push(budgetSection)
  }

  // === Funding Requests Summary ===
  if (fundingRequests && fundingRequests.length > 0) {
    const pending = fundingRequests.filter(r => r.status === 'pending')
    const approved = fundingRequests.filter(r => r.status === 'approved')
    const denied = fundingRequests.filter(r => r.status === 'denied')
    const flagged = fundingRequests.filter(r => r.contextCheck?.flag === 'FLAG')
    const totalRequested = pending.reduce((s, r) => s + (r.amount || 0), 0)

    let frSection = `## FUNDING REQUESTS (${fundingRequests.length} total)
- Pending: ${pending.length} (total $${totalRequested.toLocaleString()} requested)
- Approved: ${approved.length} | Denied: ${denied.length}
- Flagged by AI: ${flagged.length}`

    if (pending.length > 0) {
      frSection += '\n\nPending Requests:'
      for (const r of pending.slice(0, 10)) {
        frSection += `\n- ${r.orgName}: $${r.amount?.toLocaleString()} for ${r.category} — "${(r.description || '').slice(0, 80)}"${r.contextCheck?.flag === 'FLAG' ? ' [FLAGGED]' : ''}`
      }
    }
    sections.push(frSection)
  }

  // === Detailed Operations Summary ===
  if (operationalData.techLoaners || operationalData.foodPantry || operationalData.trainings) {
    let opsSection = '## OPERATIONS (Detailed)\n'

    if (operationalData.techLoaners?.devices?.length > 0) {
      const totalDevices = operationalData.techLoaners.devices.reduce((s, d) => s + (d.total || 0), 0)
      const available = operationalData.techLoaners.devices.reduce((s, d) => s + (d.available || 0), 0)
      const onLoan = operationalData.techLoaners.devices.reduce((s, d) => s + (d.onLoan || 0), 0)
      const utilizationPct = totalDevices > 0 ? Math.round((onLoan / totalDevices) * 100) : 0
      opsSection += `\n### Tech Loaner Program
- Total Devices: ${totalDevices} | Available: ${available} | On Loan: ${onLoan} | Utilization: ${utilizationPct}%`
      for (const d of operationalData.techLoaners.devices) {
        opsSection += `\n  - ${d.name}: ${d.available}/${d.total} available (${d.total > 0 ? Math.round(((d.onLoan || 0) / d.total) * 100) : 0}% loaned)`
      }
      const activeLoans = (operationalData.techLoaners.loans || []).filter(l => l.status === 'active')
      const overdueLoans = (operationalData.techLoaners.loans || []).filter(l => l.status === 'overdue')
      if (activeLoans.length > 0 || overdueLoans.length > 0) {
        opsSection += `\n- Active Loans: ${activeLoans.length}${overdueLoans.length > 0 ? ` | OVERDUE: ${overdueLoans.length}` : ''}`
      }
    }

    if (operationalData.foodPantry) {
      opsSection += `\n\n### Food Pantry
- Total Visits: ${operationalData.foodPantry.totalVisits || 0}
- Donations: $${operationalData.foodPantry.donations || 0}
- Locations: ${operationalData.foodPantry.locations?.length || 0}`
      for (const loc of (operationalData.foodPantry.locations || [])) {
        const inv = loc.inventory || 'unknown'
        const warning = inv === 'critical' ? ' [CRITICAL]' : inv === 'low' ? ' [LOW]' : ''
        opsSection += `\n  - ${loc.name}: ${loc.visits || 0} visits, inventory: ${inv}${warning}`
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
      annSection += `- [${a.category}] ${a.title}${a.pinned ? ' (PINNED)' : ''}: ${(a.content || '').slice(0, 100)}${(a.content || '').length > 100 ? '...' : ''}\n`
    }
    sections.push(annSection.trim())
  }

  // === Detailed Student Feedback ===
  if (feedback.length > 0) {
    const newCount = feedback.filter(f => f.status === 'new').length
    const reviewedCount = feedback.filter(f => f.status === 'reviewed').length
    const resolvedCount = feedback.filter(f => f.status === 'resolved').length
    let fbSection = `## STUDENT FEEDBACK (${feedback.length} total)
- New/Unread: ${newCount} | Reviewed: ${reviewedCount} | Resolved: ${resolvedCount}`

    // Show up to 10 most recent feedback items
    const recentFb = feedback.filter(f => f.status === 'new').slice(0, 10)
    if (recentFb.length > 0) {
      fbSection += '\n\nRecent unread feedback:'
      for (const f of recentFb) {
        const preview = (f.message || '').slice(0, 150)
        fbSection += `\n- "${preview}${f.message?.length > 150 ? '...' : ''}" (${f.category || 'general'}, ${f.submittedAt ? new Date(f.submittedAt).toLocaleDateString() : 'recent'})`
      }
    }

    // Category breakdown
    const categories = {}
    for (const f of feedback) {
      categories[f.category || 'general'] = (categories[f.category || 'general'] || 0) + 1
    }
    fbSection += '\n\nFeedback by category:'
    for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
      fbSection += `\n- ${cat}: ${count}`
    }
    sections.push(fbSection)
  }

  // === Accountability & Transparency ===
  sections.push(`## ACCOUNTABILITY & TRANSPARENCY
This platform serves as a transparency tool for UNC Student Government. All policy progress, budget allocations, operational metrics, and student feedback shown above are publicly accessible. The Scroll knowledge base contains all approved governance documents that inform decision-making. Budget verification is powered by Grok AI to ensure realistic funding requests. Every document in The Scroll is versioned, timestamped, and attributed.`)

  // === Resources ===
  sections.push(`## RESOURCES ON THIS PLATFORM
The website provides: policy tracking across 5 departments (${policies.length} total policies), budget transparency dashboard with line-item detail, funding request submission with AI validation, The Scroll knowledge base with searchable governance documents, student feedback system, tech loaner program tracking, food pantry operations, mental health first aid training records, and announcements. All of these data sources are available to Grok through The Scroll RAG system.`)

  return sections.join('\n\n---\n\n')
}

// Build the enhanced system prompt — Hyper-Tuned for comprehensive, detailed responses
export function buildEnhancedSystemPrompt(documentContext, platformContext, isAdminMode = false) {
  const role = isAdminMode
    ? `You are the UNC Student Government Grok Admin Assistant — a deeply knowledgeable, data-driven governance analyst. You have FULL ACCESS to The Scroll knowledge base, all governance documents, live platform data including every policy, its progress, metrics, and department assignment, detailed budget data with category breakdowns and utilization rates, operational metrics for tech loans, food pantry, and training programs, all student feedback, and funding request details with AI-flagged items.`
    : `You are the UNC Student Government Grok Assistant. You help students and community members understand governance, policies, budget, and available resources. You source your knowledge from The Scroll — the official knowledge base of approved governance documents — plus live platform data.`

  const adminRules = isAdminMode ? `
- You are in ADMIN MODE. Provide deeply detailed operational insights with specific numbers, percentages, and data points.
- ALWAYS cross-reference data across sources: when discussing a policy, cite its progress %, budget allocation, relevant Scroll documents, related feedback, and operational impact.
- When discussing budget, break down by category, show utilization rates, flag underspent/overspent areas, and connect to policy needs.
- When discussing operations, include device counts, loan utilization %, pantry inventory status, training completion numbers.
- For audit-style questions: provide executive summary, then detailed findings per department, then prioritized recommendations.
- For department questions: comprehensively cover ALL policies in that department, their budget allocation, operational programs, related feedback, and Scroll documents.
- Provide ACTIONABLE RECOMMENDATIONS — don't just report data, tell admins what they should do about it.
- Include trend analysis when data supports it (e.g., "3 of 5 wellness policies are still at 0% — this department needs immediate attention").
- End every substantive answer with a "Key Takeaways" section summarizing the 3-5 most important points and recommended actions.
- When asked to generate reports: structure them as a clear narrative with sections, not just data dumps.` : ''

  return `${role}

You have access to THREE types of context:
1. THE SCROLL — Approved governance documents (the RAG knowledge base)
2. LIVE PLATFORM DATA — Real-time metrics, budget, operations, feedback, and policy progress
3. IMPLICIT CONTEXT — Accountability, transparency, and resource data from the platform itself

CRITICAL RULES:
- NEVER use markdown formatting. No headers (#), no bold (**), no italic (*), no bullet points (- or *), no numbered lists (1.), no code blocks, no links. Write in clean, natural prose with paragraph breaks only.
- Provide COMPREHENSIVE answers. For substantive questions, write at minimum 3-4 detailed paragraphs.
- ALWAYS cross-reference relevant data: when you mention a policy, include its progress percentage and status. When you mention budget, include specific dollar amounts. When you mention operations, include specific numbers.
- Cite The Scroll documents by name, version, and section: "according to the Student Fee Transparency Act v1.0 in The Scroll"
- Weave platform data naturally into your response — don't just list numbers, explain what they mean and why they matter.
- Be thorough, precise, and actionable. Every response should give the reader clear understanding and next steps.
- If you don't have enough information, say so clearly and suggest what data would be needed.
- Connect related topics across departments — show how policies, budget, operations, and feedback relate to each other.
- When multiple data sources are relevant, synthesize them into a coherent analysis, don't just present them separately.
${adminRules}

${documentContext ? `THE SCROLL — DOCUMENT CONTEXT:
${documentContext}

---

` : ''}LIVE PLATFORM DATA:
${platformContext || 'No platform data available.'}`
}
