/* ═══════════════════════════════════════════════════════════════
   CompareModal — Side-by-Side Property Comparison Matrix
   Renders as a modal overlay with multi-column comparison data
   ═══════════════════════════════════════════════════════════════ */

import { memo, useCallback } from 'react';
import { useVoyage } from '../context/AppStateContext';

const CompareModal = memo(function CompareModal({ isOpen, onClose }) {
  const { compareList, toggleCompare, formatPrice } = useVoyage();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleRemove = useCallback((property) => {
    const destination = compareList.find(c => c.propertyId === property.id)?.destination;
    if (destination) {
      toggleCompare(property, destination);
    }
  }, [compareList, toggleCompare]);

  if (!isOpen) return null;

  // Build compare rows
  const rows = [
    {
      label: 'Property',
      getValue: (item) => item.property.name,
    },
    {
      label: 'Location',
      getValue: (item) => `${item.destination.city}, ${item.destination.country}`,
    },
    {
      label: 'Rating',
      getValue: (item) => `★ ${item.property.rating} (${item.property.reviews.toLocaleString()})`,
    },
    {
      label: 'Base Price/Night',
      getValue: (item) => formatPrice(item.property.basePrice),
    },
    {
      label: 'Amenities',
      getValue: (item) => item.property.amenities.join(', '),
    },
    {
      label: 'Description',
      getValue: (item) => item.property.description,
    },
  ];

  const gridCols = `1fr repeat(${compareList.length}, minmax(180px, 1fr))`;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-title">⚖️ Side-by-Side Comparison</h2>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleClose}
            aria-label="Close compare modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {compareList.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📊</div>
              <h3>No properties to compare</h3>
              <p>Add at least 2 properties to compare them side-by-side</p>
            </div>
          ) : (
            <div className="compare-table">
              {rows.map((row, rowIdx) => (
                <div
                  key={row.label}
                  className="compare-row"
                  style={{
                    gridTemplateColumns: gridCols,
                    borderBottom: rowIdx < rows.length - 1
                      ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                  }}
                >
                  <div className="compare-label">{row.label}</div>
                  {compareList.map((item) => (
                    <div key={item.propertyId} className="compare-value">
                      {row.getValue(item)}
                    </div>
                  ))}
                </div>
              ))}

              {/* Action Row */}
              <div
                className="compare-row"
                style={{ gridTemplateColumns: gridCols, marginTop: '1rem' }}
              >
                <div className="compare-label">Actions</div>
                {compareList.map((item) => (
                  <div
                    key={item.propertyId}
                    className="compare-value"
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                  >
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(item.property)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CompareModal;
