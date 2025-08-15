import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-neutral-100">
      {/* Header */}
      <header className="bg-bg-secondary shadow-sm border-b border-primary-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <img 
                src="/favicon-64x64.png" 
                alt="CapitolScope Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-glow-primary/20"
                loading="lazy"
                width="40"
                height="40"
              />
              <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-primary-400">CapitolScope</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Hide "Sign in" text on mobile, show on larger screens */}
              <Link
                to="/login"
                className="hidden sm:block text-neutral-300 hover:text-neutral-100 text-sm"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm px-3 py-2 sm:px-4 sm:py-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            {/* Large Logo and Branding */}
            <div className="mb-8 sm:mb-12">
              <img 
                src="/android-chrome-192x192.png" 
                alt="CapitolScope" 
                className="h-24 w-24 sm:h-32 sm:w-32 mx-auto rounded-full shadow-glow-primary/30 mb-6"
                loading="lazy"
                width="128"
                height="128"
              />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 sm:text-5xl md:text-6xl">
                Congressional Trading
                <span className="text-primary-400"> Transparency</span>
              </h1>
            </div>
            
            <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-3xl mx-auto">
              Track and analyze congressional trading activity in real-time. Discover patterns, 
              monitor portfolios, and stay informed about the financial activities of your elected officials.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="btn-primary px-8 py-3 text-lg"
              >
                Start Exploring
              </Link>
              <Link
                to="/login"
                className="btn-outline px-8 py-3 text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-900/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-100">Real-time Data</h3>
              <p className="mt-2 text-neutral-400">
                Access up-to-date congressional trading information with comprehensive filtering and search capabilities.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-900/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-100">Member Profiles</h3>
              <p className="mt-2 text-neutral-400">
                Detailed profiles of congressional members with their trading history, portfolio analysis, and performance metrics.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary-900/20 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-100">Advanced Analytics</h3>
              <p className="mt-2 text-neutral-400">
                Powerful analytics tools to identify patterns, trends, and correlations in congressional trading activity.
              </p>
            </div>
          </div>

          {/* Beta Notice */}
          <div className="mt-16 card p-6 sm:p-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-primary-400">
                🚀 Currently in Beta
              </h3>
              <p className="mt-2 text-neutral-400">
                CapitolScope is currently in beta testing. Sign up now to get early access and help us improve the platform.
              </p>
              <div className="mt-4">
                <Link
                  to="/register"
                  className="btn-outline px-6 py-3 text-base"
                >
                  Join Beta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage; 