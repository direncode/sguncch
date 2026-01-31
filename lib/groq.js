// ============================================
// GROQ LLAMA 3.3 INTEGRATION
// Real-world context validation for budget requests
// ============================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Validate a funding request against real-world context using LLAMA 3.3
 * Returns contextual analysis including price reasonableness, alternatives, and flags
 */
export async function validateFundingRequest(request) {
  const apiKey = process.env.GROQ_API_KEY

  // If no API key, return a default pass-through response
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set - skipping AI validation')
    return {
      validated: true,
      skipped: true,
      reason: 'API key not configured',
    }
  }

  const prompt = buildValidationPrompt(request)

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a budget analyst for UNC Student Government. Your job is to validate funding requests by checking if the requested amounts are reasonable for what's being purchased/funded.

You must respond with valid JSON only, no markdown or explanation outside the JSON. Use this exact format:
{
  "isReasonable": true/false,
  "confidence": 0-100,
  "marketAnalysis": "Brief analysis of typical costs for this type of request",
  "suggestedRange": { "min": number, "max": number },
  "flags": ["array of any red flags or concerns"],
  "alternatives": ["cost-saving alternatives if applicable"],
  "recommendation": "APPROVE" | "REVIEW" | "FLAG" | "REJECT",
  "reasoning": "One sentence explanation"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      return {
        validated: true,
        skipped: true,
        reason: `API error: ${response.status}`,
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return {
        validated: true,
        skipped: true,
        reason: 'Empty response from API',
      }
    }

    // Parse the JSON response
    try {
      const analysis = JSON.parse(content)
      return {
        validated: true,
        skipped: false,
        ...analysis,
        model: 'llama-3.3-70b-versatile',
        timestamp: new Date().toISOString(),
      }
    } catch (parseError) {
      console.error('Failed to parse Groq response:', content)
      return {
        validated: true,
        skipped: true,
        reason: 'Failed to parse AI response',
        rawResponse: content,
      }
    }
  } catch (error) {
    console.error('Groq API request failed:', error)
    return {
      validated: true,
      skipped: true,
      reason: `Request failed: ${error.message}`,
    }
  }
}

/**
 * Build the validation prompt from the funding request
 */
function buildValidationPrompt(request) {
  return `Please validate this student organization funding request:

Organization: ${request.orgName}
Category: ${request.category}
Amount Requested: $${request.amount?.toLocaleString()}
Description: ${request.description}
Justification: ${request.justification}
Students Impacted: ${request.studentsImpacted || 'Not specified'}

Context: This is a UNC Chapel Hill Student Government funding request. The total SG budget is approximately $500,000/year. Typical approved requests range from $200-$15,000.

Analyze whether $${request.amount?.toLocaleString()} is reasonable for "${request.description}" and provide your assessment.`
}

/**
 * Quick price check for common categories
 * Returns rough market estimates without API call
 */
export function quickPriceCheck(category, amount, description) {
  const categoryBenchmarks = {
    events: { typical: 2000, max: 15000, perStudent: 25 },
    travel: { typical: 500, max: 5000, perStudent: 200 },
    equipment: { typical: 1000, max: 10000, perStudent: 50 },
    programming: { typical: 1500, max: 8000, perStudent: 15 },
    marketing: { typical: 500, max: 3000, perStudent: 5 },
    operations: { typical: 1000, max: 5000, perStudent: 10 },
    emergency: { typical: 500, max: 2000, perStudent: 100 },
  }

  const benchmark = categoryBenchmarks[category] || categoryBenchmarks.events

  const flags = []
  let severity = 'normal'

  if (amount > benchmark.max * 2) {
    flags.push(`Amount exceeds 2x typical maximum for ${category}`)
    severity = 'high'
  } else if (amount > benchmark.max) {
    flags.push(`Amount exceeds typical maximum for ${category}`)
    severity = 'medium'
  }

  if (amount > 10000 && !description.toLowerCase().includes('conference') &&
      !description.toLowerCase().includes('competition') &&
      !description.toLowerCase().includes('national')) {
    flags.push('Large request without major event keywords')
    severity = severity === 'normal' ? 'medium' : severity
  }

  return {
    benchmark,
    flags,
    severity,
    requiresDeepValidation: severity !== 'normal' || amount > 5000,
  }
}

export default { validateFundingRequest, quickPriceCheck }
