import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(req: NextRequest) {
  const fpoId = req.nextUrl.searchParams.get('fpoId')
  if (!fpoId) return NextResponse.json({ success: false, error: 'fpoId required' }, { status: 400 })

  try {
    const db = await getDb()

    // Gather real context in parallel
    const [
      pendingPayoutsRes,
      mandiPricesRes,
      inTransitRes,
      godownReadyRes,
      revenueRes,
    ] = await Promise.allSettled([
      // Pending payouts
      db.query(
        `SELECT COUNT(*) as count, COALESCE(SUM(net_amount),0) as total
         FROM payouts WHERE fpo_id = $1 AND payment_status = 'PENDING'`,
        [fpoId]
      ),
      // Top mandi prices (live data)
      db.query(
        `SELECT name, state, price_per_quintal, crop_type
         FROM mandis
         WHERE price_per_quintal > 0
         ORDER BY price_per_quintal DESC
         LIMIT 5`
      ),
      // Dispatches currently in transit
      db.query(
        `SELECT crop, mandi_id, total_quantity, current_stage
         FROM dispatches
         WHERE fpo_id = $1 AND current_stage BETWEEN 1 AND 3
         ORDER BY created_at DESC LIMIT 5`,
        [fpoId]
      ),
      // Harvests at godown waiting to be dispatched
      db.query(
        `SELECT crop_type, COUNT(*) as count,
                SUM(COALESCE(quantity_final, quantity_actual, quantity_estimated, 0)::numeric) as total_qty
         FROM harvests
         WHERE fpo_id = $1 AND status = 'GODOWN_RECEIVED'
         GROUP BY crop_type`,
        [fpoId]
      ),
      // Revenue this month
      db.query(
        `SELECT COALESCE(SUM(actual_revenue),0) as revenue,
                COUNT(*) as dispatches
         FROM dispatches
         WHERE fpo_id = $1
           AND current_stage >= 4
           AND sold_at >= date_trunc('month', NOW())`,
        [fpoId]
      ),
    ])

    // Extract data safely
    const pending = pendingPayoutsRes.status === 'fulfilled'
      ? { count: parseInt(pendingPayoutsRes.value.rows[0]?.count ?? '0'), total: parseFloat(pendingPayoutsRes.value.rows[0]?.total ?? '0') }
      : { count: 0, total: 0 }

    const mandis = mandiPricesRes.status === 'fulfilled' ? mandiPricesRes.value.rows : []
    const inTransit = inTransitRes.status === 'fulfilled' ? inTransitRes.value.rows : []
    const godownReady = godownReadyRes.status === 'fulfilled' ? godownReadyRes.value.rows : []
    const revenue = revenueRes.status === 'fulfilled'
      ? { amount: parseFloat(revenueRes.value.rows[0]?.revenue ?? '0'), dispatches: parseInt(revenueRes.value.rows[0]?.dispatches ?? '0') }
      : { amount: 0, dispatches: 0 }

    // Build context string for Gemini
    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const month = new Date().toLocaleDateString('en-IN', { month: 'long' })

    const context = `
Today: ${today}
Month: ${month}

PENDING PAYOUTS:
- ${pending.count} farmers are awaiting payment
- Total pending amount: ₹${Math.round(pending.total).toLocaleString('en-IN')}

TOP MANDI PRICES RIGHT NOW:
${mandis.length > 0
  ? mandis.map((m: { name: string; state: string; price_per_quintal: string; crop_type: string }) =>
      `- ${m.name}, ${m.state}: ₹${Math.round(parseFloat(m.price_per_quintal))}/q (${m.crop_type || 'general'})`
    ).join('\n')
  : '- No mandi price data available'}

DISPATCHES IN TRANSIT:
${inTransit.length > 0
  ? inTransit.map((d: { crop: string; total_quantity: string; current_stage: number }) =>
      `- ${d.crop}: ${Math.round(parseFloat(d.total_quantity))}q, stage ${d.current_stage}/5`
    ).join('\n')
  : '- No dispatches currently in transit'}

CROPS AT GODOWN (READY TO DISPATCH):
${godownReady.length > 0
  ? godownReady.map((g: { crop_type: string; count: string; total_qty: string }) =>
      `- ${g.crop_type}: ${g.count} farmer(s), ${Math.round(parseFloat(g.total_qty))}q ready`
    ).join('\n')
  : '- No crops awaiting dispatch'}

REVENUE THIS MONTH:
- ₹${Math.round(revenue.amount).toLocaleString('en-IN')} from ${revenue.dispatches} dispatch${revenue.dispatches !== 1 ? 'es' : ''}
`.trim()

    // Call Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // Fallback if no API key
      return NextResponse.json({
        success: true,
        insights: buildFallback(pending, mandis, godownReady),
        cached: false,
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an AI advisor for an Indian Farmer Producer Organisation (FPO) management platform called CropChain OS.

Based on the real data below, generate exactly 3 actionable insights for the FPO manager for today. Be specific, data-driven, and use the actual numbers from the context.

${context}

Respond ONLY in this exact JSON format — no markdown, no code fences, no extra text:
[
  {
    "type": "payment" | "price" | "weather" | "dispatch" | "alert" | "opportunity",
    "title": "<short action headline, max 8 words, specific>",
    "detail": "<one line of supporting data or recommendation>"
  },
  { ... },
  { ... }
]

Rules:
- Use actual numbers from the context (pending count, amounts, quantities, mandi names)
- If pending payouts > 0, one insight MUST be about clearing those payments
- If crops are at godown, recommend dispatching to the highest-priced mandi
- Type must be one of: payment, price, dispatch, alert, opportunity`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    const parsed = JSON.parse(raw)
    const insights = Array.isArray(parsed) ? parsed.slice(0, 3) : buildFallback(pending, mandis, godownReady)

    return NextResponse.json({ success: true, insights, cached: false })
  } catch (err) {
    console.error('[GET /api/ai/insights]', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

function buildFallback(
  pending: { count: number; total: number },
  mandis: { name: string; price_per_quintal: string }[],
  godownReady: { crop_type: string; total_qty: string }[]
) {
  const insights = []
  if (pending.count > 0) {
    insights.push({
      type: 'payment',
      title: `${pending.count} farmer payment${pending.count > 1 ? 's' : ''} pending`,
      detail: `₹${Math.round(pending.total).toLocaleString('en-IN')} awaiting payout approval`,
    })
  }
  if (mandis.length > 0) {
    const top = mandis[0]
    insights.push({
      type: 'price',
      title: `${top.name} has highest price today`,
      detail: `₹${Math.round(parseFloat(top.price_per_quintal))}/q — consider dispatching now`,
    })
  }
  if (godownReady.length > 0) {
    const g = godownReady[0]
    insights.push({
      type: 'dispatch',
      title: `${Math.round(parseFloat(g.total_qty))}q ${g.crop_type} ready to dispatch`,
      detail: 'Crops at godown awaiting dispatch order',
    })
  }
  while (insights.length < 3) {
    insights.push({ type: 'opportunity', title: 'Review FPO performance', detail: 'Check dispatches and earnings summary' })
  }
  return insights.slice(0, 3)
}
