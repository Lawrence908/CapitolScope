import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { CongressionalTrade, CongressMember, DataQualityStats } from '../types';
import apiClient from '../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DataQualityStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<CongressionalTrade[]>([]);
  const [topMembers, setTopMembers] = useState<CongressMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel
        const [statsResponse, tradesResponse, membersResponse] = await Promise.all([
          apiClient.getDataQualityStats(),
          apiClient.getTrades({}, 1, 10),
          apiClient.getTopTradingMembers(10),
        ]);

        setStats(statsResponse.data);
        setRecentTrades(tradesResponse.items || []);
        setTopMembers(membersResponse.data || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Trades',
      value: stats?.total_trades?.toLocaleString() || '0',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      link: '/trades',
    },
    {
      title: 'Congress Members',
      value: stats?.unique_members?.toLocaleString() || '0',
      icon: UserGroupIcon,
      color: 'bg-green-500',
      link: '/members',
    },
    {
      title: 'Unique Tickers',
      value: stats?.unique_tickers?.toLocaleString() || '0',
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
      link: '/trades',
    },
    {
      title: 'Missing Tickers',
      value: `${stats?.null_ticker_percentage?.toFixed(1) || '0'}%`,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
      link: '/data-quality',
    },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome header */}
      <div className="card p-4 lg:p-6">
        <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Welcome to CapitolScope
        </h2>
        <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400">
          Explore congressional trading data with powerful filtering and analytics tools.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="card p-4 lg:p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200"
            >
              <div className="flex items-center">
                <div className={`p-2 lg:p-3 rounded-lg bg-neon-gradient` }>
                  <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-bg-primary" />
                </div>
                <div className="ml-3 lg:ml-4">
                  <p className="text-xs lg:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {stat.title}
                  </p>
                  <p className="text-lg lg:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent trades and top members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent trades */}
        <div className="card p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-neutral-100">Recent Trades</h3>
            <Link
              to="/trades"
              className="text-xs lg:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3 lg:space-y-4">
            {recentTrades && recentTrades.length > 0 ? recentTrades.map((trade, index) => (
              <div key={trade.id || `trade-${index}`} className="flex items-center justify-between py-2 border-b border-primary-800/20 last:border-b-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {trade.member_name || 'Unknown'}
                  </p>
                  <p className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">
                    {trade.ticker ? (
                      <span className="font-mono">{trade.ticker}</span>
                    ) : (
                      <span className="text-neutral-500">No ticker</span>
                    )}
                    {' • '}
                    <span className="capitalize">{trade.transaction_type || 'Unknown'}</span>
                  </p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs lg:text-sm text-neutral-900 dark:text-neutral-100">
                    {trade.estimated_value ? `$${(trade.estimated_value / 100).toLocaleString()}` : 'N/A'}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {new Date(trade.transaction_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-neutral-600 dark:text-neutral-400">
                <p className="text-sm">No recent trades available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top trading members */}
        <div className="card p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-neutral-100">Top Trading Members</h3>
            <Link
              to="/members"
              className="text-xs lg:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3 lg:space-y-4">
            {topMembers && topMembers.length > 0 ? topMembers.map((member, index) => (
              <div key={member.id || `member-${index}`} className="flex items-center justify-between py-2 border-b border-primary-800/20 last:border-b-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {member.member_name}
                  </p>
                  <p className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">
                    {member.party} • {member.state}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs lg:text-sm text-neutral-900 dark:text-neutral-100">
                    {member.trade_count || 0} trades
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{member.chamber}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-neutral-600 dark:text-neutral-400">
                <p className="text-sm">No top members available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Party distribution */}
      {stats && (
        <div className="card p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Party Distribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.party_distribution && Object.entries(stats.party_distribution).map(([party, count]) => (
              <div key={party} className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{count.toString()}</div>
                <div className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400">{party}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  };
  
export default Dashboard; 