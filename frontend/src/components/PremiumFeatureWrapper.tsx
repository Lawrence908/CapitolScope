import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon } from '@heroicons/react/24/outline';

interface PremiumFeatureWrapperProps {
  children: React.ReactNode;
  featureName: string;
  requiredTier?: 'pro' | 'premium' | 'enterprise';
  showBadge?: boolean;
  className?: string;
}

const PremiumFeatureWrapper: React.FC<PremiumFeatureWrapperProps> = ({ 
  children, 
  featureName, 
  requiredTier = 'pro',
  showBadge = true,
  className = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const PremiumBadge = () => (
    <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
      <StarIcon className="h-3 w-3 mr-1" />
      {requiredTier === 'pro' ? 'Pro' : requiredTier === 'premium' ? 'Premium' : 'Enterprise'}
    </div>
  );

  const handlePremiumFeatureClick = () => {
    if (!hasRequiredTier()) {
      // Show upgrade prompt and redirect to premium page
      navigate('/premium', { 
        state: { 
          from: window.location.pathname, 
          requiredTier,
          featureName 
        } 
      });
    }
  };

  if (hasRequiredTier()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={`opacity-60 cursor-not-allowed ${className}`} 
      onClick={handlePremiumFeatureClick}
      title={`${featureName} requires a ${requiredTier} subscription`}
    >
      {children}
      {showBadge && <PremiumBadge />}
    </div>
  );
};

export default PremiumFeatureWrapper;
