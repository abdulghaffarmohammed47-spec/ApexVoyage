/* ═══════════════════════════════════════════════════════════════
   ExploreHome — Professional Travel Search & Discovery Canvas
   Features: Booking.com-style search bar, proper images,
   conditional CTA, vibe filters, price range, sort, deals
   ═══════════════════════════════════════════════════════════════ */

import { useState, useCallback, useMemo, memo, useEffect, useRef, lazy, Suspense } from 'react';
import { useVoyage } from '../context/AppStateContext';
import AutocompleteSearch from '../components/AutocompleteSearch';
import FlightSearch from '../components/FlightSearch';
import FlightResults from '../components/FlightResults';
import Skeleton, { PropertyCardSkeleton } from '../components/Skeleton';
import { CABIN_CLASSES } from '../data/flights';

// ─── Destination & Property Database (High-Quality Pexels Images) ───
const DESTINATIONS = [
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    vibes: ['urban', 'culture', 'food'],
    lat: 35.6762,
    lon: 139.6503,
    image: 'https://images.pexels.com/photos/31048512/pexels-photo-31048512.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    tagline: 'Neon-lit streets meet ancient temples',
    properties: [
      {
        id: 'tokyo-1',
        name: 'The Ritz-Carlton Tokyo',
        rating: 4.9,
        reviews: 2841,
        basePrice: 280,
        originalPrice: 350,
        dealBadge: '20% OFF',
        image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Spa', 'Pool', 'Restaurant', 'Gym', 'Bar', 'Concierge'],
        description: 'Perched in the clouds of Midtown Tower, enjoy panoramic views of Mt. Fuji alongside world-class luxury.',
      },
      {
        id: 'tokyo-2',
        name: 'Aman Tokyo',
        rating: 4.8,
        reviews: 1532,
        basePrice: 420,
        image: 'https://images.pexels.com/photos/2869215/pexels-photo-2869215.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Spa', 'Restaurant', 'Gym', 'Concierge', 'Yoga'],
        description: 'A serene urban sanctuary blending traditional Japanese aesthetics with contemporary sophistication.',
      },
    ],
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    vibes: ['culture', 'romantic', 'food'],
    lat: 48.8566,
    lon: 2.3522,
    image: 'https://images.pexels.com/photos/34207006/pexels-photo-34207006.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    tagline: 'The eternal city of light and romance',
    properties: [
      {
        id: 'paris-1',
        name: 'Le Bristol Paris',
        rating: 4.9,
        reviews: 3210,
        basePrice: 350,
        originalPrice: 420,
        dealBadge: 'DEAL',
        image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Spa', 'Pool', 'Michelin Restaurant', 'Garden', 'Bar'],
        description: 'An iconic palace hotel on Rue du Faubourg Saint-Honoré offering timeless Parisian elegance.',
      },
      {
        id: 'paris-2',
        name: 'Hôtel Plaza Athénée',
        rating: 4.8,
        reviews: 2456,
        basePrice: 380,
        image: 'https://images.pexels.com/photos/2507010/pexels-photo-2507010.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Spa', 'Dior Institute', 'Restaurant', 'Bar', 'Room Service'],
        description: 'Overlooking Avenue Montaigne, this legendary hotel defines haute couture hospitality.',
      },
    ],
  },
  {
    id: 'maldives',
    city: 'Maldives',
    country: 'Maldives',
    vibes: ['tropical', 'romantic', 'luxury'],
    lat: 3.2028,
    lon: 73.2207,
    image: 'https://images.pexels.com/photos/27099922/pexels-photo-27099922.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    tagline: 'Crystal waters and overwater paradise',
    properties: [
      {
        id: 'maldives-1',
        name: 'Soneva Fushi Resort',
        rating: 4.9,
        reviews: 1890,
        basePrice: 520,
        originalPrice: 700,
        dealBadge: '25% OFF',
        image: 'https://images.pexels.com/photos/6875499/pexels-photo-6875499.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Private Beach', 'Overwater Spa', 'Diving', 'Observatory', 'Water Sports'],
        description: 'Barefoot luxury on a pristine private island in the Baa Atoll UNESCO Biosphere Reserve.',
      },
      {
        id: 'maldives-2',
        name: 'One&Only Reethi Rah',
        rating: 4.8,
        reviews: 1344,
        basePrice: 480,
        image: 'https://images.pexels.com/photos/1456294/pexels-photo-1456294.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['12 Restaurants', 'Spa', 'Water Sports', 'Kids Club', 'Pool'],
        description: 'Sprawling across one of the largest islands in North Malé Atoll with unrivaled seclusion.',
      },
    ],
  },
  {
    id: 'zurich',
    city: 'Zurich',
    country: 'Switzerland',
    vibes: ['alpine', 'adventure', 'luxury'],
    lat: 47.3769,
    lon: 8.5417,
    image: 'https://images.pexels.com/photos/37320975/pexels-photo-37320975.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    tagline: 'Alpine majesty meets precision luxury',
    properties: [
      {
        id: 'zurich-1',
        name: 'The Dolder Grand',
        rating: 4.8,
        reviews: 2102,
        basePrice: 310,
        image: 'https://images.pexels.com/photos/16116489/pexels-photo-16116489.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Spa', 'Golf', '2 Restaurants', 'Art Collection', 'Pool'],
        description: 'A city resort between pulsating city life and idyllic nature on Adlisberg hill.',
      },
      {
        id: 'zurich-2',
        name: 'Baur au Lac',
        rating: 4.9,
        reviews: 1876,
        basePrice: 360,
        originalPrice: 410,
        dealBadge: '12% OFF',
        image: 'https://images.pexels.com/photos/6875519/pexels-photo-6875519.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Lake View', 'Garden', 'Michelin Restaurant', 'Spa', 'Bar'],
        description: 'Since 1844, a beacon of Swiss hospitality overlooking Lake Zurich and the Alps.',
      },
    ],
  },
  {
    id: 'newyork',
    city: 'New York',
    country: 'United States',
    vibes: ['urban', 'culture', 'food', 'luxury'],
    lat: 40.7128,
    lon: -74.0060,
    image: 'https://images.pexels.com/photos/38048122/pexels-photo-38048122.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    tagline: 'The city that never sleeps',
    properties: [
      {
        id: 'ny-1',
        name: 'The Plaza Hotel',
        rating: 4.7,
        reviews: 4520,
        basePrice: 390,
        image: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Spa', 'Butler Service', 'Champagne Bar', 'Ballroom', 'Concierge'],
        description: 'An iconic landmark on Central Park South, defining New York luxury since 1907.',
      },
      {
        id: 'ny-2',
        name: 'The St. Regis New York',
        rating: 4.8,
        reviews: 2890,
        basePrice: 410,
        image: 'https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Butler Service', 'Spa', 'King Cole Bar', 'Fitness', 'Restaurant'],
        description: 'Beaux-Arts landmark on Fifth Avenue where personalized service reaches its pinnacle.',
      },
    ],
  },
  {
    id: 'dubai',
    city: 'Dubai',
    country: 'UAE',
    vibes: ['luxury', 'urban', 'adventure'],
    lat: 25.2048,
    lon: 55.2708,
    image: 'https://images.pexels.com/photos/19664340/pexels-photo-19664340.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    tagline: 'Where vision becomes architectural reality',
    properties: [
      {
        id: 'dubai-1',
        name: 'Burj Al Arab Jumeirah',
        rating: 4.9,
        reviews: 3670,
        basePrice: 680,
        originalPrice: 850,
        dealBadge: 'LUXURY DEAL',
        image: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Helipad', 'Private Beach', 'Spa', '9 Restaurants', 'Pool'],
        description: 'The world\'s most luxurious hotel, rising from its own artificial island in the Arabian Gulf.',
      },
      {
        id: 'dubai-2',
        name: 'Atlantis The Royal',
        rating: 4.8,
        reviews: 2100,
        basePrice: 450,
        image: 'https://images.pexels.com/photos/2373201/pexels-photo-2373201.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Skypool', 'Waterpark', 'Celebrity Restaurants', 'Spa', 'Fitness'],
        description: 'An architectural masterpiece redefining ultra-luxury hospitality on Palm Jumeirah.',
      },
    ],
  },
  {
    id: 'bali',
    city: 'Bali',
    country: 'Indonesia',
    vibes: ['tropical', 'culture', 'adventure'],
    lat: -8.3405,
    lon: 115.0920,
    image: 'https://images.pexels.com/photos/32191652/pexels-photo-32191652.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    tagline: 'Island of gods and endless sunsets',
    properties: [
      {
        id: 'bali-1',
        name: 'Four Seasons Sayan',
        rating: 4.9,
        reviews: 1654,
        basePrice: 290,
        image: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Infinity Pool', 'Spa', 'Yoga', 'River View', 'Restaurant'],
        description: 'Suspended above the Ayung River valley, where Balinese spirituality meets world-class comfort.',
      },
      {
        id: 'bali-2',
        name: 'COMO Shambhala Estate',
        rating: 4.8,
        reviews: 1320,
        basePrice: 340,
        originalPrice: 395,
        dealBadge: 'HOT DEAL',
        image: 'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Wellness Retreat', 'Hiking', 'Pool', 'Organic Cuisine', 'Spa'],
        description: 'A holistic wellness retreat set in a jungle hillside near Ubud\'s cultural heart.',
      },
    ],
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    vibes: ['culture', 'urban', 'food'],
    lat: 51.5074,
    lon: -0.1278,
    image: 'https://images.pexels.com/photos/18093790/pexels-photo-18093790.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    tagline: 'Centuries of heritage, boundless modernity',
    properties: [
      {
        id: 'london-1',
        name: 'Claridge\'s',
        rating: 4.9,
        reviews: 3890,
        basePrice: 370,
        image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['Art Deco Interiors', 'Spa', 'Restaurant', 'Afternoon Tea', 'Bar'],
        description: 'The epitome of British elegance in the heart of Mayfair since 1856.',
      },
      {
        id: 'london-2',
        name: 'The Savoy',
        rating: 4.8,
        reviews: 3120,
        basePrice: 340,
        originalPrice: 390,
        dealBadge: '13% OFF',
        image: 'https://images.pexels.com/photos/15156229/pexels-photo-15156229.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800',
        amenities: ['River View', 'Spa', 'Theatre', 'Restaurant', 'Cocktail Bar'],
        description: 'A legendary riverside hotel on the Strand, synonymous with glamour and sophistication since 1889.',
      },
    ],
  },
];

export { DESTINATIONS };

// ─── Room Tiers ───
export const ROOM_TIERS = [
  { id: 'standard', name: 'Standard Room', multiplier: 1.0, icon: '🛏️' },
  { id: 'deluxe', name: 'Deluxe Suite', multiplier: 1.8, icon: '✨' },
  { id: 'premium', name: 'Premium Luxury', multiplier: 2.5, icon: '💎' },
  { id: 'royal', name: 'Royal Penthouse', multiplier: 4.0, icon: '👑' },
];

// ─── Vibe Categories ───
const VIBES = [
  { id: 'all', label: '🌍 All', emoji: '🌍' },
  { id: 'tropical', label: '🏝️ Tropical', emoji: '🏝️' },
  { id: 'alpine', label: '🏔️ Alpine', emoji: '🏔️' },
  { id: 'culture', label: '🏛️ Culture', emoji: '🏛️' },
  { id: 'urban', label: '🏙️ Urban', emoji: '🏙️' },
  { id: 'romantic', label: '💕 Romance', emoji: '💕' },
  { id: 'adventure', label: '🧗 Adventure', emoji: '🧗' },
  { id: 'food', label: '🍽️ Culinary', emoji: '🍽️' },
];

// ─── Sort Options ───
const SORT_OPTIONS = [
  { id: 'recommended', label: '⭐ Recommended' },
  { id: 'price-low', label: '💰 Price: Low to High' },
  { id: 'price-high', label: '💰 Price: High to Low' },
  { id: 'rating', label: '🌟 Guest Rating' },
  { id: 'reviews', label: '📝 Most Reviewed' },
];

// ─── Amenities List ───
const ALL_AMENITIES = ['Spa', 'Pool', 'Restaurant', 'Gym', 'Bar', 'Concierge', 'Beach', 'Room Service'];

// ─── Star Render ───
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '½';
  return s;
}

// ═══ Property Card ───
const PropertyCard = memo(function PropertyCard({ property, destination, onSelect, onToggleWishlist, onToggleCompare, isInWishlist, isInCompare, formatPrice }) {
  const handleClick = useCallback(() => onSelect(property, destination), [property, destination, onSelect]);
  const handleWishlist = useCallback(e => { e.stopPropagation(); onToggleWishlist(property, destination); }, [property, destination, onToggleWishlist]);
  const handleCompare = useCallback(e => { e.stopPropagation(); onToggleCompare(property, destination); }, [property, destination, onToggleCompare]);

  return (
    <div className="property-card animate-fadeInUp" onClick={handleClick}>
      {property.dealBadge && <div className="deal-badge">{property.dealBadge}</div>}
      <div className={`compare-toggle ${isInCompare ? 'active' : ''}`} onClick={handleCompare}>
        <span>⚖️</span><span>{isInCompare ? 'Added' : 'Compare'}</span>
      </div>
      <button className={`wishlist-btn ${isInWishlist ? 'active' : ''}`} onClick={handleWishlist} aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
        {isInWishlist ? '❤️' : '🤍'}
      </button>
      <div className="property-card-img-wrapper">
        <img src={property.image} alt={property.name} className="property-card-image" loading="lazy" />
      </div>
      <div className="property-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <span className="badge badge-cyan">{destination.city}</span>
        </div>
        <h3 className="property-card-title">{property.name}</h3>
        <p className="property-card-location">📍 {destination.city}, {destination.country}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
          {property.amenities.slice(0, 3).map(a => (<span key={a} className="badge badge-violet" style={{ fontSize: '0.65rem' }}>{a}</span>))}
          {property.amenities.length > 3 && <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>+{property.amenities.length - 3}</span>}
        </div>
        <div className="property-card-footer">
          <div>
            <span className="star-rating">{renderStars(property.rating)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>{property.rating} ({property.reviews.toLocaleString()})</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            {property.originalPrice && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(property.originalPrice)}</div>}
            <div className="property-price">{formatPrice(property.basePrice)}<small>/night</small></div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ═══ Main ExploreHome Component ───
const ExploreHome = memo(function ExploreHome() {
  const {
    searchCity, setSearchCity,
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    guests, setGuests,
    selectedVibe, setSelectedVibe,
    priceRange, setPriceRange,
    sortBy, setSortBy,
    selectedAmenities, setSelectedAmenities,
    navigateTo,
    setSelectedProperty,
    setSelectedDestination,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    recentSearches,
    addRecentSearch,
    formatPrice,
    isAuthenticated,
    exploreTab, setExploreTab,
    addFlightBooking,
  } = useVoyage();

  const [activeVibe, setActiveVibe] = useState(selectedVibe || 'all');
  const [flightResults, setFlightResults] = useState(null);
  const [flightSearchMeta, setFlightSearchMeta] = useState(null);
  const searchFormRef = useRef(null);

  // Recent search tracking
  useEffect(() => {
    if (!searchCity && activeVibe === 'all') return;
    const timer = setTimeout(() => {
      addRecentSearch({
        city: searchCity || 'Anywhere',
        vibe: activeVibe === 'all' ? null : activeVibe,
        checkIn, checkOut, guests,
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [searchCity, activeVibe, checkIn, checkOut, guests, addRecentSearch]);

  // ─── Filter & Sort Engine ───
  const filteredDestinations = useMemo(() => {
    let results = DESTINATIONS;
    if (activeVibe && activeVibe !== 'all') results = results.filter(d => d.vibes.includes(activeVibe));
    if (searchCity && searchCity.trim()) {
      const q = searchCity.toLowerCase().trim();
      results = results.filter(d => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q));
    }
    return results;
  }, [activeVibe, searchCity]);

  const allProperties = useMemo(() => {
    const props = [];
    filteredDestinations.forEach(dest => {
      dest.properties.forEach(prop => {
        if (prop.basePrice < priceRange[0] || prop.basePrice > priceRange[1]) return;
        if (selectedAmenities.length > 0 && !selectedAmenities.every(a => prop.amenities.includes(a))) return;
        props.push({ property: prop, destination: dest });
      });
    });
    const sorted = [...props];
    switch (sortBy) {
      case 'price-low': sorted.sort((a, b) => a.property.basePrice - b.property.basePrice); break;
      case 'price-high': sorted.sort((a, b) => b.property.basePrice - a.property.basePrice); break;
      case 'rating': sorted.sort((a, b) => b.property.rating - a.property.rating); break;
      case 'reviews': sorted.sort((a, b) => b.property.reviews - a.property.reviews); break;
      default:
        sorted.sort((a, b) => {
          const aD = a.property.dealBadge ? 1 : 0, bD = b.property.dealBadge ? 1 : 0;
          if (aD !== bD) return bD - aD;
          if (a.property.rating !== b.property.rating) return b.property.rating - a.property.rating;
          return b.property.reviews - a.property.reviews;
        });
    }
    return sorted;
  }, [filteredDestinations, priceRange, selectedAmenities, sortBy]);

  const handlePropertySelect = useCallback((prop, dest) => { setSelectedProperty(prop); setSelectedDestination(dest); navigateTo('property', { property: prop, destination: dest }); }, [setSelectedProperty, setSelectedDestination, navigateTo]);
  const handleVibeSelect = useCallback((vibeId) => { setActiveVibe(vibeId); setSelectedVibe(vibeId === 'all' ? null : vibeId); }, [setSelectedVibe]);
  const handleCitySelect = useCallback((city) => { setSearchCity(city.city); }, [setSearchCity]);
  const handlePriceChange = useCallback(e => { setPriceRange([priceRange[0], parseInt(e.target.value, 10)]); }, [priceRange, setPriceRange]);
  const handleAmenityToggle = useCallback(a => { setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]); }, [setSelectedAmenities]);
  const handleRecentSearchClick = useCallback(s => { setSearchCity(s.city === 'Anywhere' ? '' : s.city); if (s.vibe) { setActiveVibe(s.vibe); setSelectedVibe(s.vibe); } }, [setSearchCity, setSelectedVibe]);
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ─── Guest dropdown trigger ───
  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchCity) {
      const matched = DESTINATIONS.find(d => d.city.toLowerCase() === searchCity.toLowerCase());
      if (matched && allProperties.length > 0) {
        handlePropertySelect(allProperties[0].property, allProperties[0].destination);
      }
    }
  }, [searchCity, allProperties, handlePropertySelect]);

  // ─── Flight Handlers ───
  const handleFlightResults = useCallback(({ flights, from, to, departDate, returnDate, passengers, cabinClass, tripType }) => {
    setFlightResults(flights);
    setFlightSearchMeta({ from, to, departDate, returnDate, passengers, cabinClass, tripType });
  }, []);

  const handleFlightBack = useCallback(() => {
    setFlightResults(null);
    setFlightSearchMeta(null);
  }, []);

  const handleFlightBook = useCallback((flight, from, to, departDate, passengers, cabinClass) => {
    const multiplier = CABIN_CLASSES.find(c => c.id === cabinClass)?.multiplier || 1;
    addFlightBooking({
      airline: flight.airline.name,
      airlineCode: flight.airline.code,
      flightNumber: flight.flightNumber,
      from,
      to,
      departureDate: departDate,
      departureTime: flight.from.time,
      arrivalTime: flight.to.time,
      arrivalDate: flight.to.date,
      duration: flight.duration,
      stops: flight.stops,
      stopover: flight.stopover?.city || null,
      passengers,
      cabinClass,
      totalCost: Math.round(flight.price * passengers * multiplier),
      pricePerSeat: flight.price,
      distance: flight.distance,
      refundable: flight.refundable,
    });
    setFlightResults(null);
    setFlightSearchMeta(null);
  }, [addFlightBooking]);

  return (
    <div>
      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section" style={{ minHeight: '92vh' }}>
        <div className="hero-bg" />
        <div className="hero-content animate-fadeInUp" style={{ width: '100%', maxWidth: '1000px' }}>
          <p className="text-caption" style={{ color: 'var(--cyan-400)', marginBottom: '1rem', letterSpacing: '0.12em' }}>
            ✦   A P E X V O Y A G E   ✦
          </p>
          <h1 className="text-display" style={{ marginBottom: '0.5rem' }}>
            Discover Your Next{' '}
            <span className="text-gradient">Extraordinary</span>{' '}
            Journey
          </h1>
          <p className="text-body" style={{ fontSize: '1.1rem', maxWidth: '620px', margin: '0.75rem auto 1.75rem' }}>
            Hand-picked luxury accommodations in the world&apos;s most coveted destinations.
          </p>

          {/* ─── Professional Booking.com-Style Search Bar ─── */}
          <form className="pro-search-bar" onSubmit={handleSearchSubmit} ref={searchFormRef}>
            <div className="pro-search-field pro-search-destination">
              <span className="pro-search-icon">🔍</span>
              <div className="pro-search-input-group">
                <label className="pro-search-label">Destination</label>
                <AutocompleteSearch
                  value={searchCity}
                  onChange={setSearchCity}
                  onSelect={handleCitySelect}
                  placeholder="Search cities or hotels..."
                />
              </div>
            </div>
            <div className="pro-search-divider" />
            <div className="pro-search-field">
              <span className="pro-search-icon">📅</span>
              <div className="pro-search-input-group">
                <label className="pro-search-label">Check-in</label>
                <input type="date" className="pro-search-input" value={checkIn} onChange={e => setCheckIn(e.target.value)} min={today} />
              </div>
            </div>
            <div className="pro-search-divider" />
            <div className="pro-search-field">
              <span className="pro-search-icon">📅</span>
              <div className="pro-search-input-group">
                <label className="pro-search-label">Check-out</label>
                <input type="date" className="pro-search-input" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn || today} />
              </div>
            </div>
            <div className="pro-search-divider" />
            <div className="pro-search-field" style={{ maxWidth: '140px', flexShrink: 0 }}>
              <span className="pro-search-icon">👤</span>
              <div className="pro-search-input-group" style={{ minWidth: '80px' }}>
                <label className="pro-search-label">Guests</label>
                <div className="pro-guest-selector">
                  <button type="button" className="pro-guest-btn" onClick={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>−</button>
                  <span className="pro-guest-count">{guests}</span>
                  <button type="button" className="pro-guest-btn" onClick={() => setGuests(Math.min(8, guests + 1))} disabled={guests >= 8}>+</button>
                </div>
              </div>
            </div>
            <button type="submit" className="pro-search-submit">
              Search
            </button>
          </form>

          {/* Quick vibe shortcuts under search */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Popular:</span>
            {['Tropical', 'Alpine', 'Culture', 'Urban'].map(v => (
              <button key={v} className="pro-quick-tag" onClick={() => handleVibeSelect(v.toLowerCase())}>
                {v}
              </button>
            ))}
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div className="recent-searches" style={{ justifyContent: 'center' }}>
                {recentSearches.slice(0, 4).map((s, i) => (
                  <button key={`${s.city}-${i}`} className="recent-search-chip" onClick={() => handleRecentSearchClick(s)}>
                    🕐 {s.city}{s.vibe ? ` · ${s.vibe}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ EXPLORE TAB BAR ═══ */}
      <section className="container" style={{ paddingTop: '1.5rem' }}>
        <div className="explore-tab-bar">
          <button
            className={`explore-tab ${exploreTab === 'hotels' ? 'active' : ''}`}
            onClick={() => { setExploreTab('hotels'); setFlightResults(null); }}
          >
            🏨 Hotels & Resorts
          </button>
          <button
            className={`explore-tab ${exploreTab === 'flights' ? 'active' : ''}`}
            onClick={() => setExploreTab('flights')}
          >
            ✈️ Flights
          </button>
        </div>
      </section>

      {/* Hotels Content */}
      {exploreTab === 'hotels' && (
        <>
      {/* ═══ VIBE FILTERS ═══ */}
      <section className="container" style={{ paddingTop: '0.5rem' }}>
        <div className="vibe-tags" style={{ margin: '0.75rem 0' }}>
          {VIBES.map(v => (
            <button key={v.id} className={`vibe-tag ${activeVibe === v.id ? 'active' : ''}`} onClick={() => handleVibeSelect(v.id)}>
              {v.label}
            </button>
          ))}
        </div>
      </section>

      {/* ═══ ADVANCED FILTERS: Price + Amenities + Sort ═══ */}
      <section className="container">
        <div className="bento-glass" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'start' }}>
            <div>
              <label className="input-label">💰 Max Price: {formatPrice(priceRange[1])}/night</label>
              <input type="range" className="range-slider" min="100" max="1000" step="50" value={priceRange[1]} onChange={handlePriceChange} />
              <div className="range-labels"><span>{formatPrice(100)}</span><span>{formatPrice(1000)}+</span></div>
            </div>
            <div>
              <label className="input-label">🏨 Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
                {ALL_AMENITIES.map(a => (
                  <button key={a} className={`vibe-tag ${selectedAmenities.includes(a) ? 'active' : ''}`} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => handleAmenityToggle(a)}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="input-label">🔀 Sort By</label>
              <select className="input-field" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ marginTop: '0.4rem' }}>
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--cyan-400)' }}>{allProperties.length}</strong> {allProperties.length === 1 ? 'property' : 'properties'}
            </span>
            {(selectedAmenities.length > 0 || priceRange[1] < 1000 || activeVibe !== 'all') && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedAmenities([]); setPriceRange([0, 1000]); handleVibeSelect('all'); }}>✕ Clear All</button>
            )}
          </div>
        </div>
      </section>

      {/* ═══ PROPERTY GRID ═══ */}
      <section className="container section">
        <div className="section-header">
          <h2 className="text-headline">
            {activeVibe && activeVibe !== 'all'
              ? `${VIBES.find(v => v.id === activeVibe)?.emoji || ''} ${VIBES.find(v => v.id === activeVibe)?.label || ''} Properties`
              : '🌟 Featured Properties'}
          </h2>
        </div>
        {allProperties.length === 0 ? (
          <div className="empty-state glass-panel" style={{ padding: '3rem' }}>
            <div className="icon">🔍</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No properties match your criteria</h3>
            <p style={{ fontSize: '0.85rem' }}>Try adjusting your search, vibe, or price range</p>
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => { handleVibeSelect('all'); setSearchCity(''); setPriceRange([0, 1000]); setSelectedAmenities([]); }}>Reset Filters</button>
          </div>
        ) : (
          <div className="property-grid">
            {allProperties.map(({ property, destination }) => (
              <PropertyCard key={property.id} property={property} destination={destination}
                onSelect={handlePropertySelect} onToggleWishlist={toggleWishlist} onToggleCompare={toggleCompare}
                isInWishlist={isInWishlist(property.id)} isInCompare={isInCompare(property.id)} formatPrice={formatPrice} />
            ))}
          </div>
        )}
      </section>

      {/* ═══ DESTINATION SHOWCASE ═══ */}
      <section className="container section">
        <div className="section-header">
          <h2 className="text-headline">🗺️ Explore Destinations</h2>
        </div>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filteredDestinations.map(dest => (
            <div key={dest.id} className="glass-panel" style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
              onClick={() => { setSearchCity(dest.city); handleVibeSelect('all'); }}>
              <div className="dest-card-img">
                <img src={dest.image} alt={dest.city} loading="lazy" />
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.3rem' }}>{dest.city}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{dest.tagline}</p>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {dest.vibes.map(v => <span key={v} className="badge badge-cyan">{v}</span>)}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {dest.properties.length} {dest.properties.length === 1 ? 'property' : 'properties'} from {formatPrice(Math.min(...dest.properties.map(p => p.basePrice)))}/night
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

        </>
      )}

      {/* ═══ FLIGHTS SECTION ═══ */}
      {exploreTab === 'flights' && (
        <section className="container section">
          {!flightResults ? (
            <div className="flight-hero-card">
              <div className="flight-hero-content">
                <div className="flight-hero-badge">✈️ Apex Flights</div>
                <h2 className="flight-hero-title">Find the Best Flight Deals</h2>
                <p className="flight-hero-subtitle">Search hundreds of airlines and secure the perfect fare for your journey.</p>
              </div>
              <div className="flight-hero-search">
                <FlightSearch onResults={handleFlightResults} />
              </div>
            </div>
          ) : (
            <FlightResults
              flights={flightResults}
              from={flightSearchMeta?.from}
              to={flightSearchMeta?.to}
              departDate={flightSearchMeta?.departDate}
              passengers={flightSearchMeta?.passengers}
              cabinClass={flightSearchMeta?.cabinClass}
              onBook={handleFlightBook}
              onBack={handleFlightBack}
            />
          )}
        </section>
      )}

      {/* ═══ BOTTOM CTA — CONDITIONAL ═══ */}
      {!isAuthenticated ? (
        <section className="container" style={{ padding: '3rem 1.5rem 7rem' }}>
          <div className="reserve-panel" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 className="text-headline" style={{ marginBottom: '0.75rem' }}>
              Ready to Start Planning?
            </h2>
            <p className="text-body" style={{ marginBottom: '1.5rem' }}>
              Create a free account to unlock booking, wishlist saves, itinerary planning, and spending analytics.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigateTo('auth')}>✨ Get Started Free</button>
              <button className="btn btn-secondary btn-lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Back to Top</button>
            </div>
          </div>
        </section>
      ) : (
        <section className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
          <div className="reserve-panel" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(139, 92, 246, 0.06))' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👋</div>
            <h2 className="text-headline" style={{ marginBottom: '0.5rem' }}>
              Welcome Back, Traveler
            </h2>
            <p className="text-body" style={{ marginBottom: '1.25rem' }}>
              View your reservations, saved properties, and plan your itinerary.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigateTo('dashboard')}>📊 Go to Dashboard</button>
              <button className="btn btn-secondary btn-lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑ Back to Top</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
});

export default ExploreHome;
