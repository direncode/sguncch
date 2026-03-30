import { callGrok } from '../../../lib/embeddings'
import { withAdminAuth } from '../../../lib/auth'
import { getDocuments } from '../../../lib/codex'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, title } = req.body

  if (!text || text.length < 50) {
    return res.status(400).json({ error: 'Document text must be at least 50 characters' })
  }

  try {
    // Get existing documents for duplicate detection
    let existingTitles = []
    try {
      const { data: approved } = await getDocuments('approved')
      existingTitles = (approved || []).map(d => d.title)
    } catch { /* non-blocking */ }

    const preview = text.slice(0, 3000)

    const prompt = `Analyze this governance document and return a JSON response with exactly these fields:

{
  "category": one of "laws", "policies", "resources", "academic", "budget", "student-life", "general",
  "confidence": number 0-100 representing how confident you are in the category,
  "summary": a 2-3 sentence summary of the document's purpose and key content,
  "keyProvisions": an array of up to 5 strings, each being a key provision or important section title from the document,
  "similarDocs": an array of existing document titles that this document may be related to or duplicating
}

${title ? `Document title: "${title}"` : ''}

Existing documents in the knowledge base: ${existingTitles.length > 0 ? existingTitles.join(', ') : 'none yet'}

Document text (first 3000 chars):
${preview}

Return ONLY the JSON object, no other text.`

    const result = await callGrok([
      { role: 'system', content: 'You are a document analyzer for a UNC Student Government knowledge base. Respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ], { temperature: 0.1, maxTokens: 512 })

    // Parse JSON from response
    let analysis
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : result)
    } catch {
      analysis = {
        category: 'general',
        confidence: 50,
        summary: 'Unable to generate summary automatically.',
        keyProvisions: [],
        similarDocs: [],
      }
    }

    return res.status(200).json({
      category: analysis.category || 'general',
      confidence: Math.min(100, Math.max(0, analysis.confidence || 50)),
      summary: (analysis.summary || '').slice(0, 500),
      keyProvisions: Array.isArray(analysis.keyProvisions) ? analysis.keyProvisions.slice(0, 5) : [],
      similarDocs: Array.isArray(analysis.similarDocs) ? analysis.similarDocs.slice(0, 5) : [],
    })
  } catch (err) {
    console.error('Document analysis error:', err)
    return res.status(500).json({ error: 'Analysis failed' })
  }
}

export default withAdminAuth(handler)
