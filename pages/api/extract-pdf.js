export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROK_API_KEY not configured. Add it to your .env.local file.' })
  }

  const { url, query } = req.body
  if (!url) {
    return res.status(400).json({ error: 'Missing document URL' })
  }

  try {
    // Fetch the PDF
    const pdfResponse = await fetch(url)
    if (!pdfResponse.ok) {
      return res.status(502).json({ error: `Failed to fetch PDF: ${pdfResponse.status}` })
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64')
    const dataUri = `data:application/pdf;base64,${base64Pdf}`

    const prompt = query
      ? `Read this PDF document and answer the following question based on its contents:\n\n"${query}"\n\nProvide a clear, accurate answer citing specific sections when possible.`
      : 'Read this PDF document and provide a comprehensive summary. Include the document title, key sections, main points, and any important definitions or procedures. Format your response with clear headings and bullet points.'

    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2-vision-1212',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dataUri } },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    })

    if (!grokResponse.ok) {
      const errBody = await grokResponse.text()
      console.error('Grok API error:', grokResponse.status, errBody)
      return res.status(502).json({ error: `Grok API returned ${grokResponse.status}` })
    }

    const data = await grokResponse.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return res.status(502).json({ error: 'No content returned from Grok API' })
    }

    return res.status(200).json({ content, model: data.model })
  } catch (err) {
    console.error('PDF extraction error:', err)
    return res.status(500).json({ error: err.message })
  }
}
