# Complete Harvest Entry Flow - CropChain OS OS

## Overview

The Harvest Entry Flow enables farmers to submit crop requests through a mobile-friendly 3-step wizard, allows managers to review and approve requests with token generation, and provides managers with godown verification tools to record physical crop deliveries.

## System Architecture

```
STEP 1: Farmer submits request (mobile)
STEP 2: Manager reviews & approves (desktop)
STEP 3: Manager verifies at godown (desktop)
STEP 4: Farmer notified of receipt
STEP 5: Crop enters FPO inventory
```

## Components Created

### Farmer-Facing Components

#### 1. **HarvestWizard** (`app/components/harvest-wizard.tsx`)
3-step form for crop submission with progress tracking:
- **Step 1: Crop Details** - Select crop type, variety, grade
- **Step 2: Quantity** - Enter estimated quantity with stepper
- **Step 3: Confirm** - Review submission before sending

**Features:**
- useReducer for form state management
- Progress bar with animated transitions
- Toast-style success confirmation
- Mobile-optimized (390px) with large tap targets
- LocalStorage draft save capability

**Usage:**
```tsx
import { HarvestWizard } from '@/app/components/harvest-wizard'

<HarvestWizard />
```

#### 2. **HarvestStatusCard** (`app/components/harvest-status-card.tsx`)
Displays harvest status with contextual information:

**Status Types:**
- `SUBMITTED` (📱 blue) - Awaiting manager review
- `APPROVED` (✅ amber) - Manager approved, token provided
- `GODOWN_RECEIVED` (🏚️ emerald) - Physical receipt confirmed
- `IN_TRANSIT` (🚛 purple) - Dispatched to mandi
- `SOLD` (💼 indigo) - Sold at mandi
- `PAID` (💰 gold) - Payment received

**Props:**
```tsx
interface HarvestStatusCardProps {
  cropType: string
  variety: string
  grade: string
  estimatedQty: number
  status: HarvestStatus
  tokenNumber?: string
  actualQty?: number
  timestamp: string
  godownAddress?: string
  contact?: string
  actualEarnings?: string
}
```

### Manager-Facing Components

#### 3. **ManagerPendingRequests** (`app/components/manager-pending-requests.tsx`)
Lists pending crop requests for manager approval:

**Features:**
- Card-based layout with farmer info
- Manager note input (optional)
- Approve with auto-token generation
- Reject with reason selection
- Animates out on action
- Amber badge showing count

**Integration:**
Added to `/app/dashboard/harvests/page.tsx` at top of page

#### 4. **GodownVerification** (`app/components/godown-verification.tsx`)
Manager's tool for verifying physical crop delivery:

**Workflow:**
1. Enter or scan token number
2. System displays farmer + submitted request details
3. Manager enters actual verified quantity
4. Manager confirms quality checks
5. Manager selects verified grade
6. Confirmation dialog before recording

**Key Features:**
- Token lookup with farmer validation
- Quantity difference detection (warns if >10%)
- Quality checklist
- Grade verification (may differ from estimate)
- Condition notes field
- Success screen on completion

### Pages Created

#### Farmer Pages
1. **`/farmer-dashboard/submit-harvest`** - Harvest submission wizard
2. **`/farmer-dashboard`** - Updated with harvest status cards

#### Manager Pages
1. **`/dashboard/harvests`** - Updated with pending requests section
2. **`/dashboard/godown-verification`** - Godown verification tool

## Status Color System

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| SUBMITTED | Blue | 📱 | Farmer submitted, awaiting approval |
| APPROVED | Amber | ✅ | Manager approved, bring to godown |
| GODOWN_RECEIVED | Emerald | 🏚️ | Physical receipt confirmed |
| IN_TRANSIT | Purple | 🚛 | Dispatched to mandi |
| SOLD | Indigo | 💼 | Sold at mandi |
| PAID | Gold | 💰 | Payment received |

## Farmer Dashboard Integration

The farmer dashboard now includes:

```tsx
// My Harvests Section
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-bold text-white">🌾 My Harvests</h2>
    <Link href="/farmer-dashboard/submit-harvest">
      <Plus className="w-4 h-4" />
      Submit Crop
    </Link>
  </div>
  <div className="grid gap-4">
    {harvests.map((harvest) => (
      <HarvestStatusCard {...harvest} />
    ))}
  </div>
</div>
```

## Manager Dashboard Integration

The manager harvests page includes pending requests at the top:

```tsx
// At top of /app/dashboard/harvests/page.tsx
<ManagerPendingRequests />
```

## Database Schema (Aurora DSQL)

```sql
CREATE TABLE harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fpo_id UUID REFERENCES fpos(id),
  farmer_id UUID REFERENCES members(id),
  season TEXT DEFAULT 'Kharif 2025',
  
  -- Farmer submitted
  crop_type TEXT NOT NULL,
  variety TEXT,
  grade_submitted TEXT CHECK (grade IN ('A','B','C')),
  quantity_estimated DECIMAL(8,2) NOT NULL,
  photo_url TEXT,
  moisture_pct DECIMAL(4,1),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Manager approval
  status TEXT DEFAULT 'SUBMITTED',
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  rejection_reason TEXT,
  manager_note TEXT,
  token_number TEXT UNIQUE,
  
  -- Godown verification
  quantity_actual DECIMAL(8,2),
  grade_verified TEXT,
  godown_photo_url TEXT,
  godown_notes TEXT,
  godown_received_at TIMESTAMPTZ,
  godown_verified_by UUID,
  
  -- Final
  quantity_final DECIMAL(8,2) GENERATED ALWAYS AS
    (COALESCE(quantity_actual, quantity_estimated)) STORED
);
```

## API Routes to Implement

```
POST /api/harvests/submit
  Body: { farmer_id, crop_type, variety, grade, quantity_estimated, photo_url }
  Returns: { harvest_id, status: 'SUBMITTED' }

POST /api/harvests/approve
  Body: { harvest_id, manager_note }
  Returns: { token_number, status: 'APPROVED' }
  Note: Generates token via: FPO_CODE-YEAR-RANDOM(4)

POST /api/harvests/reject
  Body: { harvest_id, rejection_reason }
  Returns: { status: 'REJECTED' }

GET /api/harvests/token/:token
  Returns: { farmer details, crop details, status }

POST /api/harvests/godown-verify
  Body: { harvest_id, token_number, quantity_actual, 
          grade_verified, godown_notes, godown_photo_url }
  Returns: { status: 'GODOWN_RECEIVED', quantity_final: 7.8 }

GET /api/harvests/my-harvests/:farmer_id
  Returns: all harvests for farmer
```

## Token System

**Format:** `FPO_CODE-YEAR-RANDOM(4)`
**Example:** `GH-2025-0847`

- Generated on manager approval
- Unique per harvest
- Shown to farmer as 36px bold font for easy screenshot
- Scanned/entered by manager at godown

## Real-Time Updates

- Farmer dashboard polls `/api/harvests/my-harvests` every 30s
- Manager dashboard updates pending count live
- Both see same status immediately after verification

## Mobile Responsiveness

**Farmer Screens (390px):**
- Buttons: minimum 56px height
- Token number: 36px font, bold
- Forms: full-width inputs
- Crop grid: 2 columns

**Manager Screens (Desktop):**
- Token input auto-focuses
- Enter key = search token
- Tab navigation through form

## Design System

- **Theme:** Dark (#0A0F0A)
- **Primary:** Emerald (#10B981)
- **Secondary:** Amber (#FBBF24)
- **Status Colors:** Blue, Amber, Emerald, Purple, Indigo, Gold
- **Font:** Sans serif with proper hierarchy
- **Decorations:** Marigold emoji on cards
- **Animations:** Framer Motion with smooth transitions

## How to Use

### Farmer Submitting Crop

1. Go to `/farmer-dashboard`
2. Click **"+ Submit Crop"** button
3. Complete 3-step wizard:
   - Select crop type and grade
   - Enter quantity estimate
   - Review and submit
4. Receive success confirmation
5. Crop appears in "My Harvests" section

### Manager Approving Request

1. Go to `/dashboard/harvests`
2. See **Pending Requests** section at top
3. Review farmer + crop details
4. Optionally add manager note
5. Click **"Approve & Send Token"**
6. Token automatically generated and sent to farmer

### Manager Verifying at Godown

1. Go to `/dashboard/godown-verification`
2. Enter or scan farmer's token number
3. Review submitted request details
4. Enter actual verified quantity
5. Confirm quality checks
6. Select verified grade
7. Add optional condition notes
8. Click **"Confirm Godown Receipt"**
9. Crop recorded in FPO inventory

## Testing

All components include mock data for testing:
- Demo harvests with different statuses
- Mock pending requests with 3 farmers
- Auto-generated token examples
- Sample godown verification flow

Navigate to any page to see live interactive demos with animations and state management.

## Future Enhancements

- Camera/photo capture for crop verification
- QR code generation and scanning for tokens
- WhatsApp notifications integration
- Batch verification for multiple farmers
- CSV export of verified harvests
- Historical analytics dashboard
- Rejection reason tracking
- Photo comparison before/after verification
