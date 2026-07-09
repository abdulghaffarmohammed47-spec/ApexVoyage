/* ═══════════════════════════════════════════════════════════════
   ThemeToggle — Modern/Classic UI Mode Switch Button
   Animated pill toggle with sun/moon icon indicators
   ═══════════════════════════════════════════════════════════════ */

import { memo, useCallback } from 'react';
import { useVoyage } from '../context/AppStateContext';

const ThemeToggle = memo(function ThemeToggle() {
  const { uiTheme, toggleTheme } = useVoyage();
  const isModern = uiTheme === 'modern';

  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <button
      className="theme-toggle-btn"
      onClick={handleToggle}
      aria-label={`Switch to ${isModern ? 'Classic' : 'Modern'} theme`}
      title={isModern ? 'Switch to Classic Theme' : 'Switch to Modern Theme'}
    >
      {/* Track background */}
      <div className="theme-toggle-track">
        <div className={`theme-toggle-thumb ${isModern ? 'thumb-left' : 'thumb-right'}`}>
          <span className="theme-toggle-icon">
            {isModern ? '🌙' : '☀️'}
          </span>
        </div>
      </div>
      {/* Labels */}
      <span className="theme-toggle-label">
        {isModern ? 'Dark' : 'Light'}
      </span>
    </button>
  );
});

export default ThemeToggle;
