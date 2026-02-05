// ============================================
// GROQ LLAMA 3.3 INTEGRATION
// Simple context validation for budget requests
// ============================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

/**
 * Validate a funding request against real-world context using LLAMA 3.3
 * Returns a simple pass/flag result based on whether the amount is realistic
 */
export async function validateFundingRequest(request) {
  const apiKey = process.env.GROQ_API_KEY

  console.log('[Groq] validateFundingRequest called for:', request.orgName, '$' + request.amount)
  console.log('[Groq] GROQ_API_KEY configured:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No')

  // If no API key, return a default pass-through response
  if (!apiKey) {
    console.warn('[Groq] GROQ_API_KEY not set - skipping context validation')
    return {
      validated: true,
      skipped: true,
      isRealistic: true,
      reason: 'GROQ_API_KEY not configured. Get a free key at https://console.groq.com',
    }
  }

  if (apiKey.includes('your-')) {
    console.warn('[Groq] GROQ_API_KEY appears to be placeholder value')
    return {
      validated: true,
      skipped: true,
      isRealistic: true,
      reason: 'GROQ_API_KEY is still set to placeholder. Update with real key from https://console.groq.com',
    }
  }

  const prompt = buildContextPrompt(request)
  console.log('[Groq] Sending request to Groq API...')

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
            content: `You are a context checker for student organization funding requests. Your only job is to verify if the requested amount is realistic compared to real-world costs.

You must respond with valid JSON only, no markdown or explanation outside the JSON. Use this exact format:
{
  "isRealistic": true/false,
  "marketContext": "Brief explanation of typical costs for this type of expense",
  "typicalRange": { "min": number, "max": number },
  "flag": "PASS" | "FLAG",
  "note": "One sentence summary"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    })

    console.log('[Groq] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Groq] API error:', response.status, errorText)
      return {
        validated: true,
        skipped: true,
        isRealistic: true,
        reason: `Groq API error: ${response.status}. Check your API key at https://console.groq.com`,
        details: errorText,
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    console.log('[Groq] Response received, content length:', content?.length || 0)

    if (!content) {
      console.warn('[Groq] Empty content in response')
      return {
        validated: true,
        skipped: true,
        isRealistic: true,
        reason: 'Empty response from Groq API',
      }
    }

    // Parse the JSON response
    try {
      const analysis = JSON.parse(content)
      console.log('[Groq] Successfully parsed response:', analysis.flag)
      return {
        validated: true,
        skipped: false,
        isRealistic: analysis.isRealistic,
        marketContext: analysis.marketContext,
        typicalRange: analysis.typicalRange,
        flag: analysis.flag,
        note: analysis.note,
        model: 'llama-3.3-70b-versatile',
        timestamp: new Date().toISOString(),
      }
    } catch (parseError) {
      console.error('[Groq] Failed to parse response as JSON:', parseError.message)
      console.error('[Groq] Raw content:', content.substring(0, 500))
      return {
        validated: true,
        skipped: true,
        isRealistic: true,
        reason: 'Failed to parse AI response as JSON',
        rawResponse: content.substring(0, 500),
      }
    }
  } catch (error) {
    console.error('[Groq] Request failed:', error.name, error.message)
    return {
      validated: true,
      skipped: true,
      isRealistic: true,
      reason: `Groq request failed: ${error.message}`,
    }
  }
}

/**
 * Build the context check prompt from the funding request
 */
function buildContextPrompt(request) {
  return `Check if this student organization funding request amount is realistic:

Organization: ${request.orgName}
Category: ${request.category}
Amount Requested: $${request.amount?.toLocaleString()}
Description: ${request.description}
Students Impacted: ${request.studentsImpacted || 'Not specified'}

Is $${request.amount?.toLocaleString()} a realistic amount for "${request.description}"? Compare against typical real-world costs for similar expenses.`
}

/**
 * Quick local price check for common categories (no API call)
 * Returns rough market estimates as a fallback
 */
export function quickPriceCheck(category, amount, description, studentsImpacted = null) {
  const categoryBenchmarks = {
    events: { typical: 2000, max: 15000, perStudent: 25 },
    travel: { typical: 500, max: 5000, perStudent: 200 },
    equipment: { typical: 1000, max: 10000, perStudent: 50 },
    programming: { typical: 1500, max: 8000, perStudent: 15 },
    marketing: { typical: 500, max: 3000, perStudent: 5 },
    operations: { typical: 1000, max: 5000, perStudent: 10 },
    emergency: { typical: 500, max: 2000, perStudent: 100 },
    food: { typical: 500, max: 3000, perStudent: 15 },
  }

  const benchmark = categoryBenchmarks[category] || categoryBenchmarks.events

  let isRealistic = true
  let note = 'Amount appears reasonable'

  if (amount > benchmark.max * 2) {
    isRealistic = false
    note = `Amount significantly exceeds typical maximum ($${benchmark.max.toLocaleString()}) for ${category}`
  } else if (amount > benchmark.max) {
    note = `Amount is above typical maximum ($${benchmark.max.toLocaleString()}) for ${category} - may need review`
  }

  // Check per-student cost if provided
  if (studentsImpacted && studentsImpacted > 0) {
    const perStudentCost = amount / studentsImpacted
    if (perStudentCost > benchmark.perStudent * 3) {
      isRealistic = false
      note = `Per-student cost ($${perStudentCost.toFixed(2)}) is very high for ${category}`
    }
  }

  return {
    isRealistic,
    benchmark,
    note,
    typicalRange: { min: 0, max: benchmark.max },
  }
}

export default { validateFundingRequest, quickPriceCheck }
