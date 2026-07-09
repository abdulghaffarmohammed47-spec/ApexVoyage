/* ═══════════════════════════════════════════════════════════════
   PropertyDetails — Enhanced Booking View
   Features: Room tiers, date math, promo codes, reviews, currency
   ═══════════════════════════════════════════════════════════════ */

import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { useVoyage } from '../context/AppStateContext';
import InteractiveMap from '../components/InteractiveMap';
import ReviewsList from '../components/ReviewsList';
import { fetchDestinationData } from '../services/dataGateway';
import { ROOM_TIERS } from './ExploreHome';

// ─── Helper: Calculate Nights Between Dates ───
function calculateNights(checkInStr, checkOutStr) {
  if (!checkInStr || !checkOutStr) return 0;
  const checkInDate = new Date(checkInStr + 'T00:00:00');
  const checkOutDate = new Date(checkOutStr + 'T00:00:00');
  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

// ─── Helper: Safe Currency Format ───
function formatCurrency(amount) {
  const safe = typeof amount === 'number' && isFinite(amount) ? amount : 0;
  return safe.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ─── Star Renderer ───
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  let stars = '';
  for (let i = 0; i < fullStars; i++) stars += '★';
  if (hasHalf) stars += '½';
  return stars;
}

// ═══ Main PropertyDetails Component ═══
const PropertyDetails = memo(function PropertyDetails() {
  const {
    selectedProperty,
    selectedDestination,
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    guests, setGuests,
    isAuthenticated,
    navigateTo,
    addReservation,
    cancelPreviousRequest,
    weatherData, setWeatherData,
    cityCoordinates, setCityCoordinates,
    loading, setLoading,
    formatPrice,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    toggleWishlist,
    isInWishlist,
  } = useVoyage();

  const [selectedTier, setSelectedTier] = useState(ROOM_TIERS[0]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [promoInput, setPromoInput] = useState('');

  const property = selectedProperty;
  const destination = selectedDestination;

  // ─── Fetch Weather & Coordinate Data ───
  useEffect(() => {
    if (!destination) return;

    let cancelled = false;
    const signal = cancelPreviousRequest();

    setLoading(true);
    fetchDestinationData(destination.city, destination.lat, destination.lon, signal)
      .then(data => {
        if (!cancelled && data) {
          setWeatherData(data.weather);
          setCityCoordinates(data.coordinates);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [destination, cancelPreviousRequest, setWeatherData, setCityCoordinates, setLoading]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);

  // ─── Price Calculation with Promo Discount ───
  const priceBreakdown = useMemo(() => {
    if (!property) return null;
    const basePrice = property.basePrice || 0;
    const tierMultiplier = selectedTier.multiplier;
    const guestCount = Math.max(1, guests);

    const nightlyRate = Math.round(basePrice * tierMultiplier * 100) / 100;

    const guestSurcharge = guestCount > 2
      ? Math.round(nightlyRate * 0.15 * (guestCount - 2) * 100) / 100
      : 0;

    const effectiveNightly = Math.round((nightlyRate + guestSurcharge) * 100) / 100;
    const subtotal = Math.round(effectiveNightly * Math.max(nights, 0) * 100) / 100;
    const taxes = Math.round(subtotal * 0.12 * 100) / 100;

    // Apply promo discount
    let discount = 0;
    if (appliedPromo && nights >= (appliedPromo.minNights || 1)) {
      discount = Math.round(subtotal * appliedPromo.discount * 100) / 100;
    }

    const totalCost = Math.round((subtotal + taxes - discount) * 100) / 100;
    const originalCost = Math.round((subtotal + taxes) * 100) / 100;

    return {
      nightlyRate,
      guestSurcharge,
      effectiveNightly,
      nights,
      subtotal,
      taxes,
      discount,
      totalCost,
      originalCost,
    };
  }, [property, selectedTier, guests, nights, appliedPromo]);

  // ─── Promo Handler ───
  const handleApplyPromo = useCallback(() => {
    if (applyPromoCode(promoInput)) {
      setPromoInput('');
    }
  }, [applyPromoCode, promoInput]);

  // ─── Booking Handler ───
  const handleBooking = useCallback(() => {
    setBookingError('');

    if (!isAuthenticated) {
      navigateTo('auth');
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingError('Please select check-in and check-out dates');
      return;
    }

    if (nights <= 0) {
      setBookingError('Check-out must be after check-in');
      return;
    }

    if (nights > 90) {
      setBookingError('Maximum stay duration is 90 nights');
      return;
    }

    if (!priceBreakdown || priceBreakdown.totalCost <= 0) {
      setBookingError('Unable to calculate pricing. Please verify your selections.');
      return;
    }

    addReservation({
      hotelName: property.name,
      destination: destination.city,
      checkIn,
      checkOut,
      guests,
      roomTier: selectedTier.name,
      totalCost: priceBreakdown.totalCost,
      originalPrice: priceBreakdown.originalCost,
      pricePerNight: priceBreakdown.effectiveNightly,
      nights: priceBreakdown.nights,
      promoCode: appliedPromo ? appliedPromo.code : null,
    });

    setBookingSuccess(true);
    setTimeout(() => {
      navigateTo('dashboard');
    }, 2000);
  }, [isAuthenticated, checkIn, checkOut, nights, priceBreakdown, property, destination, guests, selectedTier, addReservation, navigateTo, appliedPromo]);

  // ─── Wishlist Handler ───
  const handleToggleWishlist = useCallback(() => {
    if (property && destination) {
      toggleWishlist(property, destination);
    }
  }, [property, destination, toggleWishlist]);

  // ─── Guard: No property selected ───
  if (!property || !destination) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏨</div>
          <h2 className="text-headline">No Property Selected</h2>
          <p className="text-body" style={{ margin: '1rem 0' }}>
            Please browse our properties and select one to view details.
          </p>
          <button className="btn btn-primary" onClick={() => navigateTo('explore')}>
            Explore Properties
          </button>
        </div>
      </div>
    );
  }

  const mapLat = cityCoordinates?.lat || destination.lat;
  const mapLon = cityCoordinates?.lon || destination.lon;
  const isWishlisted = isInWishlist(property.id);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Back Button */}
      <button
        className="btn btn-ghost"
        onClick={() => navigateTo('explore')}
        style={{ marginBottom: '1rem' }}
      >
        ← Back to Explore
      </button>

      {/* ═══ Hero Image ═══ */}
      <div className="detail-hero animate-fadeInUp" style={{ position: 'relative' }}>
        <img
          src={property.image}
          alt={property.name}
          onError={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #0f172a, #1e293b)';
          }}
        />
        {/* Wishlist button on hero */}
        <button
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          style={{ top: 'auto', bottom: '1rem', right: '1rem' }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>
        {property.dealBadge && (
          <div className="deal-badge" style={{ top: '1rem' }}>
            {property.dealBadge}
          </div>
        )}
        <div className="detail-hero-overlay">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-cyan">{destination.city}</span>
            <span className="badge badge-amber">
              ★ {property.rating} ({property.reviews.toLocaleString()} reviews)
            </span>
          </div>
          <h1 className="text-headline" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            {property.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            📍 {destination.city}, {destination.country}
          </p>
        </div>
      </div>

      {/* ═══ Main Content Grid ═══ */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr' }}>
        {/* Top Row: Details + Booking */}
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}>
          {/* Left: Property Info */}
          <div className="bento-glass">
            <h3 className="text-title" style={{ marginBottom: '1rem' }}>About This Property</h3>
            <p className="text-body" style={{ lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {property.description}
            </p>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Amenities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {property.amenities.map(amenity => (
                <span key={amenity} className="badge badge-violet">{amenity}</span>
              ))}
            </div>

            <div className="divider" />

            {/* Rating Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--amber-400), var(--amber-500))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#000',
              }}>
                {property.rating}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>
                  {property.rating >= 4.8 ? 'Exceptional' : property.rating >= 4.5 ? 'Wonderful' : 'Very Good'}
                </div>
                <div className="star-rating" style={{ fontSize: '1rem' }}>
                  {renderStars(property.rating)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {property.reviews.toLocaleString()} verified reviews
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="reserve-panel">
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }} className="animate-fadeIn">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h3 className="text-headline" style={{ color: 'var(--emerald-400)', marginBottom: '0.5rem' }}>
                  Booking Confirmed!
                </h3>
                <p className="text-body">
                  Your reservation at {property.name} has been secured.
                  Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                  <h3 className="text-title">💳 Reserve Your Stay</h3>
                  {property.originalPrice && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {formatPrice(property.originalPrice)}/night
                      </div>
                      <div className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                        Save {formatPrice(property.originalPrice - property.basePrice)}/nt
                      </div>
                    </div>
                  )}
                </div>

                {bookingError && (
                  <div className="error-message animate-fadeIn">
                    ⚠️ {bookingError}
                  </div>
                )}

                {/* Date Selectors */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="input-label">Check-in</label>
                    <input
                      type="date"
                      className="input-field"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={today}
                    />
                  </div>
                  <div>
                    <label className="input-label">Check-out</label>
                    <input
                      type="date"
                      className="input-field"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || today}
                    />
                  </div>
                </div>

                {/* Guest Count */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="input-label">Guests</label>
                  <select
                    className="input-field"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                {/* Room Tier Selector */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="input-label">Room Category</label>
                  <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {ROOM_TIERS.map(tier => (
                      <div
                        key={tier.id}
                        className={`room-tier-card ${selectedTier.id === tier.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTier(tier)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{tier.icon}</span>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tier.name}</span>
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--cyan-400)', fontFamily: 'var(--font-display)' }}>
                            {formatPrice(property.basePrice * tier.multiplier)}
                            <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>/night</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Section */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="input-label">🎁 Promo Code</label>
                  {appliedPromo ? (
                    <div className="applied-promo">
                      <div>
                        <span className="promo-code">{appliedPromo.code}</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {appliedPromo.label}
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={removePromoCode}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="promo-input-group">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Try: WELCOME10"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        maxLength={20}
                      />
                      <button className="btn btn-secondary btn-sm" onClick={handleApplyPromo}>
                        Apply
                      </button>
                    </div>
                  )}
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    💡 Try: <code style={{ color: 'var(--cyan-400)' }}>WELCOME10</code>,{' '}
                    <code style={{ color: 'var(--cyan-400)' }}>LUXURY15</code>,{' '}
                    <code style={{ color: 'var(--cyan-400)' }}>SUMMER25</code>
                  </p>
                </div>

                <div className="divider" />

                {/* Price Breakdown */}
                {priceBreakdown && nights > 0 && (
                  <div className="booking-summary" style={{ marginBottom: '1.25rem' }}>
                    <div className="summary-row">
                      <span className="label">
                        {formatPrice(priceBreakdown.nightlyRate)} × {nights} {nights === 1 ? 'night' : 'nights'}
                      </span>
                      <span className="value">{formatPrice(priceBreakdown.nightlyRate * nights)}</span>
                    </div>
                    {priceBreakdown.guestSurcharge > 0 && (
                      <div className="summary-row">
                        <span className="label">Guest surcharge ({guests} guests)</span>
                        <span className="value">
                          {formatPrice(priceBreakdown.guestSurcharge * nights)}
                        </span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span className="label">Taxes & fees (12%)</span>
                      <span className="value">{formatPrice(priceBreakdown.taxes)}</span>
                    </div>
                    {priceBreakdown.discount > 0 && (
                      <div className="summary-row">
                        <span className="label" style={{ color: 'var(--emerald-400)' }}>
                          Promo discount
                        </span>
                        <span className="value" style={{ color: 'var(--emerald-400)' }}>
                          -{formatPrice(priceBreakdown.discount)}
                        </span>
                      </div>
                    )}
                    {priceBreakdown.discount > 0 && (
                      <div className="summary-row" style={{ fontSize: '0.75rem' }}>
                        <span className="label" style={{ textDecoration: 'line-through' }}>
                          Was: {formatPrice(priceBreakdown.originalCost)}
                        </span>
                      </div>
                    )}
                    <div className="summary-row summary-total">
                      <span className="label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                      <span className="value">{formatPrice(priceBreakdown.totalCost)}</span>
                    </div>
                  </div>
                )}

                {nights === 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem' }}>
                    Select dates to see pricing breakdown
                  </p>
                )}

                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={handleBooking}
                  disabled={nights === 0}
                >
                  {!isAuthenticated ? '🔐 Sign In to Book' : '✨ Confirm Reservation'}
                </button>

                {!isAuthenticated && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                    You need to sign in before booking
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Map + Weather */}
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}>
          {/* Map */}
          <div className="bento-glass" style={{ padding: 0, overflow: 'hidden', minHeight: '350px' }}>
            <div style={{ padding: '1rem 1.25rem 0.75rem' }}>
              <h3 className="text-title">📍 Location</h3>
            </div>
            <div style={{ height: '300px' }}>
              <InteractiveMap
                lat={mapLat}
                lon={mapLon}
                zoom={13}
                markerLabel={property.name}
                height="300px"
              />
            </div>
          </div>

          {/* Weather */}
          <div className="bento-glass">
            <h3 className="text-title" style={{ marginBottom: '1rem' }}>🌤️ Current Weather</h3>
            {loading ? (
              <div className="flex-center" style={{ padding: '2rem' }}>
                <div className="spinner" />
              </div>
            ) : weatherData ? (
              <div className="weather-widget">
                <div className="weather-icon">{weatherData.icon}</div>
                <div className="weather-temp">{weatherData.temperature}°C</div>
                <div className="weather-desc">{weatherData.description}</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginTop: '1.5rem',
                }}>
                  <div className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wind</div>
                    <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>
                      {weatherData.windSpeed} km/h
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Humidity</div>
                    <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>
                      {weatherData.humidity != null ? `${weatherData.humidity}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Weather data unavailable</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bento-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="text-title">💬 Guest Reviews</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {property.reviews.toLocaleString()} total reviews
            </span>
          </div>
          <ReviewsList maxReviews={3} />
        </div>
      </div>
    </div>
  );
});

export default PropertyDetails;
