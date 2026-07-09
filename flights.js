// ═══════════════════════════════════════════════════════════════
// ApexVoyage Flight Data & Generator Engine
// ═══════════════════════════════════════════════════════════════

export const AIRLINES = [
  { code: 'AA', name: 'American Airlines', logo: 'AA', color: '#0078D2', rating: 4.3, alliance: 'Oneworld' },
  { code: 'UA', name: 'United Airlines', logo: 'UA', color: '#002244', rating: 4.2, alliance: 'Star Alliance' },
  { code: 'DL', name: 'Delta Air Lines', logo: 'DL', color: '#003366', rating: 4.4, alliance: 'SkyTeam' },
  { code: 'EK', name: 'Emirates', logo: 'EK', color: '#D71921', rating: 4.7, alliance: 'None' },
  { code: 'QR', name: 'Qatar Airways', logo: 'QR', color: '#8A1538', rating: 4.8, alliance: 'Oneworld' },
  { code: 'SQ', name: 'Singapore Airlines', logo: 'SQ', color: '#F0AB00', rating: 4.8, alliance: 'Star Alliance' },
  { code: 'BA', name: 'British Airways', logo: 'BA', color: '#2E5C99', rating: 4.3, alliance: 'Oneworld' },
  { code: 'LH', name: 'Lufthansa', logo: 'LH', color: '#002855', rating: 4.4, alliance: 'Star Alliance' },
  { code: 'AF', name: 'Air France', logo: 'AF', color: '#002157', rating: 4.4, alliance: 'SkyTeam' },
  { code: 'CX', name: 'Cathay Pacific', logo: 'CX', color: '#006747', rating: 4.6, alliance: 'Oneworld' },
  { code: 'JL', name: 'Japan Airlines', logo: 'JL', color: '#C41E3A', rating: 4.7, alliance: 'Oneworld' },
  { code: 'TK', name: 'Turkish Airlines', logo: 'TK', color: '#E30A17', rating: 4.5, alliance: 'Star Alliance' },
];

export const AIRPORTS = {
  'Tokyo': { code: 'NRT', full: 'Narita International Airport', city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  'Paris': { code: 'CDG', full: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  'New York': { code: 'JFK', full: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  'London': { code: 'LHR', full: 'Heathrow Airport', city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  'Dubai': { code: 'DXB', full: 'Dubai International Airport', city: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  'Maldives': { code: 'MLE', full: 'Velana International Airport', city: 'Malé', country: 'Maldives', lat: 3.2028, lon: 73.2207 },
  'Sydney': { code: 'SYD', full: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  'Zurich': { code: 'ZRH', full: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },
  'Bali': { code: 'DPS', full: 'Ngurah Rai International Airport', city: 'Denpasar', country: 'Indonesia', lat: -8.3405, lon: 115.0920 },
  'Rome': { code: 'FCO', full: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  'Bangkok': { code: 'BKK', full: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  'Singapore': { code: 'SIN', full: 'Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  'Istanbul': { code: 'IST', full: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  'Hong Kong': { code: 'HKG', full: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694 },
  'Doha': { code: 'DOH', full: 'Hamad International Airport', city: 'Doha', country: 'Qatar', lat: 25.276987, lon: 51.520067 },
};

export const ALL_CITIES = Object.keys(AIRPORTS);

export const POPULAR_ROUTES = [
  { from: 'New York', to: 'London', emoji: '🗽→🎡', basePrice: 420 },
  { from: 'New York', to: 'Paris', emoji: '🗽→🗼', basePrice: 480 },
  { from: 'London', to: 'Dubai', emoji: '🎡→🏙️', basePrice: 390 },
  { from: 'Paris', to: 'Tokyo', emoji: '🗼→🗼', basePrice: 620 },
  { from: 'Dubai', to: 'Maldives', emoji: '🏙️→🏝️', basePrice: 280 },
  { from: 'Tokyo', to: 'Bali', emoji: '🗼→🌴', basePrice: 340 },
  { from: 'London', to: 'Zurich', emoji: '🎡→🏔️', basePrice: 180 },
  { from: 'Singapore', to: 'Sydney', emoji: '🌏→🏄', basePrice: 360 },
  { from: 'New York', to: 'Bali', emoji: '🗽→🌴', basePrice: 780 },
  { from: 'Bangkok', to: 'Tokyo', emoji: '🛕→🗼', basePrice: 410 },
  { from: 'Doha', to: 'Maldives', emoji: '🕌→🏝️', basePrice: 320 },
  { from: 'Hong Kong', to: 'Singapore', emoji: '🌆→🌏', basePrice: 240 },
];

export const CABIN_CLASSES = [
  { id: 'economy', name: 'Economy', icon: '💺', multiplier: 1, baggage: '7 kg carry-on', features: ['Standard seat', 'Meals', 'Entertainment'] },
  { id: 'premium', name: 'Premium Economy', icon: '💺✨', multiplier: 1.6, baggage: '2 × 23 kg checked', features: ['Extra legroom', 'Priority boarding', 'Premium meals'] },
  { id: 'business', name: 'Business Class', icon: '🛋️', multiplier: 2.8, baggage: '2 × 32 kg checked', features: ['Flat-bed seat', 'Lounge access', 'Priority check-in'] },
  { id: 'first', name: 'First Class', icon: '👑', multiplier: 4.5, baggage: '3 × 32 kg checked', features: ['Private suite', 'Chauffeur service', 'Fine dining'] },
];

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const haversineDistance = (fromCity, toCity) => {
  const from = AIRPORTS[fromCity];
  const to = AIRPORTS[toCity];
  if (!from || !to) return 3000;
  const R = 6371;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLon = (to.lon - from.lon) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateDuration = (distanceKm) => {
  const speedKmph = randomBetween(820, 920);
  const flightMinutes = Math.round((distanceKm / speedKmph) * 60);
  const groundTime = randomBetween(35, 75);
  const total = flightMinutes + groundTime;
  return { hours: Math.floor(total / 60), minutes: total % 60, totalMinutes: total };
};

const formatTime = (minutes) => {
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const formatDuration = (hours, minutes) => `${hours}h ${minutes}m`;

const generateStopover = (from, to) => {
  const hubs = ['Dubai', 'Doha', 'Singapore', 'Istanbul', 'Hong Kong', 'London'];
  const validHubs = hubs.filter(h => h !== from && h !== to);
  return validHubs[randomBetween(0, validHubs.length - 1)];
};

export const generateFlights = (from, to, date, count = 8) => {
  const distance = haversineDistance(from, to);
  const duration = calculateDuration(distance);
  const baseRoutePrice = Math.max(120, Math.round(distance * 0.08 + randomBetween(-50, 150)));
  const results = [];

  for (let i = 0; i < count; i++) {
    const airline = AIRLINES[i % AIRLINES.length];
    const airlineMultiplier = airline.rating >= 4.6 ? 1.2 : airline.rating >= 4.4 ? 1.05 : 0.95;
    const departureWindow = randomBetween(360, 1320);
    const totalFlightMinutes = duration.totalMinutes + (i % 3 === 0 ? randomBetween(45, 120) : 0);
    const arrivalMinutes = departureWindow + totalFlightMinutes;
    const isOvernight = arrivalMinutes >= 1440;
    const stops = i % 3 === 0 && distance > 2500 ? 1 : 0;

    let finalDuration = duration;
    if (stops > 0) {
      const extra = randomBetween(90, 180);
      const totalMin = duration.totalMinutes + extra;
      finalDuration = {
        hours: Math.floor(totalMin / 60),
        minutes: totalMin % 60,
        totalMinutes: totalMin,
      };
    }

    const price = Math.round(baseRoutePrice * airlineMultiplier * (stops > 0 ? 0.92 : 1));
    const seatsAvailable = randomBetween(1, 28);

    results.push({
      id: `FL-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      airline,
      flightNumber: `${airline.code}${randomBetween(100, 9999)}`,
      from: {
        city: from,
        airport: AIRPORTS[from],
        time: formatTime(departureWindow),
        timestamp: departureWindow,
        date,
      },
      to: {
        city: to,
        airport: AIRPORTS[to],
        time: formatTime(arrivalMinutes),
        timestamp: arrivalMinutes % 1440,
        date: isOvernight ? addDay(date) : date,
      },
      duration: formatDuration(finalDuration.hours, finalDuration.minutes),
      durationMinutes: finalDuration.totalMinutes,
      distance: Math.round(distance),
      stops,
      stopover: stops > 0 ? { city: generateStopover(from, to), airport: AIRPORTS[generateStopover(from, to)] } : null,
      price,
      originalPrice: Math.round(price * (1 + Math.random() * 0.25 + 0.1)),
      seatsAvailable,
      amenities: ['Wi-Fi', 'Entertainment', 'USB Charging', 'Meals'].filter(() => Math.random() > 0.25),
      refundable: Math.random() > 0.6,
      co2: Math.round(distance * 0.15),
    });
  }

  return results.sort((a, b) => a.price - b.price);
};

function addDay(dateStr) {
  if (!dateStr) return dateStr;
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

export const formatMinutesToTime = (mins) => formatTime(mins);
