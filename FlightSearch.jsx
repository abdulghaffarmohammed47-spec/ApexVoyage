import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { useVoyage } from '../context/AppStateContext';
import { POPULAR_ROUTES, ALL_CITIES, generateFlights, CABIN_CLASSES } from '../data/flights';
import { useDebounce } from '../hooks/useDebounce';
import { useIsMobile } from '../hooks/useMediaQuery';

const CityAutocomplete = memo(function CityAutocomplete({
  value, onChange, placeholder, label, icon,
}) {
  const [show, setShow] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 120);
  const suggestions = useMemo(() => {
    if (debouncedValue.length < 1) return [];
    const q = debouncedValue.toLowerCase();
    return ALL_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
  }, [debouncedValue]);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = useCallback((city) => {
    setLocalValue(city);
    onChange(city);
    setShow(false);
  }, [onChange]);

  const handleChange = useCallback((e) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
    setShow(true);
  }, [onChange]);

  return (
    <div ref={wrapperRef} className="flight-city-field" style={{ position: 'relative', flex: 1 }}>
      <label className="flight-field-label">{label}</label>
      <div className="flight-city-input-wrapper">
        <span className="flight-city-icon">{icon}</span>
        <input
          ref={inputRef}
          type="text"
          className="flight-city-input"
          value={localValue}
          onChange={handleChange}
          onFocus={() => { if (localValue.trim() || suggestions.length > 0) setShow(true); }}
          placeholder={placeholder}
          autoComplete="off"
          aria-haspopup="listbox"
          aria-expanded={show}
        />
      </div>
      {show && suggestions.length > 0 && (
        <div className="flight-city-dropdown" role="listbox">
          {suggestions.map(city => (
            <button
              key={city}
              className="flight-city-option"
              onClick={() => handleSelect(city)}
              role="option"
              type="button"
            >
              <span className="flight-city-option-code">{city.substring(0, 3).toUpperCase()}</span>
              <span className="flight-city-option-name">{city}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

const FlightSearch = memo(function FlightSearch({ onResults }) {
  const { formatPrice } = useVoyage();
  const isMobile = useIsMobile();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [tripType, setTripType] = useState('roundtrip');
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState({});

  const cabinInfo = useMemo(() => CABIN_CLASSES.find(c => c.id === cabinClass), [cabinClass]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const validate = useCallback(() => {
    const errs = {};
    if (!from.trim()) errs.from = 'Enter departure city';
    if (!to.trim()) errs.to = 'Enter arrival city';
    if (from.trim() && to.trim() && from.trim().toLowerCase() === to.trim().toLowerCase()) {
      errs.to = 'Cannot fly to same city';
    }
    if (!departDate) errs.departDate = 'Select departure date';
    if (tripType === 'roundtrip' && !returnDate) errs.returnDate = 'Select return date';
    if (tripType === 'roundtrip' && returnDate && departDate && returnDate < departDate) {
      errs.returnDate = 'Return must be after departure';
    }
    if (!ALL_CITIES.includes(from)) errs.from = 'Select a valid city';
    if (!ALL_CITIES.includes(to)) errs.to = 'Select a valid city';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [from, to, departDate, returnDate, tripType]);

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
    setErrors(prev => ({ ...prev, from: '', to: '' }));
  }, [from, to]);

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    if (!validate()) return;
    setIsSearching(true);
    setTimeout(() => {
      const flights = generateFlights(from, to, departDate, 9);
      onResults({
        flights,
        from,
        to,
        departDate,
        returnDate,
        passengers,
        cabinClass,
        tripType,
      });
      setIsSearching(false);
    }, 900);
  }, [validate, from, to, departDate, returnDate, passengers, cabinClass, tripType, onResults]);

  const handlePopularRoute = useCallback((route) => {
    setFrom(route.from);
    setTo(route.to);
    setErrors(prev => ({ ...prev, from: '', to: '' }));
  }, []);

  return (
    <div className="flight-search">
      {/* Trip Type Toggle */}
      <div className="flight-trip-toggle">
        <button
          type="button"
          className={`flight-trip-option ${tripType === 'oneway' ? 'active' : ''}`}
          onClick={() => setTripType('oneway')}
        >
          One way
        </button>
        <button
          type="button"
          className={`flight-trip-option ${tripType === 'roundtrip' ? 'active' : ''}`}
          onClick={() => setTripType('roundtrip')}
        >
          Round trip
        </button>
      </div>

      <form onSubmit={handleSearch} className="flight-search-form">
        <div className="flight-search-row flight-search-cities">
          <CityAutocomplete
            value={from}
            onChange={setFrom}
            placeholder="From where?"
            label="From"
            icon="📍"
          />

          <button
            type="button"
            className="flight-swap-btn"
            onClick={handleSwap}
            title="Swap cities"
            aria-label="Swap origin and destination"
          >
            ⇄
          </button>

          <CityAutocomplete
            value={to}
            onChange={setTo}
            placeholder="To where?"
            label="To"
            icon="📍"
          />
        </div>

        <div className="flight-search-row flight-search-dates">
          <div className="flight-field" style={{ flex: 1 }}>
            <label className="flight-field-label">Departure</label>
            <input
              type="date"
              className={`flight-date-input ${errors.departDate ? 'error' : ''}`}
              value={departDate}
              onChange={(e) => { setDepartDate(e.target.value); setErrors(prev => ({ ...prev, departDate: '' })); }}
              min={today}
            />
            {errors.departDate && <span className="flight-field-error">{errors.departDate}</span>}
          </div>

          <div className="flight-field" style={{ flex: 1 }}>
            <label className={`flight-field-label ${tripType === 'oneway' ? 'flight-disabled' : ''}`}>Return</label>
            <input
              type="date"
              className={`flight-date-input ${errors.returnDate ? 'error' : ''}`}
              value={returnDate}
              onChange={(e) => { setReturnDate(e.target.value); setErrors(prev => ({ ...prev, returnDate: '' })); }}
              min={departDate || today}
              disabled={tripType === 'oneway'}
              style={tripType === 'oneway' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            />
            {errors.returnDate && <span className="flight-field-error">{errors.returnDate}</span>}
          </div>
        </div>

        <div className="flight-search-row flight-search-passengers">
          <div className="flight-field" style={{ flex: 1 }}>
            <label className="flight-field-label">Passengers</label>
            <div className="flight-passenger-counter">
              <button type="button" className="flight-counter-btn" onClick={() => setPassengers(p => Math.max(1, p - 1))} disabled={passengers <= 1} aria-label="Decrease passengers">−</button>
              <div className="flight-passenger-display">
                <span className="flight-passenger-count">{passengers}</span>
                <span className="flight-passenger-label">{passengers === 1 ? 'Passenger' : 'Passengers'}</span>
              </div>
              <button type="button" className="flight-counter-btn" onClick={() => setPassengers(p => Math.min(9, p + 1))} disabled={passengers >= 9} aria-label="Increase passengers">+</button>
            </div>
          </div>

          <div className="flight-field" style={{ flex: 1 }}>
            <label className="flight-field-label">Cabin Class</label>
            <select
              className="flight-cabin-select"
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
            >
              {CABIN_CLASSES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <span className="flight-cabin-detail">{cabinInfo.baggage}</span>
          </div>
        </div>

        {(errors.from || errors.to) && (
          <div className="flight-form-error">
            {errors.from || errors.to}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg flight-search-submit"
          disabled={isSearching}
        >
          {isSearching ? (
            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Searching...</>
          ) : (
            '🔍 Search Flights'
          )}
        </button>
      </form>

      {/* Popular Routes */}
      <div className="flight-popular-routes">
        <p className="flight-popular-title">Popular Routes</p>
        <div className="flight-popular-chips">
          {POPULAR_ROUTES.map(route => (
            <button
              key={`${route.from}-${route.to}`}
              type="button"
              className="flight-popular-chip"
              onClick={() => handlePopularRoute(route)}
            >
              <span>{route.emoji}</span>
              <span>{route.from} → {route.to}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default FlightSearch;
