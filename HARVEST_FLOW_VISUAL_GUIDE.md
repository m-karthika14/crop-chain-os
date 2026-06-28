# Harvest Entry Flow - Visual Guide

## User Journeys

### Farmer Journey: Submit Crop Request

```
┌─────────────────────────────────────────────────────────────┐
│ Farmer Dashboard                                             │
│  ▪ Hero Cards (Total Earnings, Harvest Submitted, etc)      │
│  ▪ MY HARVESTS SECTION                                       │
│    ├─ [+ SUBMIT CROP] ← Clicks here                          │
│    └─ Current harvests (status cards)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓ Click Submit Crop
┌─────────────────────────────────────────────────────────────┐
│ STEP 1 OF 3 - CROP DETAILS (33%)                             │
│  ▪ What crop? [Wheat] [Rice] [Corn] [Tomato] [Onion] [Bean]│
│  ▪ Variety: [HD-2967, Basmati...]                           │
│  ▪ Quality Grade: [A · Premium] [B] [C]                     │
│  [← Back]                              [Next →]             │
└─────────────────────────────────────────────────────────────┘
                          ↓ Select Crop & Grade
┌─────────────────────────────────────────────────────────────┐
│ STEP 2 OF 3 - QUANTITY (66%)                                 │
│  ⚠️ This is estimated. Will verify at godown.               │
│                                                              │
│              [−]  [  8.0  ]  [+]                            │
│                   Quintals                                  │
│                                                              │
│  Moisture: Dry ←————●————→ Wet (~12%)                       │
│  [📷 Take Photo]                                             │
│  [← Back]                              [Next →]             │
└─────────────────────────────────────────────────────────────┘
                          ↓ Enter Quantity
┌─────────────────────────────────────────────────────────────┐
│ STEP 3 OF 3 - CONFIRM (100%)                                 │
│  📋 Your Crop Request                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Crop:         Wheat (HD-2967)                              │
│  Grade:        A — Premium                                  │
│  Est. Qty:     8 Quintals                                   │
│  FPO:          GreenHarvest FPO                              │
│  Farmer:       Ramesh Kumar                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  [← Edit]                    [✅ Submit Request]            │
└─────────────────────────────────────────────────────────────┘
                          ↓ Submit
┌─────────────────────────────────────────────────────────────┐
│ 🎉 REQUEST SUBMITTED!                                        │
│ Gopal Hegde will review shortly.                            │
│ You'll get notified when approved.                          │
│                                                              │
│ 📱 SUBMITTED (pulsing blue badge)                           │
│                                                              │
│ [Back to Dashboard]                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓ Redirects
┌─────────────────────────────────────────────────────────────┐
│ Farmer Dashboard - MY HARVESTS                               │
│ 🌾 Wheat (HD-2967) · Est. 8Q · Grade A                      │
│ 📱 SUBMITTED · Just now                                     │
│ "Waiting for manager approval..."                           │
└─────────────────────────────────────────────────────────────┘
```

### Manager Journey: Approve Request

```
┌─────────────────────────────────────────────────────────────┐
│ Manager Dashboard Harvests Page                             │
│ ┌─ PENDING REQUESTS ────────────── [3]                      │
│ │ Ramesh Kumar · Sonepat · 2 mins ago                       │
│ │ 🌾 Wheat (HD-2967) · Grade A · 8Q                         │
│ │ ┌──────────────────────────────────────────────────────┐  │
│ │ │ CROP: Wheat    VARIETY: HD-2967                     │  │
│ │ │ GRADE: A       EST. QTY: 8Q                         │  │
│ │ │ Manager Note:  [Type note...]                       │  │
│ │ │ [✗ Reject]              [✅ Approve & Send Token]   │  │
│ │ └──────────────────────────────────────────────────────┘  │
│ │                                                            │
│ │ Priya Devi · Panipat · 9 mins ago                        │
│ │ [Second request card...]                                 │
│ │                                                            │
│ │ Suresh Patel · Karnal · 16 mins ago                      │
│ │ [Third request card...]                                  │
│ └────────────────────────────────────────────────────────── │
│ Add Harvest Form...                                        │
│ Harvest table...                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓ Click Approve
┌─────────────────────────────────────────────────────────────┐
│ Processing... [⏳ Spinning]                                  │
│                                                              │
│ Toast: ✅ Approved! Token GH-2025-0847 sent to Ramesh      │
│                                                              │
│ [Card animates out with green flash]                       │
└─────────────────────────────────────────────────────────────┘
```

### Manager Journey: Verify at Godown

```
┌─────────────────────────────────────────────────────────────┐
│ GODOWN VERIFICATION                                          │
│ Verify physical crop delivery                               │
│                                                              │
│ [Enter or Scan Token Number       ] [🔍 Find]              │
└─────────────────────────────────────────────────────────────┘
                          ↓ Enter Token
┌─────────────────────────────────────────────────────────────┐
│ TOKEN: GH-2025-0847                                          │
│ ✅ Valid Token                                               │
│                                                              │
│ 👨‍🌾 Ramesh Kumar                                              │
│ Village Sonepat, Haryana                                    │
│ Member since: Jan 2024                                     │
│                                                              │
│ SUBMITTED REQUEST:                                         │
│ Crop: Wheat (HD-2967)                                      │
│ Est. Quantity: 8.0 Quintals                                │
│ Grade: A — Premium                                         │
│ Submitted: 8:12 AM                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓ Fill Verification Form
┌─────────────────────────────────────────────────────────────┐
│ Now enter the ACTUAL verified quantities:                   │
│                                                              │
│ Actual Weight:                                              │
│ [  7.8  ] Quintals                                          │
│                                                              │
│ Quality Verification:                                       │
│ ☑ Moisture within range                                    │
│ ☑ No foreign material                                      │
│ ☑ Grain size consistent                                    │
│ ☐ Colour acceptable                                        │
│                                                              │
│ Verified Grade:                                             │
│ [A · Premium ✓]  [B · Standard]  [C · Basic]              │
│                                                              │
│ Condition Notes:                                            │
│ [Some moisture at edges — acceptable...]                   │
│                                                              │
│ [✅ Confirm Godown Receipt]                                │
└─────────────────────────────────────────────────────────────┘
                          ↓ Submit
┌─────────────────────────────────────────────────────────────┐
│ Confirm Godown Receipt?                                     │
│                                                              │
│ Farmer: Ramesh Kumar                                       │
│ Crop: Wheat (HD-2967)                                      │
│ Farmer est: 8.0Q    Actual: 7.8Q    Diff: -0.2Q (-2.5%)  │
│ Grade: A (same)                                            │
│                                                              │
│ This will:                                                 │
│ ✅ Update farmer's crop to 7.8Q                            │
│ ✅ Add 7.8Q to FPO total harvest                           │
│ ✅ Notify Ramesh Kumar                                     │
│ ✅ Record in immutable ledger                              │
│                                                              │
│ [Confirm ✅]                          [Cancel]             │
└─────────────────────────────────────────────────────────────┘
                          ↓ Confirm
┌─────────────────────────────────────────────────────────────┐
│ ✅ VERIFIED!                                                 │
│ Crop recorded in FPO ledger                                 │
│                                                              │
│ Farmer: Ramesh Kumar                                       │
│ Crop: Wheat (HD-2967)                                      │
│ Est. Qty: 8Q → Actual: 7.8Q ✅                             │
│                                                              │
│ [Next Farmer]                                              │
└─────────────────────────────────────────────────────────────┘
```

## Screen Layouts

### Farmer Dashboard - Harvests Section

```
DESKTOP VIEW (1280+px)                 TABLET VIEW (768px)
┌───────────────────────────────────┐ ┌──────────────────────┐
│  🌾 My Harvests  [+ Submit Crop]  │ │ 🌾 My Harvests       │
├───────────────────────────────────┤ │ [+ Submit Crop]      │
│ ┌─────────────────────────────────┤ ├──────────────────────┤
│ │ 🌾 Wheat (HD-2967)   [✅ APRVD] │ │ ┌──────────────────┐ │
│ │ Est. 8Q · Grade A                │ │ │ Wheat (HD-2967)  │ │
│ │ Today 9:15 AM                    │ │ │ 8Q · Grade A     │ │
│ │ Token: GH-2025-0847              │ │ │ ✅ APPROVED      │ │
│ └─────────────────────────────────┤ │ └──────────────────┘ │
│ ┌─────────────────────────────────┤ ├──────────────────────┤
│ │ 🌾 Rice (Basmati)    [📱 SUBMIT]│ │ ┌──────────────────┐ │
│ │ Est. 12Q · Grade A               │ │ │ Rice (Basmati)   │ │
│ │ Yesterday 2:30 PM                │ │ │ 12Q · Grade A    │ │
│ │ "Waiting for approval..."        │ │ │ 📱 SUBMITTED     │ │
│ └─────────────────────────────────┤ │ └──────────────────┘ │
│ ┌─────────────────────────────────┤ ├──────────────────────┤
│ │ 🌾 Soybean (JS-20-98) [🏚️ RCVD] │ │ ┌──────────────────┐ │
│ │ Est. 6.5Q · Grade B              │ │ │ Soybean (JS-20)  │ │
│ │ 2 days ago                       │ │ │ 6.5Q · Grade B   │ │
│ │ Actual: 6.3Q ✅                 │ │ │ 🏚️ GODOWN RCVD  │ │
│ └─────────────────────────────────┤ │ └──────────────────┘ │
└───────────────────────────────────┘ └──────────────────────┘

MOBILE VIEW (390px)
┌─────────────────────┐
│ 🌾 My Harvests      │
│ [+ Submit Crop]     │
├─────────────────────┤
│ 🌾 Wheat (HD)       │
│ 8Q · Grade A        │
│ ✅ APPROVED         │
├─────────────────────┤
│ 🌾 Rice (Basmati)   │
│ 12Q · Grade A       │
│ 📱 SUBMITTED        │
├─────────────────────┤
│ 🌾 Soybean (JS-20)  │
│ 6.5Q · Grade B      │
│ 🏚️ GODOWN RCVD     │
└─────────────────────┘
```

### Manager Pending Requests

```
DESKTOP VIEW - Harvest Collection Page

┌─────────────────────────────────────────────────────────────┐
│ 🌾 HARVEST COLLECTION    Record farmer contributions 2025   │
│                                                 [126Q Collected]
├─────────────────────────────────────────────────────────────┤
│ 📱 PENDING REQUESTS                                 [Badge: 3]│
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Ramesh Kumar · Sonepat · 2 mins ago   [Wheat: HD-2967]  ││
│ │ Grade A · 8Q                                            ││
│ │ ┌────────────────────────────────────────────────────┐ ││
│ │ │ CROP: Wheat  VARIETY: HD-2967  GRADE: A  EST: 8Q ││ ││
│ │ │                                                    ││ ││
│ │ │ MANAGER NOTE:  [Type note to farmer...]          ││ ││
│ │ │                                                    ││ ││
│ │ │ [✗ Reject]          [✅ Approve & Send Token]    ││ ││
│ │ └────────────────────────────────────────────────────┘ ││
│ └──────────────────────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Priya Devi · Panipat · 9 mins ago    [Rice: Basmati]   ││
│ │ Grade A · 12Q                                           ││
│ │ [Similar card layout...]                                ││
│ └──────────────────────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Suresh Patel · Karnal · 16 mins ago  [Corn: Hybrid]    ││
│ │ Grade B · 6.5Q                                          ││
│ │ [Similar card layout...]                                ││
│ └──────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ [Add Harvest Form...]                                       │
│ [Harvest Table...]                                          │
└─────────────────────────────────────────────────────────────┘
```

## Status Badge Evolution

```
Timeline for Single Harvest

Day 1, 8:12 AM                      Day 1, 9:15 AM
────────────────────────────────────────────────────────
📱 SUBMITTED                        ✅ APPROVED
(blue pill, pulsing)               (amber pill, pulsing)
↓                                   ↓
Token generated: GH-2025-0847
Farmer notified


Day 1, 11:30 AM                    Day 2, 9:00 AM
────────────────────────────────────────────────────────
🏚️ GODOWN_RECEIVED                 🚛 IN_TRANSIT
(emerald pill)                     (purple pill)
↓                                   ↓
Actual: 7.8Q verified
Quality: Grade A
Earnings: ₹14,490 – ₹15,750


Day 4, 3:00 PM                     Day 4, 6:00 PM
────────────────────────────────────────────────────────
💼 SOLD                            💰 PAID
(indigo pill)                      (gold pill)
↓                                   ↓
Mandi: Karnal
Price: ₹2,340/Q
Farmer received: ₹18,252
```

## Stepper Progress Visualization

```
HARVEST FLOW WITH HORIZONTAL STEPPER

[📱 Submitted]→[✅ Approved]→[🏚️ Godown]→[🚛 Transit]→[💼 Sold]→[💰 Paid]
      ✓            ✓           ◉            ○           ○        ○
    completed   completed    current      pending      pending   pending
```

## Component Relationships

```
app/
├── farmer-dashboard/
│   ├── page.tsx ◄─── imports HarvestStatusCard
│   └── submit-harvest/
│       └── page.tsx ◄─── imports HarvestWizard
│
├── dashboard/
│   ├── harvests/
│   │   └── page.tsx ◄─── imports ManagerPendingRequests
│   └── godown-verification/
│       └── page.tsx ◄─── imports GodownVerification
│
└── components/
    ├── harvest-wizard.tsx
    │   └── 3-step form with useReducer
    │
    ├── harvest-status-card.tsx
    │   └── Status display with animations
    │
    ├── manager-pending-requests.tsx
    │   └── Approval workflow
    │
    └── godown-verification.tsx
        └── Verification form
```

---

**Layout Notes:**
- All components use Tailwind CSS with dark theme (#0A0F0A)
- Status colors: Blue → Amber → Emerald → Purple → Indigo → Gold
- Animations: Framer Motion with smooth transitions
- Responsive: Mobile 390px → Tablet 768px → Desktop 1280px+
- Icons: Lucide React (consistent across all pages)
- Typography: Single font family with proper hierarchy
