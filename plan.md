
THIS IS MY aurorasql database

DROP TABLE IF EXISTS notifications;


CREATE TABLE fpo_memberships (
  id TEXT PRIMARY KEY,
  fpo_id TEXT NOT NULL,
  farmer_id TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  joined_with_code TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  left_at TIMESTAMPTZ,
  left_reason TEXT
);


Chunk 1 — Core tables (paste and run first)
sqlCREATE TABLE managers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  avatar_initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fpos (
  id TEXT PRIMARY KEY,
  manager_id TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  fpo_code TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_person TEXT,
  contact_phone TEXT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT,
  godown_address TEXT,
  godown_capacity TEXT,
  godown_timing TEXT DEFAULT '8 AM - 5 PM',
  primary_crops TEXT,
  season TEXT DEFAULT 'Kharif 2025',
  member_count INT DEFAULT 0,
  active_harvest_q DECIMAL(10,2) DEFAULT 0,
  revenue_this_month DECIMAL(15,2) DEFAULT 0,
  pending_payouts DECIMAL(15,2) DEFAULT 0,
  active_mandis INT DEFAULT 1473,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE farmers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  state TEXT,
  village TEXT,
  upi_id TEXT,
  language TEXT DEFAULT 'en',
  trust_score INT DEFAULT 50,
  status TEXT DEFAULT 'Active',
  total_earnings DECIMAL(15,2) DEFAULT 0,
  total_seasons INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fpo_memberships (
  id TEXT PRIMARY KEY,
  fpo_id TEXT NOT NULL,
  farmer_id TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  joined_with_code TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  left_at TIMESTAMPTZ,
  left_reason TEXT
);
Run this. Tell me if it works — do you see 4 tables (or error)?

Once Chunk 1 works I'll give you Chunk 2, 3, 4 one by one. This way we know exactly which line is failing.You said: only fpo meembership table got craetedonly fpo meembership table got craeted27 JunClaude responded: Aurora DSQL is creating only the LAST table in each batch.Aurora DSQL is creating only the LAST table in each batch. It's running each CREATE TABLE as a separate transaction and only committing the last one.
Run each table one at a time. One CREATE TABLE per query tab.
Start with these — open a new tab for each:

Tab 1:
sqlCREATE TABLE managers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  avatar_initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 2:
sqlCREATE TABLE fpos (
  id TEXT PRIMARY KEY,
  manager_id TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  fpo_code TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_person TEXT,
  contact_phone TEXT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT,
  godown_address TEXT,
  godown_capacity TEXT,
  primary_crops TEXT,
  season TEXT DEFAULT 'Kharif 2025',
  member_count INT DEFAULT 0,
  active_harvest_q DECIMAL(10,2) DEFAULT 0,
  revenue_this_month DECIMAL(15,2) DEFAULT 0,
  pending_payouts DECIMAL(15,2) DEFAULT 0,
  active_mandis INT DEFAULT 1473,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 3:
sqlCREATE TABLE farmers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  state TEXT,
  village TEXT,
  upi_id TEXT,
  language TEXT DEFAULT 'en',
  trust_score INT DEFAULT 50,
  status TEXT DEFAULT 'Active',
  total_earnings DECIMAL(15,2) DEFAULT 0,
  total_seasons INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 4:
sqlCREATE TABLE mandis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  is_enam BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 5:
sqlCREATE TABLE mandi_prices (
  id TEXT PRIMARY KEY,
  mandi_id TEXT NOT NULL,
  crop TEXT NOT NULL,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  modal_price DECIMAL(10,2) NOT NULL,
  recorded_date DATE NOT NULL,
  source TEXT DEFAULT 'AGMARKNET',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 6:
sqlCREATE TABLE trust_scores (
  mandi_id TEXT PRIMARY KEY,
  score INT NOT NULL DEFAULT 50,
  payment_speed TEXT DEFAULT '3 Days',
  commission_pct DECIMAL(4,2) DEFAULT 2.0,
  avg_payment_delay_days DECIMAL(5,2) DEFAULT 3.0,
  dispute_rate DECIMAL(5,4) DEFAULT 0.05,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 7:
sqlCREATE TABLE harvests (
  id TEXT PRIMARY KEY,
  fpo_id TEXT NOT NULL,
  farmer_id TEXT NOT NULL,
  season TEXT DEFAULT 'Kharif 2025',
  crop_type TEXT NOT NULL,
  variety TEXT,
  grade_submitted TEXT,
  quantity_estimated DECIMAL(8,2) NOT NULL,
  quantity_actual DECIMAL(8,2),
  quantity_final DECIMAL(8,2),
  photo_url TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'SUBMITTED',
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  rejection_reason TEXT,
  token_number TEXT,
  grade_verified TEXT,
  godown_received_at TIMESTAMPTZ,
  godown_verified_by TEXT,
  quality_moisture_ok BOOLEAN DEFAULT FALSE,
  quality_foreign_ok BOOLEAN DEFAULT FALSE,
  quality_size_ok BOOLEAN DEFAULT FALSE,
  quality_color_ok BOOLEAN DEFAULT FALSE
);

Tab 8:
sqlCREATE TABLE dispatches (
  id TEXT PRIMARY KEY,
  fpo_id TEXT NOT NULL,
  mandi_id TEXT NOT NULL,
  crop TEXT NOT NULL,
  total_quantity DECIMAL(10,2) NOT NULL,
  truck_number TEXT NOT NULL,
  driver_name TEXT,
  departed_at TIMESTAMPTZ,
  eta TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  current_stage INT DEFAULT 0,
  expected_revenue DECIMAL(15,2),
  actual_revenue DECIMAL(15,2),
  price_per_quintal DECIMAL(10,2),
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 9:
sqlCREATE TABLE payouts (
  id TEXT PRIMARY KEY,
  dispatch_id TEXT NOT NULL,
  farmer_id TEXT NOT NULL,
  fpo_id TEXT NOT NULL,
  quantity_q DECIMAL(8,2) NOT NULL,
  share_pct DECIMAL(8,6) NOT NULL,
  net_amount DECIMAL(12,2) NOT NULL,
  upi_id TEXT,
  upi_reference TEXT,
  payment_status TEXT DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 10:
sqlCREATE TABLE events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  actor_id TEXT,
  actor_type TEXT,
  payload TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 11:
sqlCREATE TABLE ledger (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 12:
sqlCREATE TABLE fpo_credit_scores (
  fpo_id TEXT PRIMARY KEY,
  score INT NOT NULL DEFAULT 500,
  category TEXT,
  revenue_consistency INT DEFAULT 0,
  settlement_reliability INT DEFAULT 0,
  farmer_retention INT DEFAULT 0,
  trade_volume_score INT DEFAULT 0,
  total_sales_inr DECIMAL(15,2) DEFAULT 0,
  total_sales_count INT DEFAULT 0,
  working_capital_eligible DECIMAL(15,2) DEFAULT 0,
  term_loan_eligible DECIMAL(15,2) DEFAULT 0,
  interest_rate DECIMAL(4,2) DEFAULT 8.5,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 13:
sqlCREATE TABLE credit_score_history (
  id TEXT PRIMARY KEY,
  fpo_id TEXT NOT NULL,
  score INT NOT NULL,
  month TEXT NOT NULL,
  year INT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 14:
sqlCREATE TABLE sales (
  id TEXT PRIMARY KEY,
  dispatch_id TEXT NOT NULL,
  fpo_id TEXT NOT NULL,
  mandi_id TEXT NOT NULL,
  crop TEXT NOT NULL,
  quantity_q DECIMAL(10,2),
  price_per_q DECIMAL(10,2),
  total_amount DECIMAL(15,2),
  sale_date DATE,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 15:
sqlCREATE TABLE analytics_revenue (
  id TEXT PRIMARY KEY,
  fpo_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INT NOT NULL,
  revenue_l DECIMAL(10,2),
  target_l DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Tab 16:
sqlCREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  recipient_id TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  fpo_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

Run all 16 tabs. Then verify:
sqlSELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;