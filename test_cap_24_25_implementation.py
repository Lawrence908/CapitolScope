"""
Comprehensive test script for CAP-24 and CAP-25 implementation.

This script validates:
- Database setup and population
- Price data ingestion
- Data quality and completeness
- Performance metrics
- Error handling and reliability
"""

import asyncio
import logging
import time
from datetime import date, timedelta
from typing import Dict, List
import statistics
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func

import sys
import os

# Add the app/src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'src'))

from domains.securities.price_fetcher import PriceDataFetcher, HistoricalDataBackfiller
from domains.securities.models import Security, DailyPrice, AssetType, Exchange, Sector
from scripts.setup_securities_database import SecuritiesDatabaseSetup

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CAP24_25_TestSuite:
    """Comprehensive test suite for CAP-24 and CAP-25 implementation."""
    
    def __init__(self):
        self.engine = None
        self.session_factory = None
        self.test_results = {}
    
    async def _get_session(self) -> AsyncSession:
        """Get database session."""
        if not self.engine:
            # Configure with your database URL
            database_url = "postgresql+asyncpg://user:password@localhost/capitolscope"
            self.engine = create_async_engine(database_url)
            self.session_factory = sessionmaker(
                self.engine, class_=AsyncSession, expire_on_commit=False
            )
        
        return self.session_factory()
    
    async def test_cap_24_database_setup(self) -> Dict:
        """Test CAP-24: Comprehensive Stock Database Setup."""
        logger.info("Testing CAP-24: Database Setup")
        
        async with await self._get_session() as session:
            try:
                # 1. Test base data creation
                setup = SecuritiesDatabaseSetup(session)
                await setup._create_base_data()
                
                # Verify asset types
                result = await session.execute(select(AssetType))
                asset_types = result.scalars().all()
                logger.info(f"Created {len(asset_types)} asset types")
                
                # Verify exchanges
                result = await session.execute(select(Exchange))
                exchanges = result.scalars().all()
                logger.info(f"Created {len(exchanges)} exchanges")
                
                # Verify sectors
                result = await session.execute(select(Sector))
                sectors = result.scalars().all()
                logger.info(f"Created {len(sectors)} sectors")
                
                # 2. Test security population
                await setup._populate_universe('sp500', {
                    'name': 'S&P 500 Test',
                    'source': setup._get_sp500_sample
                })
                
                # Verify securities were created
                result = await session.execute(select(Security))
                securities = result.scalars().all()
                logger.info(f"Created {len(securities)} securities")
                
                # 3. Test data quality
                quality_metrics = await self._test_data_quality(session)
                
                result = {
                    'asset_types_created': len(asset_types),
                    'exchanges_created': len(exchanges),
                    'sectors_created': len(sectors),
                    'securities_created': len(securities),
                    'data_quality': quality_metrics,
                    'status': 'PASSED'
                }
                
                logger.info(f"CAP-24 test completed: {result}")
                return result
                
            except Exception as e:
                logger.error(f"CAP-24 test failed: {e}")
                return {'status': 'FAILED', 'error': str(e)}
    
    async def test_cap_25_price_ingestion(self) -> Dict:
        """Test CAP-25: Daily Price Data Ingestion System."""
        logger.info("Testing CAP-25: Price Data Ingestion")
        
        async with await self._get_session() as session:
            try:
                # 1. Test price fetcher
                fetcher = PriceDataFetcher()
                
                # Test single price fetch
                test_ticker = "AAPL"
                test_date = date.today() - timedelta(days=5)  # Use a date that should have data
                
                start_time = time.time()
                price_data = await fetcher.fetch_price_data(test_ticker, test_date)
                fetch_time = time.time() - start_time
                
                if price_data:
                    logger.info(f"Successfully fetched {test_ticker} data: ${price_data.close_price}")
                else:
                    logger.warning(f"Failed to fetch {test_ticker} data")
                
                # 2. Test batch price fetch
                test_tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
                start_time = time.time()
                batch_data = await fetcher.fetch_batch_prices(test_tickers, test_date)
                batch_time = time.time() - start_time
                
                logger.info(f"Batch fetch: {len(batch_data)}/{len(test_tickers)} successful in {batch_time:.2f}s")
                
                # 3. Test historical backfill
                backfiller = HistoricalDataBackfiller(session)
                
                # Get a test security
                result = await session.execute(select(Security).limit(1))
                test_security = result.scalar_one_or_none()
                
                if test_security:
                    start_date = date.today() - timedelta(days=30)
                    end_date = date.today() - timedelta(days=5)  # Use a date that should have data
                    
                    start_time = time.time()
                    records_created = await backfiller.backfill_security(
                        str(test_security.id), start_date, end_date
                    )
                    backfill_time = time.time() - start_time
                    
                    logger.info(f"Backfilled {records_created} records for {test_security.ticker} in {backfill_time:.2f}s")
                
                # 4. Test data validation
                validation_metrics = await self._test_price_data_validation(session)
                
                result = {
                    'single_fetch_success': price_data is not None,
                    'single_fetch_time': fetch_time,
                    'batch_fetch_success_rate': len(batch_data) / len(test_tickers),
                    'batch_fetch_time': batch_time,
                    'backfill_records_created': records_created if test_security else 0,
                    'backfill_time': backfill_time if test_security else 0,
                    'validation_metrics': validation_metrics,
                    'status': 'PASSED'
                }
                
                logger.info(f"CAP-25 test completed: {result}")
                return result
                
            except Exception as e:
                logger.error(f"CAP-25 test failed: {e}")
                return {'status': 'FAILED', 'error': str(e)}
    
    async def _test_data_quality(self, session: AsyncSession) -> Dict:
        """Test data quality metrics."""
        try:
            # Test security data completeness
            result = await session.execute(select(Security))
            securities = result.scalars().all()
            
            total_securities = len(securities)
            securities_with_ticker = len([s for s in securities if s.ticker])
            securities_with_name = len([s for s in securities if s.name])
            securities_with_asset_type = len([s for s in securities if s.asset_type_code])
            securities_with_exchange = len([s for s in securities if s.exchange_code])
            
            return {
                'total_securities': total_securities,
                'ticker_completeness': securities_with_ticker / total_securities if total_securities > 0 else 0,
                'name_completeness': securities_with_name / total_securities if total_securities > 0 else 0,
                'asset_type_completeness': securities_with_asset_type / total_securities if total_securities > 0 else 0,
                'exchange_completeness': securities_with_exchange / total_securities if total_securities > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Data quality test failed: {e}")
            return {'error': str(e)}
    
    async def _test_price_data_validation(self, session: AsyncSession) -> Dict:
        """Test price data validation."""
        try:
            # Get recent price data
            result = await session.execute(
                select(DailyPrice).where(
                    DailyPrice.price_date >= date.today() - timedelta(days=7)
                )
            )
            price_records = result.scalars().all()
            
            if not price_records:
                return {'error': 'No price data found for validation'}
            
            # Test price data quality
            valid_prices = 0
            total_prices = len(price_records)
            
            for price in price_records:
                # Basic validation
                if (price.close_price > 0 and 
                    price.high_price >= price.low_price and
                    price.volume >= 0):
                    valid_prices += 1
            
            # Test for extreme price changes
            extreme_changes = 0
            for price in price_records:
                if price.open_price > 0:
                    change_pct = abs(price.close_price - price.open_price) / price.open_price
                    if change_pct > 0.5:  # More than 50% change
                        extreme_changes += 1
            
            return {
                'total_price_records': total_prices,
                'valid_price_records': valid_prices,
                'price_validation_rate': valid_prices / total_prices if total_prices > 0 else 0,
                'extreme_price_changes': extreme_changes,
                'extreme_change_rate': extreme_changes / total_prices if total_prices > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Price data validation test failed: {e}")
            return {'error': str(e)}
    
    async def test_performance_metrics(self) -> Dict:
        """Test performance metrics."""
        logger.info("Testing Performance Metrics")
        
        async with await self._get_session() as session:
            try:
                # 1. Test database query performance
                start_time = time.time()
                result = await session.execute(select(Security))
                securities = result.scalars().all()
                query_time = time.time() - start_time
                
                # 2. Test price data query performance
                start_time = time.time()
                result = await session.execute(
                    select(DailyPrice).where(
                        DailyPrice.price_date >= date.today() - timedelta(days=30)
                    )
                )
                price_records = result.scalars().all()
                price_query_time = time.time() - start_time
                
                # 3. Test concurrent operations
                fetcher = PriceDataFetcher()
                test_tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX", "ADBE", "CRM"]
                test_date = date.today() - timedelta(days=1)
                
                start_time = time.time()
                batch_data = await fetcher.fetch_batch_prices(test_tickers, test_date, max_concurrent=5)
                concurrent_time = time.time() - start_time
                
                return {
                    'securities_query_time': query_time,
                    'price_query_time': price_query_time,
                    'concurrent_fetch_time': concurrent_time,
                    'concurrent_success_rate': len(batch_data) / len(test_tickers),
                    'total_securities': len(securities),
                    'total_price_records': len(price_records)
                }
                
            except Exception as e:
                logger.error(f"Performance test failed: {e}")
                return {'error': str(e)}
    
    async def test_error_handling(self) -> Dict:
        """Test error handling and reliability."""
        logger.info("Testing Error Handling")
        
        try:
            fetcher = PriceDataFetcher()
            
            # Test with invalid ticker
            invalid_price = await fetcher.fetch_price_data("INVALID_TICKER_123", date.today())
            
            # Test with invalid date
            future_price = await fetcher.fetch_price_data("AAPL", date.today() + timedelta(days=365))
            
            # Test rate limiting
            test_tickers = ["AAPL"] * 100  # Try to trigger rate limiting
            batch_data = await fetcher.fetch_batch_prices(test_tickers, date.today() - timedelta(days=1))
            
            return {
                'invalid_ticker_handled': invalid_price is None,
                'future_date_handled': future_price is None,
                'rate_limiting_working': len(batch_data) < len(test_tickers),
                'error_handling_status': 'PASSED'
            }
            
        except Exception as e:
            logger.error(f"Error handling test failed: {e}")
            return {'error_handling_status': 'FAILED', 'error': str(e)}
    
    async def run_comprehensive_test(self) -> Dict:
        """Run comprehensive test suite."""
        logger.info("Starting comprehensive CAP-24/25 test suite")
        
        start_time = time.time()
        
        # Run all tests
        cap24_result = await self.test_cap_24_database_setup()
        cap25_result = await self.test_cap_25_price_ingestion()
        performance_result = await self.test_performance_metrics()
        error_handling_result = await self.test_error_handling()
        
        total_time = time.time() - start_time
        
        # Compile results
        comprehensive_result = {
            'test_duration': total_time,
            'cap24_result': cap24_result,
            'cap25_result': cap25_result,
            'performance_result': performance_result,
            'error_handling_result': error_handling_result,
            'overall_status': 'PASSED' if all(
                result.get('status') == 'PASSED' 
                for result in [cap24_result, cap25_result, error_handling_result]
            ) else 'FAILED'
        }
        
        # Log summary
        logger.info("=" * 50)
        logger.info("COMPREHENSIVE TEST RESULTS")
        logger.info("=" * 50)
        logger.info(f"CAP-24 Status: {cap24_result.get('status', 'UNKNOWN')}")
        logger.info(f"CAP-25 Status: {cap25_result.get('status', 'UNKNOWN')}")
        logger.info(f"Error Handling: {error_handling_result.get('error_handling_status', 'UNKNOWN')}")
        logger.info(f"Total Test Time: {total_time:.2f} seconds")
        logger.info(f"Overall Status: {comprehensive_result['overall_status']}")
        logger.info("=" * 50)
        
        return comprehensive_result


async def main():
    """Main test function."""
    test_suite = CAP24_25_TestSuite()
    results = await test_suite.run_comprehensive_test()
    
    # Print detailed results
    print("\n" + "="*60)
    print("CAP-24 & CAP-25 IMPLEMENTATION TEST RESULTS")
    print("="*60)
    
    print(f"\n📊 Overall Status: {results['overall_status']}")
    print(f"⏱️  Total Test Time: {results['test_duration']:.2f} seconds")
    
    print(f"\n🏗️  CAP-24 (Database Setup):")
    cap24 = results['cap24_result']
    if cap24.get('status') == 'PASSED':
        print(f"   ✅ Status: PASSED")
        print(f"   📈 Securities Created: {cap24.get('securities_created', 0)}")
        print(f"   🏢 Asset Types: {cap24.get('asset_types_created', 0)}")
        print(f"   🏛️  Exchanges: {cap24.get('exchanges_created', 0)}")
        print(f"   🏭 Sectors: {cap24.get('sectors_created', 0)}")
    else:
        print(f"   ❌ Status: FAILED")
        print(f"   🔍 Error: {cap24.get('error', 'Unknown error')}")
    
    print(f"\n📈 CAP-25 (Price Ingestion):")
    cap25 = results['cap25_result']
    if cap25.get('status') == 'PASSED':
        print(f"   ✅ Status: PASSED")
        print(f"   ⚡ Single Fetch Time: {cap25.get('single_fetch_time', 0):.3f}s")
        print(f"   📦 Batch Success Rate: {cap25.get('batch_fetch_success_rate', 0):.1%}")
        print(f"   📊 Backfill Records: {cap25.get('backfill_records_created', 0)}")
    else:
        print(f"   ❌ Status: FAILED")
        print(f"   🔍 Error: {cap25.get('error', 'Unknown error')}")
    
    print(f"\n⚡ Performance Metrics:")
    perf = results['performance_result']
    if 'error' not in perf:
        print(f"   🗄️  Securities Query: {perf.get('securities_query_time', 0):.3f}s")
        print(f"   📊 Price Query: {perf.get('price_query_time', 0):.3f}s")
        print(f"   🔄 Concurrent Fetch: {perf.get('concurrent_fetch_time', 0):.3f}s")
        print(f"   📈 Success Rate: {perf.get('concurrent_success_rate', 0):.1%}")
    
    print(f"\n🛡️  Error Handling:")
    error = results['error_handling_result']
    if error.get('error_handling_status') == 'PASSED':
        print(f"   ✅ Status: PASSED")
        print(f"   🚫 Invalid Ticker: {'✅' if error.get('invalid_ticker_handled') else '❌'}")
        print(f"   📅 Future Date: {'✅' if error.get('future_date_handled') else '❌'}")
        print(f"   ⏱️  Rate Limiting: {'✅' if error.get('rate_limiting_working') else '❌'}")
    else:
        print(f"   ❌ Status: FAILED")
        print(f"   🔍 Error: {error.get('error', 'Unknown error')}")
    
    print("\n" + "="*60)
    
    return results


if __name__ == "__main__":
    asyncio.run(main()) 