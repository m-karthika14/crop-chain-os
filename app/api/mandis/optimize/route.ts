import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getBestMandiRecommendation } from '@/lib/gemini'

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { crop, quantityQ, fpoId } = body

    if (!crop) {
      return NextResponse.json({ success: false, error: 'crop is required' }, { status: 400 })
    }

    const db = await getDb()

    // Fetch FPO location from DB
    const fpoResult = await db.query(
      `SELECT id, organization_name, district, state, lat, lng FROM fpos WHERE id = $1`,
      [fpoId || 'fpo-001']
    )

    const fpo = fpoResult.rows[0]
    const fpoLat = fpo?.lat ? parseFloat(fpo.lat) : 29.6857  // fallback: Karnal, Haryana
    const fpoLng = fpo?.lng ? parseFloat(fpo.lng) : 76.9905
    const fpoLocation = fpo
      ? `${fpo.district || fpo.state}, ${fpo.state}`
      : 'Karnal, Haryana'

    // Fetch mandis with today's prices and trust scores (including mandi coordinates)
    const result = await db.query(
      `SELECT
         m.id, m.name, m.state, m.district,
         m.lat, m.lng,
         mp.modal_price,
         COALESCE(ts.score,
           CASE
             WHEN mp.max_price > 0 AND mp.min_price > 0
               AND (mp.max_price - mp.min_price)::float / NULLIF(mp.modal_price, 0) < 0.05 THEN 85
             WHEN mp.max_price > 0 AND mp.min_price > 0
               AND (mp.max_price - mp.min_price)::float / NULLIF(mp.modal_price, 0) < 0.15 THEN 72
             WHEN mp.max_price > 0 AND mp.min_price > 0
               AND (mp.max_price - mp.min_price)::float / NULLIF(mp.modal_price, 0) < 0.30 THEN 58
             ELSE 45
           END
         )                                       AS trust_score,
         COALESCE(ts.payment_speed, '2-3 Days')  AS payment_speed,
         COALESCE(ts.commission_pct, 1.5)        AS commission_pct,
         COALESCE(ts.avg_payment_delay_days, 3)  AS avg_payment_delay_days
       FROM mandis m
       JOIN mandi_prices mp ON mp.mandi_id = m.id
         AND mp.crop = $1
         AND mp.recorded_date = CURRENT_DATE
       LEFT JOIN trust_scores ts ON ts.mandi_id = m.id
       ORDER BY mp.modal_price DESC`,
      [crop]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true, mandis: [], winner: null, totalRevenue: 0,
        aiInsight: null, fpoLocation,
      })
    }

    const qty = parseFloat(quantityQ) || 0

    // Calculate real distance + net price for each mandi
    const rankedMandis = result.rows
      .map(row => {
        const trustScore = parseInt(row.trust_score) || 0
        const modalPrice = parseFloat(row.modal_price) || 0
        const commissionPct = parseFloat(row.commission_pct) || 0
        const avgDelayDays = parseFloat(row.avg_payment_delay_days) || 0
        const mandiLat = parseFloat(row.lat)
        const mandiLng = parseFloat(row.lng)

        const distKm = Math.round(haversineKm(fpoLat, fpoLng, mandiLat, mandiLng))
        const transportCost = Math.round(distKm * 1.8)           // ₹1.8 per km per quintal
        const commission = Math.round(modalPrice * commissionPct / 100)
        const delayPenalty = Math.round(avgDelayDays * 50)       // ₹50 per day delay
        const netPrice = modalPrice - transportCost - commission - delayPenalty

        return {
          mandiId: row.id,
          name: row.name,
          state: row.state,
          lat: mandiLat,
          lng: mandiLng,
          price: modalPrice,
          transport: transportCost,
          distKm,
          commission,
          net: netPrice,
          trust: trustScore,
          payment: row.payment_speed || '2-3 Days',
          totalRevenue: Math.round(netPrice * qty),
          tag: '',        // set after sorting
          rank: 0,
        }
      })
      .sort((a, b) => b.net - a.net)
      .map((m, index) => ({
        ...m,
        rank: index + 1,
        tag: index === 0 ? 'best'
          : m.trust >= 65 ? 'good'
          : m.trust >= 50 ? 'ok'
          : 'risky',
      }))

    // Send top 3 to Gemini — backend already did the math
    const top3 = rankedMandis.slice(0, 3)
    let aiInsight = null

    try {
      aiInsight = await getBestMandiRecommendation({
        crop,
        quantity: qty,
        mandis: top3.map(m => ({
          name: m.name,
          pricePerQuintal: m.price,
          transportCost: m.transport,
          commission: m.commission,
          trustScore: m.trust,
          estimatedSettlementDays: m.payment,
          distanceKm: m.distKm,
        })),
      })
    } catch (geminiError) {
      console.warn('[Gemini fallback]', String(geminiError))
      const w = rankedMandis[0]
      const second = rankedMandis[1]
      aiInsight = {
        recommendedMandi: w.name,
        confidence: 88,
        summary: `${w.name} offers the best net price of ₹${Math.round(w.net).toLocaleString('en-IN')}/q at ${w.distKm} km from your FPO with trust score ${w.trust}/100.`,
        reasons: [
          `Best net price: ₹${Math.round(w.net).toLocaleString('en-IN')}/q after ₹${w.transport}/q transport (${w.distKm} km) and ₹${w.commission}/q commission`,
          `Trust Score ${w.trust}/100 — reliable payment history`,
          `Payment in ${w.payment}`,
          second ? `₹${Math.round(w.net - second.net).toLocaleString('en-IN')}/q better net vs ${second.name} (${second.distKm} km away)` : 'Top-ranked by CropChain optimization engine',
          `Total estimated revenue: ₹${Math.round(w.totalRevenue).toLocaleString('en-IN')} for ${qty} quintals`,
        ],
        aiUsed: false,
      }
    }

    return NextResponse.json({
      success: true,
      mandis: rankedMandis,
      winner: rankedMandis[0],
      totalRevenue: rankedMandis[0]?.totalRevenue || 0,
      aiInsight,
      fpoLocation,
    })
  } catch (error) {
    console.error('[POST /api/mandis/optimize]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
