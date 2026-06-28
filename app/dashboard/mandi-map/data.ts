// Seeded deterministic pseudo-random for reproducible map
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

// India bounding box roughly: lat 8–37, lng 68–97
// We cluster around real mandi-dense states
const clusters = [
  { lat: 29.0, lng: 76.0, spread: 3.5, count: 180, name: 'Haryana/Punjab' },
  { lat: 26.8, lng: 80.9, spread: 4.0, count: 160, name: 'UP' },
  { lat: 23.5, lng: 77.5, spread: 3.5, count: 140, name: 'MP' },
  { lat: 18.5, lng: 76.0, spread: 3.5, count: 130, name: 'Maharashtra' },
  { lat: 22.5, lng: 88.3, spread: 2.5, count: 100, name: 'West Bengal' },
  { lat: 13.0, lng: 77.5, spread: 3.0, count: 110, name: 'Karnataka' },
  { lat: 10.5, lng: 77.0, spread: 2.5, count: 90,  name: 'Tamil Nadu' },
  { lat: 20.5, lng: 85.8, spread: 2.5, count: 80,  name: 'Odisha' },
  { lat: 25.5, lng: 85.0, spread: 2.5, count: 80,  name: 'Bihar' },
  { lat: 27.0, lng: 73.0, spread: 3.0, count: 80,  name: 'Rajasthan' },
  { lat: 23.0, lng: 72.5, spread: 2.5, count: 80,  name: 'Gujarat' },
  { lat: 17.5, lng: 80.5, spread: 2.5, count: 60,  name: 'Andhra/Telangana' },
  { lat: 15.5, lng: 74.5, spread: 1.5, count: 40,  name: 'Goa/Konkan' },
  { lat: 25.5, lng: 91.5, spread: 2.0, count: 30,  name: 'Northeast' },
  { lat: 31.5, lng: 75.5, spread: 2.0, count: 33,  name: 'Punjab Hills' },
]

const mandiNames = [
  'Karnal', 'Panipat', 'Ambala', 'Hisar', 'Rohtak', 'Sonipat', 'Kurukshetra',
  'Agra', 'Kanpur', 'Lucknow', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly',
  'Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Ratlam',
  'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Kolhapur', 'Solapur',
  'Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Howrah',
  'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Bellary',
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tirupur',
  'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur',
  'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur',
  'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer',
  'Ahmedabad', 'Surat', 'Baroda', 'Rajkot', 'Gandhinagar',
  'Hyderabad', 'Warangal', 'Vijayawada', 'Visakhapatnam',
  'Delhi Azadpur', 'Delhi Okhla', 'Delhi Shahdara',
  'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala',
  'Guwahati', 'Shillong', 'Dibrugarh',
]

const crops = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Soybean', 'Maize', 'Cotton', 'Mustard', 'Chilli']

export interface MandiData {
  id: number
  name: string
  lat: number
  lng: number
  trustScore: number
  price: number
  volume: number // quintals/day
  paymentDelay: number // days
  commission: number // %
  distance: number // km from FPO
  crop: string
  isTop10: boolean
  state: string
}

let globalId = 0

export const mandis: MandiData[] = clusters.flatMap((cluster, ci) =>
  Array.from({ length: cluster.count }, (_, i) => {
    const seed = ci * 10000 + i
    const lat = cluster.lat + (seededRand(seed) - 0.5) * cluster.spread * 2
    const lng = cluster.lng + (seededRand(seed + 100) - 0.5) * cluster.spread * 2
    const trustScore = Math.round(30 + seededRand(seed + 200) * 70)
    const price = Math.round(1800 + seededRand(seed + 300) * 1200)
    const volume = Math.round(200 + seededRand(seed + 400) * 2800)
    const paymentDelay = Math.round(seededRand(seed + 500) * 7)
    const commission = parseFloat((0.5 + seededRand(seed + 600) * 3.5).toFixed(1))
    const distance = Math.round(20 + seededRand(seed + 700) * 450)
    const nameIdx = (ci * 17 + i * 7) % mandiNames.length
    const cropIdx = (ci * 5 + i * 3) % crops.length
    return {
      id: globalId++,
      name: `${mandiNames[nameIdx]} ${i > 0 ? `(${String.fromCharCode(65 + (i % 26))})` : ''}`.trim(),
      lat,
      lng,
      trustScore,
      price,
      volume,
      paymentDelay,
      commission,
      distance,
      crop: crops[cropIdx],
      isTop10: false,
      state: cluster.name,
    }
  })
)

// Mark top 10 by combined score (high trust, high price, low delay)
const scored = [...mandis].sort((a, b) => {
  const scoreA = a.trustScore * 0.5 + (a.price / 30) - a.paymentDelay * 10 - a.commission * 5
  const scoreB = b.trustScore * 0.5 + (b.price / 30) - b.paymentDelay * 10 - b.commission * 5
  return scoreB - scoreA
})
scored.slice(0, 10).forEach(m => { m.isTop10 = true })

// The FPO home base (Karnal, Haryana)
export const FPO_LOCATION: [number, number] = [29.685, 76.988]

// Pre-selected winner mandi
export const WINNER_MANDI = mandis.find(m => m.name.startsWith('Karnal') && !m.name.includes('(')) ?? mandis[0]
WINNER_MANDI.trustScore = 94
WINNER_MANDI.price = 2387
WINNER_MANDI.paymentDelay = 1
WINNER_MANDI.commission = 1.5
WINNER_MANDI.distance = 87
WINNER_MANDI.isTop10 = true

// Comparison mandis for the sidebar
export const COMPARISON_MANDIS = [
  { name: 'Karnal Mandi', price: 2387, trust: 94, net: '₹17.6L', winner: true },
  { name: 'Delhi Azadpur', price: 2400, trust: 52, net: '₹15.2L', winner: false },
  { name: 'Panipat Mandi', price: 2290, trust: 71, net: '₹16.1L', winner: false },
]
