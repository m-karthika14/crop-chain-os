import { getDashboardStats, getRevenueChart } from '../queries/dashboard'
import type { DashboardStats, RevenueDataPoint } from '../types'

export async function fetchDashboardStats(fpo_id: string): Promise<DashboardStats> {
  return getDashboardStats(fpo_id)
}

export async function fetchRevenueChart(
  fpo_id: string,
  months = 6
): Promise<RevenueDataPoint[]> {
  return getRevenueChart(fpo_id, months)
}
