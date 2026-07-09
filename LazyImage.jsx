import { useState, useCallback, memo } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  style = {},
  fallback = null,
  onLoad,
  onError,
  aspectRatio = '',
  width,
  height,
}) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.01 });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    onError?.();
  }, [onError]);

  const placeholderStyle = {
    background: 'rgba(255,255,255,0.04)',
    ...(aspectRatio ? { aspectRatio } : {}),
    ...style,
  };

  return (
    <div
      ref={ref}
      className={`lazy-image-wrapper ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: width || '100%',
        height: height || 'auto',
        minHeight: 120,
        ...style,
      }}
    >
      {!loaded && !error && (
        <div
          className="loading-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            zIndex: 1,
          }}
        />
      )}
      {isVisible && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
          loading="lazy"
        />
      )}
      {error && (fallback || (
        <div style={{
          ...placeholderStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
        }}>
          🏨
        </div>
      ))}
    </div>
  );
});

export default LazyImage;
