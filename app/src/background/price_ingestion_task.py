"""
Daily price data ingestion background task for CAP-25.

This module provides a Celery task for automated daily price data ingestion
with monitoring, error handling, and data quality checks.
"""

import asyncio
import logging
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
from celery import Celery
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from domains.securities.price_fetcher import PriceDataFetcher, HistoricalDataBackfiller
from domains.securities.models import Security, DailyPrice
from domains.market_data.models import DataFeed

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Celery app (configure with your Redis settings)
celery_app = Celery('price_ingestion')
celery_app.config_from_object('celeryconfig')


class PriceIngestionTask:
    """Handles daily price data ingestion tasks."""
    
    def __init__(self):
        self.fetcher = PriceDataFetcher()
        self.engine = None
        self.session_factory = None
    
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
    
    async def _get_active_securities(self, session: AsyncSession) -> List[Security]:
        """Get all active securities."""
        from sqlalchemy import select
        
        result = await session.execute(
            select(Security).where(Security.is_active == True)
        )
        return result.scalars().all()
    
    async def _update_data_feed_status(self, session: AsyncSession, feed_name: str, 
                                      is_healthy: bool, error_message: str = None):
        """Update data feed status."""
        from sqlalchemy import select
        
        result = await session.execute(
            select(DataFeed).where(DataFeed.feed_name == feed_name)
        )
        feed = result.scalar_one_or_none()
        
        if not feed:
            feed = DataFeed(
                feed_name=feed_name,
                provider="multi_source",
                feed_type="price",
                is_active=True,
                is_healthy=is_healthy,
                last_successful_fetch=datetime.utcnow() if is_healthy else None,
                last_error=datetime.utcnow() if not is_healthy else None,
                error_message=error_message
            )
            session.add(feed)
        else:
            feed.is_healthy = is_healthy
            if is_healthy:
                feed.last_successful_fetch = datetime.utcnow()
                feed.error_message = None
            else:
                feed.last_error = datetime.utcnow()
                feed.error_message = error_message
        
        await session.commit()
    
    async def ingest_daily_prices(self, target_date: Optional[date] = None) -> Dict:
        """Ingest daily price data for all active securities."""
        if target_date is None:
            target_date = date.today()
        
        logger.info(f"Starting daily price ingestion for {target_date}")
        
        async with await self._get_session() as session:
            try:
                # Get active securities
                securities = await self._get_active_securities(session)
                logger.info(f"Found {len(securities)} active securities")
                
                # Fetch prices in batches
                batch_size = 50
                total_records = 0
                errors = 0
                
                for i in range(0, len(securities), batch_size):
                    batch = securities[i:i + batch_size]
                    tickers = [sec.ticker for sec in batch]
                    
                    try:
                        # Fetch batch prices
                        price_data_dict = await self.fetcher.fetch_batch_prices(
                            tickers, target_date, max_concurrent=10
                        )
                        
                        # Create price records
                        for ticker, price_data in price_data_dict.items():
                            try:
                                # Find security
                                security = next(sec for sec in batch if sec.ticker == ticker)
                                
                                # Check if price data already exists
                                from sqlalchemy import select
                                existing_result = await session.execute(
                                    select(DailyPrice).where(
                                        DailyPrice.security_id == security.id,
                                        DailyPrice.price_date == target_date
                                    )
                                )
                                existing_price = existing_result.scalar_one_or_none()
                                
                                if not existing_price:
                                    # Create new price record
                                    daily_price = DailyPrice(
                                        security_id=security.id,
                                        price_date=target_date,
                                        open_price=int(price_data.open_price * 100),
                                        high_price=int(price_data.high_price * 100),
                                        low_price=int(price_data.low_price * 100),
                                        close_price=int(price_data.close_price * 100),
                                        volume=price_data.volume,
                                        adjusted_close=int(price_data.adjusted_close * 100) if price_data.adjusted_close else None
                                    )
                                    
                                    session.add(daily_price)
                                    total_records += 1
                                
                            except Exception as e:
                                errors += 1
                                logger.error(f"Error processing {ticker}: {e}")
                        
                        # Commit batch
                        await session.commit()
                        logger.info(f"Processed batch {i//batch_size + 1}: "
                                   f"{len(price_data_dict)}/{len(batch)} successful")
                        
                    except Exception as e:
                        errors += 1
                        logger.error(f"Error processing batch {i//batch_size + 1}: {e}")
                
                # Update data feed status
                await self._update_data_feed_status(
                    session, "daily_price_ingestion", True
                )
                
                result = {
                    'date': target_date,
                    'total_securities': len(securities),
                    'records_created': total_records,
                    'errors': errors,
                    'success_rate': (len(securities) - errors) / len(securities) if securities else 0
                }
                
                logger.info(f"Daily price ingestion completed: {result}")
                return result
                
            except Exception as e:
                logger.error(f"Daily price ingestion failed: {e}")
                await self._update_data_feed_status(
                    session, "daily_price_ingestion", False, str(e)
                )
                raise
    
    async def backfill_historical_data(self, start_date: date, end_date: date, 
                                     batch_size: int = 50) -> Dict:
        """Backfill historical price data."""
        logger.info(f"Starting historical data backfill from {start_date} to {end_date}")
        
        async with await self._get_session() as session:
            try:
                backfiller = HistoricalDataBackfiller(session)
                result = await backfiller.backfill_all_securities(
                    start_date, end_date, batch_size
                )
                
                logger.info(f"Historical backfill completed: {result}")
                return result
                
            except Exception as e:
                logger.error(f"Historical backfill failed: {e}")
                raise
    
    async def calculate_technical_indicators(self, lookback_days: int = 50) -> Dict:
        """Calculate technical indicators for all securities."""
        logger.info(f"Starting technical indicators calculation (lookback: {lookback_days} days)")
        
        async with await self._get_session() as session:
            try:
                from domains.securities.models import DailyPrice
                from sqlalchemy import select, func
                import statistics
                
                securities = await self._get_active_securities(session)
                processed = 0
                errors = 0
                
                for security in securities:
                    try:
                        # Get price history
                        cutoff_date = date.today() - timedelta(days=lookback_days)
                        result = await session.execute(
                            select(DailyPrice).where(
                                DailyPrice.security_id == security.id,
                                DailyPrice.price_date >= cutoff_date
                            ).order_by(DailyPrice.price_date)
                        )
                        price_data = result.scalars().all()
                        
                        if len(price_data) < 20:
                            continue
                        
                        # Calculate moving averages
                        close_prices = [p.close_price for p in price_data]
                        
                        if len(close_prices) >= 20:
                            sma_20 = sum(close_prices[-20:]) / 20
                        else:
                            sma_20 = None
                        
                        if len(close_prices) >= 50:
                            sma_50 = sum(close_prices[-50:]) / 50
                        else:
                            sma_50 = None
                        
                        if len(close_prices) >= 200:
                            sma_200 = sum(close_prices[-200:]) / 200
                        else:
                            sma_200 = None
                        
                        # Calculate RSI (14-day)
                        if len(close_prices) >= 14:
                            gains = []
                            losses = []
                            for i in range(1, len(close_prices)):
                                change = close_prices[i] - close_prices[i-1]
                                if change > 0:
                                    gains.append(change)
                                    losses.append(0)
                                else:
                                    gains.append(0)
                                    losses.append(abs(change))
                            
                            if len(gains) >= 14:
                                avg_gain = sum(gains[-14:]) / 14
                                avg_loss = sum(losses[-14:]) / 14
                                
                                if avg_loss > 0:
                                    rs = avg_gain / avg_loss
                                    rsi = 100 - (100 / (1 + rs))
                                else:
                                    rsi = 100
                            else:
                                rsi = None
                        else:
                            rsi = None
                        
                        # Update latest price record with indicators
                        latest_price = price_data[-1]
                        latest_price.sma_20 = sma_20
                        latest_price.sma_50 = sma_50
                        latest_price.sma_200 = sma_200
                        latest_price.rsi_14 = rsi
                        
                        processed += 1
                        
                        if processed % 100 == 0:
                            await session.commit()
                            logger.info(f"Processed {processed} securities for technical indicators")
                    
                    except Exception as e:
                        errors += 1
                        logger.error(f"Error calculating indicators for {security.ticker}: {e}")
                
                await session.commit()
                
                result = {
                    'securities_processed': processed,
                    'errors': errors,
                    'success_rate': (processed - errors) / processed if processed > 0 else 0
                }
                
                logger.info(f"Technical indicators calculation completed: {result}")
                return result
                
            except Exception as e:
                logger.error(f"Technical indicators calculation failed: {e}")
                raise


# Celery tasks
@celery_app.task
def daily_price_ingestion_task(target_date_str: str = None):
    """Celery task for daily price ingestion."""
    task = PriceIngestionTask()
    
    if target_date_str:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
    else:
        target_date = None
    
    return asyncio.run(task.ingest_daily_prices(target_date))


@celery_app.task
def historical_backfill_task(start_date_str: str, end_date_str: str, batch_size: int = 50):
    """Celery task for historical data backfill."""
    task = PriceIngestionTask()
    
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    
    return asyncio.run(task.backfill_historical_data(start_date, end_date, batch_size))


@celery_app.task
def technical_indicators_task(lookback_days: int = 50):
    """Celery task for technical indicators calculation."""
    task = PriceIngestionTask()
    return asyncio.run(task.calculate_technical_indicators(lookback_days))


# Scheduled tasks (using Celery Beat)
@celery_app.task
def scheduled_daily_ingestion():
    """Scheduled daily price ingestion (runs at 6 PM ET after market close)."""
    return daily_price_ingestion_task.delay()


@celery_app.task
def scheduled_technical_indicators():
    """Scheduled technical indicators calculation (runs daily at 7 PM ET)."""
    return technical_indicators_task.delay(lookback_days=50)


# Monitoring and health checks
@celery_app.task
def health_check_task():
    """Health check task to monitor data feed status."""
    async def check_health():
        async with await PriceIngestionTask()._get_session() as session:
            from sqlalchemy import select
            from domains.market_data.models import DataFeed
            
            result = await session.execute(
                select(DataFeed).where(DataFeed.feed_name == "daily_price_ingestion")
            )
            feed = result.scalar_one_or_none()
            
            if feed and not feed.is_healthy:
                logger.warning(f"Data feed unhealthy: {feed.error_message}")
                return False
            
            return True
    
    return asyncio.run(check_health())


# Example usage and testing
async def test_price_ingestion():
    """Test the price ingestion system."""
    task = PriceIngestionTask()
    
    # Test daily ingestion
    result = await task.ingest_daily_prices(date.today())
    print(f"Daily ingestion result: {result}")
    
    # Test technical indicators
    result = await task.calculate_technical_indicators()
    print(f"Technical indicators result: {result}")


if __name__ == "__main__":
    # Run test
    asyncio.run(test_price_ingestion()) 