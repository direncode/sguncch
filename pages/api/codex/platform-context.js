import { buildPlatformContext } from '../../../lib/platformContext'

/**
 * Returns the live platform context as a structured string.
 * Called by the chat API to inject real-time platform data into Grok prompts.
 * Also accepts POST with platform data from the client for localStorage-mode.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const platformData = req.body

    if (!platformData || typeof platformData !== 'object') {
      return res.status(400).json({ error: 'Platform data object is required' })
    }

    const context = buildPlatformContext(platformData)

    return res.status(200).json({ context })
  } catch (err) {
    console.error('Platform context error:', err)
    return res.status(500).json({ error: 'Failed to build platform context' })
  }
}
