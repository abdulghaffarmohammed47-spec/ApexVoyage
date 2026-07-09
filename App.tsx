/* ═══════════════════════════════════════════════════════════════
   ApexVoyage: Premium Reserve — Master Application Shell
   Client-side view router, layout wrapper, toast notifications
   ═══════════════════════════════════════════════════════════════ */

// @ts-nocheck
import { useCallback, useMemo, useState } from 'react';
import { AppStateProvider, useVoyage } from './context/AppStateContext';
import Navbar from './components/Navbar';
import BrandLanding from './views/BrandLanding';
import ExploreHome from './views/ExploreHome';
import AuthPortal from './views/AuthPortal';
import PropertyDetails from './views/PropertyDetails';
import TravelerDashboard from './views/TravelerDashboard';
import CompareBar from './components/CompareBar';
import CompareModal from './components/CompareModal';
import ErrorBoundary from './components/ErrorBoundary';

/* ─── Toast Notification Component ─── */
function ToastNotification() {
  const { toast, setToast } = useVoyage();

  if (!toast) return null;

  return (
    <div
      className={`toast toast-${toast.type || 'success'}`}
      onClick={() => setToast(null)}
      role="alert"
    >
      <span style={{ fontSize: '1.2rem' }}>
        {toast.type === 'error' ? '⚠️' : '✅'}
      </span>
      <span style={{ fontSize: '0.85rem', flex: 1 }}>
        {toast.message}
      </span>
      <button
        className="btn btn-ghost btn-icon"
        onClick={(e) => { e.stopPropagation(); setToast(null); }}
        style={{ fontSize: '0.7rem', width: 24, height: 24, opacity: 0.6 }}
      >
        ✕
      </button>
    </div>
  );
}

/* ─── View Router Component ─── */
function ViewRouter() {
  const { currentView, isAuthenticated } = useVoyage();

  const viewComponent = useMemo(() => {
    switch (currentView) {
      case 'landing':
        return <BrandLanding />;
      case 'explore':
        return isAuthenticated ? <ExploreHome /> : <BrandLanding />;
      case 'auth':
        return <AuthPortal />;
      case 'property':
        return isAuthenticated ? <PropertyDetails /> : <BrandLanding />;
      case 'dashboard':
        return isAuthenticated ? <TravelerDashboard /> : <BrandLanding />;
      default:
        return <BrandLanding />;
    }
  }, [currentView, isAuthenticated]);

  return (
    <main style={{ flex: 1 }}>
      {viewComponent}
    </main>
  );
}

/* ─── Footer Component ─── */
function Footer() {
  const { navigateTo } = useVoyage();

  const handleNavigate = useCallback((view: string) => {
    navigateTo(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigateTo]);

  return (
    <footer style={{
      borderTop: '1px solid var(--glass-border)',
      padding: '2.5rem 1.5rem',
      background: 'rgba(2, 6, 23, 0.8)',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.2rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              ✈️ <span className="text-gradient">ApexVoyage</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Premium travel concierge platform. Discover, book, and plan your extraordinary journeys.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Navigate
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button className="btn btn-ghost" onClick={() => handleNavigate('explore')} style={{ justifyContent: 'flex-start', padding: '0.3rem 0' }}>
                Explore
              </button>
              <button className="btn btn-ghost" onClick={() => handleNavigate('dashboard')} style={{ justifyContent: 'flex-start', padding: '0.3rem 0' }}>
                Dashboard
              </button>
              <button className="btn btn-ghost" onClick={() => handleNavigate('auth')} style={{ justifyContent: 'flex-start', padding: '0.3rem 0' }}>
                Account
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Features
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>🔍 Smart Autocomplete Search</span>
              <span>❤️ Wishlist & Compare</span>
              <span>🎁 Promo Code Discounts</span>
              <span>💱 Multi-Currency Support</span>
              <span>📋 Itinerary Planning</span>
              <span>📊 Spending Analytics</span>
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: '1rem 0' }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © 2025 ApexVoyage Premium Reserve. Built with React, Recharts & Leaflet.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-cyan">React 19</span>
            <span className="badge badge-violet">Recharts</span>
            <span className="badge badge-emerald">Leaflet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Compare Bar & Modal Controller ─── */
function CompareController() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { compareList } = useVoyage();

  const handleOpenCompare = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseCompare = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      {compareList.length > 0 && (
        <CompareBar onOpenCompare={handleOpenCompare} />
      )}
      <CompareModal isOpen={isModalOpen} onClose={handleCloseCompare} />
    </>
  );
}

/* ─── Application Shell ─── */
function AppShell() {
  const { currentView } = useVoyage();
  const isLanding = currentView === 'landing';

  return (
    <>
      <div className={`ambient-orbs ${isLanding ? 'ambient-orbs-landing' : ''}`} />
      {!isLanding && <Navbar />}
      <ViewRouter />
      {!isLanding && <Footer />}
      <ToastNotification />
      <CompareController />
    </>
  );
}

/* ═══ Root App Component ═══ */
export default function App() {
  return (
    <AppStateProvider>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </AppStateProvider>
  );
}
