const BASE_PRICES = [
  // Madhya Pradesh (10 districts)
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Rewa', base: 2350 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Indore', base: 2400 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Bhopal', base: 2380 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Jabalpur', base: 2320 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Gwalior', base: 2360 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Ujjain', base: 2390 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Sagar', base: 2310 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Satna', base: 2330 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Khandwa', base: 2340 },
  { commodity: 'Wheat', variety: 'Sharbati', state: 'Madhya Pradesh', market: 'Vidisha', base: 2370 },
  { commodity: 'Soybean', variety: 'Yellow', state: 'Madhya Pradesh', market: 'Indore', base: 4500 },
  { commodity: 'Soybean', variety: 'Yellow', state: 'Madhya Pradesh', market: 'Ujjain', base: 4450 },
  { commodity: 'Soybean', variety: 'Yellow', state: 'Madhya Pradesh', market: 'Rewa', base: 4300 },
  
  // Uttar Pradesh (8 districts)
  { commodity: 'Sugarcane', variety: 'Co-0238', state: 'Uttar Pradesh', market: 'Muzaffarnagar', base: 350 },
  { commodity: 'Sugarcane', variety: 'Co-0238', state: 'Uttar Pradesh', market: 'Meerut', base: 345 },
  { commodity: 'Sugarcane', variety: 'Co-0238', state: 'Uttar Pradesh', market: 'Saharanpur', base: 340 },
  { commodity: 'Wheat', variety: 'Local', state: 'Uttar Pradesh', market: 'Lucknow', base: 2150 },
  { commodity: 'Wheat', variety: 'Local', state: 'Uttar Pradesh', market: 'Kanpur', base: 2160 },
  { commodity: 'Wheat', variety: 'Local', state: 'Uttar Pradesh', market: 'Varanasi', base: 2120 },
  { commodity: 'Wheat', variety: 'Local', state: 'Uttar Pradesh', market: 'Agra', base: 2180 },
  { commodity: 'Wheat', variety: 'Local', state: 'Uttar Pradesh', market: 'Gorakhpur', base: 2100 },
  
  // Maharashtra (8 districts)
  { commodity: 'Onion', variety: 'Red', state: 'Maharashtra', market: 'Lasalgaon', base: 1800 },
  { commodity: 'Onion', variety: 'Red', state: 'Maharashtra', market: 'Nashik', base: 1750 },
  { commodity: 'Onion', variety: 'Red', state: 'Maharashtra', market: 'Pune', base: 1900 },
  { commodity: 'Cotton', variety: 'BT', state: 'Maharashtra', market: 'Nagpur', base: 7100 },
  { commodity: 'Cotton', variety: 'BT', state: 'Maharashtra', market: 'Amravati', base: 7050 },
  { commodity: 'Cotton', variety: 'BT', state: 'Maharashtra', market: 'Jalgaon', base: 7150 },
  { commodity: 'Soybean', variety: 'Yellow', state: 'Maharashtra', market: 'Latur', base: 4600 },
  { commodity: 'Soybean', variety: 'Yellow', state: 'Maharashtra', market: 'Nanded', base: 4550 },

  // Punjab (8 districts)
  { commodity: 'Wheat', variety: 'HD-2967', state: 'Punjab', market: 'Amritsar', base: 2200 },
  { commodity: 'Wheat', variety: 'HD-2967', state: 'Punjab', market: 'Ludhiana', base: 2220 },
  { commodity: 'Wheat', variety: 'HD-2967', state: 'Punjab', market: 'Jalandhar', base: 2210 },
  { commodity: 'Wheat', variety: 'HD-2967', state: 'Punjab', market: 'Patiala', base: 2190 },
  { commodity: 'Rice', variety: 'Basmati', state: 'Punjab', market: 'Amritsar', base: 3600 },
  { commodity: 'Rice', variety: 'Basmati', state: 'Punjab', market: 'Ludhiana', base: 3650 },
  { commodity: 'Rice', variety: 'Basmati', state: 'Punjab', market: 'Bathinda', base: 3500 },
  { commodity: 'Cotton', variety: 'BT', state: 'Punjab', market: 'Fazilka', base: 7000 },

  // Add more commodities so the lists are rich
  { commodity: 'Mustard', variety: 'Black', state: 'Rajasthan', market: 'Alwar', base: 5100 },
  { commodity: 'Maize', variety: 'Hybrid', state: 'Bihar', market: 'Patna', base: 1900 },
  { commodity: 'Tomato', variety: 'Local', state: 'Karnataka', market: 'Kolar', base: 1200 },
  { commodity: 'Potato', variety: 'Jyoti', state: 'West Bengal', market: 'Hooghly', base: 1400 },
];

const generatePriceData = () => {
  return BASE_PRICES.map(item => {
    // Random variation between -5% to +5%
    const variation = 1 + (Math.random() * 0.1 - 0.05);
    const modalPrice = Math.round(item.base * variation);
    const minPrice = Math.round(modalPrice * 0.95);
    const maxPrice = Math.round(modalPrice * 1.05);
    const trend = variation > 1.01 ? 'up' : variation < 0.99 ? 'down' : 'stable';
    const changePercent = ((variation - 1) * 100).toFixed(1);

    return {
      ...item,
      minPrice,
      modalPrice,
      maxPrice,
      trend,
      changePercent,
      date: new Date().toISOString().split('T')[0]
    };
  });
};

module.exports = { BASE_PRICES, generatePriceData };
