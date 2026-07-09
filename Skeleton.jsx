import { memo } from 'react';

const Skeleton = memo(function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  style = {},
  count = 1,
  gap = '0.75rem',
  direction = 'column',
}) {
  if (count > 1) {
    return (
      <div style={{ display: 'flex', flexDirection: direction, gap }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="loading-shimmer"
            style={{ width, height, borderRadius, ...style }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="loading-shimmer"
      style={{ width, height, borderRadius, ...style }}
    />
  );
});

export function PropertyCardSkeleton() {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <Skeleton height={200} borderRadius="0" />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width="40%" height="0.75rem" />
        <Skeleton width="75%" height="1.1rem" />
        <Skeleton width="55%" height="0.75rem" />
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <Skeleton width="60px" height="1.2rem" borderRadius="20px" />
          <Skeleton width="50px" height="1.2rem" borderRadius="20px" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <Skeleton width="120px" height="0.85rem" />
          <Skeleton width="80px" height="1rem" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
