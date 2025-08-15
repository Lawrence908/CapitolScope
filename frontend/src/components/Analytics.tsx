import React, { useState, useEffect, Suspense } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import PremiumFeatureWrapper from './PremiumFeatureWrapper';
import apiClient from '../services/api';

// Lazy load chart components to reduce bundle size
const ChartComponents = React.lazy(() => import('./charts'));

// Loading component for charts
const ChartLoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    <span className="ml-2 text-sm text-neutral-400">Loading chart...</span>
  </div>
);

interface AnalyticsData {
  topTradingMembers: Array<{
    member_name: string;
    total_trades: number;
    total_value: number;
  }>;
  topTradedTickers: Array<{
    ticker: string;
    count: number;
    total_value: number;
  }>;
  partyDistribution: Record<string, number>;
  chamberDistribution: Record<string, number>;
  amountDistribution: Record<string, number>;
  volumeOverTime: Array<{
    date: string;
    count: number;
    volume: number;
  }>;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Check subscription tier
  const subscriptionTier = user?.subscription_tier?.toLowerCase();
  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';
  const isPro = subscriptionTier === 'pro' || isPremium;
  const isFree = subscriptionTier === 'free' || !subscriptionTier;

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all analytics data in parallel
        const [
          topTradingMembers,
          topTradedTickers,
          partyDistribution,
          chamberDistribution,
          amountDistribution,
          volumeOverTime
        ] = await Promise.all([
          apiClient.getTopTradingMembers(10),
          apiClient.getTopTradedTickers(10),
          apiClient.getPartyDistribution(),
          apiClient.getChamberDistribution(),
          apiClient.getAmountDistribution(),
          apiClient.getVolumeOverTime(timePeriod)
        ]);

        const analyticsData: AnalyticsData = {
          topTradingMembers: topTradingMembers.map(member => ({
            member_name: member.full_name || member.member_name || 'Unknown',
            total_trades: member.trade_count || 0,
            total_value: member.total_value || 0
          })),
          topTradedTickers,
          partyDistribution,
          chamberDistribution,
          amountDistribution,
          volumeOverTime
        };

        setData(analyticsData);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timePeriod]);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  // Helper function to format dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: timePeriod === 'monthly' ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">No analytics data available.</div>;
  }

  // Prepare chart data
  const topMembersChartData = {
    labels: data.topTradingMembers.map(member => member.member_name),
    datasets: [{
      label: 'Total Trades',
      data: data.topTradingMembers.map(member => member.total_trades),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }]
  };

  const topTickersChartData = {
    labels: data.topTradedTickers.map(ticker => ticker.ticker),
    datasets: [{
      label: 'Trade Count',
      data: data.topTradedTickers.map(ticker => ticker.count),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
    }]
  };

  const partyChartData = {
    labels: Object.keys(data.partyDistribution),
    datasets: [{
      label: 'Trades by Party',
      data: Object.values(data.partyDistribution),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',   // Blue for Democratic
        'rgba(239, 68, 68, 0.8)',    // Red for Republican
        'rgba(107, 114, 128, 0.8)',  // Gray for Independent/Other
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(107, 114, 128, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const chamberChartData = {
    labels: Object.keys(data.chamberDistribution),
    datasets: [{
      label: 'Trades by Chamber',
      data: Object.values(data.chamberDistribution),
      backgroundColor: [
        'rgba(147, 51, 234, 0.8)',   // Purple for Senate
        'rgba(34, 197, 94, 0.8)',    // Green for House
        'rgba(107, 114, 128, 0.8)',  // Gray for Unknown
      ],
      borderColor: [
        'rgba(147, 51, 234, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(107, 114, 128, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const amountChartData = {
    labels: Object.keys(data.amountDistribution),
    datasets: [{
      label: 'Number of Trades',
      data: Object.values(data.amountDistribution),
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 1,
    }]
  };

  const volumeChartData = {
    labels: data.volumeOverTime.map(item => formatDate(item.date)),
    datasets: [{
      label: 'Trade Volume',
      data: data.volumeOverTime.map(item => item.volume / 100), // Convert cents to dollars
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }]
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="card p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-neutral-100">Analytics Dashboard</h2>
            <p className="text-sm lg:text-base text-neutral-400 mt-1">
              Comprehensive analysis of congressional trading activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-neutral-400" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="input-field text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Premium Upgrade Banner for Free Users */}
      {isFree && (
        <div className="card p-4 lg:p-6 bg-neon-gradient rounded-lg shadow-glow-primary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 lg:h-6 lg:w-6 text-bg-primary mr-2 lg:mr-3" />
              <div>
                <h4 className="text-base lg:text-lg font-bold text-bg-primary mb-1">Unlock Advanced Analytics</h4>
                <p className="text-bg-primary/80 text-xs lg:text-sm">
                  Get access to comprehensive trading analytics, advanced charts, and detailed insights
                </p>
              </div>
            </div>
            <Link
              to="/premium"
              className="bg-bg-primary text-primary-400 px-3 lg:px-4 py-2 rounded-lg font-semibold hover:bg-bg-tertiary transition-colors duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm lg:text-base"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}

      {/* Top Trading Members */}
      <PremiumFeatureWrapper featureName="Top Trading Members Analytics" requiredTier="pro" showBadge={false}>
        <div className="card p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserGroupIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary-400" />
            <h3 className="text-base lg:text-lg font-semibold text-neutral-100">
              Top Trading Members
            </h3>
          </div>
          <Suspense fallback={<ChartLoadingSpinner />}>
            <ChartComponents.BarChart 
              data={topMembersChartData} 
              title="Members by Total Trades"
              height={300}
            />
          </Suspense>
        </div>
      </PremiumFeatureWrapper>

      {/* Top Traded Tickers */}
      <PremiumFeatureWrapper featureName="Most Traded Securities Analytics" requiredTier="pro" showBadge={false}>
        <div className="card p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary-400" />
            <h3 className="text-base lg:text-lg font-semibold text-neutral-100">
              Most Traded Securities
            </h3>
          </div>
          <Suspense fallback={<ChartLoadingSpinner />}>
            <ChartComponents.BarChart 
              data={topTickersChartData} 
              title="Securities by Trade Count"
              height={300}
            />
          </Suspense>
        </div>
      </PremiumFeatureWrapper>

      {/* Party and Chamber Distribution */}
      <PremiumFeatureWrapper featureName="Party and Chamber Distribution Analytics" requiredTier="pro" showBadge={false}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="card p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowTrendingUpIcon className="h-5 w-5 lg:h-6 lg:w-6 text-secondary-400" />
              <h3 className="text-base lg:text-lg font-semibold text-neutral-100">
                Trading by Party
              </h3>
            </div>
            <Suspense fallback={<ChartLoadingSpinner />}>
              <ChartComponents.PieChart 
                data={partyChartData} 
                title="Trades by Political Party"
                height={250}
              />
            </Suspense>
          </div>

          <div className="card p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CurrencyDollarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary-400" />
              <h3 className="text-base lg:text-lg font-semibold text-neutral-100">
                Trading by Chamber
              </h3>
            </div>
            <Suspense fallback={<ChartLoadingSpinner />}>
              <ChartComponents.DoughnutChart 
                data={chamberChartData} 
                title="Trades by Congressional Chamber"
                height={250}
              />
            </Suspense>
          </div>
        </div>
      </PremiumFeatureWrapper>

      {/* Amount Distribution */}
      <PremiumFeatureWrapper featureName="Trade Amount Distribution Analytics" requiredTier="pro" showBadge={false}>
        <div className="card p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <CurrencyDollarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary-400" />
            <h3 className="text-base lg:text-lg font-semibold text-neutral-100">
              Trade Amount Distribution
            </h3>
          </div>
          <Suspense fallback={<ChartLoadingSpinner />}>
            <ChartComponents.BarChart 
              data={amountChartData} 
              title="Trades by Amount Range"
              height={300}
            />
          </Suspense>
        </div>
      </PremiumFeatureWrapper>

      {/* Volume Over Time */}
      <PremiumFeatureWrapper featureName="Trading Volume Over Time Analytics" requiredTier="premium" showBadge={false}>
        <div className="card p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="h-5 w-5 lg:h-6 lg:w-6 text-secondary-400" />
            <h3 className="text-base lg:text-lg font-semibold text-neutral-100">
              Trading Volume Over Time
            </h3>
          </div>
          <Suspense fallback={<ChartLoadingSpinner />}>
            <ChartComponents.LineChart 
              data={volumeChartData} 
              title={`Trade Volume (${timePeriod})`}
              height={300}
            />
          </Suspense>
        </div>
      </PremiumFeatureWrapper>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="card p-4 lg:p-6">
          <div className="text-xs lg:text-sm text-neutral-400">Total Members</div>
          <div className="text-xl lg:text-2xl font-bold text-neutral-100">
            {data.topTradingMembers.length}
          </div>
        </div>
        <div className="card p-4 lg:p-6">
          <div className="text-xs lg:text-sm text-neutral-400">Total Securities</div>
          <div className="text-xl lg:text-2xl font-bold text-neutral-100">
            {data.topTradedTickers.length}
          </div>
        </div>
        <div className="card p-4 lg:p-6">
          <div className="text-xs lg:text-sm text-neutral-400">Total Trades</div>
          <div className="text-xl lg:text-2xl font-bold text-neutral-100">
            {Object.values(data.partyDistribution).reduce((a, b) => a + b, 0).toLocaleString()}
          </div>
        </div>
        <div className="card p-4 lg:p-6">
          <div className="text-xs lg:text-sm text-neutral-400">Total Volume</div>
          <div className="text-xl lg:text-2xl font-bold text-neutral-100">
            {formatCurrency(data.volumeOverTime.reduce((sum, item) => sum + item.volume, 0) / 100)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 