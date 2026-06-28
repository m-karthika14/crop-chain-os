import { query, queryOne } from '../db'

export async function getTopCropsByRevenue(
  fpo_id: string,
  limit = 5
): Promise<{ crop: string; total_revenue: number; total_quantity: number }[]> {
  return query(
    `SELECT crop,
            SUM(total_amount)::numeric AS total_revenue,
            SUM(quantity_kg)::numeric  AS total_quantity
     FROM sales WHERE fpo_id = $1
     GROUP BY crop ORDER BY total_revenue DESC LIMIT $2`,
    [fpo_id, limit]
  )
}

export async function getTopMandis(
  fpo_id: string,
  limit = 5
): Promise<{ mandi_name: string; total_revenue: number; trips: number }[]> {
  return query(
    `SELECT m.name AS mandi_name,
            SUM(s.total_amount)::numeric AS total_revenue,
            COUNT(*)::int                AS trips
     FROM sales s JOIN mandis m ON m.id = s.mandi_id
     WHERE s.fpo_id = $1
     GROUP BY m.name ORDER BY total_revenue DESC LIMIT $2`,
    [fpo_id, limit]
  )
}

export async function getFarmerPayoutSummary(
  fpo_id: string
): Promise<{ total_paid: number; total_pending: number; farmer_count: number }> {
  const row = await queryOne<{ total_paid: string; total_pending: string; farmer_count: string }>(
    `SELECT
       COALESCE(SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END), 0)::text AS total_paid,
       COALESCE(SUM(CASE WHEN status = 'pending'   THEN net_amount ELSE 0 END), 0)::text AS total_pending,
       COUNT(DISTINCT farmer_id)::text                                                    AS farmer_count
     FROM payouts WHERE fpo_id = $1`,
    [fpo_id]
  )
  return {
    total_paid: parseFloat(row?.total_paid ?? '0'),
    total_pending: parseFloat(row?.total_pending ?? '0'),
    farmer_count: parseInt(row?.farmer_count ?? '0'),
  }
}

export async function getMonthlyDispatchTrend(
  fpo_id: string,
  months = 6
): Promise<{ month: string; count: number; quantity_kg: number }[]> {
  return query(
    `SELECT to_char(date_trunc('month', scheduled_date), 'Mon YY') AS month,
            COUNT(*)::int             AS count,
            SUM(quantity_kg)::numeric AS quantity_kg
     FROM dispatches
     WHERE fpo_id = $1
       AND scheduled_date >= now() - ($2 || ' months')::interval
     GROUP BY date_trunc('month', scheduled_date)
     ORDER BY date_trunc('month', scheduled_date)`,
    [fpo_id, months]
  )
}
