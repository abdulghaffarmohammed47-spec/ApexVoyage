/* ═══════════════════════════════════════════════════════════════
   BrandLanding — Immersive Full-Screen Brand Introduction
   Cinematic hero, advanced CSS animations, feature showcase
   ═══════════════════════════════════════════════════════════════ */

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useVoyage } from '../context/AppStateContext';
import AnimatedSection from '../components/AnimatedSection';

// ─── Feature Data ───
const FEATURES = [
  {
    icon: '🔍',
    title: 'Smart Search',
    desc: 'AI-powered destination discovery with real-time autocomplete, vibe filters, and intelligent recommendations.',
    color: 'var(--cyan-400)',
  },
  {
    icon: '🏨',
    title: 'Luxury Booking',
    desc: 'Curated portfolio of world-class hotels and resorts with dynamic pricing, tier upgrades, and promo codes.',
    color: 'var(--violet-400)',
  },
  {
    icon: '❤️',
    title: 'Wishlist & Compare',
    desc: 'Save favorites, compare properties side-by-side, and track price drops across your dream destinations.',
    color: 'var(--rose-400)',
  },
  {
    icon: '📋',
    title: 'Itinerary Planner',
    desc: 'Build detailed day-by-day travel plans with activity categories, timestamps, and flexible editing.',
    color: 'var(--emerald-400)',
  },
  {
    icon: '💱',
    title: 'Multi-Currency',
    desc: 'Real-time currency conversion across 8 global currencies with a seamless toggle in the navigation bar.',
    color: 'var(--amber-400)',
  },
  {
    icon: '📊',
    title: 'Spend Analytics',
    desc: 'Visualize your travel spending with interactive Recharts dashboards showing destination breakdowns.',
    color: 'var(--sky-400)',
  },
];

// ─── Stat Counter ───
const STATS = [
  { value: '500+', label: 'Luxury Properties' },
  { value: '8', label: 'Global Destinations' },
  { value: '99%', label: 'Guest Satisfaction' },
  { value: '24/7', label: 'Premium Support' },
];

// ─── Testimonials ───
const TESTIMONIALS = [
  {
    text: '"The most seamless travel planning experience I have ever used. Every detail is thoughtfully designed."',
    author: 'Sarah Chen',
    role: 'Frequent Traveler',
    rating: 5,
  },
  {
    text: '"The itinerary planner alone is worth it. I planned our entire two-week European vacation in under an hour."',
    author: 'Marcus Webb',
    role: 'Business Consultant',
    rating: 5,
  },
  {
    text: '"From booking to check-out, ApexVoyage made everything effortless. The concierge recommendations were spot-on."',
    author: 'Elena Rodriguez',
    role: 'Luxury Travel Blogger',
    rating: 5,
  },
];

// ═══ Floating Particle Background ───
function ParticleBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="landing-canvas" />;
}

// ═══ Floating Elements ───
function FloatingElements() {
  const emojis = ['✈️', '🗺️', '🌍', '🏝️', '🗼', '🏔️', '🌴', '🏙️'];
  return (
    <div className="floating-elements">
      {emojis.map((emoji, i) => (
        <span
          key={i}
          className="floating-emoji"
          style={{
            left: `${10 + i * 11}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${12 + i * 2}s`,
            fontSize: `${1.2 + Math.random() * 1}rem`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// ═══ Brand Landing Component ───
const BrandLanding = memo(function BrandLanding() {
  const { navigateTo, isAuthenticated } = useVoyage();
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Reset scroll on mount
    window.scrollTo(0, 0);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = useCallback(() => {
    if (isAuthenticated) {
      navigateTo('explore');
    } else {
      navigateTo('auth');
    }
  }, [isAuthenticated, navigateTo]);

  const handleExplore = useCallback(() => {
    if (isAuthenticated) {
      navigateTo('explore');
    } else {
      navigateTo('auth');
    }
  }, [isAuthenticated, navigateTo]);

  const handleDashboard = useCallback(() => {
    navigateTo('dashboard');
  }, [navigateTo]);

  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const renderStars = (count) => '★'.repeat(count);

  return (
    <div className="brand-landing">
      <ParticleBackground />
      <FloatingElements />

      {/* ═══ HERO SECTION ═══ */}
      <section className="landing-hero">
        <div className="landing-hero-badge animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <span className="badge badge-cyan">✦ Premium Travel Concierge</span>
        </div>

        <div className="landing-logo animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          ✈️
        </div>

        <h1 className="landing-title animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <span className="text-gradient">ApexVoyage</span>
        </h1>

        <p className="landing-subtitle animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          Premium Reserve
        </p>

        <p className="landing-tagline animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          Rediscover the art of travel. <br />
          Curated luxury, intelligent planning, and unforgettable experiences —
          <span className="text-gradient"> all in one place.</span>
        </p>

        <div className="landing-cta animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
          {isAuthenticated ? (
            <>
              <button className="btn btn-primary btn-lg landing-btn-glow" onClick={handleExplore}>
                🔍 Continue Exploring
              </button>
              <button className="btn btn-secondary btn-lg" onClick={handleDashboard}>
                📊 My Dashboard
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-lg landing-btn-glow" onClick={handleGetStarted}>
                ✨ Get Started Free
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigateTo('auth')}>
                🔐 Sign In
              </button>
            </>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator animate-fadeIn" style={{ animationDelay: '1.2s' }} onClick={scrollToFeatures}>
          <span className="scroll-text">Discover More</span>
          <span className="scroll-arrow">↓</span>
        </div>
      </section>

      {/* ═══ STATS COUNTER ═══ */}
      <section className="landing-stats-section">
        <div className="container">
          <AnimatedSection>
            <div className="landing-stats-grid">
              {STATS.map((stat) => (
                <div key={stat.label} className="landing-stat-card">
                  <div className="landing-stat-value">{stat.value}</div>
                  <div className="landing-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="landing-features-section" ref={featuresRef} id="features">
        <div className="container">
          <AnimatedSection>
            <div className="landing-section-header">
              <p className="text-caption" style={{ color: 'var(--cyan-400)', marginBottom: '0.5rem' }}>
                ✦ WHY APEXVOYAGE
              </p>
              <h2 className="text-headline">
                Everything You Need for the{' '}
                <span className="text-gradient">Perfect Journey</span>
              </h2>
              <p className="text-body" style={{ maxWidth: '600px', margin: '0.75rem auto 0' }}>
                A unified platform combining luxury booking, smart planning, and travel analytics.
              </p>
            </div>
          </AnimatedSection>

          <div className="landing-features-grid">
            {FEATURES.map((feature, i) => (
              <AnimatedSection key={feature.title} delay={0.05 * i} threshold={0.2}>
                <div
                  className="landing-feature-card"
                  style={{ '--accent': feature.color }}
                >
                  <div className="feature-icon-wrapper" style={{ background: `${feature.color}15` }}>
                    <span className="feature-icon">{feature.icon}</span>
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="landing-testimonials-section">
        <div className="container">
          <AnimatedSection>
            <div className="landing-section-header">
              <p className="text-caption" style={{ color: 'var(--violet-400)', marginBottom: '0.5rem' }}>
                ✦ TRAVELER STORIES
              </p>
              <h2 className="text-headline">
                Loved by <span className="text-gradient">Explorers</span> Worldwide
              </h2>
            </div>
          </AnimatedSection>

          <div className="landing-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <AnimatedSection key={t.author} delay={0.1 * i} threshold={0.2}>
                <div className="landing-testimonial-card">
                  <div className="testimonial-stars">{renderStars(t.rating)}</div>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-divider" />
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.author.split(' ').map(s => s[0]).join('')}</div>
                    <div>
                      <div className="testimonial-name">{t.author}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA SECTION ═══ */}
      <section className="landing-cta-section">
        <div className="container">
          <AnimatedSection threshold={0.3}>
            <div className="landing-cta-card">
              <div className="cta-glow" />
              <h2 className="text-headline" style={{ position: 'relative', zIndex: 1 }}>
                Begin Your{' '}
                <span className="text-gradient">Extraordinary Journey</span>
              </h2>
              <p className="text-body" style={{ position: 'relative', zIndex: 1, maxWidth: '500px', margin: '0.75rem auto 1.5rem' }}>
                Join discerning travelers who trust ApexVoyage for their most memorable experiences.
              </p>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <button className="btn btn-primary btn-lg landing-btn-glow" onClick={handleExplore}>
                    🔍 Start Exploring
                  </button>
                ) : (
                  <button className="btn btn-primary btn-lg landing-btn-glow" onClick={handleGetStarted}>
                    ✨ Create Free Account
                  </button>
                )}
                <button className="btn btn-secondary btn-lg" onClick={() => navigateTo('auth')}>
                  🔐 Sign In
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ FOOTER (minimal brand) ═══ */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer-content">
            <div className="landing-footer-brand">
              ✈️ <span className="text-gradient">ApexVoyage</span>
            </div>
            <p className="landing-footer-text">
              Premium Reserve — Crafted with care for the modern traveler.
            </p>
            <div className="landing-footer-bottom">
              <span>© 2025 ApexVoyage. All rights reserved.</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-cyan">React 19</span>
                <span className="badge badge-violet">Recharts</span>
                <span className="badge badge-emerald">Leaflet</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default BrandLanding;
