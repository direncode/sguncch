// The Scroll API — returns approved documents with text and auto-categorized buckets

import { getDocuments } from '../../../lib/codex'

const CATEGORIES = [
  { id: 'laws', label: 'Laws & Statutes', keywords: ['law', 'statute', 'code of conduct', 'act', 'legislation', 'legal', 'ordinance', 'regulation', 'compliance', 'ferpa', 'title ix', 'clery', 'judicial', 'enforcement'] },
  { id: 'policies', label: 'Policies & Governance', keywords: ['policy', 'governance', 'procedure', 'bylaw', 'constitution', 'charter', 'rules', 'guideline', 'conduct', 'honor code', 'resolution', 'mandate', 'directive'] },
  { id: 'resources', label: 'Resources & Services', keywords: ['resource', 'service', 'support', 'program', 'center', 'office', 'help', 'assistance', 'counseling', 'health', 'wellness', 'safety', 'hotline'] },
  { id: 'academic', label: 'Academic', keywords: ['academic', 'course', 'faculty', 'curriculum', 'degree', 'registration', 'advising', 'research', 'grading', 'syllabus', 'professor', 'dean', 'provost'] },
  { id: 'budget', label: 'Budget & Finance', keywords: ['budget', 'finance', 'funding', 'allocation', 'expenditure', 'revenue', 'fee', 'cost', 'appropriation', 'treasurer', 'fiscal', 'stipend', 'grant'] },
  { id: 'student-life', label: 'Student Life', keywords: ['organization', 'club', 'event', 'housing', 'dining', 'recreation', 'campus life', 'greek', 'fraternity', 'sorority', 'athletics', 'orientation'] },
]

function categorizeDocument(title, textPreview) {
  const searchText = `${title} ${textPreview}`.toLowerCase()
  let bestMatch = null
  let bestScore = 0

  for (const cat of CATEGORIES) {
    let score = 0
    for (const kw of cat.keywords) {
      if (searchText.includes(kw)) {
        score += kw.includes(' ') ? 3 : 1
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = cat.id
    }
  }

  return bestMatch || 'general'
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Uses lib/codex.js which handles Supabase vs file-based fallback automatically
    const { data: documents, error } = await getDocuments('approved', { includeText: true })

    if (error) {
      console.error('Scroll API - getDocuments error:', error)
      return res.status(500).json({ error: 'Failed to load The Scroll' })
    }

    // Categorize each document
    const categorized = (documents || []).map(doc => {
      const preview = (doc.text_full || '').slice(0, 1000)
      return {
        id: doc.id,
        title: doc.title,
        version: doc.version,
        text_full: doc.text_full,
        file_name: doc.file_name,
        approved_at: doc.approved_at,
        created_at: doc.created_at,
        category: categorizeDocument(doc.title, preview),
        char_count: (doc.text_full || '').length,
      }
    })

    // Build category summary
    const allCategories = [...CATEGORIES, { id: 'general', label: 'General', keywords: [] }]
    const buckets = allCategories.map(cat => ({
      id: cat.id,
      label: cat.label,
      count: categorized.filter(d => d.category === cat.id).length,
    })).filter(b => b.count > 0)

    return res.status(200).json({
      documents: categorized,
      buckets,
      total: categorized.length,
    })
  } catch (err) {
    console.error('Scroll API error:', err)
    return res.status(500).json({ error: 'Failed to load The Scroll' })
  }
}
