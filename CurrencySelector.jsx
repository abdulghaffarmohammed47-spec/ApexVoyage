/* ═══════════════════════════════════════════════════════════════
   CurrencySelector — Floating Currency Picker with LocalStorage
   Updates global currency state and triggers re-render via context
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import { useVoyage } from '../context/AppStateContext';

const CurrencySelector = memo(function CurrencySelector() {
  const { currency, setCurrency, CURRENCY_TABLE } = useVoyage();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((code) => {
    const config = CURRENCY_TABLE[code];
    if (config) {
      setCurrency({ code, symbol: config.symbol, rate: config.rate, name: config.name });
      setIsOpen(false);
    }
  }, [CURRENCY_TABLE, setCurrency]);

  return (
    <div className="currency-selector" ref={wrapperRef}>
      <button
        className="currency-btn"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{currency.symbol}</span>
        <span>{currency.code}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>▾</span>
      </button>

      {isOpen && (
        <div className="currency-dropdown" role="listbox">
          {Object.entries(CURRENCY_TABLE).map(([code, config]) => (
            <div
              key={code}
              className={`currency-option ${currency.code === code ? 'selected' : ''}`}
              onClick={() => handleSelect(code)}
              role="option"
              aria-selected={currency.code === code}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, minWidth: 24 }}>{config.symbol}</span>
                <span>{code}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {config.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default CurrencySelector;
