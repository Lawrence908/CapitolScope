import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { CongressMember, MemberFilters, PaginatedResponse } from '../types';
import apiClient from '../services/api';

const MembersBrowser: React.FC = () => {
  const [members, setMembers] = useState<PaginatedResponse<CongressMember> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MemberFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMembers = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMembers({ ...filters }, page, 20);
      setMembers(response);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to fetch members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMembers(1);
  }, [fetchMembers]);

  const handleFilterChange = (key: keyof MemberFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: searchQuery || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
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

  if (loading && !members) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header with search and filters */}
      <div className="card p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-white">Congress Members</h2>
            <p className="text-xs lg:text-sm text-neutral-400 mt-1">
              {members?.total ? `${members.total.toLocaleString()} total members` : 'Loading...'}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-2 flex-1 sm:flex-none"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, state, or party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-4"
            />
          </div>
        </form>
        {/* Filters panel */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-neutral-300 mb-1">Party</label>
            <select
              value={filters.party || ''}
              onChange={(e) => handleFilterChange('party', e.target.value)}
              className="input-field"
            >
              <option value="">All Parties</option>
              <option value="Democratic">Democratic</option>
              <option value="Republican">Republican</option>
              <option value="Independent">Independent</option>
            </select>
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-neutral-300 mb-1">State</label>
            <input
              type="text"
              placeholder="e.g., CA, NY"
              value={filters.state || ''}
              onChange={(e) => handleFilterChange('state', e.target.value.toUpperCase())}
              className="input-field"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-xs lg:text-sm font-medium text-neutral-300 mb-1">Chamber</label>
            <select
              value={filters.chamber || ''}
              onChange={(e) => handleFilterChange('chamber', e.target.value as any)}
              className="input-field"
            >
              <option value="">All Chambers</option>
              <option value="House">House</option>
              <option value="Senate">Senate</option>
            </select>
          </div>
        </div>
      </div>
      {/* Error message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-md p-4">
          <div className="flex">
            <span className="text-error font-bold mr-2">!</span>
            <div className="ml-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          </div>
        </div>
      )}
      {/* Members table */}
      {members && (
        <div className="card overflow-hidden">
          {members.items.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              <p className="text-lg font-semibold mb-2">No members found</p>
              <p className="text-sm">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop table */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden lg:table">
                <thead className="bg-bg-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Party</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">State</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Chamber</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Total Trades</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Total $ Volume</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-bg-primary divide-y divide-neutral-700">
                  {members.items.map((member) => (
                    <tr key={member.id} className="hover:bg-bg-secondary">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/members/${member.id}`} className="font-semibold text-primary-400 hover:text-primary-300 hover:underline">
                          {member.full_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPartyBadge(member.party)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.state}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getChamberBadge(member.chamber)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.trade_count?.toLocaleString() ?? 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.total_trade_value ? `$${(member.total_trade_value / 100).toLocaleString()}` : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link to={`/members/${member.id}`} className="btn-primary btn-sm">Profile</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card layout */}
              <div className="lg:hidden space-y-4 p-4">
                {members.items.map((member) => (
                  <div key={member.id} className="bg-bg-secondary rounded-lg p-4 border border-neutral-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link to={`/members/${member.id}`} className="font-semibold text-primary-400 hover:text-primary-300 text-sm">
                          {member.full_name}
                        </Link>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getPartyBadge(member.party)}
                          {getChamberBadge(member.chamber)}
                          {member.state && (
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 font-medium shadow-sm">
                              {member.state}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link to={`/members/${member.id}`} className="btn-primary btn-sm ml-2">
                        Profile
                      </Link>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Total Trades:</span>
                        <span className="text-neutral-100 font-semibold">{member.trade_count?.toLocaleString() ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Total Volume:</span>
                        <span className="text-neutral-100 font-semibold">
                          {member.total_trade_value ? `$${(member.total_trade_value / 100).toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Pagination */}
          {members.pages > 1 && (
            <div className="bg-bg-secondary px-4 py-3 flex items-center justify-between border-t border-neutral-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchMembers(currentPage - 1)}
                  disabled={!members.has_prev}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchMembers(currentPage + 1)}
                  disabled={!members.has_next}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-300">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>{' '}
                    to{' '}
                    <span className="font-medium">{Math.min(currentPage * 20, members.total)}</span>{' '}
                    of{' '}
                    <span className="font-medium">{members.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchMembers(currentPage - 1)}
                      disabled={!members.has_prev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-600 bg-bg-secondary text-sm font-medium text-neutral-400 hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-neutral-600 bg-bg-secondary text-sm font-medium text-neutral-300">
                      Page {currentPage} of {members.pages}
                    </span>
                    <button
                      onClick={() => fetchMembers(currentPage + 1)}
                      disabled={!members.has_next}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-600 bg-bg-secondary text-sm font-medium text-neutral-400 hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MembersBrowser; 