import React, { useState, useEffect, useCallback } from 'react';

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { CongressionalTrade, TradeFilters, PaginatedResponse } from '../types/index';
import apiClient from '../services/api';

const TradeBrowser: React.FC = () => {
  const [trades, setTrades] = useState<PaginatedResponse<CongressionalTrade> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TradeFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // Fetch trades with current filters and pagination
  const fetchTrades = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setFilterLoading(true);
      setError(null);
      
      const response = await apiClient.getTrades(filters, page, 50);
      setTrades(response);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to fetch trades. Please try again.');
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchTrades(1);
  }, [fetchTrades]);

  // Handle filter changes
  const handleFilterChange = (key: keyof TradeFilters, value: string | number | undefined) => {
    setFilters((prev: TradeFilters) => ({
      ...prev,
      [key]: value === '' ? undefined : 
        // Convert single values to arrays for backend compatibility
        key === 'parties' || key === 'chambers' || key === 'transaction_types' || key === 'owners' || key === 'tickers'
          ? (value ? [value] : undefined)
          : value,
    }));
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev: TradeFilters) => ({
      ...prev,
      search: searchQuery || undefined,
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };



  const formatCentsToDollars = (cents?: number | null) => {
    if (cents === undefined || cents === null || cents === 0) return 'N/A';
    const dollars = cents / 100;
    if (dollars >= 1000000) {
      return `$${(dollars / 1000000).toFixed(1)}M`;
    } else if (dollars >= 1000) {
      return `$${(dollars / 1000).toFixed(0)}K`;
    } else {
      return `$${dollars.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  };



  // Get transaction type icon and color
  const getTransactionTypeStyle = (type: string) => {
    switch (type) {
      case 'P':
        return { icon: ArrowUpIcon, color: 'text-green-600' };
      case 'S':
        return { icon: ArrowDownIcon, color: 'text-red-600' };
      case 'E':
        return { icon: ExclamationTriangleIcon, color: 'text-yellow-600' };
      default:
        return { icon: ExclamationTriangleIcon, color: 'text-yellow-600' };
    }
  };

  // Helper for party badge
  const getPartyBadge = (party: string | null | undefined) => {
    if (!party) return <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 font-medium shadow-sm" aria-label="Unknown party">Unknown</span>;
    switch (party.toLowerCase()) {
      case 'democratic':
      case 'd':
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-600/20 border border-primary-500/40 text-primary-300 font-medium shadow-sm shadow-primary-500/20" aria-label="Democratic">Democratic</span>;
      case 'republican':
      case 'r':
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary-600/20 border border-secondary-500/40 text-secondary-300 font-medium shadow-sm shadow-secondary-500/20" aria-label="Republican">Republican</span>;
      case 'independent':
      case 'i':
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 font-medium shadow-sm" aria-label="Independent">Independent</span>;
      default:
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 font-medium shadow-sm" aria-label={party}>{party}</span>;
    }
  };

  // Helper for chamber badge
  const getChamberBadge = (chamber: string | null | undefined) => {
    if (!chamber) return <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 font-medium shadow-sm" aria-label="Unknown chamber">Unknown</span>;
    switch (chamber.toLowerCase()) {
      case 'senate':
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-600/20 border border-primary-500/40 text-primary-300 font-medium shadow-sm shadow-primary-500/20" aria-label="Senate">Senate</span>;
      case 'house':
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-secondary-600/20 border border-secondary-500/40 text-secondary-300 font-medium shadow-sm shadow-secondary-500/20" aria-label="House">House</span>;
      default:
        return <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 font-medium shadow-sm" aria-label={chamber}>{chamber}</span>;
    }
  };

  // Patch: Ensure trades.items is always an array
  const tradeItems = trades?.items ?? [];

  if (loading && !trades) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to ensure a string is always passed
  const safeString = (val: string | null | undefined) => (typeof val === 'string' ? val : '');

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header with search and filters */}
      <div className="card p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-neutral-900 dark:text-white">Congressional Trades</h2>
            <p className="text-xs lg:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {trades?.total ? `${trades.total.toLocaleString()} total trades` : 'Loading...'}
            </p>
            {trades && trades.total > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 lg:gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                <span>📊 {trades.items.filter(t => t.transaction_type === 'P').length} purchases</span>
                <span>📉 {trades.items.filter(t => t.transaction_type === 'S').length} sales</span>
                <span>💰 {trades.items.filter(t => t.amount_exact && t.amount_exact >= 1000000).length} major trades</span>
                <span>👥 {new Set(trades.items.map(t => t.member_name)).size} members</span>
                {filters.amount_range && (
                  <span className="text-primary-600 dark:text-primary-400">
                    🔍 Filtered by amount range
                  </span>
                )}
                {filterLoading && (
                  <span className="flex items-center text-primary-600 dark:text-primary-400">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                    Updating...
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2 flex-1 sm:flex-none"
            >
              <FunnelIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              onClick={() => {
                // TODO: Implement CSV export
                alert('Export functionality coming soon!');
              }}
              className="btn-secondary flex items-center gap-2 flex-1 sm:flex-none"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by member name, ticker, or asset description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </form>

        {/* Quick Amount Filters */}
        <div className="mt-4">
          <span className="text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 mr-2">Quick Filters:</span>
          <div className="flex flex-wrap gap-1 lg:gap-2 items-center mt-2">
            {[
              { label: '$1K-$15K', value: '1001-15000', description: 'Standard congressional range: $1,001 - $15,000' },
              { label: '$15K-$50K', value: '15001-50000', description: 'Standard congressional range: $15,001 - $50,000' },
              { label: '$50K-$100K', value: '50001-100000', description: 'Standard congressional range: $50,001 - $100,000' },
              { label: '$100K-$250K', value: '100001-250000', description: 'Standard congressional range: $100,001 - $250,000' },
              { label: '$250K-$500K', value: '250001-500000', description: 'Standard congressional range: $250,001 - $500,000' },
              { label: '$500K-$1M', value: '500001-1000000', description: 'Standard congressional range: $500,001 - $1,000,000' },
              { label: '$1M+', value: '1000001-10000000', description: 'Standard congressional range: $1,000,001+' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterChange('amount_range', filter.value)}
                className={`px-2 lg:px-3 py-1 text-xs rounded-full border transition-colors ${
                  filters.amount_range === filter.value
                    ? 'bg-primary-600 text-bg-primary border-primary-600'
                    : 'bg-bg-light-secondary dark:bg-bg-secondary text-neutral-700 dark:text-neutral-300 border-neutral-400 dark:border-neutral-600 hover:bg-bg-light-tertiary dark:hover:bg-bg-tertiary'
                }`}
                title={filter.description}
              >
                {filter.label}
              </button>
            ))}
            {filters.amount_range && (
              <button
                onClick={() => handleFilterChange('amount_range', undefined)}
                className="px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-4 card transition-colors duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Transaction Type
                </label>
                <select
                  value={filters.transaction_types || ''}
                  onChange={(e) => handleFilterChange('transaction_types', e.target.value as any)}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  <option value="P">Purchase</option>
                  <option value="S">Sale</option>
                  <option value="E">Exchange</option>
                </select>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Party
                </label>
                <select
                  value={filters.parties || ''}
                  onChange={(e) => handleFilterChange('parties', e.target.value as any)}
                  className="input-field"
                >
                  <option value="">All Parties</option>
                  <option value="R">Republican</option>
                  <option value="D">Democratic</option>
                  <option value="I">Independent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Chamber
                </label>
                <select
                  value={filters.chambers || ''}
                  onChange={(e) => handleFilterChange('chambers', e.target.value as any)}
                  className="input-field"
                >
                  <option value="">All Chambers</option>
                  <option value="House">House</option>
                  <option value="Senate">Senate</option>
                </select>
              </div>



              <div>
                <label className="block text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.transaction_date_from || ''}
                  onChange={(e) => handleFilterChange('transaction_date_from', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.transaction_date_to || ''}
                  onChange={(e) => handleFilterChange('transaction_date_to', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Ticker
                </label>
                <input
                  type="text"
                  placeholder="e.g., AAPL, MSFT"
                  value={filters.tickers?.[0] || ''}
                  onChange={(e) => handleFilterChange('tickers', e.target.value ? e.target.value : undefined)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs lg:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Amount Range
                </label>
                <select
                  value={filters.amount_range || ''}
                  onChange={(e) => handleFilterChange('amount_range', e.target.value as any)}
                  className="input-field"
                >
                  <option value="">All Amounts</option>
                  <option value="1-1000">$1 - $1,000</option>
                  <option value="1001-15000">$1,001 - $15,000</option>
                  <option value="15001-50000">$15,001 - $50,000</option>
                  <option value="50001-100000">$50,001 - $100,000</option>
                  <option value="100001-250000">$100,001 - $250,000</option>
                  <option value="250001-500000">$250,001 - $500,000</option>
                  <option value="500001-1000000">$500,001 - $1,000,000</option>
                  <option value="1000001-10000000">$1,000,001+</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-error" />
            <div className="ml-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trades table */}
      {trades && (
        <div className="card overflow-hidden">
          {tradeItems.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              <p className="text-lg font-semibold mb-2">No trades found</p>
              <p className="text-sm">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop table */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table">
                <thead className="bg-bg-light-secondary dark:bg-bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                      Owner
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-bg-light-primary dark:bg-bg-primary divide-y divide-neutral-300 dark:divide-neutral-700">
                  {tradeItems.map((trade: CongressionalTrade) => {
                    const { icon: TypeIcon, color } = getTransactionTypeStyle(trade.transaction_type || '');
                    
                    return (
                      <tr key={trade.id} className="hover:bg-bg-light-secondary dark:hover:bg-bg-secondary">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100" aria-label="Member name">
                              {trade.member_name || 'Unknown'}
                            </span>
                            <div className="flex gap-2 mt-1">
                              {getPartyBadge(trade.member_party)}
                              {getChamberBadge(trade.member_chamber)}
                              {(() => { const memberState = trade.member_state ? trade.member_state : ''; return memberState && (
                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 font-medium shadow-sm" aria-label={memberState || ''}>{memberState}</span>
                              ); })()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-neutral-100 font-semibold" aria-label="Ticker">
                            {trade.ticker ? (
                              <span className="font-mono font-semibold">{trade.ticker}</span>
                            ) : (
                              <span className="text-neutral-400">No ticker</span>
                            )}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs truncate" aria-label="Asset name">
                            {trade.asset_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${color}`}> {/* color is still used for icon */}
                            <TypeIcon className="h-4 w-4 mr-1" />
                            <span className="capitalize text-sm font-semibold text-neutral-900 dark:text-neutral-100" aria-label="Transaction type">
                              {trade.transaction_type === 'P' ? 'Purchase' : 
                               trade.transaction_type === 'S' ? 'Sale' : 
                               trade.transaction_type === 'E' ? 'Exchange' : 
                               trade.transaction_type || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold" aria-label="Amount">
                          <div className="flex items-center">
                            {trade.amount_exact !== undefined && trade.amount_exact !== null ? (
                              <span className="flex items-center">
                                {formatCentsToDollars(trade.amount_exact)}
                                {trade.amount_exact >= 1000000 && (
                                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-warning/20 border border-warning/30 text-warning rounded-full">
                                    Major
                                  </span>
                                )}
                              </span>
                            ) : (trade.amount_min !== undefined && trade.amount_min !== null && trade.amount_max !== undefined && trade.amount_max !== null) ? (
                              <span className="flex items-center">
                                {formatCentsToDollars(trade.amount_min)} - {formatCentsToDollars(trade.amount_max)}
                                {trade.amount_max >= 1000000 && (
                                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-warning/20 border border-warning/30 text-warning rounded-full">
                                    Major
                                  </span>
                                )}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100" aria-label="Date">
                          {formatDate(safeString(trade.transaction_date))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100" aria-label="Owner">
                          {trade.owner === 'SP' ? 'Spouse' : 
                           trade.owner === 'JT' ? 'Joint' :
                           trade.owner === 'DC' ? 'Child' : 'Self'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile card layout */}
              <div className="lg:hidden space-y-4 p-4">
                {tradeItems.map((trade: CongressionalTrade) => {
                  const { icon: TypeIcon, color } = getTransactionTypeStyle(trade.transaction_type || '');
                  
                  return (
                    <div key={trade.id} className="bg-bg-light-secondary dark:bg-bg-secondary rounded-lg p-4 border border-neutral-300 dark:border-neutral-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm" aria-label="Member name">
                            {trade.member_name || 'Unknown'}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getPartyBadge(trade.member_party)}
                            {getChamberBadge(trade.member_chamber)}
                            {trade.member_state && (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 font-medium shadow-sm">
                                {trade.member_state}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center ${color} ml-2`}>
                          <TypeIcon className="h-4 w-4 mr-1" />
                                                      <span className="capitalize text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {trade.transaction_type === 'P' ? 'Purchase' : 
                             trade.transaction_type === 'S' ? 'Sale' : 
                             trade.transaction_type === 'E' ? 'Exchange' : 
                             trade.transaction_type || 'Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Asset:</span>
                          <div className="text-right">
                            <div className="text-neutral-900 dark:text-neutral-100 font-semibold">
                              {trade.ticker ? (
                                <span className="font-mono">{trade.ticker}</span>
                              ) : (
                                <span className="text-neutral-500 dark:text-neutral-400">No ticker</span>
                              )}
                            </div>
                            {trade.asset_name && (
                              <div className="text-neutral-600 dark:text-neutral-300 text-xs truncate max-w-32">
                                {trade.asset_name}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Amount:</span>
                          <div className="text-right">
                            <div className="text-neutral-900 dark:text-neutral-100 font-semibold">
                              {trade.amount_exact !== undefined && trade.amount_exact !== null ? (
                                <span className="flex items-center">
                                  {formatCentsToDollars(trade.amount_exact)}
                                  {trade.amount_exact >= 1000000 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-warning/20 border border-warning/30 text-warning rounded-full">
                                      Major
                                    </span>
                                  )}
                                </span>
                              ) : (trade.amount_min !== undefined && trade.amount_min !== null && trade.amount_max !== undefined && trade.amount_max !== null) ? (
                                <span className="flex items-center">
                                  {formatCentsToDollars(trade.amount_min)} - {formatCentsToDollars(trade.amount_max)}
                                  {trade.amount_max >= 1000000 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-warning/20 border border-warning/30 text-warning rounded-full">
                                      Major
                                    </span>
                                  )}
                                </span>
                              ) : (
                                'N/A'
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Date:</span>
                          <span className="text-neutral-900 dark:text-neutral-100">{formatDate(safeString(trade.transaction_date))}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Owner:</span>
                          <span className="text-neutral-900 dark:text-neutral-100">
                            {trade.owner === 'SP' ? 'Spouse' : 
                             trade.owner === 'JT' ? 'Joint' :
                             trade.owner === 'DC' ? 'Child' : 'Self'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {trades.pages > 1 && (
            <div className="bg-bg-light-secondary dark:bg-bg-secondary px-4 py-3 flex items-center justify-between border-t border-neutral-300 dark:border-neutral-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchTrades(currentPage - 1)}
                  disabled={!trades.has_prev}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchTrades(currentPage + 1)}
                  disabled={!trades.has_next}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Showing{' '}
                    <span className="font-medium">
                      {(currentPage - 1) * 50 + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 50, trades.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{trades.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchTrades(currentPage - 1)}
                      disabled={!trades.has_prev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-400 dark:border-neutral-600 bg-bg-light-secondary dark:bg-bg-secondary text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-bg-light-tertiary dark:hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-neutral-400 dark:border-neutral-600 bg-bg-light-secondary dark:bg-bg-secondary text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Page {currentPage} of {trades.pages}
                    </span>
                    <button
                      onClick={() => fetchTrades(currentPage + 1)}
                      disabled={!trades.has_next}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-400 dark:border-neutral-600 bg-bg-light-secondary dark:bg-bg-secondary text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-bg-light-tertiary dark:hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TradeBrowser; 