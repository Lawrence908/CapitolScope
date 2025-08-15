"""
Multi-source price data fetcher for CAP-25 implementation.

This module provides a robust price data ingestion system with:
- Multi-source fallback logic (YFinance, Alpha Vantage, Polygon)
- Rate limiting and error handling
- Data validation and quality checks
- Historical data backfill capabilities
"""

import asyncio
import aiohttp
import time
import logging
from typing import Dict, Optional, List, Tuple
from datetime import datetime, date, timedelta
from decimal import Decimal
import yfinance as yf
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class DataSource(Enum):
    """Available data sources for price data."""
    YFINANCE = "yfinance"
    ALPHA_VANTAGE = "alpha_vantage"
    POLYGON = "polygon"


@dataclass
class PriceData:
    """Standardized price data structure."""
    ticker: str
    date: date
    open_price: Decimal
    high_price: Decimal
    low_price: Decimal
    close_price: Decimal
    volume: int
    adjusted_close: Optional[Decimal] = None
    source: str = "unknown"
    data_quality: str = "good"


class RateLimiter:
    """Rate limiter for API calls."""
    
    def __init__(self, max_requests: int, time_window: int):
        self.max_requests = max_requests
        self.time_window = time_window  # seconds
        self.requests = []
    
    def can_proceed(self) -> bool:
        """Check if we can make another request."""
        now = time.time()
        # Remove old requests outside the time window
        self.requests = [req_time for req_time in self.requests 
                        if now - req_time < self.time_window]
        
        if len(self.requests) < self.max_requests:
            self.requests.append(now)
            return True
        
        return False
    
    def get_wait_time(self) -> float:
        """Get time to wait before next request."""
        if not self.requests:
            return 0.0
        
        oldest_request = min(self.requests)
        wait_time = self.time_window - (time.time() - oldest_request)
        return max(0.0, wait_time)


class YFinanceSource:
    """YFinance data source implementation."""
    
    def __init__(self):
        self.rate_limiter = RateLimiter(max_requests=2000, time_window=3600)  # 2000 requests per hour
        self.name = "yfinance"
    
    async def fetch_daily_price(self, ticker: str, target_date: date) -> Optional[PriceData]:
        """Fetch daily price data from YFinance."""
        if not self.rate_limiter.can_proceed():
            logger.warning(f"Rate limit exceeded for YFinance: {ticker}")
            return None
        
        try:
            # Get data for a range around the target date
            start_date = target_date - timedelta(days=5)
            end_date = target_date + timedelta(days=5)
            
            ticker_obj = yf.Ticker(ticker)
            hist = ticker_obj.history(start=start_date, end=end_date)
            
            if hist.empty:
                logger.warning(f"No data found for {ticker} on {target_date}")
                return None
            
            # Find the closest date to target_date
            target_date_str = target_date.strftime('%Y-%m-%d')
            if target_date_str in hist.index:
                row = hist.loc[target_date_str]
            else:
                # Find the closest available date
                available_dates = hist.index.date
                closest_date = min(available_dates, key=lambda x: abs((x - target_date).days))
                row = hist.loc[closest_date.strftime('%Y-%m-%d')]
            
            return PriceData(
                ticker=ticker,
                date=target_date,
                open_price=Decimal(str(row['Open'])),
                high_price=Decimal(str(row['High'])),
                low_price=Decimal(str(row['Low'])),
                close_price=Decimal(str(row['Close'])),
                volume=int(row['Volume']),
                adjusted_close=Decimal(str(row['Adj Close'])) if 'Adj Close' in row else None,
                source=self.name,
                data_quality="good"
            )
            
        except Exception as e:
            logger.error(f"YFinance error for {ticker}: {e}")
            return None


class AlphaVantageSource:
    """Alpha Vantage data source implementation."""
    
    def __init__(self):
        self.api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.rate_limiter = RateLimiter(max_requests=500, time_window=86400)  # 500 requests per day
        self.name = "alpha_vantage"
        
        if not self.api_key:
            logger.warning("Alpha Vantage API key not found")
    
    async def fetch_daily_price(self, ticker: str, target_date: date) -> Optional[PriceData]:
        """Fetch daily price data from Alpha Vantage."""
        if not self.api_key or not self.rate_limiter.can_proceed():
            return None
        
        try:
            url = "https://www.alphavantage.co/query"
            params = {
                "function": "TIME_SERIES_DAILY",
                "symbol": ticker,
                "apikey": self.api_key,
                "outputsize": "compact"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status != 200:
                        logger.error(f"Alpha Vantage API error: {response.status}")
                        return None
                    
                    data = await response.json()
                    
                    if "Error Message" in data:
                        logger.error(f"Alpha Vantage error: {data['Error Message']}")
                        return None
                    
                    time_series = data.get("Time Series (Daily)", {})
                    target_date_str = target_date.strftime('%Y-%m-%d')
                    
                    if target_date_str not in time_series:
                        logger.warning(f"No data for {ticker} on {target_date_str}")
                        return None
                    
                    daily_data = time_series[target_date_str]
                    
                    return PriceData(
                        ticker=ticker,
                        date=target_date,
                        open_price=Decimal(daily_data['1. open']),
                        high_price=Decimal(daily_data['2. high']),
                        low_price=Decimal(daily_data['3. low']),
                        close_price=Decimal(daily_data['4. close']),
                        volume=int(daily_data['5. volume']),
                        source=self.name,
                        data_quality="good"
                    )
                    
        except Exception as e:
            logger.error(f"Alpha Vantage error for {ticker}: {e}")
            return None


class PolygonSource:
    """Polygon.io data source implementation."""
    
    def __init__(self):
        self.api_key = os.getenv('POLYGON_API_KEY')
        self.rate_limiter = RateLimiter(max_requests=5000, time_window=60)  # 5000 requests per minute
        self.name = "polygon"
        
        if not self.api_key:
            logger.warning("Polygon API key not found")
    
    async def fetch_daily_price(self, ticker: str, target_date: date) -> Optional[PriceData]:
        """Fetch daily price data from Polygon."""
        if not self.api_key or not self.rate_limiter.can_proceed():
            return None
        
        try:
            url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{target_date}/{target_date}"
            params = {
                "apiKey": self.api_key,
                "adjusted": "true"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status != 200:
                        logger.error(f"Polygon API error: {response.status}")
                        return None
                    
                    data = await response.json()
                    
                    if data.get("status") != "OK":
                        logger.error(f"Polygon error: {data.get('error', 'Unknown error')}")
                        return None
                    
                    results = data.get("results", [])
                    if not results:
                        logger.warning(f"No data for {ticker} on {target_date}")
                        return None
                    
                    daily_data = results[0]
                    
                    return PriceData(
                        ticker=ticker,
                        date=target_date,
                        open_price=Decimal(str(daily_data['o'])),
                        high_price=Decimal(str(daily_data['h'])),
                        low_price=Decimal(str(daily_data['l'])),
                        close_price=Decimal(str(daily_data['c'])),
                        volume=int(daily_data['v']),
                        source=self.name,
                        data_quality="good"
                    )
                    
        except Exception as e:
            logger.error(f"Polygon error for {ticker}: {e}")
            return None


class PriceDataFetcher:
    """Multi-source price data fetcher with fallback logic."""
    
    def __init__(self):
        self.sources = {
            DataSource.YFINANCE: YFinanceSource(),
            DataSource.ALPHA_VANTAGE: AlphaVantageSource(),
            DataSource.POLYGON: PolygonSource()
        }
        self.source_priority = [
            DataSource.YFINANCE,
            DataSource.ALPHA_VANTAGE,
            DataSource.POLYGON
        ]
    
    def _validate_price_data(self, price_data: PriceData) -> bool:
        """Validate price data quality."""
        try:
            # Basic validation
            if price_data.close_price <= 0:
                return False
            
            if price_data.high_price < price_data.low_price:
                return False
            
            if price_data.open_price <= 0 or price_data.high_price <= 0 or price_data.low_price <= 0:
                return False
            
            # Volume should be non-negative
            if price_data.volume < 0:
                return False
            
            # Price change should be reasonable (not more than 50% in a day)
            price_change_pct = abs(price_data.close_price - price_data.open_price) / price_data.open_price
            if price_change_pct > 0.5:
                logger.warning(f"Large price change detected for {price_data.ticker}: {price_change_pct:.2%}")
                price_data.data_quality = "suspicious"
            
            return True
            
        except Exception as e:
            logger.error(f"Price data validation error: {e}")
            return False
    
    async def fetch_price_data(self, ticker: str, target_date: date) -> Optional[PriceData]:
        """Fetch price data with source fallback."""
        for source_enum in self.source_priority:
            source = self.sources[source_enum]
            
            try:
                price_data = await source.fetch_daily_price(ticker, target_date)
                
                if price_data and self._validate_price_data(price_data):
                    logger.info(f"Successfully fetched {ticker} data from {source.name} for {target_date}")
                    return price_data
                elif price_data:
                    logger.warning(f"Invalid price data for {ticker} from {source.name}")
                
            except Exception as e:
                logger.warning(f"Source {source.name} failed for {ticker}: {e}")
                continue
        
        logger.error(f"All sources failed for {ticker} on {target_date}")
        return None
    
    async def fetch_batch_prices(self, tickers: List[str], target_date: date, 
                                max_concurrent: int = 10) -> Dict[str, PriceData]:
        """Fetch price data for multiple tickers concurrently."""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def fetch_single(ticker: str) -> Tuple[str, Optional[PriceData]]:
            async with semaphore:
                price_data = await self.fetch_price_data(ticker, target_date)
                return ticker, price_data
        
        tasks = [fetch_single(ticker) for ticker in tickers]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        price_data_dict = {}
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Batch fetch error: {result}")
            elif result[1] is not None:
                price_data_dict[result[0]] = result[1]
        
        return price_data_dict


class HistoricalDataBackfiller:
    """Historical data backfill system."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.fetcher = PriceDataFetcher()
    
    def _is_trading_day(self, check_date: date) -> bool:
        """Check if date is a trading day (weekday)."""
        return check_date.weekday() < 5  # Monday = 0, Friday = 4
    
    async def backfill_security(self, security_id: str, start_date: date, 
                               end_date: date) -> int:
        """Backfill historical data for a single security."""
        from domains.securities.models import Security, DailyPrice
        
        # Get security
        result = await self.session.execute(
            select(Security).where(Security.id == security_id)
        )
        security = result.scalar_one_or_none()
        
        if not security:
            logger.error(f"Security not found: {security_id}")
            return 0
        
        records_created = 0
        current_date = start_date
        
        while current_date <= end_date:
            if self._is_trading_day(current_date):
                # Check if price data already exists
                existing_result = await self.session.execute(
                    select(DailyPrice).where(
                        DailyPrice.security_id == security_id,
                        DailyPrice.price_date == current_date
                    )
                )
                existing_price = existing_result.scalar_one_or_none()
                
                if not existing_price:
                    price_data = await self.fetcher.fetch_price_data(security.ticker, current_date)
                    
                    if price_data:
                        daily_price = DailyPrice(
                            security_id=security_id,
                            price_date=current_date,
                            open_price=int(price_data.open_price * 100),  # Convert to cents
                            high_price=int(price_data.high_price * 100),
                            low_price=int(price_data.low_price * 100),
                            close_price=int(price_data.close_price * 100),
                            volume=price_data.volume,
                            adjusted_close=int(price_data.adjusted_close * 100) if price_data.adjusted_close else None
                        )
                        
                        self.session.add(daily_price)
                        records_created += 1
                        
                        if records_created % 100 == 0:
                            await self.session.commit()
                            logger.info(f"Backfilled {records_created} records for {security.ticker}")
            
            current_date += timedelta(days=1)
        
        await self.session.commit()
        logger.info(f"Completed backfill for {security.ticker}: {records_created} records")
        return records_created
    
    async def backfill_all_securities(self, start_date: date, end_date: date, 
                                     batch_size: int = 50) -> Dict[str, int]:
        """Backfill historical data for all securities."""
        from domains.securities.models import Security
        
        # Get all active securities
        result = await self.session.execute(
            select(Security).where(Security.is_active == True)
        )
        securities = result.scalars().all()
        
        results = {
            'total_securities': len(securities),
            'records_created': 0,
            'errors': 0,
            'securities_processed': 0
        }
        
        for i in range(0, len(securities), batch_size):
            batch = securities[i:i + batch_size]
            
            for security in batch:
                try:
                    records_created = await self.backfill_security(
                        str(security.id), start_date, end_date
                    )
                    results['records_created'] += records_created
                    results['securities_processed'] += 1
                    
                except Exception as e:
                    results['errors'] += 1
                    logger.error(f"Backfill error for {security.ticker}: {e}")
            
            logger.info(f"Processed batch {i//batch_size + 1}: "
                       f"{results['securities_processed']}/{results['total_securities']} securities")
        
        logger.info(f"Backfill completed: {results['records_created']} records created, "
                   f"{results['errors']} errors")
        return results


# Example usage
async def main():
    """Example usage of the price data fetcher."""
    # This would be used in a script or background task
    fetcher = PriceDataFetcher()
    
    # Fetch single price
    price_data = await fetcher.fetch_price_data("AAPL", date(2024, 1, 15))
    if price_data:
        print(f"AAPL on {price_data.date}: ${price_data.close_price}")
    
    # Fetch batch prices
    tickers = ["AAPL", "MSFT", "GOOGL"]
    batch_data = await fetcher.fetch_batch_prices(tickers, date(2024, 1, 15))
    print(f"Fetched data for {len(batch_data)} tickers")


if __name__ == "__main__":
    asyncio.run(main()) 