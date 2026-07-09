/* ═══════════════════════════════════════════════════════════════
   AuthPortal — Secure Login & Registration Forms
   Strict structural input validation and clean state toggling
   ═══════════════════════════════════════════════════════════════ */

import { useState, useCallback, memo } from 'react';
import { useVoyage } from '../context/AppStateContext';

const AuthPortal = memo(function AuthPortal() {
  const { login, register, navigateTo } = useVoyage();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Field Change Handler ───
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitError('');
  }, []);

  // ─── Strict Validation Engine ───
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Email validation
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Registration-specific validations
    if (mode === 'register') {
      const nameTrimmed = formData.name.trim();
      if (!nameTrimmed) {
        newErrors.name = 'Full name is required';
      } else if (nameTrimmed.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s'-]+$/.test(nameTrimmed)) {
        newErrors.name = 'Name contains invalid characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mode]);

  // ─── Form Submission ───
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate brief network delay for realism
      await new Promise(resolve => setTimeout(resolve, 400));

      if (mode === 'login') {
        login(formData.email, formData.password);
      } else {
        register(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      setSubmitError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, mode, formData, login, register]);

  // ─── Mode Toggle ───
  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setErrors({});
    setSubmitError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel-elevated animate-fadeInUp" style={{ padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
            {mode === 'login' ? '👋' : '🚀'}
          </div>
          <h2 className="text-headline" style={{ marginBottom: '0.4rem' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-body">
            {mode === 'login'
              ? 'Sign in to access your travel workspace'
              : 'Join ApexVoyage for premium travel planning'}
          </p>
        </div>

        {/* Error Banner */}
        {submitError && (
          <div className="error-message animate-fadeIn">
            ⚠️ {submitError}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Name Field (Register Only) */}
          {mode === 'register' && (
            <div>
              <label className="input-label" htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                name="name"
                className={`input-field ${errors.name ? 'error' : ''}`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                maxLength={50}
              />
              {errors.name && (
                <span style={{ fontSize: '0.75rem', color: 'var(--state-error)', marginTop: '0.3rem', display: 'block' }}>
                  {errors.name}
                </span>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="input-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              name="email"
              className={`input-field ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={100}
            />
            {errors.email && (
              <span style={{ fontSize: '0.75rem', color: 'var(--state-error)', marginTop: '0.3rem', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="input-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              name="password"
              className={`input-field ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              maxLength={64}
            />
            {errors.password && (
              <span style={{ fontSize: '0.75rem', color: 'var(--state-error)', marginTop: '0.3rem', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password (Register Only) */}
          {mode === 'register' && (
            <div>
              <label className="input-label" htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                id="auth-confirm-password"
                type="password"
                name="confirmPassword"
                className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                maxLength={64}
              />
              {errors.confirmPassword && (
                <span style={{ fontSize: '0.75rem', color: 'var(--state-error)', marginTop: '0.3rem', display: 'block' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="auth-toggle">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button onClick={toggleMode}>Create one</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={toggleMode}>Sign in</button>
            </>
          )}
        </div>

        {/* Demo Account Hint */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(34, 211, 238, 0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(34, 211, 238, 0.1)',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            💡 Register a new account to get started, or explore destinations without signing in.
          </p>
        </div>
      </div>
    </div>
  );
});

export default AuthPortal;
