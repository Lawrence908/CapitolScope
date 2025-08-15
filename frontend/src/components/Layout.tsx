import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentMagnifyingGlassIcon,
  CogIcon,
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Check if user has premium subscription (handle both lowercase and uppercase)
  const subscriptionTier = user?.subscription_tier?.toLowerCase();
  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';
  const isPro = subscriptionTier === 'pro' || isPremium;
  const isFree = subscriptionTier === 'free' || !subscriptionTier;
  
  // Debug logging
  console.log('User data:', {
    user: user,
    subscription_tier: user?.subscription_tier,
    subscriptionTier,
    isPremium,
    isPro,
    isFree
  });

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Trade Browser', href: '/trades', icon: DocumentMagnifyingGlassIcon },
    { name: 'Members', href: '/members', icon: UserGroupIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Data Quality', href: '/data-quality', icon: CogIcon },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-neutral-100 transition-colors duration-300">
      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu} />
          <div className="fixed inset-y-0 left-0 w-64 bg-bg-secondary shadow-lg transition-colors duration-300 border-r border-primary-800/20">
            <div className="flex h-16 items-center justify-between px-4 border-b border-primary-800/20">
              <div className="flex items-center space-x-3">
                <img 
                  src="/favicon-64x64.png" 
                  alt="CapitolScope Logo" 
                  className="h-8 w-8 rounded-full shadow-glow-primary/20"
                  loading="lazy"
                  width="32"
                  height="32"
                />
                <h1 className="text-lg font-bold text-primary-400">CapitolScope</h1>
              </div>
              <button
                onClick={closeMobileMenu}
                className="text-neutral-400 hover:text-neutral-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="mt-4 px-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                          isActive(item.href)
                            ? 'bg-primary-900/20 text-primary-400 shadow-glow-primary/20'
                            : 'text-neutral-300 hover:text-primary-400 hover:bg-bg-tertiary'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              
              {/* Premium Upgrade Section for Free Users */}
              {isFree && (
                <div className="mt-6 pt-4 border-t border-primary-800/20">
                  <div className="bg-neon-gradient p-4 rounded-lg shadow-glow-primary">
                    <div className="flex items-center mb-2">
                      <SparklesIcon className="h-5 w-5 text-bg-primary mr-2" />
                      <span className="text-bg-primary text-sm font-semibold">Upgrade to Pro</span>
                    </div>
                    <p className="text-bg-primary/80 text-xs mb-3">
                      Unlock trade alerts, analytics, and more
                    </p>
                    <Link
                      to="/premium"
                      onClick={closeMobileMenu}
                      className="block w-full bg-bg-primary text-primary-400 text-xs font-semibold py-2 px-3 rounded text-center hover:bg-bg-tertiary transition-colors duration-200"
                    >
                      View Plans
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-bg-secondary shadow-lg transition-colors duration-300 border-r border-primary-800/20">
        <div className="flex h-16 items-center justify-center border-b border-primary-800/20">
          <div className="flex items-center space-x-3">
            <img 
              src="/favicon-64x64.png" 
              alt="CapitolScope Logo" 
              className="h-10 w-10 rounded-full shadow-glow-primary/20"
              loading="lazy"
              width="40"
              height="40"
            />
            <h1 className="text-xl font-bold text-primary-400">CapitolScope</h1>
          </div>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      isActive(item.href)
                        ? 'bg-primary-900/20 text-primary-400 shadow-glow-primary/20'
                        : 'text-neutral-300 hover:text-primary-400 hover:bg-bg-tertiary'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Premium Upgrade Section for Free Users */}
          {isFree && (
            <div className="mt-8 pt-6 border-t border-primary-800/20">
              <div className="bg-neon-gradient p-4 rounded-lg shadow-glow-primary">
                <div className="flex items-center mb-2">
                  <SparklesIcon className="h-5 w-5 text-bg-primary mr-2" />
                  <span className="text-bg-primary text-sm font-semibold">Upgrade to Pro</span>
                </div>
                <p className="text-bg-primary/80 text-xs mb-3">
                  Unlock trade alerts, analytics, and more
                </p>
                <Link
                  to="/premium"
                  className="block w-full bg-bg-primary text-primary-400 text-xs font-semibold py-2 px-3 rounded text-center hover:bg-bg-tertiary transition-colors duration-200"
                >
                  View Plans
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-bg-secondary shadow-sm border-b border-primary-800/20 transition-colors duration-300">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button and title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="lg:hidden text-neutral-400 hover:text-neutral-100"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-xl lg:text-2xl font-semibold text-neutral-100">
                    {navigation.find(item => isActive(item.href))?.name || 'CapitolScope'}
                  </h1>
                  <p className="text-xs lg:text-sm text-neutral-400 mt-1 hidden sm:block">
                    Congressional trading transparency platform
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                {/* Premium Upgrade Button for Free Users */}
                {isFree && (
                  <Link
                    to="/premium"
                    className="hidden sm:inline-flex items-center px-3 lg:px-4 py-2 bg-neon-gradient text-bg-primary text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 shadow-glow-primary hover:shadow-glow-primary/70 transform hover:scale-105"
                  >
                    <SparklesIcon className="h-4 w-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">Upgrade to Pro</span>
                    <span className="lg:hidden">Pro</span>
                  </Link>
                )}
                
                <div className="hidden lg:block text-sm text-neutral-400">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
                <DarkModeToggle />
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-sm text-neutral-300 hover:text-neutral-100 transition-colors"
                  >
                    <UserCircleIcon className="h-6 w-6" />
                    <span className="hidden md:block">
                      {user?.display_name || user?.email || 'User'}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-secondary rounded-md shadow-lg py-1 z-50 border border-primary-800/20">
                      <div className="px-4 py-2 border-b border-primary-800/20">
                        <p className="text-sm font-medium text-neutral-100">
                          {user?.display_name || user?.email}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {isFree ? 'Free Plan' : isPremium ? 'Premium Plan' : isPro ? 'Pro Plan' : 'Enterprise Plan'}
                        </p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-neutral-300 hover:bg-bg-tertiary"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-bg-tertiary"
                      >
                        <div className="flex items-center">
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Sign out
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
      
      {/* Overlay to close user menu when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Layout; 