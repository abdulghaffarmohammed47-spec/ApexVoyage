/* ═══════════════════════════════════════════════════════════════
   ApexVoyage — Core Application State Context Hub
   Houses auth, reservations, itinerary, search, and navigation.
   Exports clean custom hook: useVoyage()
   ═══════════════════════════════════════════════════════════════ */

import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react';

const AppStateContext = createContext(null);

// ─── Persistent Storage Helpers ───
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Failed to save key "${key}" to localStorage`);
  }
}

// ─── Input Sanitization Utilities ───
function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>]/g, '');
}

function sanitizeAmount(value) {
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  // Fix floating-point precision (max 2 decimal places)
  return Math.round(parsed * 100) / 100;
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ─── Provider Component ───
export function AppStateProvider({ children }) {
  // ═══ Authentication State ═══
  const [user, setUser] = useState(() => loadFromStorage('apex_user', null));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!loadFromStorage('apex_user', null));

  // ═══ Navigation State ═══
  const [currentView, setCurrentView] = useState('landing');

  // ═══ Search & Filter State ═══
  const [searchCity, setSearchCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // ═══ Selection State ═══
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // ═══ API Data ═══
  const [weatherData, setWeatherData] = useState(null);
  const [cityCoordinates, setCityCoordinates] = useState(null);

  // ═══ Currency ═══
  const [currency, setCurrency] = useState(() => loadFromStorage('apex_currency', { code: 'USD', symbol: '$', rate: 1 }));
  const [exchangeRates, setExchangeRates] = useState(() => loadFromStorage('apex_exchange_rates', { USD: 1 }));
  const [exchangeTimestamp, setExchangeTimestamp] = useState(() => loadFromStorage('apex_exchange_timestamp', 0));

  // ═══ User Data (Persisted) ═══
  const [reservations, setReservations] = useState(() => loadFromStorage('apex_reservations', []));
  const [itinerary, setItinerary] = useState(() => loadFromStorage('apex_itinerary', []));
  const [wishlist, setWishlist] = useState(() => loadFromStorage('apex_wishlist', []));
  const [recentSearches, setRecentSearches] = useState(() => loadFromStorage('apex_recent_searches', []));
  const [compareList, setCompareList] = useState(() => loadFromStorage('apex_compare', []));
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [uiTheme, setUiTheme] = useState(() => loadFromStorage('apex_theme', 'modern'));
  const [exploreTab, setExploreTab] = useState('hotels');

  // ═══ Flight Bookings ═══
  const [flightBookings, setFlightBookings] = useState(() => loadFromStorage('apex_flights', []));

  // ═══ UI State ═══
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // ═══ AbortController Ref for Race Condition Defense ═══
  const abortControllerRef = useRef(null);

  // ─── Persist user data to localStorage ───
  useEffect(() => { saveToStorage('apex_reservations', reservations); }, [reservations]);
  useEffect(() => { saveToStorage('apex_itinerary', itinerary); }, [itinerary]);
  useEffect(() => { saveToStorage('apex_wishlist', wishlist); }, [wishlist]);
  useEffect(() => { saveToStorage('apex_recent_searches', recentSearches); }, [recentSearches]);
  useEffect(() => { saveToStorage('apex_compare', compareList); }, [compareList]);
  useEffect(() => { saveToStorage('apex_currency', currency); }, [currency]);
  useEffect(() => { saveToStorage('apex_exchange_rates', exchangeRates); }, [exchangeRates]);
  useEffect(() => { saveToStorage('apex_exchange_timestamp', exchangeTimestamp); }, [exchangeTimestamp]);
  useEffect(() => { saveToStorage('apex_theme', uiTheme); }, [uiTheme]);
  useEffect(() => { saveToStorage('apex_flights', flightBookings); }, [flightBookings]);

  // ─── Toast auto-dismiss ───
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ═══ Authentication Functions ═══
  const login = useCallback((email, password) => {
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanPassword = password; // Don't trim passwords

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address');
    }

    const users = loadFromStorage('apex_users_db', []);
    const found = users.find(u => u.email === cleanEmail && u.password === cleanPassword);

    if (!found) {
      throw new Error('Invalid email or password');
    }

    const sessionUser = { id: found.id, name: found.name, email: found.email };
    setUser(sessionUser);
    setIsAuthenticated(true);
    saveToStorage('apex_user', sessionUser);
    setCurrentView('explore');
    setToast({ type: 'success', message: `Welcome back, ${found.name}!` });
  }, []);

  const register = useCallback((name, email, password) => {
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email).toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    if (!cleanEmail) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const users = loadFromStorage('apex_users_db', []);
    if (users.find(u => u.email === cleanEmail)) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: generateId(),
      name: cleanName,
      email: cleanEmail,
      password: password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveToStorage('apex_users_db', users);

    const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(sessionUser);
    setIsAuthenticated(true);
    saveToStorage('apex_user', sessionUser);
    setCurrentView('explore');
    setToast({ type: 'success', message: `Welcome to ApexVoyage, ${cleanName}!` });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('apex_user');
    setCurrentView('landing');
    setToast({ type: 'success', message: 'You have been signed out' });
  }, []);

  // ═══ Navigation ═══
  const navigateTo = useCallback((view, data) => {
    // Route protection for authenticated views
    if ((view === 'dashboard' || view === 'explore') && !isAuthenticated) {
      setCurrentView('auth');
      setToast({ type: 'error', message: 'Please sign in to access this page' });
      return;
    }

    setCurrentView(view);
    setError(null);

    if (data?.property) setSelectedProperty(data.property);
    if (data?.destination) setSelectedDestination(data.destination);
  }, [isAuthenticated]);

  // ═══ AbortController Management ═══
  const cancelPreviousRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  }, []);

  // ═══ Theme Toggle ═══
  const toggleTheme = useCallback(() => {
    setUiTheme(prev => {
      const next = prev === 'modern' ? 'classic' : 'modern';
      // Apply theme to <html> for CSS variable switching
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next);
      }
      return next;
    });
  }, []);

  // Apply initial theme on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', uiTheme);
    }
  }, [uiTheme]);

  // ═══ Reservation CRUD ═══
  const addReservation = useCallback((reservationData) => {
    const reservation = {
      id: generateId(),
      hotelName: sanitizeString(reservationData.hotelName),
      destination: sanitizeString(reservationData.destination),
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      guests: Math.max(1, Math.min(10, parseInt(reservationData.guests, 10) || 1)),
      roomTier: sanitizeString(reservationData.roomTier),
      totalCost: sanitizeAmount(reservationData.totalCost),
      pricePerNight: sanitizeAmount(reservationData.pricePerNight),
      nights: Math.max(1, parseInt(reservationData.nights, 10) || 1),
      bookedAt: new Date().toISOString(),
      status: 'confirmed',
    };

    setReservations(prev => [reservation, ...prev]);
    setToast({ type: 'success', message: `Booking confirmed at ${reservation.hotelName}!` });
    return reservation;
  }, []);

  const removeReservation = useCallback((id) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    setToast({ type: 'success', message: 'Reservation cancelled' });
  }, []);

  // ═══ Flight Booking CRUD ═══
  const addFlightBooking = useCallback((flightData) => {
    const booking = {
      id: `FB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      airline: flightData.airline,
      airlineCode: flightData.airlineCode,
      flightNumber: flightData.flightNumber,
      from: flightData.from,
      to: flightData.to,
      departureDate: flightData.departureDate,
      departureTime: flightData.departureTime,
      arrivalTime: flightData.arrivalTime,
      duration: flightData.duration,
      stops: flightData.stops || 0,
      passengers: flightData.passengers || 1,
      cabinClass: flightData.cabinClass || 'economy',
      totalCost: sanitizeAmount(flightData.totalCost),
      pricePerSeat: sanitizeAmount(flightData.pricePerSeat),
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      tripId: flightData.tripId || null,
    };
    setFlightBookings(prev => [booking, ...prev]);
    setToast({ type: 'success', message: `✈️ Flight booked! ${flightData.from} → ${flightData.to}` });
    return booking;
  }, []);

  const removeFlightBooking = useCallback((id) => {
    setFlightBookings(prev => prev.filter(f => f.id !== id));
    setToast({ type: 'success', message: 'Flight booking cancelled' });
  }, []);

  const upcomingFlights = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return flightBookings.filter(f => f.departureDate >= today);
  }, [flightBookings]);

  const pastFlights = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return flightBookings.filter(f => f.departureDate < today);
  }, [flightBookings]);

  const totalFlightSpend = useMemo(() => {
    return flightBookings.reduce((sum, f) => sum + (sanitizeAmount(f.totalCost) || 0), 0);
  }, [flightBookings]);

  // ═══ Itinerary CRUD ═══
  const addItineraryItem = useCallback((itemData) => {
    const item = {
      id: generateId(),
      date: itemData.date || new Date().toISOString().split('T')[0],
      time: sanitizeString(itemData.time) || '09:00',
      title: sanitizeString(itemData.title),
      description: sanitizeString(itemData.description),
      category: sanitizeString(itemData.category) || 'activity',
      createdAt: new Date().toISOString(),
    };

    if (!item.title) {
      setToast({ type: 'error', message: 'Activity title is required' });
      return null;
    }

    setItinerary(prev => [...prev, item]);
    setToast({ type: 'success', message: 'Activity added to itinerary' });
    return item;
  }, []);

  const updateItineraryItem = useCallback((id, updates) => {
    setItinerary(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          ...(updates.title !== undefined ? { title: sanitizeString(updates.title) } : {}),
          ...(updates.description !== undefined ? { description: sanitizeString(updates.description) } : {}),
          ...(updates.time !== undefined ? { time: sanitizeString(updates.time) } : {}),
          ...(updates.date !== undefined ? { date: updates.date } : {}),
          ...(updates.category !== undefined ? { category: sanitizeString(updates.category) } : {}),
        };
      })
    );
  }, []);

  const removeItineraryItem = useCallback((id) => {
    setItinerary(prev => prev.filter(item => item.id !== id));
    setToast({ type: 'success', message: 'Activity removed' });
  }, []);

  // ═══ Wishlist CRUD ═══
  const toggleWishlist = useCallback((property, destination) => {
    if (!property || !destination) return;
    setWishlist(prev => {
      const exists = prev.find(w => w.propertyId === property.id);
      if (exists) {
        setToast({ type: 'success', message: `Removed ${property.name} from wishlist` });
        return prev.filter(w => w.propertyId !== property.id);
      }
      setToast({ type: 'success', message: `Added ${property.name} to wishlist ❤️` });
      return [...prev, {
        propertyId: property.id,
        property: { ...property },
        destination: { ...destination },
        addedAt: new Date().toISOString(),
      }];
    });
  }, []);

  const removeFromWishlist = useCallback((propertyId) => {
    setWishlist(prev => prev.filter(w => w.propertyId !== propertyId));
    setToast({ type: 'success', message: 'Removed from wishlist' });
  }, []);

  const isInWishlist = useCallback((propertyId) => {
    return wishlist.some(w => w.propertyId === propertyId);
  }, [wishlist]);

  // ═══ Recent Searches ═══
  const addRecentSearch = useCallback((searchData) => {
    if (!searchData || (!searchData.city && !searchData.vibe)) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(
        s => s.city !== searchData.city || s.vibe !== searchData.vibe
      );
      return [{ ...searchData, searchedAt: new Date().toISOString() }, ...filtered].slice(0, 8);
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    setToast({ type: 'success', message: 'Recent searches cleared' });
  }, []);

  // ═══ Compare List ═══
  const toggleCompare = useCallback((property, destination) => {
    if (!property || !destination) return;
    setCompareList(prev => {
      const exists = prev.find(c => c.propertyId === property.id);
      if (exists) {
        setToast({ type: 'success', message: 'Removed from compare' });
        return prev.filter(c => c.propertyId !== property.id);
      }
      if (prev.length >= 3) {
        setToast({ type: 'error', message: 'You can compare up to 3 properties' });
        return prev;
      }
      setToast({ type: 'success', message: `Added ${property.name} to compare` });
      return [...prev, {
        propertyId: property.id,
        property: { ...property },
        destination: { ...destination },
        addedAt: new Date().toISOString(),
      }];
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback((propertyId) => {
    return compareList.some(c => c.propertyId === propertyId);
  }, [compareList]);

  // ═══ Currency & Exchange Rates ═══
  const CURRENCY_TABLE = useMemo(() => ({
    USD: { symbol: '$', rate: 1, name: 'US Dollar' },
    EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
    JPY: { symbol: '¥', rate: 149.50, name: 'Japanese Yen' },
    AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
    CHF: { symbol: 'Fr', rate: 0.88, name: 'Swiss Franc' },
    AED: { symbol: 'د.إ', rate: 3.67, name: 'UAE Dirham' },
    INR: { symbol: '₹', rate: 83.20, name: 'Indian Rupee' },
  }), []);

  const updateExchangeRates = useCallback((rates, timestamp) => {
    if (rates && typeof rates === 'object') {
      setExchangeRates(rates);
      setExchangeTimestamp(timestamp || Date.now());
    }
  }, []);

  const convertCurrency = useCallback((amountInUSD) => {
    const safe = sanitizeAmount(amountInUSD);
    const rate = currency.rate || 1;
    return Math.round(safe * rate * 100) / 100;
  }, [currency]);

  const formatPrice = useCallback((amountInUSD) => {
    const converted = convertCurrency(amountInUSD);
    const symbol = currency.symbol || '$';
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: currency.code === 'JPY' ? 0 : 0,
      maximumFractionDigits: 0,
    })}`;
  }, [currency, convertCurrency]);

  // ═══ Promo Codes ═══
  const PROMO_CODES = useMemo(() => ({
    'WELCOME10': { discount: 0.10, label: '10% Welcome Discount', minNights: 1 },
    'WEEKEND20': { discount: 0.20, label: '20% Weekend Special', minNights: 2 },
    'LUXURY15': { discount: 0.15, label: '15% Luxury Discount', minNights: 3 },
    'SUMMER25': { discount: 0.25, label: '25% Summer Sale', minNights: 5 },
    'FLASH5': { discount: 0.05, label: '5% Flash Discount', minNights: 1 },
  }), []);

  const applyPromoCode = useCallback((code) => {
    const cleaned = sanitizeString(code).toUpperCase();
    if (!cleaned) {
      setToast({ type: 'error', message: 'Please enter a promo code' });
      return false;
    }
    const promo = PROMO_CODES[cleaned];
    if (!promo) {
      setToast({ type: 'error', message: 'Invalid promo code' });
      return false;
    }
    setAppliedPromo({ code: cleaned, ...promo });
    setToast({ type: 'success', message: `Promo applied: ${promo.label}` });
    return true;
  }, [PROMO_CODES]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setToast({ type: 'success', message: 'Promo code removed' });
  }, []);

  // ═══ Modify Reservation ═══
  const updateReservation = useCallback((id, updates) => {
    setReservations(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updated = { ...r };
        if (updates.checkIn) updated.checkIn = updates.checkIn;
        if (updates.checkOut) updated.checkOut = updates.checkOut;
        if (updates.guests) {
          updated.guests = Math.max(1, Math.min(10, parseInt(updates.guests, 10) || 1));
        }
        if (updates.roomTier) updated.roomTier = sanitizeString(updates.roomTier);
        if (updates.totalCost !== undefined) updated.totalCost = sanitizeAmount(updates.totalCost);
        return updated;
      })
    );
    setToast({ type: 'success', message: 'Reservation updated successfully' });
  }, []);

  // ═══ Computed Values ═══
  const totalSpent = useMemo(() => {
    return reservations.reduce((sum, r) => sum + (sanitizeAmount(r.totalCost) || 0), 0);
  }, [reservations]);

  const upcomingReservations = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(r => r.checkIn >= today);
  }, [reservations]);

  const pastReservations = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(r => r.checkOut < today);
  }, [reservations]);

  const totalSaved = useMemo(() => {
    return reservations.reduce((sum, r) => {
      const original = sanitizeAmount(r.originalPrice);
      const final = sanitizeAmount(r.totalCost);
      return sum + Math.max(0, original - final);
    }, 0);
  }, [reservations]);

  // ═══ Context Value (Memoized) ═══
  const contextValue = useMemo(() => ({
    // Auth
    user,
    isAuthenticated,
    login,
    register,
    logout,

    // Navigation
    currentView,
    navigateTo,

    // Search
    searchCity,
    setSearchCity,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    selectedVibe,
    setSelectedVibe,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    selectedAmenities,
    setSelectedAmenities,

    // Selections
    selectedProperty,
    setSelectedProperty,
    selectedDestination,
    setSelectedDestination,

    // API data
    weatherData,
    setWeatherData,
    cityCoordinates,
    setCityCoordinates,

    // Currency
    currency,
    setCurrency,
    exchangeRates,
    exchangeTimestamp,
    CURRENCY_TABLE,
    updateExchangeRates,
    convertCurrency,
    formatPrice,

    // Reservations
    reservations,
    addReservation,
    removeReservation,
    updateReservation,
    upcomingReservations,
    pastReservations,
    totalSpent,
    totalSaved,

    // Itinerary
    itinerary,
    addItineraryItem,
    updateItineraryItem,
    removeItineraryItem,

    // Wishlist
    wishlist,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,

    // Recent searches
    recentSearches,
    addRecentSearch,
    clearRecentSearches,

    // Compare
    compareList,
    toggleCompare,
    clearCompare,
    isInCompare,

    // Promo codes
    PROMO_CODES,
    appliedPromo,
    applyPromoCode,
    removePromoCode,

    // UI
    loading,
    setLoading,
    error,
    setError,
    toast,
    setToast,

    // Explore Tab
    exploreTab,
    setExploreTab,

    // Theme
    uiTheme,
    toggleTheme,

    // Flight Bookings
    flightBookings,
    addFlightBooking,
    removeFlightBooking,
    upcomingFlights,
    pastFlights,
    totalFlightSpend,

    // Request management
    cancelPreviousRequest,
    abortControllerRef,
  }), [
    user, isAuthenticated, login, register, logout,
    currentView, navigateTo,
    searchCity, checkIn, checkOut, guests, selectedVibe,
    priceRange, sortBy, selectedAmenities,
    selectedProperty, selectedDestination,
    weatherData, cityCoordinates,
    currency, exchangeRates, exchangeTimestamp, CURRENCY_TABLE,
    updateExchangeRates, convertCurrency, formatPrice,
    reservations, addReservation, removeReservation, updateReservation,
    upcomingReservations, pastReservations, totalSpent, totalSaved,
    itinerary, addItineraryItem, updateItineraryItem, removeItineraryItem,
    wishlist, toggleWishlist, removeFromWishlist, isInWishlist,
    recentSearches, addRecentSearch, clearRecentSearches,
    compareList, toggleCompare, clearCompare, isInCompare,
    PROMO_CODES, appliedPromo, applyPromoCode, removePromoCode,
    exploreTab, setExploreTab,
    loading, error, toast,
    uiTheme, toggleTheme,
    flightBookings, addFlightBooking, removeFlightBooking,
    upcomingFlights, pastFlights, totalFlightSpend,
    cancelPreviousRequest,
  ]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

// ═══ Custom Hook with Defensive Boundary Check ═══
export function useVoyage() {
  const context = useContext(AppStateContext);
  if (context === null || context === undefined) {
    throw new Error(
      'useVoyage() must be called within an <AppStateProvider>. ' +
      'Ensure your component tree is wrapped with the provider.'
    );
  }
  return context;
}
