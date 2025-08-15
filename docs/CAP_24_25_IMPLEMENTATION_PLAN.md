# CAP-24 & CAP-25 Implementation Plan
## Comprehensive Stock Database & Price Data Ingestion System

### 🎯 **Overview**

This plan implements a production-ready stock database and price ingestion system that supports:
- **CAP-24:** Comprehensive stock database covering S&P 500, NASDAQ-100, Dow Jones, ETFs, bonds, and more
- **CAP-25:** Automated daily price data ingestion with real-time updates, historical backfill, and data validation

### 📊 **Current State Analysis**

**✅ Already Implemented:**
- Solid database schema (`securities` and `market_data` domains)
- Basic ingestion framework with YFinance integration
- Rate limiting and error handling
- Async database operations
- Comprehensive models for securities, prices, indices, and economic data

**🚧 Needs Enhancement:**
- Multi-source data ingestion (YFinance + Alpha Vantage + Polygon)
- Robust error handling and retry mechanisms
- Data validation and quality checks
- Historical data backfill system
- Real-time price updates
- Performance optimization for large datasets

---

## 🏗️ **CAP-24: Comprehensive Stock Database Setup**

### **Phase 1: Core Database Enhancement**

#### **1.1 Database Schema Optimization**
```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_securities_ticker_active ON securities(ticker) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_daily_prices_security_date_compound ON daily_prices(security_id, price_date DESC);
CREATE INDEX CONCURRENTLY idx_securities_market_cap ON securities(market_cap DESC) WHERE market_cap IS NOT NULL;

-- Partition daily_prices by year for better performance
CREATE TABLE daily_prices_2024 PARTITION OF daily_prices
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE daily_prices_2023 PARTITION OF daily_prices
FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
```

#### **1.2 Security Universe Expansion**
```python
# Enhanced security universe covering:
SECURITY_UNIVERSE = {
    'sp500': {
        'source': 'sp500_tickers',
        'count': 500,
        'priority': 'high'
    },
    'nasdaq100': {
        'source': 'nasdaq100_tickers', 
        'count': 100,
        'priority': 'high'
    },
    'dow_jones': {
        'source': 'dow_jones_tickers',
        'count': 30,
        'priority': 'high'
    },
    'russell_1000': {
        'source': 'russell_1000_tickers',
        'count': 1000,
        'priority': 'medium'
    },
    'etfs': {
        'source': 'etf_securities',
        'count': 2000,
        'priority': 'medium'
    },
    'bonds': {
        'source': 'bond_securities',
        'count': 500,
        'priority': 'low'
    },
    'crypto': {
        'source': 'crypto_securities',
        'count': 100,
        'priority': 'low'
    }
}
```

#### **1.3 Data Source Integration**
```python
# Multi-source data ingestion
DATA_SOURCES = {
    'yfinance': {
        'priority': 1,
        'rate_limit': 2000,  # requests per hour
        'retry_delay': 1.0,
        'max_retries': 3
    },
    'alpha_vantage': {
        'priority': 2,
        'rate_limit': 500,   # requests per day (free tier)
        'retry_delay': 12.0, # 12 seconds between requests
        'max_retries': 2
    },
    'polygon': {
        'priority': 3,
        'rate_limit': 5000,  # requests per minute
        'retry_delay': 0.1,
        'max_retries': 3
    }
}
```

### **Phase 2: Data Quality & Validation**

#### **2.1 Data Validation Framework**
```python
class SecurityDataValidator:
    """Validates security data before ingestion."""
    
    @staticmethod
    def validate_ticker(ticker: str) -> bool:
        """Validate ticker symbol format."""
        return bool(re.match(r'^[A-Z]{1,5}$', ticker))
    
    @staticmethod
    def validate_market_cap(market_cap: int) -> bool:
        """Validate market cap is reasonable."""
        return 0 < market_cap < 10_000_000_000_000  # $10T max
    
    @staticmethod
    def validate_price_data(price_data: dict) -> bool:
        """Validate OHLC price data."""
        required_fields = ['open', 'high', 'low', 'close', 'volume']
        return all(field in price_data for field in required_fields)
```

#### **2.2 Data Quality Metrics**
```python
class DataQualityMonitor:
    """Monitors data quality and completeness."""
    
    def __init__(self):
        self.metrics = {
            'ticker_extraction_rate': 0.0,
            'price_data_completeness': 0.0,
            'data_freshness': 0.0,
            'error_rate': 0.0
        }
    
    async def calculate_quality_metrics(self, session: AsyncSession) -> dict:
        """Calculate current data quality metrics."""
        # Implementation for quality monitoring
        pass
```

---

## 📈 **CAP-25: Daily Price Data Ingestion System**

### **Phase 1: Core Ingestion Engine**

#### **1.1 Multi-Source Price Fetcher**
```python
class PriceDataFetcher:
    """Fetches price data from multiple sources with fallback logic."""
    
    def __init__(self):
        self.sources = {
            'yfinance': YFinanceSource(),
            'alpha_vantage': AlphaVantageSource(),
            'polygon': PolygonSource()
        }
        self.rate_limiters = self._setup_rate_limiters()
    
    async def fetch_price_data(self, ticker: str, date: date) -> Optional[dict]:
        """Fetch price data with source fallback."""
        for source_name, source in self.sources.items():
            try:
                if await self.rate_limiters[source_name].can_proceed():
                    data = await source.fetch_daily_price(ticker, date)
                    if data and self._validate_price_data(data):
                        return data
            except Exception as e:
                logger.warning(f"Source {source_name} failed for {ticker}: {e}")
                continue
        
        return None
```

#### **1.2 Historical Data Backfill**
```python
class HistoricalDataBackfiller:
    """Backfills historical price data for securities."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.fetcher = PriceDataFetcher()
    
    async def backfill_security(self, security_id: UUID, start_date: date, end_date: date) -> int:
        """Backfill historical data for a single security."""
        security = await self._get_security(security_id)
        if not security:
            return 0
        
        records_created = 0
        current_date = start_date
        
        while current_date <= end_date:
            # Skip weekends and holidays
            if self._is_trading_day(current_date):
                existing_price = await self._get_existing_price(security_id, current_date)
                if not existing_price:
                    price_data = await self.fetcher.fetch_price_data(security.ticker, current_date)
                    if price_data:
                        await self._create_price_record(security_id, current_date, price_data)
                        records_created += 1
            
            current_date += timedelta(days=1)
        
        return records_created
    
    async def backfill_all_securities(self, start_date: date, end_date: date, batch_size: int = 50) -> dict:
        """Backfill historical data for all securities."""
        securities = await self._get_active_securities()
        results = {
            'total_securities': len(securities),
            'records_created': 0,
            'errors': 0
        }
        
        for i in range(0, len(securities), batch_size):
            batch = securities[i:i + batch_size]
            tasks = [
                self.backfill_security(sec.id, start_date, end_date)
                for sec in batch
            ]
            
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in batch_results:
                if isinstance(result, Exception):
                    results['errors'] += 1
                    logger.error(f"Backfill error: {result}")
                else:
                    results['records_created'] += result
        
        return results
```

### **Phase 2: Real-Time Updates**

#### **2.1 Real-Time Price Monitor**
```python
class RealTimePriceMonitor:
    """Monitors real-time price updates during market hours."""
    
    def __init__(self):
        self.is_running = False
        self.update_interval = 60  # seconds
        self.market_hours = self._get_market_hours()
    
    async def start_monitoring(self):
        """Start real-time price monitoring."""
        self.is_running = True
        logger.info("Starting real-time price monitoring")
        
        while self.is_running:
            if self._is_market_open():
                await self._update_real_time_prices()
            
            await asyncio.sleep(self.update_interval)
    
    async def _update_real_time_prices(self):
        """Update real-time prices for active securities."""
        active_securities = await self._get_active_securities()
        
        for security in active_securities:
            try:
                current_price = await self._fetch_current_price(security.ticker)
                if current_price:
                    await self._update_intraday_price(security.id, current_price)
            except Exception as e:
                logger.error(f"Failed to update price for {security.ticker}: {e}")
```

#### **2.2 Intraday Price Tracking**
```python
class IntradayPriceTracker:
    """Tracks intraday price movements for portfolio valuation."""
    
    async def update_intraday_price(self, security_id: UUID, price_data: dict):
        """Update intraday price for a security."""
        intraday_price = IntradayPrice(
            security_id=security_id,
            price_timestamp=datetime.utcnow(),
            price=price_data['price'],
            volume=price_data.get('volume', 0),
            bid_price=price_data.get('bid'),
            ask_price=price_data.get('ask'),
            data_source=price_data.get('source', 'unknown')
        )
        
        self.session.add(intraday_price)
        await self.session.commit()
```

### **Phase 3: Data Processing & Analytics**

#### **3.1 Technical Indicators Calculator**
```python
class TechnicalIndicatorsCalculator:
    """Calculates technical indicators for securities."""
    
    async def calculate_indicators(self, security_id: UUID, lookback_days: int = 50):
        """Calculate technical indicators for a security."""
        price_data = await self._get_price_history(security_id, lookback_days)
        
        if len(price_data) < 20:
            return
        
        # Calculate moving averages
        sma_20 = self._calculate_sma(price_data, 20)
        sma_50 = self._calculate_sma(price_data, 50)
        sma_200 = self._calculate_sma(price_data, 200)
        
        # Calculate RSI
        rsi_14 = self._calculate_rsi(price_data, 14)
        
        # Calculate MACD
        macd = self._calculate_macd(price_data)
        
        # Update latest price record with indicators
        latest_price = price_data[-1]
        latest_price.sma_20 = sma_20
        latest_price.sma_50 = sma_50
        latest_price.sma_200 = sma_200
        latest_price.rsi_14 = rsi_14
        latest_price.macd = macd
        
        await self.session.commit()
```

#### **3.2 Performance Analytics**
```python
class PerformanceAnalytics:
    """Calculates performance metrics for securities."""
    
    async def calculate_performance_metrics(self, security_id: UUID, period_days: int = 30):
        """Calculate performance metrics for a security."""
        price_data = await self._get_price_history(security_id, period_days)
        
        if len(price_data) < 2:
            return
        
        # Calculate returns
        total_return = (price_data[-1].close_price - price_data[0].close_price) / price_data[0].close_price
        
        # Calculate volatility
        returns = [self._calculate_daily_return(price_data[i], price_data[i-1]) 
                  for i in range(1, len(price_data))]
        volatility = statistics.stdev(returns) * (252 ** 0.5)  # Annualized
        
        # Calculate Sharpe ratio (assuming risk-free rate of 2%)
        risk_free_rate = 0.02
        excess_return = total_return - (risk_free_rate * period_days / 365)
        sharpe_ratio = excess_return / volatility if volatility > 0 else 0
        
        # Update security with metrics
        security = await self._get_security(security_id)
        security.beta = self._calculate_beta(security_id, period_days)
        security.volatility_30d = volatility
        
        await self.session.commit()
```

---

## 🔧 **Implementation Steps**

### **Week 1: Core Infrastructure**

#### **Day 1-2: Database Enhancement**
```bash
# 1. Run database migrations
alembic revision --autogenerate -m "Add performance indexes and partitions"
alembic upgrade head

# 2. Create initial data
python -m app.src.scripts.setup_securities_database
```

#### **Day 3-4: Multi-Source Integration**
```python
# Implement PriceDataFetcher with fallback logic
# Add rate limiting and error handling
# Test with sample securities
```

#### **Day 5: Historical Backfill**
```python
# Implement HistoricalDataBackfiller
# Backfill 2 years of data for S&P 500
# Validate data quality
```

### **Week 2: Real-Time & Analytics**

#### **Day 1-2: Real-Time Updates**
```python
# Implement RealTimePriceMonitor
# Add intraday price tracking
# Test during market hours
```

#### **Day 3-4: Technical Indicators**
```python
# Implement TechnicalIndicatorsCalculator
# Calculate indicators for all securities
# Optimize calculation performance
```

#### **Day 5: Performance Analytics**
```python
# Implement PerformanceAnalytics
# Calculate beta, volatility, Sharpe ratio
# Update security metadata
```

### **Week 3: Production Deployment**

#### **Day 1-2: Monitoring & Alerting**
```python
# Add comprehensive logging
# Implement data quality alerts
# Set up performance monitoring
```

#### **Day 3-4: Optimization**
```python
# Optimize database queries
# Implement caching layer
# Add batch processing
```

#### **Day 5: Testing & Validation**
```python
# End-to-end testing
# Data quality validation
# Performance testing
```

---

## 📊 **Success Metrics**

### **Data Coverage**
- [ ] S&P 500: 100% coverage
- [ ] NASDAQ-100: 100% coverage  
- [ ] Dow Jones: 100% coverage
- [ ] ETFs: 80% coverage
- [ ] Bonds: 60% coverage

### **Data Quality**
- [ ] Price data completeness: >95%
- [ ] Data freshness: <24 hours
- [ ] Error rate: <1%
- [ ] Validation success: >99%

### **Performance**
- [ ] Historical backfill: <2 hours for 2 years
- [ ] Real-time updates: <60 second delay
- [ ] Database queries: <100ms average
- [ ] API response time: <200ms

### **Reliability**
- [ ] Uptime: >99.9%
- [ ] Data source redundancy: 3+ sources
- [ ] Automatic error recovery: <5 minutes
- [ ] Backup and recovery: <1 hour

---

## 🚀 **Deployment Strategy**

### **Phase 1: Development (Week 1)**
- Implement core infrastructure
- Test with sample data
- Validate data quality

### **Phase 2: Staging (Week 2)**
- Deploy to staging environment
- Test with real data sources
- Optimize performance

### **Phase 3: Production (Week 3)**
- Deploy to production
- Monitor and optimize
- Scale as needed

This implementation plan builds on your existing solid foundation and follows industry best practices for financial data systems. The multi-source approach ensures reliability, while the comprehensive validation and monitoring ensure data quality. 