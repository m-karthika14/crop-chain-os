export const APP_NAME = 'CropChain OS'
export const APP_VERSION = '0.1.0'

export const ROLES = {
  FPO_MANAGER: 'fpo_manager',
  FARMER: 'farmer',
} as const

export const HARVEST_STATUSES = ['pending', 'approved', 'dispatched', 'sold', 'paid'] as const

export const DISPATCH_STATUSES = ['scheduled', 'in_transit', 'arrived', 'completed', 'cancelled'] as const

export const QUALITY_GRADES = ['A', 'B', 'C'] as const

export const PAYOUT_METHODS = ['upi', 'bank_transfer', 'cash'] as const

export const CROPS = [
  'Wheat',
  'Rice',
  'Maize',
  'Soybean',
  'Cotton',
  'Sugarcane',
  'Groundnut',
  'Mustard',
  'Turmeric',
  'Onion',
  'Tomato',
  'Potato',
  'Chilli',
  'Garlic',
  'Ginger',
  'Jowar',
  'Bajra',
  'Tur Dal',
  'Moong Dal',
  'Chana',
] as const

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Bihar',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
] as const

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  DASHBOARD: '/api/dashboard',
  FARMERS: '/api/farmers',
  FARMER: (id: string) => `/api/farmers/${id}`,
  HARVESTS: '/api/harvests',
  HARVEST: (id: string) => `/api/harvests/${id}`,
  MANDIS: '/api/mandis',
  DISPATCHES: '/api/dispatches',
  SALES: '/api/sales',
  PAYOUTS: '/api/payouts',
  LEDGER: '/api/ledger',
  CREDIT_SCORE: '/api/credit-score',
  ANALYTICS: '/api/analytics',
  NOTIFICATIONS: '/api/notifications',
  TEST: '/api/test',
} as const

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
} as const

export const SESSION_COOKIE = 'cropchain_session'
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7 // 7 days
