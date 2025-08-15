import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import {
  CheckIcon,
  StarIcon,
  ShieldCheckIcon,
  BellIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import DarkModeToggle from './DarkModeToggle';
import stripeService from '../services/stripeService';

const PremiumSignup: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Get redirect information from location state
  const redirectInfo = location.state as {
    from?: string;
    requiredTier?: string;
    featureName?: string;
  } | null;

  const plans = {
    monthly: {
      free: { price: 0, period: 'month', savings: null },
      pro: { price: 5.99, period: 'month', savings: null },
      premium: { price: 14.99, period: 'month', savings: null },
      enterprise: { price: 49.99, period: 'month', savings: null },
    },
    yearly: {
      free: { price: 0, period: 'year', savings: null },
      pro: { price: 59.99, period: 'year', savings: 'Save 17%' },
      premium: { price: 149.99, period: 'year', savings: 'Save 17%' },
      enterprise: { price: 499.99, period: 'year', savings: 'Save 17%' },
    },
  };

  const features = [
    {
      name: 'Basic Search & Browse',
      description: 'Search and filter congressional trading data',
      icon: ChartBarIcon,
      free: true,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Member Profiles',
      description: 'Detailed profiles of congress members and their trading history',
      icon: UserGroupIcon,
      free: true,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Two-Factor Authentication',
      description: 'Enhanced security for your account',
      icon: ShieldCheckIcon,
      free: true,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Active Sessions',
      description: 'Manage your login sessions across devices',
      icon: ShieldCheckIcon,
      free: true,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Trade Alerts',
      description: 'Get notified of new congressional trades in real-time',
      icon: BellIcon,
      free: true,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Basic Portfolio Analytics',
      description: 'Basic portfolio performance and analytics',
      icon: ChartBarIcon,
      free: true,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Export to CSV',
      description: 'Export trading data to CSV format',
      icon: ChartBarIcon,
      free: true,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Limited Historical Data',
      description: 'Access to 3 months of historical trade data',
      icon: ExclamationTriangleIcon,
      free: true,
      pro: false,
      premium: false,
      enterprise: false,
    },
    {
      name: 'Full Historical Data',
      description: 'Complete access to all historical trading data',
      icon: ChartBarIcon,
      free: false,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Weekly Summaries',
      description: 'Comprehensive weekly trading activity reports',
      icon: ChartBarIcon,
      free: false,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Multiple Buyer Alerts',
      description: 'Alerts when 5+ members buy same stock in 3 months',
      icon: BellIcon,
      free: false,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'High-Value Trade Alerts',
      description: 'Alerts for trades over $1M',
      icon: BellIcon,
      free: false,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Saved Portfolios / Watchlists',
      description: 'Save and track your favorite portfolios',
      icon: UserGroupIcon,
      free: false,
      pro: true,
      premium: true,
      enterprise: true,
    },
    {
      name: 'TradingView-Style Charts',
      description: 'Interactive stock charts with trade overlays',
      icon: ChartBarIcon,
      free: false,
      pro: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Advanced Portfolio Analytics',
      description: 'Advanced trading patterns and insights',
      icon: ChartBarIcon,
      free: false,
      pro: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Sector/Committee-based Filters',
      description: 'Filter trades by congressional committees and sectors',
      icon: ChartBarIcon,
      free: false,
      pro: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'API Access (Rate-limited)',
      description: 'Programmatic access to trading data',
      icon: SparklesIcon,
      free: false,
      pro: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Custom Alert Configurations',
      description: 'Create custom alerts for specific criteria',
      icon: BellIcon,
      free: false,
      pro: false,
      premium: true,
      enterprise: true,
    },
    {
      name: 'Advanced Analytics Dashboard',
      description: 'Advanced analytics and pattern recognition',
      icon: ChartBarIcon,
      free: false,
      pro: false,
      premium: false,
      enterprise: true,
    },
    {
      name: 'White-Label Dashboard Options',
      description: 'Custom branding and deployment options',
      icon: BuildingOfficeIcon,
      free: false,
      pro: false,
      premium: false,
      enterprise: true,
    },
    {
      name: 'Priority Support',
      description: 'Priority customer support and assistance',
      icon: BuildingOfficeIcon,
      free: false,
      pro: false,
      premium: false,
      enterprise: true,
    },
    {
      name: 'Increased API Limits',
      description: 'Higher rate limits for API access',
      icon: SparklesIcon,
      free: false,
      pro: false,
      premium: false,
      enterprise: true,
    },
    {
      name: 'Team Seats / Admin Panel',
      description: 'Manage team access and permissions',
      icon: UserGroupIcon,
      free: false,
      pro: false,
      premium: false,
      enterprise: true,
    },
  ];

  // Handle payment success/cancellation on component mount
  useEffect(() => {
    const paymentSuccess = stripeService.handlePaymentSuccess();
    const paymentCancelled = stripeService.handlePaymentCancellation();
    
    if (paymentSuccess.success) {
      alert(paymentSuccess.message);
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (paymentCancelled.cancelled) {
      alert(paymentCancelled.message);
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load subscription info on component mount
  useEffect(() => {
    const loadSubscriptionInfo = async () => {
      try {
        const info = await stripeService.getSubscriptionInfo();
        setSubscriptionInfo(info);
      } catch (error) {
        console.error('Error loading subscription info:', error);
      }
    };
    
    loadSubscriptionInfo();
  }, []);

  const handleUpgrade = async (tier: string) => {
    if (tier === 'free') {
      return; // No action needed for free tier
    }
    
    setIsLoading(true);
    
    try {
      const response = await stripeService.createCheckoutSession({
        tier: tier.toLowerCase(),
        interval: selectedPlan,
        success_url: `${window.location.origin}/dashboard?payment=success&tier=${tier}`,
        cancel_url: `${window.location.origin}/premium?payment=cancelled`
      });
      
      // Redirect to Stripe Checkout
      stripeService.redirectToCheckout(response.url);
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await stripeService.createPortalSession(
        `${window.location.origin}/premium`
      );
      stripeService.redirectToPortal(response.url);
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open subscription management. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg-light-primary dark:bg-bg-primary circuit-bg">
      {/* Header */}
      <header className="bg-bg-light-secondary dark:bg-bg-secondary shadow-lg border-b border-primary-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
                          <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/capitol-scope-logo.png" 
                  alt="CapitolScope Logo" 
                  className="h-10 w-10 rounded-lg shadow-glow-primary/20"
                  loading="lazy"
                  width="40"
                  height="40"
                />
                <h1 className="ml-3 text-lg sm:text-xl font-bold text-glow-primary">CapitolScope</h1>
              </Link>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <Link
                to="/dashboard"
                className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 hover:text-primary-400 transition-colors duration-300"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Redirect Banner */}
        {redirectInfo && (
          <div className="mb-8 p-4 lg:p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  {redirectInfo.featureName ? `${redirectInfo.featureName} Requires ${redirectInfo.requiredTier?.toUpperCase()} Subscription` : 'Premium Feature Access Required'}
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  {redirectInfo.featureName 
                    ? `You need a ${redirectInfo.requiredTier} subscription to access ${redirectInfo.featureName}.`
                    : 'This feature requires a premium subscription. Choose a plan below to continue.'
                  }
                </p>
                {redirectInfo.from && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                    Redirected from: {redirectInfo.from}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary-600 dark:text-glow-primary sm:text-5xl mb-4">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-neutral-700 dark:text-neutral-300 max-w-3xl mx-auto">
            Unlock advanced features to get deeper insights into congressional trading activity and stay ahead of the market.
          </p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="card p-1">
            <div className="flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  selectedPlan === 'monthly'
                    ? 'bg-primary-400 text-bg-primary shadow-glow-primary'
                    : 'text-neutral-300 hover:text-primary-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                  selectedPlan === 'yearly'
                    ? 'bg-primary-400 text-bg-primary shadow-glow-primary'
                    : 'text-neutral-300 hover:text-primary-400'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {/* Free Plan */}
          <div className="card p-6">
                          <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Free</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">$0</span>
                  <span className="text-neutral-600 dark:text-neutral-400">/{plans[selectedPlan].free.period}</span>
                </div>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Perfect for getting started</p>
              </div>
            <div className="mt-6">
              <button
                onClick={() => handleUpgrade('free')}
                disabled={isLoading}
                className="w-full btn-outline disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Current Plan'}
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="card-glow p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-secondary-400 text-bg-primary px-3 py-1 rounded-full text-xs font-medium shadow-glow-secondary">Most Popular</span>
            </div>
                          <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Pro</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">${plans[selectedPlan].pro.price}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">/{plans[selectedPlan].pro.period}</span>
                </div>
                {plans[selectedPlan].pro.savings && (
                  <p className="mt-2 text-sm text-success font-medium">{plans[selectedPlan].pro.savings}</p>
                )}
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">For serious investors</p>
              </div>
            <div className="mt-6">
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="card p-6">
                          <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Premium</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">${plans[selectedPlan].premium.price}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">/{plans[selectedPlan].premium.period}</span>
                </div>
                {plans[selectedPlan].premium.savings && (
                  <p className="mt-2 text-sm text-success font-medium">{plans[selectedPlan].premium.savings}</p>
                )}
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">For power users</p>
              </div>
            <div className="mt-6">
              <button
                onClick={() => handleUpgrade('premium')}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Upgrade to Premium'}
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="card p-6">
                          <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Enterprise</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">${plans[selectedPlan].enterprise.price}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">/{plans[selectedPlan].enterprise.period}</span>
                </div>
                {plans[selectedPlan].enterprise.savings && (
                  <p className="mt-2 text-sm text-success font-medium">{plans[selectedPlan].enterprise.savings}</p>
                )}
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">For organizations</p>
              </div>
            <div className="mt-6">
              <button
                onClick={() => handleUpgrade('enterprise')}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Contact Sales'}
              </button>
            </div>
          </div>
        </div>

        {/* Features Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-primary-800/20">
            <h2 className="text-xl font-semibold text-primary-600 dark:text-primary-400">Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-light-secondary dark:bg-bg-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">Free</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">Pro</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">Premium</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-400 uppercase tracking-wider">Enterprise</th>
                </tr>
              </thead>
              <tbody className="bg-bg-light-primary dark:bg-bg-primary divide-y divide-neutral-300 dark:divide-neutral-700">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <tr key={index} className="hover:bg-bg-light-secondary dark:hover:bg-bg-secondary transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 text-primary-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{feature.name}</div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">{feature.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.free ? (
                          <CheckIcon className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.pro ? (
                          <CheckIcon className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.premium ? (
                          <CheckIcon className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {feature.enterprise ? (
                          <CheckIcon className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-primary-600 dark:text-glow-primary text-center mb-8">
            Frequently Asked Questions
          </h2>
                      <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Can I cancel my subscription anytime?
                </h3>
                <p className="mt-2 text-neutral-700 dark:text-neutral-300">
                  Yes, you can cancel your subscription at any time. You'll continue to have access to your current tier features until the end of your current billing period.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  What payment methods do you accept?
                </h3>
                <p className="mt-2 text-neutral-700 dark:text-neutral-300">
                  We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through Stripe.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Is there a free trial?
                </h3>
                <p className="mt-2 text-neutral-700 dark:text-neutral-300">
                  Yes! You can try Premium features free for 7 days. No credit card required to start your trial.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  How often is the data updated?
                </h3>
                <p className="mt-2 text-neutral-700 dark:text-neutral-300">
                  Our congressional trading data is updated daily from official sources. Premium users get real-time alerts when new trades are reported.
                </p>
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  How does your free tier compare to Capitol Trades?
                </h3>
                <p className="mt-2 text-neutral-700 dark:text-neutral-300">
                  Our free tier includes trade alerts, basic portfolio analytics, and CSV export—features that Capitol Trades reserves for paid users. We believe in transparency and want to give you more value from the start.
                </p>
              </div>
            </div>
        </div>

        {/* Current Subscription Info */}
        {subscriptionInfo && (
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-primary-400 mb-4">Current Subscription</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Plan:</span>
                  <span className="font-medium text-neutral-100">
                    {stripeService.getTierDisplayName(subscriptionInfo.tier)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Status:</span>
                  <span className={`font-medium ${
                    subscriptionInfo.status === 'active' ? 'text-success' : 'text-warning'
                  }`}>
                    {subscriptionInfo.status}
                  </span>
                </div>
                {subscriptionInfo.current_period_end && (
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Next billing:</span>
                    <span className="text-neutral-100">
                      {new Date(subscriptionInfo.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {subscriptionInfo.cancel_at_period_end && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <p className="text-warning text-sm">
                      ⚠️ Your subscription will be canceled at the end of the current billing period.
                    </p>
                  </div>
                )}
              </div>
              
              {subscriptionInfo.stripe_customer_id && (
                <div className="mt-6">
                  <button
                    onClick={handleManageSubscription}
                    className="btn-outline w-full"
                  >
                    Manage Subscription
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <p className="text-neutral-700 dark:text-neutral-300">
            Have questions? Contact us at{' '}
            <a href="mailto:support@capitolscope.com" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-300">
              support@capitolscope.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default PremiumSignup; 