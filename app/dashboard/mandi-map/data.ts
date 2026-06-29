export const FPO_LOCATION: [number, number] = [29.685, 76.988]

export interface StaticMandi {
  name: string
  lat: number
  lng: number
  trustScore: number
  price: number
  state: string
}

// Visual-only markers for south India coverage — not from DB
export const SOUTH_INDIA_MANDIS: StaticMandi[] = [
  // Andhra Pradesh
  { name: 'Vijayawada',    lat: 16.506, lng: 80.648, trustScore: 72, price: 2210, state: 'Andhra Pradesh' },
  { name: 'Guntur',        lat: 16.307, lng: 80.437, trustScore: 68, price: 1980, state: 'Andhra Pradesh' },
  { name: 'Tirupati',      lat: 13.628, lng: 79.420, trustScore: 61, price: 2050, state: 'Andhra Pradesh' },
  { name: 'Kurnool',       lat: 15.828, lng: 78.037, trustScore: 55, price: 1760, state: 'Andhra Pradesh' },
  { name: 'Nellore',       lat: 14.442, lng: 79.987, trustScore: 63, price: 1890, state: 'Andhra Pradesh' },
  { name: 'Visakhapatnam', lat: 17.686, lng: 83.218, trustScore: 77, price: 2340, state: 'Andhra Pradesh' },
  { name: 'Ongole',        lat: 15.503, lng: 80.045, trustScore: 57, price: 1820, state: 'Andhra Pradesh' },
  { name: 'Kakinada',      lat: 16.980, lng: 82.247, trustScore: 65, price: 2100, state: 'Andhra Pradesh' },
  { name: 'Rajahmundry',   lat: 17.005, lng: 81.804, trustScore: 70, price: 2190, state: 'Andhra Pradesh' },
  { name: 'Anantapur',     lat: 14.682, lng: 77.600, trustScore: 52, price: 1650, state: 'Andhra Pradesh' },

  // Tamil Nadu
  { name: 'Chennai',       lat: 13.082, lng: 80.272, trustScore: 82, price: 2680, state: 'Tamil Nadu' },
  { name: 'Coimbatore',    lat: 11.017, lng: 76.958, trustScore: 79, price: 2510, state: 'Tamil Nadu' },
  { name: 'Madurai',       lat: 9.925,  lng: 78.119, trustScore: 74, price: 2290, state: 'Tamil Nadu' },
  { name: 'Salem',         lat: 11.664, lng: 78.146, trustScore: 69, price: 2150, state: 'Tamil Nadu' },
  { name: 'Trichy',        lat: 10.791, lng: 78.700, trustScore: 71, price: 2240, state: 'Tamil Nadu' },
  { name: 'Tirunelveli',   lat: 8.727,  lng: 77.695, trustScore: 62, price: 1970, state: 'Tamil Nadu' },
  { name: 'Erode',         lat: 11.341, lng: 77.717, trustScore: 75, price: 2380, state: 'Tamil Nadu' },
  { name: 'Vellore',       lat: 12.916, lng: 79.132, trustScore: 66, price: 2080, state: 'Tamil Nadu' },
  { name: 'Dindigul',      lat: 10.366, lng: 77.972, trustScore: 58, price: 1850, state: 'Tamil Nadu' },
  { name: 'Thanjavur',     lat: 10.787, lng: 79.139, trustScore: 73, price: 2310, state: 'Tamil Nadu' },

  // Kerala
  { name: 'Thiruvananthapuram', lat: 8.524,  lng: 76.936, trustScore: 78, price: 2450, state: 'Kerala' },
  { name: 'Kochi',              lat: 9.931,  lng: 76.267, trustScore: 84, price: 2720, state: 'Kerala' },
  { name: 'Kozhikode',          lat: 11.258, lng: 75.780, trustScore: 76, price: 2390, state: 'Kerala' },
  { name: 'Thrissur',           lat: 10.527, lng: 76.214, trustScore: 71, price: 2260, state: 'Kerala' },
  { name: 'Kannur',             lat: 11.868, lng: 75.370, trustScore: 67, price: 2120, state: 'Kerala' },
  { name: 'Kollam',             lat: 8.888,  lng: 76.614, trustScore: 63, price: 1990, state: 'Kerala' },
  { name: 'Palakkad',           lat: 10.776, lng: 76.654, trustScore: 69, price: 2170, state: 'Kerala' },
  { name: 'Alappuzha',          lat: 9.498,  lng: 76.339, trustScore: 72, price: 2280, state: 'Kerala' },

  // Telangana
  { name: 'Hyderabad',     lat: 17.385, lng: 78.486, trustScore: 81, price: 2590, state: 'Telangana' },
  { name: 'Warangal',      lat: 17.977, lng: 79.598, trustScore: 70, price: 2180, state: 'Telangana' },
  { name: 'Nizamabad',     lat: 18.672, lng: 78.094, trustScore: 64, price: 1970, state: 'Telangana' },
  { name: 'Khammam',       lat: 17.247, lng: 80.150, trustScore: 60, price: 1880, state: 'Telangana' },
  { name: 'Karimnagar',    lat: 18.438, lng: 79.129, trustScore: 67, price: 2050, state: 'Telangana' },
  { name: 'Mahbubnagar',   lat: 16.738, lng: 77.983, trustScore: 55, price: 1730, state: 'Telangana' },
  { name: 'Nalgonda',      lat: 17.058, lng: 79.267, trustScore: 59, price: 1810, state: 'Telangana' },

  // Chhattisgarh
  { name: 'Raipur',        lat: 21.251, lng: 81.629, trustScore: 73, price: 2230, state: 'Chhattisgarh' },
  { name: 'Bilaspur',      lat: 22.075, lng: 82.148, trustScore: 65, price: 2010, state: 'Chhattisgarh' },
  { name: 'Durg',          lat: 21.190, lng: 81.283, trustScore: 61, price: 1900, state: 'Chhattisgarh' },
  { name: 'Korba',         lat: 22.345, lng: 82.700, trustScore: 56, price: 1760, state: 'Chhattisgarh' },
  { name: 'Rajnandgaon',   lat: 21.097, lng: 81.030, trustScore: 58, price: 1820, state: 'Chhattisgarh' },
  { name: 'Jagdalpur',     lat: 19.075, lng: 82.022, trustScore: 49, price: 1640, state: 'Chhattisgarh' },

  // Jharkhand
  { name: 'Ranchi',        lat: 23.344, lng: 85.309, trustScore: 70, price: 2140, state: 'Jharkhand' },
  { name: 'Jamshedpur',    lat: 22.805, lng: 86.203, trustScore: 74, price: 2260, state: 'Jharkhand' },
  { name: 'Dhanbad',       lat: 23.795, lng: 86.430, trustScore: 66, price: 2020, state: 'Jharkhand' },
  { name: 'Bokaro',        lat: 23.667, lng: 85.991, trustScore: 62, price: 1940, state: 'Jharkhand' },
  { name: 'Hazaribagh',    lat: 23.993, lng: 85.364, trustScore: 57, price: 1790, state: 'Jharkhand' },
  { name: 'Giridih',       lat: 24.188, lng: 86.299, trustScore: 52, price: 1680, state: 'Jharkhand' },

  // West Bengal
  { name: 'Kolkata',       lat: 22.572, lng: 88.364, trustScore: 83, price: 2670, state: 'West Bengal' },
  { name: 'Howrah',        lat: 22.588, lng: 88.310, trustScore: 78, price: 2440, state: 'West Bengal' },
  { name: 'Durgapur',      lat: 23.480, lng: 87.320, trustScore: 72, price: 2220, state: 'West Bengal' },
  { name: 'Asansol',       lat: 23.683, lng: 86.983, trustScore: 69, price: 2130, state: 'West Bengal' },
  { name: 'Siliguri',      lat: 26.722, lng: 88.396, trustScore: 74, price: 2300, state: 'West Bengal' },
  { name: 'Bardhaman',     lat: 23.233, lng: 87.862, trustScore: 67, price: 2060, state: 'West Bengal' },
  { name: 'Malda',         lat: 25.011, lng: 88.140, trustScore: 60, price: 1870, state: 'West Bengal' },
  { name: 'Murshidabad',   lat: 24.185, lng: 88.269, trustScore: 63, price: 1950, state: 'West Bengal' },
  { name: 'Jalpaiguri',    lat: 26.543, lng: 88.718, trustScore: 65, price: 2000, state: 'West Bengal' },

  // North East
  { name: 'Guwahati',      lat: 26.145, lng: 91.736, trustScore: 76, price: 2360, state: 'Assam' },
  { name: 'Dibrugarh',     lat: 27.480, lng: 94.912, trustScore: 64, price: 2010, state: 'Assam' },
  { name: 'Silchar',       lat: 24.827, lng: 92.798, trustScore: 59, price: 1870, state: 'Assam' },
  { name: 'Jorhat',        lat: 26.757, lng: 94.203, trustScore: 61, price: 1920, state: 'Assam' },
  { name: 'Nagaon',        lat: 26.347, lng: 92.684, trustScore: 55, price: 1750, state: 'Assam' },
  { name: 'Shillong',      lat: 25.574, lng: 91.882, trustScore: 68, price: 2090, state: 'Meghalaya' },
  { name: 'Tura',          lat: 25.516, lng: 90.213, trustScore: 51, price: 1680, state: 'Meghalaya' },
  { name: 'Imphal',        lat: 24.817, lng: 93.936, trustScore: 62, price: 1950, state: 'Manipur' },
  { name: 'Aizawl',        lat: 23.727, lng: 92.718, trustScore: 54, price: 1710, state: 'Mizoram' },
  { name: 'Agartala',      lat: 23.831, lng: 91.280, trustScore: 66, price: 2040, state: 'Tripura' },
  { name: 'Itanagar',      lat: 27.084, lng: 93.608, trustScore: 49, price: 1630, state: 'Arunachal Pradesh' },
  { name: 'Kohima',        lat: 25.670, lng: 94.110, trustScore: 52, price: 1700, state: 'Nagaland' },
]
