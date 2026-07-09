/* ═══════════════════════════════════════════════════════════════
   Navbar — Global Header with Auth State, Profile, Wishlist & Tabs
   ═══════════════════════════════════════════════════════════════ */

import { memo, useCallback } from 'react';
import { useVoyage } from '../context/AppStateContext';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';

const Navbar = memo(function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
    currentView,
    navigateTo,
    wishlist,
  } = useVoyage();

  const handleBrandClick = useCallback(() => {
    navigateTo('explore');
  }, [navigateTo]);

  const handleDashboard = useCallback(() => {
    navigateTo('dashboard');
  }, [navigateTo]);

  const handleAuth = useCallback(() => {
    navigateTo('auth');
  }, [navigateTo]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={handleBrandClick} role="button" tabIndex={0}>
          <span style={{ fontSize: '1.5rem' }}>✈️</span>
          <div>
            Apex<span>Voyage</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="navbar-actions hide-mobile">
          <button
            className={`btn btn-ghost ${currentView === 'explore' ? 'active-nav' : ''}`}
            onClick={handleBrandClick}
            style={currentView === 'explore' ? { color: 'var(--cyan-400)' } : {}}
          >
            🔍 Explore
          </button>
          {isAuthenticated && (
            <>
              <button
                className={`btn btn-ghost ${currentView === 'dashboard' ? 'active-nav' : ''}`}
                onClick={handleDashboard}
                style={currentView === 'dashboard' ? { color: 'var(--cyan-400)' } : {}}
              >
                📊 Dashboard
              </button>
              {currentView === 'dashboard' && (
                <span
                  className="btn btn-ghost"
                  style={{ color: 'var(--rose-400)', cursor: 'default' }}
                  title="Saved Properties"
                >
                  ❤️ {wishlist.length}
                </span>
              )}
            </>
          )}
        </div>

        {/* Right Side: Theme + Currency + Auth Actions */}
        <div className="navbar-actions">
          <ThemeToggle />
          <CurrencySelector />
          {isAuthenticated ? (
            <>
              <div
                className="btn btn-ghost"
                onClick={handleDashboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--cyan-500), var(--violet-500))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hide-mobile" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {user?.name || 'User'}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={handleAuth}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
