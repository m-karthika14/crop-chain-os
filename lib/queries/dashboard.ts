import { query, queryOne } from '../db'
import type { DashboardStats, RevenueDataPoint } from '../types'

export async function getDashboardStats(fpo_id: string): Promise<DashboardStats> {
  const row = await queryOne<DashboardStats>(
    `SELECT
       (SELECT COUNT(*) FROM farmers WHERE fpo_id = $1 AND status = 'active')::int            AS total_farmers,
       (SELECT COUNT(*) FROM harvests WHERE fpo_id = $1 AND status NOT IN ('sold','paid'))::int AS active_harvests,
       (SELECT COUNT(*) FROM payouts  WHERE fpo_id = $1 AND status = 'pending')::int           AS pending_payouts,
       COALESCE((
         SELECT SUM(total_amount) FROM sales
         WHERE fpo_id = $1
           AND date_trunc('month', sale_date) = date_trunc('month', now())
       ), 0)::numeric                                                                           AS total_revenue_this_month,
       0::numeric                                                                               AS revenue_change_pct,
       (SELECT COUNT(*) FROM dispatches WHERE fpo_id = $1
          AND scheduled_date >= now() - interval '7 days')::int                                AS dispatches_this_week`,
    [fpo_id]
  )
  return row ?? {
    total_farmers: 0,
    active_harvests: 0,
    pending_payouts: 0,
    total_revenue_this_month: 0,
    revenue_change_pct: 0,
    dispatches_this_week: 0,
  }
}

export async function getRevenueChart(fpo_id: string, months = 6): Promise<RevenueDataPoint[]> {
  return query<RevenueDataPoint>(
    `SELECT
       to_char(date_trunc('month', gs.month), 'Mon YY') AS month,
       COALESCE(s.revenue, 0)                            AS revenue,
       COALESCE(p.payouts, 0)                            AS payouts
     FROM generate_series(
       date_trunc('month', now()) - (($2 - 1) || ' months')::interval,
       date_trunc('month', now()),
       '1 month'
     ) AS gs(month)
     LEFT JOIN (
       SELECT date_trunc('month', sale_date) AS m, SUM(total_amount) AS revenue
       FROM sales WHERE fpo_id = $1 GROUP BY m
     ) s ON s.m = gs.month
     LEFT JOIN (
       SELECT date_trunc('month', paid_at) AS m, SUM(net_amount) AS payouts
       FROM payouts WHERE fpo_id = $1 AND status = 'completed' GROUP BY m
     ) p ON p.m = gs.month
     ORDER BY gs.month`,
    [fpo_id, months]
  )
}
