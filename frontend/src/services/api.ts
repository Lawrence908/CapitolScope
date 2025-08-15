import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  CongressMember,
  CongressionalTrade,
  PaginatedResponse,
  TradeFilters,
  MemberFilters,
  DataQualityStats,
  MemberProfile,
  APIError,
} from '../types';

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8001') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const apiError: APIError = {
            detail: error.response.data?.detail || 'An error occurred',
            status_code: error.response.status,
          };
          console.error('API Error:', apiError);
          return Promise.reject(apiError);
        }
        console.error('Network Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Congressional Members
  async getMembers(
    filters: MemberFilters = {},
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<CongressMember>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.client.get(`/api/v1/members/?${params}`);
    return response.data.data;
  }

  async getMember(id: string): Promise<CongressMember> {
    const response = await this.client.get(`/api/v1/members/${id}`);
    return response.data.data; // Extract the data field from the response envelope
  }

  async getMemberProfile(id: number): Promise<MemberProfile> {
    const response = await this.client.get(`/api/v1/members/${id}/profile`);
    return response.data;
  }

  // Congressional Trades
  async getTrades(
    filters: TradeFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<CongressionalTrade>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    // Handle amount_range filter
    const { amount_range, ...otherFilters } = filters;
    if (amount_range) {
      const [min, max] = amount_range.split('-');
      if (min) {
        params.append('amount_min', (parseInt(min) * 100).toString()); // Convert to cents
      }
      if (max && max !== '+') {
        params.append('amount_max', (parseInt(max) * 100).toString()); // Convert to cents
      }
      // Handle the case where max is '+' (unlimited upper bound)
      if (max === '+') {
        // Don't set amount_max, which means no upper limit
        // The backend will handle this as "greater than amount_min"
      }
    }
    
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v.toString()));
      } else {
        params.append(key, value.toString());
      }
    });
    const response = await this.client.get(`/api/v1/trades?${params}`);
    return response.data.data;
  }

  async getTrade(id: number): Promise<CongressionalTrade> {
    const response = await this.client.get(`/api/v1/congressional/trades/${id}`);
    return response.data;
  }

  async getMemberTrades(
    memberId: number,
    page: number = 1,
    perPage: number = 50
  ): Promise<PaginatedResponse<CongressionalTrade>> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.client.get(
      `/api/v1/congressional/members/${memberId}/trades?${params}`
    );
    return response.data;
  }

  // Data Quality
  async getDataQualityStats(): Promise<DataQualityStats> {
    const response = await this.client.get('/api/v1/trades/data-quality/stats');
    return response.data;
  }

  // Search
  async searchTrades(query: string, page: number = 1, perPage: number = 50): Promise<PaginatedResponse<CongressionalTrade>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.client.get(`/api/v1/congressional/trades/search?${params}`);
    return response.data;
  }

  async searchMembers(query: string, page: number = 1, perPage: number = 50): Promise<PaginatedResponse<CongressMember>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await this.client.get(`/api/v1/congressional/members/search?${params}`);
    return response.data;
  }

  // Analytics
  async getTopTradingMembers(limit: number = 10): Promise<CongressMember[]> {
    const response = await this.client.get(`/api/v1/trades/analytics/top-trading-members?limit=${limit}`);
    return response.data.data;
  }

  async getTopTradedTickers(limit: number = 10): Promise<Array<{ ticker: string; count: number; total_value: number }>> {
    const response = await this.client.get(`/api/v1/trades/analytics/top-traded-tickers?limit=${limit}`);
    return response.data.data;
  }

  async getTradingActivity(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<Array<{ date: string; count: number; volume: number }>> {
    const response = await this.client.get(`/api/v1/congressional/analytics/trading-activity?period=${period}`);
    return response.data.data;
  }

  async getPartyDistribution(): Promise<Record<string, number>> {
    const response = await this.client.get('/api/v1/trades/analytics/party-distribution');
    return response.data.data;
  }

  async getChamberDistribution(): Promise<Record<string, number>> {
    const response = await this.client.get('/api/v1/trades/analytics/chamber-distribution');
    return response.data.data;
  }

  async getAmountDistribution(): Promise<Record<string, number>> {
    const response = await this.client.get('/api/v1/trades/analytics/amount-distribution');
    return response.data.data;
  }

  async getVolumeOverTime(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<Array<{ date: string; count: number; volume: number }>> {
    const response = await this.client.get(`/api/v1/trades/analytics/volume-over-time?period=${period}`);
    return response.data.data;
  }
}

// Create and export a singleton instance
export const apiClient = new APIClient();
export default apiClient; 