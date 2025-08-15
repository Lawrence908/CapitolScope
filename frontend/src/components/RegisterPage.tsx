import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    username: '',
    terms_accepted: false,
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    terms_accepted?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, clearError]);

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character (!@#$%^&*)';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (formData.first_name && formData.first_name.length > 100) {
      errors.first_name = 'First name must be less than 100 characters';
    }
    if (formData.last_name && formData.last_name.length > 100) {
      errors.last_name = 'Last name must be less than 100 characters';
    }

    // Username validation
    if (formData.username) {
      if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters long';
      } else if (formData.username.length > 50) {
        errors.username = 'Username must be less than 50 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
      }
    }

    // Terms validation
    if (!formData.terms_accepted) {
      errors.terms_accepted = 'You must accept the terms and conditions';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        username: formData.username || undefined,
        terms_accepted: formData.terms_accepted,
      };
      
      await register(registerData);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6">
            <img 
              src="/capitol-scope-logo.png" 
              alt="CapitolScope Logo" 
              className="h-70 w-70 mx-auto rounded-full shadow-glow-primary/30"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-neutral-100">
            Join CapitolScope
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 input-field ${
                  validationErrors.email 
                    ? 'border-error focus:ring-error focus:border-error' 
                    : ''
                }`}
                placeholder="Enter your email"
                aria-describedby={validationErrors.email ? "email-error" : undefined}
              />
              {validationErrors.email && (
                <p id="email-error" className="mt-1 text-sm text-error">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-neutral-300">
                  First name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`mt-1 input-field ${
                    validationErrors.first_name 
                      ? 'border-error focus:ring-error focus:border-error' 
                      : ''
                  }`}
                  placeholder="First name"
                  aria-describedby={validationErrors.first_name ? "first-name-error" : undefined}
                />
                {validationErrors.first_name && (
                  <p id="first-name-error" className="mt-1 text-sm text-error">
                    {validationErrors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-neutral-300">
                  Last name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`mt-1 input-field ${
                    validationErrors.last_name 
                      ? 'border-error focus:ring-error focus:border-error' 
                      : ''
                  }`}
                  placeholder="Last name"
                  aria-describedby={validationErrors.last_name ? "last-name-error" : undefined}
                />
                {validationErrors.last_name && (
                  <p id="last-name-error" className="mt-1 text-sm text-error">
                    {validationErrors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-300">
                Username (optional)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`mt-1 input-field ${
                  validationErrors.username 
                    ? 'border-error focus:ring-error focus:border-error' 
                    : ''
                }`}
                placeholder="Choose a username"
                aria-describedby={validationErrors.username ? "username-error" : undefined}
              />
              {validationErrors.username && (
                <p id="username-error" className="mt-1 text-sm text-error">
                  {validationErrors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 input-field ${
                  validationErrors.password 
                    ? 'border-error focus:ring-error focus:border-error' 
                    : ''
                }`}
                placeholder="Create a strong password"
                aria-describedby={validationErrors.password ? "password-error" : undefined}
              />
              {validationErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-error">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300">
                Confirm password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`mt-1 input-field ${
                  validationErrors.confirmPassword 
                    ? 'border-error focus:ring-error focus:border-error' 
                    : ''
                }`}
                placeholder="Confirm your password"
                aria-describedby={validationErrors.confirmPassword ? "confirm-password-error" : undefined}
              />
              {validationErrors.confirmPassword && (
                <p id="confirm-password-error" className="mt-1 text-sm text-error">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms_accepted"
              name="terms_accepted"
              type="checkbox"
              checked={formData.terms_accepted}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-400 focus:ring-primary-400 border-primary-600 rounded"
              aria-describedby={validationErrors.terms_accepted ? "terms-error" : undefined}
            />
            <label htmlFor="terms_accepted" className="ml-2 block text-sm text-neutral-300">
              I agree to the{' '}
              <Link
                to="/terms"
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {validationErrors.terms_accepted && (
            <p id="terms-error" className="text-sm text-error">
              {validationErrors.terms_accepted}
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-error/10 border border-error/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-error">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create account
                </div>
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-neutral-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-400 hover:text-primary-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>

        {/* Subscription Tiers Info */}
        <div className="mt-8 card p-4">
          <h3 className="text-sm font-medium text-primary-400 mb-2">
            🎯 Free Tier Features
          </h3>
          <ul className="text-xs text-neutral-400 space-y-1">
            <li>• Access to congressional trading data</li>
            <li>• Basic search and filtering</li>
            <li>• Member profiles and trade history</li>
            <li>• Email notifications for major trades</li>
            <li>• Community discussions</li>
          </ul>
          <p className="text-xs text-neutral-400 mt-2">
            Premium features coming soon: Advanced analytics, real-time alerts, portfolio tracking, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 