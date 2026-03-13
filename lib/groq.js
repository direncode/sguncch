// ============================================
// GROK (xAI) BUDGET VERIFICATION
// Uses Grok for real-world context validation of budget requests
// Unified under xAI — same provider as embeddings & chat
// ============================================

import { createLogger } from './logger'

const log = createLogger('Grok-Budget')
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions'

function getApiKey() {
  return process.env.XAI_API_KEY || null
}

/**
 * Validate a funding request against real-world context using Grok
 * Returns a simple pass/flag result based on whether the amount is realistic
 */
export async function validateFundingRequest(request) {
  const apiKey = getApiKey()

  log.info('validateFundingRequest called', { orgName: request.orgName, amount: request.amount })
  log.info('XAI_API_KEY configured', { configured: !!apiKey })

  if (!apiKey) {
    log.warn('XAI_API_KEY not set — skipping context validation')
    return {
      validated: true,
      skipped: true,
      isRealistic: true,
      reason: 'XAI_API_KEY not configured. Set it in your environment variables.',
    }
  }

  const prompt = buildContextPrompt(request)
  log.info('Sending request to xAI Grok')

  try {
    const response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-4',
        messages: [
          {
            role: 'system',
            content: `You are a budget verification assistant for UNC Student Government. Your job is to validate if funding request amounts are realistic compared to real-world costs.

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

    log.info('Response status', { status: response.status })

    if (!response.ok) {
      const errorText = await response.text()
      log.error('API error', { status: response.status, error: errorText })
      return {
        validated: true,
        skipped: true,
        isRealistic: true,
        reason: `Grok API error: ${response.status}. Check your XAI_API_KEY.`,
        details: errorText,
      }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    log.info('Response received', { contentLength: content?.length || 0 })

    if (!content) {
      log.warn('Empty content in response')
      return {
        validated: true,
        skipped: true,
        isRealistic: true,
        reason: 'Empty response from Grok API',
      }
    }

    // Parse the JSON response — strip markdown fences if Grok wraps them
    try {
      const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      const analysis = JSON.parse(cleaned)
      log.info('Successfully parsed response', { flag: analysis.flag })
      return {
        validated: true,
        skipped: false,
        isRealistic: analysis.isRealistic,
        marketContext: analysis.marketContext,
        typicalRange: analysis.typicalRange,
        flag: analysis.flag,
        note: analysis.note,
        model: 'grok-4',
        timestamp: new Date().toISOString(),
      }
    } catch (parseError) {
      log.error('Failed to parse response as JSON', { error: parseError.message, rawContent: content.substring(0, 500) })
      return {
        validated: true,
        skipped: true,
        isRealistic: true,
        reason: 'Failed to parse AI response as JSON',
        rawResponse: content.substring(0, 500),
      }
    }
  } catch (error) {
    log.error('Request failed', { errorName: error.name, error: error.message })
    return {
      validated: true,
      skipped: true,
      isRealistic: true,
      reason: `Grok request failed: ${error.message}`,
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
