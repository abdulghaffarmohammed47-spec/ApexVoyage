/* ═══════════════════════════════════════════════════════════════
   TravelerDashboard — Enhanced User Workspace
   Features: Reservations CRUD with modify, Wishlist, Itinerary, Analytics
   ═══════════════════════════════════════════════════════════════ */

import { useState, useCallback, useMemo, memo } from 'react';
import { useVoyage } from '../context/AppStateContext';
import SpendAnalytics from '../components/SpendAnalytics';

const ITINERARY_CATEGORIES = [
  { id: 'activity', label: '🎯 Activity', color: 'var(--cyan-400)' },
  { id: 'dining', label: '🍽️ Dining', color: 'var(--amber-400)' },
  { id: 'transport', label: '🚗 Transport', color: 'var(--violet-400)' },
  { id: 'sightseeing', label: '📸 Sightseeing', color: 'var(--emerald-400)' },
  { id: 'relaxation', label: '🧘 Relaxation', color: 'var(--rose-400)' },
  { id: 'shopping', label: '🛍️ Shopping', color: 'var(--sky-400)' },
];

const categoryIcons = {
  activity: '🎯',
  dining: '🍽️',
  transport: '🚗',
  sightseeing: '📸',
  relaxation: '🧘',
  shopping: '🛍️',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ═══ Reservation Card with Modify Capability ═══
const ReservationCard = memo(function ReservationCard({ reservation, onCancel, onModify, formatPrice }) {
  const [isModifying, setIsModifying] = useState(false);
  const [editCheckIn, setEditCheckIn] = useState(reservation.checkIn);
  const [editCheckOut, setEditCheckOut] = useState(reservation.checkOut);
  const [editGuests, setEditGuests] = useState(reservation.guests);

  const handleCancel = useCallback(() => {
    if (window.confirm(`Cancel your reservation at ${reservation.hotelName}?`)) {
      onCancel(reservation.id);
    }
  }, [reservation, onCancel]);

  const handleSave = useCallback(() => {
    if (new Date(editCheckOut) <= new Date(editCheckIn)) {
      alert('Check-out must be after check-in');
      return;
    }
    onModify(reservation.id, {
      checkIn: editCheckIn,
      checkOut: editCheckOut,
      guests: editGuests,
    });
    setIsModifying(false);
  }, [reservation.id, editCheckIn, editCheckOut, editGuests, onModify]);

  if (isModifying) {
    return (
      <div className="reservation-card animate-fadeIn" style={{ borderLeft: '3px solid var(--amber-400)' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--amber-500), var(--rose-500))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0,
        }}>
          ✏️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="reservation-hotel">{reservation.hotelName}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="date"
              className="input-field"
              value={editCheckIn}
              onChange={(e) => setEditCheckIn(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.4rem' }}
            />
            <input
              type="date"
              className="input-field"
              value={editCheckOut}
              onChange={(e) => setEditCheckOut(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.4rem' }}
            />
          </div>
          <select
            className="input-field"
            value={editGuests}
            onChange={(e) => setEditGuests(parseInt(e.target.value, 10))}
            style={{ fontSize: '0.8rem', padding: '0.4rem', marginTop: '0.5rem' }}
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setIsModifying(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  const savings = reservation.originalPrice && reservation.originalPrice > reservation.totalCost
    ? reservation.originalPrice - reservation.totalCost
    : 0;

  return (
    <div className="reservation-card animate-fadeIn">
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, var(--cyan-500), var(--sky-500))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        flexShrink: 0,
      }}>
        🏨
      </div>
      <div className="reservation-info">
        <div className="reservation-hotel">{reservation.hotelName}</div>
        <div className="reservation-dates">
          📍 {reservation.destination} · {formatDate(reservation.checkIn)} → {formatDate(reservation.checkOut)}
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>
            {reservation.roomTier}
          </span>
          <span className="badge badge-violet" style={{ fontSize: '0.6rem' }}>
            {reservation.nights} {reservation.nights === 1 ? 'night' : 'nights'}
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '0.6rem' }}>
            {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
          </span>
          {reservation.promoCode && (
            <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}>
              {reservation.promoCode}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
        <div className="reservation-cost">{formatPrice(reservation.totalCost)}</div>
        {savings > 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--emerald-400)' }}>
            Saved {formatPrice(savings)}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsModifying(true)}
            style={{ fontSize: '0.7rem' }}
          >
            Modify
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleCancel} style={{ fontSize: '0.7rem' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});

// ═══ Wishlist Card ═══
const WishlistCard = memo(function WishlistCard({ item, onRemove, onSelect, formatPrice }) {
  const handleSelect = useCallback(() => {
    onSelect(item.property, item.destination);
  }, [item, onSelect]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onRemove(item.propertyId);
  }, [item.propertyId, onRemove]);

  return (
    <div className="glass-panel animate-fadeInUp" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={handleSelect}>
      <div style={{ position: 'relative' }}>
        <img
          src={item.property.image}
          alt={item.property.name}
          style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="160" viewBox="0 0 400 160"><rect fill="#0f172a" width="400" height="160"/><text fill="#475569" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dy=".3em">🏨</text></svg>'
            );
          }}
        />
        <button
          className="wishlist-btn active"
          onClick={handleRemove}
          aria-label="Remove from wishlist"
          style={{ top: '0.5rem', right: '0.5rem', width: 32, height: 32 }}
        >
          ❤️
        </button>
      </div>
      <div style={{ padding: '1rem' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
          {item.property.name}
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          📍 {item.destination.city}, {item.destination.country}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="star-rating" style={{ fontSize: '0.8rem' }}>★ {item.property.rating}</span>
          <span style={{ fontWeight: 700, color: 'var(--cyan-400)', fontSize: '0.9rem' }}>
            {formatPrice(item.property.basePrice)}<small style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/nt</small>
          </span>
        </div>
      </div>
    </div>
  );
});

// ═══ Itinerary Item Card ═══
const ItineraryItemCard = memo(function ItineraryItemCard({ item, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDesc, setEditDesc] = useState(item.description || '');
  const [editTime, setEditTime] = useState(item.time || '09:00');

  const handleSave = useCallback(() => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;
    onEdit(item.id, {
      title: trimmedTitle,
      description: editDesc.trim(),
      time: editTime,
    });
    setIsEditing(false);
  }, [item.id, editTitle, editDesc, editTime, onEdit]);

  const handleCancel = useCallback(() => {
    setEditTitle(item.title);
    setEditDesc(item.description || '');
    setEditTime(item.time || '09:00');
    setIsEditing(false);
  }, [item]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  if (isEditing) {
    return (
      <div className="itinerary-item animate-fadeIn" style={{ borderLeftColor: 'var(--amber-400)' }}>
        <div style={{ flex: 1 }}>
          <input
            type="time"
            className="input-field"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            style={{ marginBottom: '0.5rem', maxWidth: '140px' }}
          />
          <input
            type="text"
            className="input-field"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Activity title"
            style={{ marginBottom: '0.5rem' }}
            maxLength={80}
          />
          <textarea
            className="input-field"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            maxLength={200}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="itinerary-item">
      <div className="itinerary-time">{item.time || '—'}</div>
      <div className="itinerary-content">
        <div className="itinerary-title">
          <span style={{ marginRight: '0.3rem' }}>
            {categoryIcons[item.category] || '📌'}
          </span>
          {item.title}
        </div>
        {item.description && (
          <div className="itinerary-desc">{item.description}</div>
        )}
        <div style={{ marginTop: '0.3rem' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>
            {item.date ? formatDate(item.date) : 'No date'}
          </span>
        </div>
      </div>
      <div className="itinerary-actions">
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setIsEditing(true)}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="btn btn-ghost btn-icon"
          onClick={handleDelete}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
});

// ═══ Flight Dashboard Card ═══
const FlightDashboardCard = memo(function FlightDashboardCard({ flight, onCancel, formatPrice }) {
  const handleCancel = useCallback(() => {
    if (window.confirm(`Cancel your ${flight.airline} flight ${flight.flightNumber}?`)) {
      onCancel(flight.id);
    }
  }, [flight, onCancel]);

  const formatFlightTime = (time) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  };

  return (
    <div className="reservation-card animate-fadeIn">
      <div style={{
        width: 48, height: 48,
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(135deg, var(--cyan-500), var(--sky-500))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 900, color: '#fff', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
      }}>
        {flight.airlineCode || '✈️'}
      </div>
      <div className="reservation-info">
        <div className="reservation-hotel">
          {flight.from} ✈ {flight.to}
        </div>
        <div className="reservation-dates">
          {flight.airline} · {flight.flightNumber} · {flight.duration}
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.6rem' }}>
            {formatFlightTime(flight.departureTime)} → {formatFlightTime(flight.arrivalTime)}
          </span>
          <span className="badge badge-violet" style={{ fontSize: '0.6rem' }}>
            {flight.departureDate}
          </span>
          <span className="badge badge-emerald" style={{ fontSize: '0.6rem' }}>
            {flight.cabinClass || 'Economy'}
          </span>
          {flight.stops === 0 ? (
            <span className="badge badge-emerald" style={{ fontSize: '0.6rem' }}>Direct</span>
          ) : (
            <span className="badge badge-amber" style={{ fontSize: '0.6rem' }}>{flight.stops} stop</span>
          )}
          {flight.refundable && (
            <span className="badge badge-emerald" style={{ fontSize: '0.6rem' }}>Refundable</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
        <div className="reservation-cost">{formatPrice(flight.totalCost)}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {flight.passengers} {flight.passengers === 1 ? 'passenger' : 'passengers'}
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
});

// ═══ Main TravelerDashboard Component ═══
const TravelerDashboard = memo(function TravelerDashboard() {
  const {
    user,
    reservations,
    removeReservation,
    updateReservation,
    upcomingReservations,
    pastReservations,
    totalSpent,
    totalSaved,
    itinerary,
    addItineraryItem,
    updateItineraryItem,
    removeItineraryItem,
    navigateTo,
    wishlist,
    removeFromWishlist,
    setSelectedProperty,
    setSelectedDestination,
    recentSearches,
    clearRecentSearches,
    formatPrice,
    flightBookings,
    removeFlightBooking,
    upcomingFlights,
    pastFlights,
    totalFlightSpend,
  } = useVoyage();

  const [activeTab, setActiveTab] = useState('reservations');

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    category: 'activity',
  });
  const [formErrors, setFormErrors] = useState({});

  const validateItineraryForm = useCallback(() => {
    const errors = {};
    const trimmedTitle = (newItem.title || '').trim();

    if (!trimmedTitle) {
      errors.title = 'Activity title is required';
    } else if (trimmedTitle.length < 2) {
      errors.title = 'Title must be at least 2 characters';
    } else if (/^\s+$/.test(newItem.title)) {
      errors.title = 'Title cannot be only whitespace';
    }

    if (!newItem.date) {
      errors.date = 'Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [newItem]);

  const handleAddItem = useCallback((e) => {
    e.preventDefault();
    if (!validateItineraryForm()) return;

    addItineraryItem({
      title: newItem.title.trim(),
      description: (newItem.description || '').trim(),
      date: newItem.date,
      time: newItem.time || '09:00',
      category: newItem.category || 'activity',
    });

    setNewItem({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      category: 'activity',
    });
    setFormErrors({});
  }, [validateItineraryForm, addItineraryItem, newItem]);

  const updateField = useCallback((field, value) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const avgPerNight = useMemo(() => {
    if (reservations.length === 0) return 0;
    const totalNights = reservations.reduce((s, r) => s + (r.nights || 0), 0);
    return totalNights > 0 ? Math.round(totalSpent / totalNights) : 0;
  }, [reservations, totalSpent]);

  const sortedItinerary = useMemo(() => {
    return [...itinerary].sort((a, b) => {
      const dateComp = (a.date || '').localeCompare(b.date || '');
      if (dateComp !== 0) return dateComp;
      return (a.time || '').localeCompare(b.time || '');
    });
  }, [itinerary]);

  const handleWishlistSelect = useCallback((property, destination) => {
    setSelectedProperty(property);
    setSelectedDestination(destination);
    navigateTo('property', { property, destination });
  }, [setSelectedProperty, setSelectedDestination, navigateTo]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Dashboard Header */}
      <div className="dashboard-header animate-fadeInUp">
        <p className="text-caption" style={{ color: 'var(--cyan-400)', marginBottom: '0.3rem' }}>
          Traveler Workspace
        </p>
        <h1 className="text-headline">
          Welcome, {user?.name || 'Traveler'} 👋
        </h1>
        <p className="text-body">
          Manage your reservations, wishlist, itineraries, and track your travel spending.
        </p>
      </div>

      {/* Stats Row */}
      <div className="dashboard-stats animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
        <div className="bento-glass stat-card">
          <div className="stat-value" style={{ color: 'var(--cyan-400)' }}>
            {reservations.length}
          </div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="bento-glass stat-card">
          <div className="stat-value" style={{ color: 'var(--emerald-400)' }}>
            {upcomingReservations.length}
          </div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="bento-glass stat-card">
          <div className="stat-value" style={{ color: 'var(--violet-400)' }}>
            ❤️ {wishlist.length}
          </div>
          <div className="stat-label">Wishlist</div>
        </div>
        <div className="bento-glass stat-card">
          <div className="stat-value" style={{ color: 'var(--amber-400)' }}>
            {formatPrice(totalSpent)}
          </div>
          <div className="stat-label">Total Spent</div>
        </div>
        <div className="bento-glass stat-card">
          <div className="stat-value" style={{ color: 'var(--rose-400)' }}>
            {formatPrice(totalSaved)}
          </div>
          <div className="stat-label">Saved</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        <button
          className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          🏨 Reservations
        </button>
        <button
          className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          ❤️ Wishlist
        </button>
        <button
          className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          📋 Itinerary
        </button>
        <button
          className={`tab-btn ${activeTab === 'flights' ? 'active' : ''}`}
          onClick={() => setActiveTab('flights')}
        >
          ✈️ Flights ({flightBookings.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn" key={activeTab}>
        {/* ─── Reservations Tab ─── */}
        {activeTab === 'reservations' && (
          <div>
            <div className="bento-glass" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="text-title">🏨 Upcoming Trips ({upcomingReservations.length})</h3>
                <button className="btn btn-primary btn-sm" onClick={() => navigateTo('explore')}>
                  + New Booking
                </button>
              </div>
              {upcomingReservations.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">✈️</div>
                  <h4 style={{ marginBottom: '0.5rem' }}>No upcoming trips</h4>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Start exploring destinations and book your next adventure!
                  </p>
                  <button className="btn btn-primary" onClick={() => navigateTo('explore')}>
                    Explore Destinations
                  </button>
                </div>
              ) : (
                <div>
                  {upcomingReservations.map(reservation => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onCancel={removeReservation}
                      onModify={updateReservation}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Past Reservations */}
            {pastReservations.length > 0 && (
              <div className="bento-glass">
                <h3 className="text-title" style={{ marginBottom: '1.25rem' }}>
                  📜 Past Stays ({pastReservations.length})
                </h3>
                <div>
                  {pastReservations.map(reservation => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onCancel={removeReservation}
                      onModify={updateReservation}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Wishlist Tab ─── */}
        {activeTab === 'wishlist' && (
          <div className="bento-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="text-title">❤️ Saved Properties ({wishlist.length})</h3>
              {wishlist.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => navigateTo('explore')}>
                  + Discover More
                </button>
              )}
            </div>

            {wishlist.length === 0 ? (
              <div className="empty-state">
                <div className="icon">💝</div>
                <h4 style={{ marginBottom: '0.5rem' }}>Your wishlist is empty</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Save properties you love to easily find them later
                </p>
                <button className="btn btn-primary" onClick={() => navigateTo('explore')}>
                  Browse Properties
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              }}>
                {wishlist.map(item => (
                  <WishlistCard
                    key={item.propertyId}
                    item={item}
                    onRemove={removeFromWishlist}
                    onSelect={handleWishlistSelect}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Itinerary Tab ─── */}
        {activeTab === 'itinerary' && (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            <div className="reserve-panel">
              <h3 className="text-title" style={{ marginBottom: '1.25rem' }}>
                ✏️ Add Activity
              </h3>
              <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Activity Title *</label>
                  <input
                    type="text"
                    className={`input-field ${formErrors.title ? 'error' : ''}`}
                    placeholder="e.g., Visit the Louvre Museum"
                    value={newItem.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    maxLength={80}
                  />
                  {formErrors.title && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--state-error)', display: 'block', marginTop: '0.2rem' }}>
                      {formErrors.title}
                    </span>
                  )}
                </div>

                <div>
                  <label className="input-label">Description</label>
                  <textarea
                    className="input-field"
                    placeholder="Additional notes or details..."
                    value={newItem.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={2}
                    maxLength={200}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="input-label">Date *</label>
                    <input
                      type="date"
                      className={`input-field ${formErrors.date ? 'error' : ''}`}
                      value={newItem.date}
                      onChange={(e) => updateField('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="input-label">Time</label>
                    <input
                      type="time"
                      className="input-field"
                      value={newItem.time}
                      onChange={(e) => updateField('time', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Category</label>
                  <select
                    className="input-field"
                    value={newItem.category}
                    onChange={(e) => updateField('category', e.target.value)}
                  >
                    {ITINERARY_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  + Add to Itinerary
                </button>
              </form>
            </div>

            <div className="bento-glass">
              <h3 className="text-title" style={{ marginBottom: '1rem' }}>
                📋 Your Itinerary ({itinerary.length})
              </h3>

              {sortedItinerary.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📋</div>
                  <h4 style={{ marginBottom: '0.3rem' }}>No activities planned</h4>
                  <p style={{ fontSize: '0.85rem' }}>
                    Use the form to add your daily travel plans
                  </p>
                </div>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {sortedItinerary.map(item => (
                    <ItineraryItemCard
                      key={item.id}
                      item={item}
                      onEdit={updateItineraryItem}
                      onDelete={removeItineraryItem}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Flights Tab ─── */}
        {activeTab === 'flights' && (
          <div className="bento-glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="text-title">✈️ Flight Bookings ({flightBookings.length})</h3>
              <button className="btn btn-primary btn-sm" onClick={() => navigateTo('explore')}>
                ✈️ Book New Flight
              </button>
            </div>

            {flightBookings.length === 0 ? (
              <div className="empty-state">
                <div className="icon">✈️</div>
                <h4 style={{ marginBottom: '0.5rem' }}>No flight bookings yet</h4>
                <p style={{ fontSize: '0.85rem' }}>
                  Book your first flight to start tracking your air travel
                </p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigateTo('explore')}>
                  ✈️ Search Flights
                </button>
              </div>
            ) : (
              <div>
                {/* Upcoming Flights */}
                {upcomingFlights.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      📅 Upcoming Flights ({upcomingFlights.length})
                    </h4>
                    {upcomingFlights.map(flight => (
                      <FlightDashboardCard
                        key={flight.id}
                        flight={flight}
                        onCancel={removeFlightBooking}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>
                )}

                {/* Past Flights */}
                {pastFlights.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      📜 Past Flights ({pastFlights.length})
                    </h4>
                    {pastFlights.map(flight => (
                      <FlightDashboardCard
                        key={flight.id}
                        flight={flight}
                        onCancel={removeFlightBooking}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Analytics Tab ─── */}
        {activeTab === 'analytics' && (
          <div className="bento-glass">
            <SpendAnalytics reservations={reservations} />
          </div>
        )}
      </div>
    </div>
  );
});

export default TravelerDashboard;
