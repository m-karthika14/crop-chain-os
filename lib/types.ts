// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'fpo_manager' | 'farmer'

export interface User {
  id: string
  email: string
  role: UserRole
  fpo_id?: string
  farmer_id?: string
  created_at: string
}

export interface SessionPayload {
  user_id: string
  role: UserRole
  fpo_id?: string
  farmer_id?: string
}

// ─── FPO ──────────────────────────────────────────────────────────────────────

export interface FPO {
  id: string
  name: string
  registration_number: string
  address: string
  district: string
  state: string
  phone: string
  email: string
  total_farmers: number
  created_at: string
}

// ─── Farmer ───────────────────────────────────────────────────────────────────

export interface Farmer {
  id: string
  fpo_id: string
  name: string
  phone: string
  village: string
  district: string
  state: string
  land_acres: number
  crops: string[]
  bank_account?: string
  ifsc_code?: string
  upi_id?: string
  status: 'active' | 'inactive'
  created_at: string
}

// ─── Harvest ──────────────────────────────────────────────────────────────────

export type HarvestStatus = 'pending' | 'approved' | 'dispatched' | 'sold' | 'paid'

export interface Harvest {
  id: string
  farmer_id: string
  fpo_id: string
  crop: string
  variety?: string
  quantity_kg: number
  quality_grade: 'A' | 'B' | 'C'
  moisture_content?: number
  harvest_date: string
  status: HarvestStatus
  godown_id?: string
  notes?: string
  created_at: string
}

// ─── Mandi ────────────────────────────────────────────────────────────────────

export interface Mandi {
  id: string
  name: string
  city: string
  district: string
  state: string
  latitude: number
  longitude: number
  active_crops: string[]
  created_at: string
}

export interface MandiPrice {
  id: string
  mandi_id: string
  crop: string
  min_price: number
  max_price: number
  modal_price: number
  date: string
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export type DispatchStatus = 'scheduled' | 'in_transit' | 'arrived' | 'completed' | 'cancelled'

export interface Dispatch {
  id: string
  harvest_id: string
  fpo_id: string
  mandi_id: string
  vehicle_number: string
  driver_name?: string
  driver_phone?: string
  quantity_kg: number
  scheduled_date: string
  actual_departure?: string
  actual_arrival?: string
  status: DispatchStatus
  notes?: string
  created_at: string
}

// ─── Sale ─────────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'partial' | 'completed'

export interface Sale {
  id: string
  dispatch_id: string
  fpo_id: string
  mandi_id: string
  crop: string
  quantity_kg: number
  price_per_kg: number
  total_amount: number
  buyer_name: string
  buyer_phone?: string
  payment_status: PaymentStatus
  sale_date: string
  created_at: string
}

// ─── Payout ───────────────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PayoutMethod = 'upi' | 'bank_transfer' | 'cash'

export interface Payout {
  id: string
  farmer_id: string
  sale_id: string
  fpo_id: string
  gross_amount: number
  deductions: number
  net_amount: number
  payout_method: PayoutMethod
  status: PayoutStatus
  reference_id?: string
  paid_at?: string
  created_at: string
}

// ─── Ledger ───────────────────────────────────────────────────────────────────

export type LedgerEntryType = 'sale_income' | 'farmer_payout' | 'expense' | 'adjustment'

export interface LedgerEntry {
  id: string
  fpo_id: string
  type: LedgerEntryType
  amount: number
  description: string
  reference_id?: string
  reference_type?: string
  balance_after: number
  created_at: string
}

// ─── Credit Score ─────────────────────────────────────────────────────────────

export interface CreditScore {
  id: string
  fpo_id: string
  score: number
  payment_history_score: number
  trade_volume_score: number
  farmer_retention_score: number
  dispute_score: number
  computed_at: string
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_farmers: number
  active_harvests: number
  pending_payouts: number
  total_revenue_this_month: number
  revenue_change_pct: number
  dispatches_this_week: number
}

export interface RevenueDataPoint {
  month: string
  revenue: number
  payouts: number
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  link?: string
  created_at: string
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
