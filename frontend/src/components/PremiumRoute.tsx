import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PremiumRouteProps {
  children: React.ReactNode;
  requiredTier?: 'pro' | 'premium' | 'enterprise';
  fallbackPath?: string;
}

const PremiumRoute: React.FC<PremiumRouteProps> = ({ 
  children, 
  requiredTier = 'pro',
  fallbackPath = '/premium'
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user has the required subscription tier
  const hasRequiredTier = () => {
    if (!user) return false;
    
    const subscriptionTier = user.subscription_tier?.toLowerCase();
    
    switch (requiredTier) {
      case 'pro':
        return ['pro', 'premium', 'enterprise'].includes(subscriptionTier);
      case 'premium':
        return ['premium', 'enterprise'].includes(subscriptionTier);
      case 'enterprise':
        return subscriptionTier === 'enterprise';
      default:
        return false;
    }
  };

  // If user doesn't have required tier, redirect to premium signup
  if (!hasRequiredTier()) {
    return <Navigate to={fallbackPath} state={{ from: location, requiredTier }} replace />;
  }

  // Render children if user has required tier
  return <>{children}</>;
};

export default PremiumRoute;
