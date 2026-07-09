import { memo } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const AnimatedSection = memo(function AnimatedSection({
  children,
  className = '',
  animation = 'fadeInUp',
  delay = 0,
  threshold = 0.1,
  rootMargin = '0px',
  style = {},
  as: Tag = 'div',
}) {
  const [ref, isVisible] = useIntersectionObserver({ threshold, rootMargin });

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        ...(isVisible ? {
          opacity: 1,
          transform: 'translateY(0)',
        } : {}),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
});

export default AnimatedSection;
