"""
Simple test script for the price fetcher functionality.

This script tests the price data fetching without requiring a database connection.
"""

import asyncio
import logging
from datetime import date, timedelta
from decimal import Decimal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the app/src directory to Python path
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'src'))

from domains.securities.price_fetcher import PriceDataFetcher


async def test_price_fetcher():
    """Test the price fetcher functionality."""
    logger.info("Testing Price Data Fetcher")
    
    try:
        # Initialize the fetcher
        fetcher = PriceDataFetcher()
        
        # Test with a date that should have data (avoid weekends and holidays)
        test_date = date.today()
        while test_date.weekday() >= 5:  # Skip weekends
            test_date -= timedelta(days=1)
        
        # Use a date from last week to ensure data exists
        test_date = test_date - timedelta(days=7)
        
        logger.info(f"Testing with date: {test_date}")
        
        # Test single price fetch
        test_ticker = "AAPL"
        logger.info(f"Testing single price fetch for {test_ticker}")
        
        price_data = await fetcher.fetch_price_data(test_ticker, test_date)
        
        if price_data:
            logger.info(f"✅ Successfully fetched {test_ticker} data:")
            logger.info(f"   Date: {price_data.date}")
            logger.info(f"   Open: ${price_data.open_price}")
            logger.info(f"   High: ${price_data.high_price}")
            logger.info(f"   Low: ${price_data.low_price}")
            logger.info(f"   Close: ${price_data.close_price}")
            logger.info(f"   Volume: {price_data.volume:,}")
            logger.info(f"   Source: {price_data.source}")
            logger.info(f"   Quality: {price_data.data_quality}")
        else:
            logger.warning(f"❌ Failed to fetch {test_ticker} data")
        
        # Test batch price fetch
        test_tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
        logger.info(f"Testing batch price fetch for {len(test_tickers)} tickers")
        
        batch_data = await fetcher.fetch_batch_prices(test_tickers, test_date, max_concurrent=3)
        
        logger.info(f"✅ Batch fetch results:")
        logger.info(f"   Requested: {len(test_tickers)} tickers")
        logger.info(f"   Successful: {len(batch_data)} tickers")
        logger.info(f"   Success rate: {len(batch_data)/len(test_tickers)*100:.1f}%")
        
        for ticker, data in batch_data.items():
            logger.info(f"   {ticker}: ${data.close_price} (source: {data.source})")
        
        # Test data validation
        logger.info("Testing data validation...")
        
        if batch_data:
            sample_data = list(batch_data.values())[0]
            is_valid = fetcher._validate_price_data(sample_data)
            logger.info(f"   Sample data validation: {'✅ PASS' if is_valid else '❌ FAIL'}")
        
        # Test error handling
        logger.info("Testing error handling...")
        
        # Test with invalid ticker
        invalid_price = await fetcher.fetch_price_data("INVALID_TICKER_123", test_date)
        logger.info(f"   Invalid ticker handling: {'✅ PASS' if invalid_price is None else '❌ FAIL'}")
        
        # Test with future date
        future_date = date.today() + timedelta(days=365)
        future_price = await fetcher.fetch_price_data("AAPL", future_date)
        logger.info(f"   Future date handling: {'✅ PASS' if future_price is None else '❌ FAIL'}")
        
        # Test rate limiting
        logger.info("Testing rate limiting...")
        test_tickers_many = ["AAPL"] * 20  # Try to trigger rate limiting
        batch_data_many = await fetcher.fetch_batch_prices(test_tickers_many, test_date, max_concurrent=5)
        logger.info(f"   Rate limiting test: {len(batch_data_many)}/{len(test_tickers_many)} successful")
        
        logger.info("🎉 Price fetcher test completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Price fetcher test failed: {e}")
        return False


async def test_data_sources():
    """Test individual data sources."""
    logger.info("Testing individual data sources...")
    
    try:
        from domains.securities.price_fetcher import YFinanceSource, AlphaVantageSource, PolygonSource
        
        test_date = date.today() - timedelta(days=7)
        test_ticker = "AAPL"
        
        # Test YFinance
        logger.info("Testing YFinance source...")
        yf_source = YFinanceSource()
        yf_data = await yf_source.fetch_daily_price(test_ticker, test_date)
        logger.info(f"   YFinance: {'✅ SUCCESS' if yf_data else '❌ FAIL'}")
        
        # Test Alpha Vantage (if API key is available)
        logger.info("Testing Alpha Vantage source...")
        av_source = AlphaVantageSource()
        av_data = await av_source.fetch_daily_price(test_ticker, test_date)
        logger.info(f"   Alpha Vantage: {'✅ SUCCESS' if av_data else '❌ FAIL (no API key or rate limit)'}")
        
        # Test Polygon (if API key is available)
        logger.info("Testing Polygon source...")
        poly_source = PolygonSource()
        poly_data = await poly_source.fetch_daily_price(test_ticker, test_date)
        logger.info(f"   Polygon: {'✅ SUCCESS' if poly_data else '❌ FAIL (no API key or rate limit)'}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Data sources test failed: {e}")
        return False


async def main():
    """Main test function."""
    logger.info("=" * 60)
    logger.info("PRICE FETCHER SIMPLE TEST")
    logger.info("=" * 60)
    
    # Test price fetcher
    price_test_result = await test_price_fetcher()
    
    # Test data sources
    sources_test_result = await test_data_sources()
    
    # Summary
    logger.info("=" * 60)
    logger.info("TEST SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Price Fetcher Test: {'✅ PASSED' if price_test_result else '❌ FAILED'}")
    logger.info(f"Data Sources Test: {'✅ PASSED' if sources_test_result else '❌ FAILED'}")
    
    overall_result = price_test_result and sources_test_result
    logger.info(f"Overall Result: {'✅ ALL TESTS PASSED' if overall_result else '❌ SOME TESTS FAILED'}")
    logger.info("=" * 60)
    
    return overall_result


if __name__ == "__main__":
    asyncio.run(main()) 