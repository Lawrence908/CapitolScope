"""
Securities database setup script for CAP-24 implementation.

This script populates the securities database with:
- S&P 500 companies
- NASDAQ-100 companies  
- Dow Jones Industrial Average
- Major ETFs
- Treasury bonds
- Corporate bonds
"""

import asyncio
import logging
from datetime import date
from typing import List, Dict, Optional
import pandas as pd
import requests
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from domains.securities.models import Security, AssetType, Exchange, Sector
from domains.securities.ingestion import (
    get_or_create_asset_type,
    get_or_create_exchange,
    get_or_create_sector,
    get_or_create_security_enhanced
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SecuritiesDatabaseSetup:
    """Handles the setup and population of the securities database."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        
        # Define security universes
        self.security_universes = {
            'sp500': {
                'name': 'S&P 500',
                'description': '500 largest US companies by market cap',
                'priority': 'high',
                'source': self._fetch_sp500_tickers
            },
            'nasdaq100': {
                'name': 'NASDAQ-100',
                'description': '100 largest non-financial companies on NASDAQ',
                'priority': 'high',
                'source': self._fetch_nasdaq100_tickers
            },
            'dow_jones': {
                'name': 'Dow Jones Industrial Average',
                'description': '30 large US companies',
                'priority': 'high',
                'source': self._fetch_dow_jones_tickers
            },
            'russell_1000': {
                'name': 'Russell 1000',
                'description': '1000 largest US companies',
                'priority': 'medium',
                'source': self._fetch_russell_1000_tickers
            },
            'etfs': {
                'name': 'Major ETFs',
                'description': 'Popular exchange-traded funds',
                'priority': 'medium',
                'source': self._fetch_major_etfs
            },
            'bonds': {
                'name': 'Treasury Bonds',
                'description': 'US Treasury securities',
                'priority': 'low',
                'source': self._fetch_treasury_bonds
            }
        }
    
    async def setup_database(self):
        """Main setup function."""
        logger.info("Starting securities database setup...")
        
        # 1. Create base asset types, exchanges, and sectors
        await self._create_base_data()
        
        # 2. Populate securities from each universe
        for universe_key, universe_config in self.security_universes.items():
            logger.info(f"Processing {universe_config['name']}...")
            await self._populate_universe(universe_key, universe_config)
        
        logger.info("Securities database setup completed!")
    
    async def _create_base_data(self):
        """Create base asset types, exchanges, and sectors."""
        logger.info("Creating base asset types...")
        
        # Asset Types
        asset_types = [
            ('STOCK', 'Common Stock', 'equity'),
            ('ETF', 'Exchange Traded Fund', 'equity'),
            ('BOND', 'Bond', 'fixed_income'),
            ('TREASURY', 'Treasury Security', 'fixed_income'),
            ('OPTION', 'Option', 'derivative'),
            ('FUTURE', 'Future', 'derivative'),
            ('CRYPTO', 'Cryptocurrency', 'crypto')
        ]
        
        for code, name, category in asset_types:
            await get_or_create_asset_type(self.session, code, name)
        
        logger.info("Creating base exchanges...")
        
        # Exchanges
        exchanges = [
            ('NYSE', 'New York Stock Exchange', 'USA'),
            ('NASDAQ', 'NASDAQ Stock Market', 'USA'),
            ('AMEX', 'American Stock Exchange', 'USA'),
            ('BATS', 'BATS Global Markets', 'USA'),
            ('IEX', 'Investors Exchange', 'USA')
        ]
        
        for code, name, country in exchanges:
            await get_or_create_exchange(self.session, code, name, country)
        
        logger.info("Creating base sectors...")
        
        # Sectors (GICS classification)
        sectors = [
            ('10', 'Energy'),
            ('15', 'Materials'),
            ('20', 'Industrials'),
            ('25', 'Consumer Discretionary'),
            ('30', 'Consumer Staples'),
            ('35', 'Health Care'),
            ('40', 'Financials'),
            ('45', 'Information Technology'),
            ('50', 'Communication Services'),
            ('55', 'Utilities'),
            ('60', 'Real Estate')
        ]
        
        for gics_code, name in sectors:
            await get_or_create_sector(self.session, name, gics_code)
        
        await self.session.commit()
        logger.info("Base data created successfully!")
    
    async def _populate_universe(self, universe_key: str, universe_config: Dict):
        """Populate securities from a specific universe."""
        try:
            tickers = await universe_config['source']()
            logger.info(f"Found {len(tickers)} tickers for {universe_config['name']}")
            
            created_count = 0
            for ticker_data in tickers:
                try:
                    security = await get_or_create_security_enhanced(
                        self.session,
                        ticker_data['ticker'],
                        ticker_data['name'],
                        ticker_data.get('asset_type', 'STOCK'),
                        ticker_data.get('exchange', 'NYSE'),
                        ticker_data.get('sector_gics_code')
                    )
                    
                    if security:
                        created_count += 1
                        
                        # Update additional metadata
                        if 'market_cap' in ticker_data:
                            security.market_cap = ticker_data['market_cap']
                        if 'currency' in ticker_data:
                            security.currency = ticker_data['currency']
                        
                except Exception as e:
                    logger.error(f"Error creating security {ticker_data.get('ticker', 'unknown')}: {e}")
            
            await self.session.commit()
            logger.info(f"Created {created_count} securities for {universe_config['name']}")
            
        except Exception as e:
            logger.error(f"Error populating {universe_config['name']}: {e}")
    
    async def _fetch_sp500_tickers(self) -> List[Dict]:
        """Fetch S&P 500 tickers."""
        try:
            # Use Wikipedia to get current S&P 500 constituents
            url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
            response = requests.get(url)
            response.raise_for_status()
            
            # Parse the table
            tables = pd.read_html(response.text)
            sp500_table = tables[0]  # First table contains the S&P 500 data
            
            tickers = []
            for _, row in sp500_table.iterrows():
                ticker = row['Symbol'].strip()
                company_name = row['Security'].strip()
                
                # Basic validation
                if ticker and company_name and len(ticker) <= 10:
                    tickers.append({
                        'ticker': ticker,
                        'name': company_name,
                        'asset_type': 'STOCK',
                        'exchange': 'NYSE' if 'NYSE' in str(row.get('GICS Sub-Industry', '')) else 'NASDAQ',
                        'sector_gics_code': self._extract_sector_code(row.get('GICS Sector', ''))
                    })
            
            logger.info(f"Fetched {len(tickers)} S&P 500 tickers")
            return tickers
            
        except Exception as e:
            logger.error(f"Error fetching S&P 500 tickers: {e}")
            # Fallback to a sample list
            return self._get_sp500_sample()
    
    async def _fetch_nasdaq100_tickers(self) -> List[Dict]:
        """Fetch NASDAQ-100 tickers."""
        try:
            # Use Wikipedia to get NASDAQ-100 constituents
            url = "https://en.wikipedia.org/wiki/Nasdaq-100"
            response = requests.get(url)
            response.raise_for_status()
            
            tables = pd.read_html(response.text)
            nasdaq_table = tables[0]  # First table contains NASDAQ-100 data
            
            tickers = []
            for _, row in nasdaq_table.iterrows():
                ticker = row['Ticker'].strip()
                company_name = row['Company'].strip()
                
                if ticker and company_name:
                    tickers.append({
                        'ticker': ticker,
                        'name': company_name,
                        'asset_type': 'STOCK',
                        'exchange': 'NASDAQ',
                        'sector_gics_code': '45'  # Information Technology (most NASDAQ companies)
                    })
            
            logger.info(f"Fetched {len(tickers)} NASDAQ-100 tickers")
            return tickers
            
        except Exception as e:
            logger.error(f"Error fetching NASDAQ-100 tickers: {e}")
            return self._get_nasdaq100_sample()
    
    async def _fetch_dow_jones_tickers(self) -> List[Dict]:
        """Fetch Dow Jones Industrial Average tickers."""
        # Dow Jones 30 companies (as of 2024)
        dow_tickers = [
            {'ticker': 'AAPL', 'name': 'Apple Inc.', 'sector': '45'},
            {'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'sector': '45'},
            {'ticker': 'JPM', 'name': 'JPMorgan Chase & Co.', 'sector': '40'},
            {'ticker': 'JNJ', 'name': 'Johnson & Johnson', 'sector': '35'},
            {'ticker': 'V', 'name': 'Visa Inc.', 'sector': '40'},
            {'ticker': 'PG', 'name': 'Procter & Gamble Co.', 'sector': '30'},
            {'ticker': 'UNH', 'name': 'UnitedHealth Group Inc.', 'sector': '35'},
            {'ticker': 'HD', 'name': 'Home Depot Inc.', 'sector': '25'},
            {'ticker': 'MA', 'name': 'Mastercard Inc.', 'sector': '40'},
            {'ticker': 'DIS', 'name': 'Walt Disney Co.', 'sector': '50'},
            {'ticker': 'PYPL', 'name': 'PayPal Holdings Inc.', 'sector': '40'},
            {'ticker': 'BAC', 'name': 'Bank of America Corp.', 'sector': '40'},
            {'ticker': 'NFLX', 'name': 'Netflix Inc.', 'sector': '50'},
            {'ticker': 'ADBE', 'name': 'Adobe Inc.', 'sector': '45'},
            {'ticker': 'CRM', 'name': 'Salesforce Inc.', 'sector': '45'},
            {'ticker': 'INTC', 'name': 'Intel Corporation', 'sector': '45'},
            {'ticker': 'VZ', 'name': 'Verizon Communications Inc.', 'sector': '50'},
            {'ticker': 'CMCSA', 'name': 'Comcast Corporation', 'sector': '50'},
            {'ticker': 'PFE', 'name': 'Pfizer Inc.', 'sector': '35'},
            {'ticker': 'ABT', 'name': 'Abbott Laboratories', 'sector': '35'},
            {'ticker': 'TMO', 'name': 'Thermo Fisher Scientific Inc.', 'sector': '35'},
            {'ticker': 'COST', 'name': 'Costco Wholesale Corporation', 'sector': '30'},
            {'ticker': 'DHR', 'name': 'Danaher Corporation', 'sector': '35'},
            {'ticker': 'ACN', 'name': 'Accenture plc', 'sector': '45'},
            {'ticker': 'WMT', 'name': 'Walmart Inc.', 'sector': '30'},
            {'ticker': 'NEE', 'name': 'NextEra Energy Inc.', 'sector': '55'},
            {'ticker': 'LLY', 'name': 'Eli Lilly and Company', 'sector': '35'},
            {'ticker': 'TXN', 'name': 'Texas Instruments Inc.', 'sector': '45'},
            {'ticker': 'QCOM', 'name': 'QUALCOMM Inc.', 'sector': '45'}
        ]
        
        return [{
            'ticker': item['ticker'],
            'name': item['name'],
            'asset_type': 'STOCK',
            'exchange': 'NYSE',
            'sector_gics_code': item['sector']
        } for item in dow_tickers]
    
    async def _fetch_russell_1000_tickers(self) -> List[Dict]:
        """Fetch Russell 1000 tickers (sample)."""
        # For now, return a sample of major companies
        # In production, you'd fetch the full Russell 1000 list
        return [
            {'ticker': 'AAPL', 'name': 'Apple Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '50'},
            {'ticker': 'AMZN', 'name': 'Amazon.com Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '25'},
            {'ticker': 'TSLA', 'name': 'Tesla Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '25'},
            {'ticker': 'NVDA', 'name': 'NVIDIA Corporation', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'META', 'name': 'Meta Platforms Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '50'},
            {'ticker': 'BRK.A', 'name': 'Berkshire Hathaway Inc.', 'asset_type': 'STOCK', 'exchange': 'NYSE', 'sector_gics_code': '40'},
            {'ticker': 'UNH', 'name': 'UnitedHealth Group Inc.', 'asset_type': 'STOCK', 'exchange': 'NYSE', 'sector_gics_code': '35'},
            {'ticker': 'JNJ', 'name': 'Johnson & Johnson', 'asset_type': 'STOCK', 'exchange': 'NYSE', 'sector_gics_code': '35'}
        ]
    
    async def _fetch_major_etfs(self) -> List[Dict]:
        """Fetch major ETFs."""
        etfs = [
            {'ticker': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'QQQ', 'name': 'Invesco QQQ Trust', 'asset_type': 'ETF', 'exchange': 'NASDAQ'},
            {'ticker': 'IWM', 'name': 'iShares Russell 2000 ETF', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'VTI', 'name': 'Vanguard Total Stock Market ETF', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'VEA', 'name': 'Vanguard FTSE Developed Markets ETF', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'VWO', 'name': 'Vanguard FTSE Emerging Markets ETF', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'AGG', 'name': 'iShares Core U.S. Aggregate Bond ETF', 'asset_type': 'ETF', 'exchange': 'NASDAQ'},
            {'ticker': 'TLT', 'name': 'iShares 20+ Year Treasury Bond ETF', 'asset_type': 'ETF', 'exchange': 'NASDAQ'},
            {'ticker': 'GLD', 'name': 'SPDR Gold Shares', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'SLV', 'name': 'iShares Silver Trust', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'USO', 'name': 'United States Oil Fund LP', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'VNQ', 'name': 'Vanguard Real Estate ETF', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'XLF', 'name': 'Financial Select Sector SPDR Fund', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'XLK', 'name': 'Technology Select Sector SPDR Fund', 'asset_type': 'ETF', 'exchange': 'AMEX'},
            {'ticker': 'XLE', 'name': 'Energy Select Sector SPDR Fund', 'asset_type': 'ETF', 'exchange': 'AMEX'}
        ]
        
        return etfs
    
    async def _fetch_treasury_bonds(self) -> List[Dict]:
        """Fetch Treasury bond securities."""
        bonds = [
            {'ticker': '^TNX', 'name': '10-Year Treasury Note Yield', 'asset_type': 'TREASURY', 'exchange': 'NYSE'},
            {'ticker': '^TYX', 'name': '30-Year Treasury Bond Yield', 'asset_type': 'TREASURY', 'exchange': 'NYSE'},
            {'ticker': '^IRX', 'name': '13-Week Treasury Bill Yield', 'asset_type': 'TREASURY', 'exchange': 'NYSE'},
            {'ticker': '^DGS', 'name': '3-Month Treasury Bill Yield', 'asset_type': 'TREASURY', 'exchange': 'NYSE'},
            {'ticker': '^DGS2', 'name': '2-Year Treasury Note Yield', 'asset_type': 'TREASURY', 'exchange': 'NYSE'},
            {'ticker': '^DGS5', 'name': '5-Year Treasury Note Yield', 'asset_type': 'TREASURY', 'exchange': 'NYSE'}
        ]
        
        return bonds
    
    def _extract_sector_code(self, sector_name: str) -> Optional[str]:
        """Extract GICS sector code from sector name."""
        sector_mapping = {
            'Energy': '10',
            'Materials': '15',
            'Industrials': '20',
            'Consumer Discretionary': '25',
            'Consumer Staples': '30',
            'Health Care': '35',
            'Financials': '40',
            'Information Technology': '45',
            'Communication Services': '50',
            'Utilities': '55',
            'Real Estate': '60'
        }
        
        return sector_mapping.get(sector_name.strip())
    
    def _get_sp500_sample(self) -> List[Dict]:
        """Fallback S&P 500 sample data."""
        return [
            {'ticker': 'AAPL', 'name': 'Apple Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '50'},
            {'ticker': 'AMZN', 'name': 'Amazon.com Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '25'},
            {'ticker': 'TSLA', 'name': 'Tesla Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '25'},
            {'ticker': 'NVDA', 'name': 'NVIDIA Corporation', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'META', 'name': 'Meta Platforms Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '50'},
            {'ticker': 'BRK.A', 'name': 'Berkshire Hathaway Inc.', 'asset_type': 'STOCK', 'exchange': 'NYSE', 'sector_gics_code': '40'},
            {'ticker': 'UNH', 'name': 'UnitedHealth Group Inc.', 'asset_type': 'STOCK', 'exchange': 'NYSE', 'sector_gics_code': '35'},
            {'ticker': 'JNJ', 'name': 'Johnson & Johnson', 'asset_type': 'STOCK', 'exchange': 'NYSE', 'sector_gics_code': '35'}
        ]
    
    def _get_nasdaq100_sample(self) -> List[Dict]:
        """Fallback NASDAQ-100 sample data."""
        return [
            {'ticker': 'AAPL', 'name': 'Apple Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '50'},
            {'ticker': 'AMZN', 'name': 'Amazon.com Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '25'},
            {'ticker': 'TSLA', 'name': 'Tesla Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '25'},
            {'ticker': 'NVDA', 'name': 'NVIDIA Corporation', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'META', 'name': 'Meta Platforms Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '50'},
            {'ticker': 'NFLX', 'name': 'Netflix Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '50'},
            {'ticker': 'ADBE', 'name': 'Adobe Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'},
            {'ticker': 'CRM', 'name': 'Salesforce Inc.', 'asset_type': 'STOCK', 'exchange': 'NASDAQ', 'sector_gics_code': '45'}
        ]


async def main():
    """Main function to run the securities database setup."""
    # Database connection (you'll need to configure this)
    database_url = "postgresql+asyncpg://user:password@localhost/capitolscope"
    engine = create_async_engine(database_url)
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        setup = SecuritiesDatabaseSetup(session)
        await setup.setup_database()


if __name__ == "__main__":
    asyncio.run(main()) 