import { useState, useCallback, useMemo, memo } from 'react';
import { useVoyage } from '../context/AppStateContext';
import { CABIN_CLASSES, AIRPORTS } from '../data/flights';

const formatTime = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
};

const FlightCard = memo(function FlightCard({
  flight, passengers, cabinClass, onSelect, isSelected,
}) {
  const { formatPrice } = useVoyage();
  const classMultiplier = CABIN_CLASSES.find(c => c.id === cabinClass)?.multiplier || 1;
  const totalPrice = Math.round(flight.price * passengers * classMultiplier);
  const savings = flight.originalPrice ? Math.round((flight.originalPrice - flight.price) * 100 / flight.originalPrice) : 0;
  const isLowSeats = flight.seatsAvailable <= 5;

  return (
    <div className={`flight-card ${isSelected ? 'flight-card-selected' : ''}`} onClick={() => onSelect(flight)}>
      <div className="flight-card-main">
        <div className="flight-airline-col">
          <div className="flight-airline-badge" style={{ background: flight.airline.color }}>
            {flight.airline.code}
          </div>
          <div className="flight-airline-name">{flight.airline.name}</div>
          <div className="flight-number">{flight.flightNumber}</div>
          {flight.airline.alliance !== 'None' && (
            <span className="flight-alliance">{flight.airline.alliance}</span>
          )}
        </div>

        <div className="flight-route-col">
          <div className="flight-time-group">
            <div className="flight-time">{formatTime(flight.from.time)}</div>
            <div className="flight-airport">{flight.from.airport.code}</div>
          </div>

          <div className="flight-duration-group">
            <div className="flight-duration-text">{flight.duration}</div>
            <div className="flight-duration-bar">
              <span className="flight-dot" />
              <span className="flight-line" />
              {flight.stops > 0 && (
                <>
                  <span className="flight-dot flight-dot-stop" title={`Stop at ${flight.stopover?.city || ''}`} />
                  <span className="flight-line flight-line-dashed" />
                </>
              )}
              <span className="flight-dot" />
            </div>
            {flight.stops === 0 ? (
              <div className="flight-stops-text">Direct · {flight.distance.toLocaleString()} km</div>
            ) : (
              <div className="flight-stops-text flight-stops-layover">
                1 stop · {flight.stopover?.city || 'Hub'}
              </div>
            )}
          </div>

          <div className="flight-time-group" style={{ textAlign: 'right' }}>
            <div className="flight-time">{formatTime(flight.to.time)}</div>
            <div className="flight-airport">{flight.to.airport.code}</div>
            {flight.to.date !== flight.from.date && (
              <div className="flight-next-day">+1 day</div>
            )}
          </div>
        </div>

        <div className="flight-price-col">
          {savings > 0 && (
            <div className="flight-savings-badge">Save {savings}%</div>
          )}
          <div className="flight-price">{formatPrice(totalPrice)}</div>
          <div className="flight-price-detail">
            {formatPrice(Math.round(flight.price * classMultiplier))} × {passengers} {passengers === 1 ? 'passenger' : 'passengers'}
          </div>
          <div className={`flight-seats ${isLowSeats ? 'flight-seats-low' : ''}`}>
            {isLowSeats ? `Only ${flight.seatsAvailable} seats left` : `${flight.seatsAvailable} seats left`}
          </div>
          {flight.refundable && (
            <div className="flight-refundable">✓ Refundable</div>
          )}
        </div>

        <div className="flight-amenities-col">
          <div className="flight-cabin-badge">{CABIN_CLASSES.find(c => c.id === cabinClass)?.icon || '💺'}</div>
          <div className="flight-cabin-name">{CABIN_CLASSES.find(c => c.id === cabinClass)?.name}</div>
          <div className="flight-amenities-list">
            {flight.amenities.slice(0, 3).map(a => (
              <span key={a} className="flight-amenity-tag">{a}</span>
            ))}
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="flight-card-selected-indicator">
          <span>✓ Selected</span>
          <span>Click elsewhere to deselect</span>
        </div>
      )}
    </div>
  );
});

const SORT_MODES = [
  { id: 'best', label: 'Best' },
  { id: 'price', label: 'Cheapest' },
  { id: 'duration', label: 'Fastest' },
  { id: 'departure', label: 'Departure' },
];

const FlightResults = memo(function FlightResults({
  flights, from, to, departDate, passengers, cabinClass, onBook, onBack,
}) {
  const { formatPrice } = useVoyage();
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [sortMode, setSortMode] = useState('best');
  const [filterStops, setFilterStops] = useState('all');

  const classMultiplier = useMemo(() => CABIN_CLASSES.find(c => c.id === cabinClass)?.multiplier || 1, [cabinClass]);

  const sortedFlights = useMemo(() => {
    let result = [...flights];
    if (filterStops !== 'all') {
      result = result.filter(f => String(f.stops) === filterStops);
    }

    switch (sortMode) {
      case 'price':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'duration':
        result.sort((a, b) => a.durationMinutes - b.durationMinutes);
        break;
      case 'departure':
        result.sort((a, b) => a.from.timestamp - b.from.timestamp);
        break;
      case 'best':
      default:
        result.sort((a, b) => {
          const scoreA = a.price * 0.5 + a.durationMinutes * 0.35 + (a.stops * 200) * 0.15;
          const scoreB = b.price * 0.5 + b.durationMinutes * 0.35 + (b.stops * 200) * 0.15;
          return scoreA - scoreB;
        });
    }
    return result;
  }, [flights, sortMode, filterStops]);

  const cheapest = useMemo(() => {
    return Math.round(Math.min(...flights.map(f => f.price)) * passengers * classMultiplier);
  }, [flights, passengers, classMultiplier]);

  const fastest = useMemo(() => Math.min(...flights.map(f => f.durationMinutes)), [flights]);

  const handleSelect = useCallback((flight) => {
    setSelectedFlight(prev => prev?.id === flight.id ? null : flight);
  }, []);

  const handleBook = useCallback(() => {
    if (selectedFlight) {
      onBook(selectedFlight, from, to, departDate, passengers, cabinClass);
    }
  }, [selectedFlight, onBook, from, to, departDate, passengers, cabinClass]);

  return (
    <div className="flight-results">
      {/* Header */}
      <div className="flight-results-header">
        <div className="flight-results-route">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <div>
            <h3 className="flight-results-title">
              {from} <span>✈</span> {to}
            </h3>
            <p className="flight-results-meta">
              {departDate || 'Any date'} · {sortedFlights.length} flights · From {formatPrice(cheapest)}
            </p>
          </div>
        </div>
        {selectedFlight && (
          <button className="btn btn-primary flight-book-btn" onClick={handleBook}>
            ✨ Book Flight
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flight-results-filters">
        <div className="flight-sort-tabs">
          {SORT_MODES.map(mode => (
            <button
              key={mode.id}
              type="button"
              className={`flight-sort-tab ${sortMode === mode.id ? 'active' : ''}`}
              onClick={() => setSortMode(mode.id)}
            >
              {mode.label}
              {mode.id === 'price' && <span className="flight-sort-hint">from {formatPrice(cheapest)}</span>}
              {mode.id === 'duration' && <span className="flight-sort-hint">{Math.floor(fastest / 60)}h {fastest % 60}m</span>}
            </button>
          ))}
        </div>

        <div className="flight-stops-filter">
          <button className={`flight-stops-btn ${filterStops === 'all' ? 'active' : ''}`} onClick={() => setFilterStops('all')}>All</button>
          <button className={`flight-stops-btn ${filterStops === '0' ? 'active' : ''}`} onClick={() => setFilterStops('0')}>Direct</button>
          <button className={`flight-stops-btn ${filterStops === '1' ? 'active' : ''}`} onClick={() => setFilterStops('1')}>1 Stop</button>
        </div>
      </div>

      {/* List */}
      <div className="flight-results-list">
        {sortedFlights.map((flight, index) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            passengers={passengers}
            cabinClass={cabinClass}
            onSelect={handleSelect}
            isSelected={selectedFlight?.id === flight.id}
          />
        ))}
        {sortedFlights.length === 0 && (
          <div className="empty-state glass-panel" style={{ padding: '2.5rem' }}>
            <div className="icon">✈️</div>
            <h4>No flights match your filters</h4>
            <p>Try changing your stopover or sorting preference</p>
            <button className="btn btn-secondary" onClick={() => { setFilterStops('all'); setSortMode('best'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default FlightResults;
