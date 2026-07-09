/* ═══════════════════════════════════════════════════════════════
   AutocompleteSearch — Debounced City Suggestion Dropdown
   Performance-optimized with local state isolation
   ═══════════════════════════════════════════════════════════════ */

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';

// ─── Global Cities Database (Static, Outside Render) ───
const GLOBAL_CITIES = [
  { city: 'Tokyo', country: 'Japan', region: 'Asia Pacific', emoji: '🗼' },
  { city: 'Paris', country: 'France', region: 'Europe', emoji: '🗼' },
  { city: 'New York', country: 'USA', region: 'North America', emoji: '🗽' },
  { city: 'London', country: 'United Kingdom', region: 'Europe', emoji: '🎡' },
  { city: 'Rome', country: 'Italy', region: 'Europe', emoji: '🏛️' },
  { city: 'Sydney', country: 'Australia', region: 'Oceania', emoji: '🌊' },
  { city: 'Dubai', country: 'UAE', region: 'Middle East', emoji: '🏙️' },
  { city: 'Maldives', country: 'Maldives', region: 'South Asia', emoji: '🏝️' },
  { city: 'Zurich', country: 'Switzerland', region: 'Europe', emoji: '🏔️' },
  { city: 'Bali', country: 'Indonesia', region: 'Southeast Asia', emoji: '🌴' },
  { city: 'Barcelona', country: 'Spain', region: 'Europe', emoji: '🎭' },
  { city: 'Bangkok', country: 'Thailand', region: 'Southeast Asia', emoji: '🛕' },
  { city: 'Santorini', country: 'Greece', region: 'Europe', emoji: '🏖️' },
  { city: 'Cape Town', country: 'South Africa', region: 'Africa', emoji: '🦁' },
  { city: 'Kyoto', country: 'Japan', region: 'Asia Pacific', emoji: '⛩️' },
];

const AutocompleteSearch = memo(function AutocompleteSearch({ value, onChange, onSelect, placeholder, className, inputClassName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localInput, setLocalInput] = useState(value || '');
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setLocalInput(value || '');
  }, [value]);

  // ─── Filtered suggestions (memoized) ───
  const suggestions = useMemo(() => {
    if (!localInput || localInput.trim().length < 1) return [];
    const query = localInput.toLowerCase().trim();
    return GLOBAL_CITIES.filter(
      c =>
        c.city.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [localInput]);

  // ─── Click outside to close ───
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Debounced input handler ───
  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setLocalInput(val);
    setActiveIndex(-1);
    setIsOpen(true);

    // Debounce the external onChange to prevent lag
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onChange) onChange(val);
    }, 200);
  }, [onChange]);

  // ─── Suggestion selection ───
  const handleSelect = useCallback((city) => {
    setLocalInput(city.city);
    setIsOpen(false);
    setActiveIndex(-1);
    if (onChange) onChange(city.city);
    if (onSelect) onSelect(city);
  }, [onChange, onSelect]);

  // ─── Keyboard navigation ───
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }, [isOpen, suggestions, activeIndex, handleSelect]);

  // ─── Focus handler ───
  const handleFocus = useCallback(() => {
    if (localInput.trim().length > 0) {
      setIsOpen(true);
    }
  }, [localInput]);

  return (
    <div className={`autocomplete-wrapper ${className || ''}`} ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        className={inputClassName || 'input-field'}
        value={localInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder || 'Search destinations...'}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="autocomplete-dropdown" role="listbox">
          {suggestions.map((city, index) => (
            <div
              key={`${city.city}-${city.country}`}
              className={`autocomplete-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => handleSelect(city)}
              role="option"
              aria-selected={index === activeIndex}
            >
              <span style={{ fontSize: '1.3rem' }}>{city.emoji}</span>
              <div>
                <div className="city-name">{city.city}</div>
                <div className="country-name">{city.country} · {city.region}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default AutocompleteSearch;
