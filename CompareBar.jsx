/* ═══════════════════════════════════════════════════════════════
   CompareBar — Sticky Bottom Bar Showing Active Compare Items
   Provides quick access to clear/launch side-by-side comparison
   ═══════════════════════════════════════════════════════════════ */

import { memo, useCallback } from 'react';
import { useVoyage } from '../context/AppStateContext';

const CompareBar = memo(function CompareBar({ onOpenCompare }) {
  const { compareList, clearCompare, toggleCompare, formatPrice } = useVoyage();

  const handleClear = useCallback(() => {
    clearCompare();
  }, [clearCompare]);

  const handleRemove = useCallback((property) => {
    toggleCompare(property, { id: property.id, city: property._destinationCity });
  }, [toggleCompare]);

  if (compareList.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="compare-items">
        {compareList.map(item => (
          <div key={item.propertyId} className="compare-item">
            <span>🏨</span>
            <span style={{ fontWeight: 600 }}>{item.property.name}</span>
            <span style={{ color: 'var(--cyan-400)' }}>
              {formatPrice(item.property.basePrice)}/nt
            </span>
            <button
              onClick={() => handleRemove(item.property)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: 0,
                marginLeft: '0.3rem',
              }}
              aria-label="Remove from compare"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={handleClear}>
          Clear
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenCompare}
          disabled={compareList.length < 2}
        >
          Compare {compareList.length} {compareList.length === 1 ? 'Property' : 'Properties'}
        </button>
      </div>
    </div>
  );
});

export default CompareBar;
