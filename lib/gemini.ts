import { GoogleGenerativeAI } from '@google/generative-ai'

export interface MandiInput {
  name: string
  pricePerQuintal: number
  transportCost: number
  commission: number
  trustScore: number
  estimatedSettlementDays: string
  distanceKm: number
}

export interface GeminiRecommendation {
  recommendedMandi: string
  confidence: number
  summary: string
  reasons: string[]
  aiUsed: boolean
}

export async function getBestMandiRecommendation(input: {
  crop: string
  quantity: number
  mandis: MandiInput[]
}): Promise<GeminiRecommendation> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const mandiSummary = input.mandis
    .map((m, i) =>
      `${i + 1}. ${m.name}: Price ₹${m.pricePerQuintal}/q, Transport ₹${m.transportCost}/q, Commission ₹${m.commission}/q, Trust Score ${m.trustScore}/100, Payment ${m.estimatedSettlementDays}`
    )
    .join('\n')

  const prompt = `You are an expert agricultural market advisor for Indian farmers and FPOs.
The backend has already mathematically ranked these mandis by net profit. Your job is ONLY to explain the recommendation — never recalculate numbers.

Crop: ${input.crop}
Quantity: ${input.quantity} quintals

Top mandis ranked by net profit (backend-calculated):
${mandiSummary}

Mandi #1 is the recommended choice. Explain why in 3-5 concise bullet points covering price advantage, trust/reliability, payment speed, and any trade-offs.

Respond ONLY in this exact JSON format — no markdown, no code blocks, no extra text:
{
  "recommendedMandi": "<exact name of mandi #1>",
  "confidence": <integer between 80 and 99>,
  "summary": "<one sentence: why this mandi wins for this farmer/FPO>",
  "reasons": ["<reason 1>", "<reason 2>", "<reason 3>", "<reason 4>", "<reason 5>"]
}`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim()

  // Strip any markdown code fences Gemini sometimes adds
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  return {
    recommendedMandi: String(parsed.recommendedMandi || input.mandis[0]?.name || ''),
    confidence: Math.min(99, Math.max(80, parseInt(parsed.confidence) || 90)),
    summary: String(parsed.summary || ''),
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 5).map(String) : [],
    aiUsed: true,
  }
}
