import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon, ChartBarIcon, UserIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../services/api';
import type { CongressMember, CongressionalTrade } from '../types';

const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<CongressMember | null>(null);
  const [recentTrades] = useState<CongressionalTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Use the proper getMember API endpoint
        const memberData = await apiClient.getMember(id);
        console.log('Member data received:', memberData);
        setMember(memberData);
        
        // TODO: Fetch recent trades for this member
        // const tradesResponse = await apiClient.getMemberTrades(id, 1, 10);
        // setRecentTrades(tradesResponse.items);
      } catch (err) {
        setError('Failed to load member data');
        console.error('Error fetching member:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-400">Loading member profile...</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="card p-4 lg:p-6">
        <div className="flex items-center mb-4">
          <Link to="/members" className="btn-secondary btn-sm mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Members
          </Link>
        </div>
        <div className="text-center">
          <h2 className="text-lg lg:text-xl font-semibold text-neutral-100 mb-2">
            {error || 'Member not found'}
          </h2>
          <p className="text-neutral-400">
            The requested member could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/members" className="btn-secondary btn-sm mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Members
          </Link>
        </div>
        <div className="text-xs lg:text-sm text-neutral-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Member Info Card */}
      <div className="card p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-neutral-700 rounded-full flex items-center justify-center">
              <UserIcon className="h-10 w-10 lg:h-12 lg:w-12 text-neutral-400" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-100 mb-2">
              {member.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-4 mb-4">
              {member.party && (
                <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium shadow-sm ${
                  member.party === 'D' 
                    ? 'bg-primary-600/20 border border-primary-500/40 text-primary-300 shadow-primary-500/20'
                    : member.party === 'R'
                    ? 'bg-secondary-600/20 border border-secondary-500/40 text-secondary-300 shadow-secondary-500/20'
                    : 'bg-neutral-600/20 border border-neutral-500/30 text-neutral-300'
                }`}>
                  {member.party === 'D' ? 'Democratic' : member.party === 'R' ? 'Republican' : member.party}
                </span>
              )}
              {member.chamber && (
                <span className={`px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium shadow-sm ${
                  member.chamber.toLowerCase() === 'senate'
                    ? 'bg-primary-600/20 border border-primary-500/40 text-primary-300 shadow-primary-500/20'
                    : member.chamber.toLowerCase() === 'house'
                    ? 'bg-secondary-600/20 border border-secondary-500/40 text-secondary-300 shadow-secondary-500/20'
                    : 'bg-neutral-600/20 border border-neutral-500/30 text-neutral-300'
                }`}>
                  {member.chamber}
                </span>
              )}
              {member.state && (
                <span className="px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-neutral-600/20 border border-neutral-500/30 text-neutral-300 shadow-sm">
                  {member.state}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-neutral-100">
                  {member.trade_count?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-xs lg:text-sm text-neutral-400">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-neutral-100">
                  {member.total_trade_value ? `$${(member.total_trade_value / 100).toLocaleString()}` : 'N/A'}
                </div>
                <div className="text-xs lg:text-sm text-neutral-400">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-xl lg:text-2xl font-bold text-neutral-100">
                  {member.portfolio_value ? `$${(member.portfolio_value / 100).toLocaleString()}` : 'N/A'}
                </div>
                <div className="text-xs lg:text-sm text-neutral-400">Portfolio Value</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-semibold text-neutral-100 flex items-center">
            <DocumentTextIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            Recent Trades
          </h2>
          <Link to="/trades" className="text-xs lg:text-sm text-primary-400 hover:text-primary-300">
            View all trades →
          </Link>
        </div>
        
        {recentTrades.length > 0 ? (
          <div className="space-y-3 lg:space-y-4">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between py-2 lg:py-3 border-b border-neutral-700 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-neutral-100 text-sm lg:text-base">
                      {trade.ticker || 'Unknown'}
                    </span>
                    <span className="text-xs lg:text-sm text-neutral-400">
                      {trade.transaction_type}
                    </span>
                  </div>
                  <div className="text-xs lg:text-sm text-neutral-400">
                    {new Date(trade.transaction_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right ml-2">
                  <div className="font-medium text-neutral-100 text-sm lg:text-base">
                    {trade.estimated_value ? `$${(trade.estimated_value / 100).toLocaleString()}` : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 lg:py-8">
            <ChartBarIcon className="h-10 w-10 lg:h-12 lg:w-12 text-neutral-400 mx-auto mb-3 lg:mb-4" />
            <p className="text-neutral-400 text-sm lg:text-base">No recent trades found</p>
          </div>
        )}
      </div>

      {/* Additional sections can be added here */}
      <div className="card p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-neutral-100 mb-3 lg:mb-4">Additional Information</h2>
        <p className="text-neutral-400 text-sm lg:text-base">
          More detailed member information, voting records, committee assignments, and advanced analytics will be available soon.
        </p>
      </div>
    </div>
  );
};

export default MemberProfile; 