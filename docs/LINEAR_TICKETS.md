# CapitolScope Linear Tickets

## 🎯 **EPIC: Free Tier Foundation (Phase 1)**

### **CAP-10: Transaction List Page**
**Priority:** Critical  
**Estimate:** 3 days  
**Labels:** `frontend`, `core-feature`, `free-tier`

**Description:**
Create a main transactions page that displays all congressional trading data in a sortable, filterable table. This is the core feature for the Free tier.

**Acceptance Criteria:**
- [ ] Display transactions in a paginated table
- [ ] Sort by congress member, date, amount, ticker
- [ ] Filter by member, date range, transaction type
- [ ] Search functionality across all fields
- [ ] Export to CSV (Free tier feature)
- [ ] Responsive design for mobile/desktop
- [ ] Limited to 3 months of historical data for Free tier

**Technical Requirements:**
- React/Next.js frontend
- API endpoint for transaction data
- Database queries with proper indexing
- Real-time updates for new transactions
- Data access controls for Free tier limitations

---

### **CAP-11: Individual Member Profile Page**
**Priority:** Critical  
**Estimate:** 4 days  
**Labels:** `frontend`, `member-profile`, `free-tier`

**Description:**
Create detailed profile pages for each congress member showing their trading history and portfolio. This is a key Free tier feature to compete with Capitol Trades.

**Acceptance Criteria:**
- [ ] Member information (name, district, party)
- [ ] Complete trading history timeline (limited to 3 months for Free tier)
- [ ] Portfolio summary (current holdings)
- [ ] Transaction statistics (total trades, amounts)
- [ ] Basic performance metrics (Free tier)
- [ ] Related news/headlines
- [ ] Export member data to CSV (Free tier feature)

**Technical Requirements:**
- Dynamic routing (`/member/[id]`)
- Basic portfolio calculation logic
- Performance analytics (basic for Free tier)
- News API integration
- Data access controls for Free tier limitations

---

## 📈 **EPIC: Stock Database & Price Tracking Infrastructure**

### **CAP-24: Comprehensive Stock Database Setup**
**Priority:** Critical  
**Estimate:** 5 days  
**Labels:** `backend`, `database`, `stocks`, `foundation`, `free-tier`

**Description:**
Build a comprehensive stock database covering all assets traded by congress members, with daily price tracking to enable basic portfolio analytics for Free tier and advanced features for paid tiers.

**Acceptance Criteria:**
- [ ] Stock database with all S&P 500 companies
- [ ] Dow Jones Industrial Average coverage
- [ ] NASDAQ-100 major companies
- [ ] US Treasury bills, notes, and bonds
- [ ] Corporate bonds and municipal securities
- [ ] ETFs and mutual funds commonly traded
- [ ] Cryptocurrency tracking for disclosed crypto trades
- [ ] REITs and commodity funds
- [ ] Stock metadata (company name, sector, market cap, etc.)

**Technical Requirements:**
- PostgreSQL database with optimized schema
- Ticker symbol standardization and validation
- Company information from reliable data sources
- Sector and industry classification
- Market capitalization tracking
- Asset type categorization

---

### **CAP-25: Daily Price Data Ingestion System**
**Priority:** Critical  
**Estimate:** 6 days  
**Labels:** `backend`, `data-ingestion`, `automation`, `free-tier`

**Description:**
Create an automated system to fetch and store daily price data for all tracked securities, enabling basic portfolio analytics for Free tier and advanced features for paid tiers.

**Acceptance Criteria:**
- [ ] Daily OHLC (Open, High, Low, Close) price data
- [ ] Volume data for all tracked securities
- [ ] Dividend and split adjustment handling
- [ ] Historical data backfill (5+ years)
- [ ] Real-time intraday price updates
- [ ] Treasury yield curve data
- [ ] Bond price and yield tracking
- [ ] ETF/mutual fund NAV tracking
- [ ] Data validation and error handling
- [ ] Automated retry mechanisms for failed fetches

**Technical Requirements:**
- Financial data API integration (Alpha Vantage, Polygon, Yahoo Finance)
- Scheduled data ingestion (daily cron jobs)
- Data validation and cleaning pipeline
- Historical data storage optimization
- Rate limiting and API quota management
- Backup data sources for reliability

---

### **CAP-26: Portfolio Performance Engine**
**Priority:** Critical  
**Estimate:** 4 days  
**Labels:** `backend`, `analytics`, `performance`, `free-tier`

**Description:**
Build the core engine that calculates portfolio performance, gains/losses, and benchmarking for congressional trades using the stock price database. This enables basic portfolio analytics for Free tier.

**Acceptance Criteria:**
- [ ] Real-time portfolio valuation
- [ ] Historical performance calculation (limited to 3 months for Free tier)
- [ ] Unrealized/realized gains tracking
- [ ] Basic benchmark comparison (S&P 500)
- [ ] Basic risk metrics for Free tier
- [ ] Dividend income tracking
- [ ] Cost basis calculation with FIFO/LIFO
- [ ] Basic portfolio diversification metrics
- [ ] Performance attribution analysis (Premium tier)

**Technical Requirements:**
- Efficient portfolio calculation algorithms
- Real-time price integration
- Historical performance computation (with tier limitations)
- Basic benchmark data integration
- Basic risk metrics calculation
- Data access controls for Free tier limitations

---

## 📊 **EPIC: Portfolio Visualization**

### **CAP-27: Congress-GOV API integration**
**Priority:** Medium  
**Estimate:** 4 days  
**Labels:** `api`, `backend`, `integration`

**Description:**
Integrate with Congress.gov API to fetch official congressional data and enhance our database.

**Acceptance Criteria:**
- [ ] Congress.gov API integration
- [ ] Member information synchronization
- [ ] Committee data integration
- [ ] Bill and legislation tracking
- [ ] Real-time data updates
- [ ] Error handling and fallbacks
- [ ] Rate limiting compliance
- [ ] Data validation and cleaning

**Technical Requirements:**
- Congress.gov API client
- Data synchronization system
- Error handling and retry logic
- Rate limiting implementation
- Data validation and cleaning
- Real-time update system

---

### **CAP-30: TradingView-Style Stock Charts**
**Priority:** Medium  
**Estimate:** 5 days  
**Labels:** `frontend`, `charts`, `visualization`, `premium-tier`

**Description:**
Create interactive stock charts similar to TradingView that show congressional trades overlaid on price movements, providing immediate context for trading decisions. This is a Premium tier feature.

**Acceptance Criteria:**
- [ ] Interactive candlestick/line charts
- [ ] Congressional trade markers on timeline
- [ ] Multiple timeframes (1D, 1W, 1M, 1Y, 5Y)
- [ ] Technical indicators (moving averages, RSI, MACD)
- [ ] Volume overlay charts
- [ ] Trade annotation with member details
- [ ] Buy/sell signal visualization
- [ ] Portfolio performance overlay
- [ ] Comparison with market indices
- [ ] Mobile-responsive chart interaction
- [ ] Premium tier access controls

**Technical Requirements:**
- TradingView widget integration or Chart.js
- Real-time data streaming
- Historical data visualization
- Trade event overlay system
- Performance calculation display
- Interactive tooltip system
- Premium tier feature gating

---

### **CAP-12: Member Portfolio Dashboard**
**Priority:** Medium  
**Estimate:** 5 days  
**Labels:** `frontend`, `charts`, `portfolio`, `free-tier`

**Description:**
Create a portfolio dashboard that shows a congress member's holdings like a personal investment account. This is a Free tier feature with basic analytics.

**Acceptance Criteria:**
- [ ] Basic portfolio visualization (Free tier)
- [ ] Portfolio allocation pie chart
- [ ] Performance over time graph (limited to 3 months for Free tier)
- [ ] Holdings list with current values
- [ ] Transaction history timeline
- [ ] Basic risk metrics and analysis (Free tier)
- [ ] Advanced portfolio analytics (Premium tier)

**Technical Requirements:**
- Chart.js or TradingView integration
- Real-time stock price data
- Portfolio calculation engine
- Performance tracking algorithms
- Tier-based feature access controls

---

### **CAP-13: Portfolio Comparison Tool**
**Priority:** Low  
**Estimate:** 3 days  
**Labels:** `frontend`, `comparison`

**Description:**
Allow users to compare portfolios between different congress members.

**Acceptance Criteria:**
- [ ] Side-by-side portfolio comparison
- [ ] Overlap analysis (shared holdings)
- [ ] Performance benchmarking
- [ ] Risk comparison metrics
- [ ] Export comparison reports

---

## 📧 **EPIC: Email Notification System**

### **CAP-14: Email Newsletter Infrastructure**
**Priority:** Medium  
**Estimate:** 4 days  
**Labels:** `backend`, `email`, `notifications`, `pro-tier`

**Description:**
Build the email notification system for alerting users about significant congressional trades. This enables Weekly Summaries for Pro tier.

**Acceptance Criteria:**
- [ ] Email service integration (SendGrid/Mailgun)
- [ ] Newsletter template design
- [ ] Subscriber management system
- [ ] Email preferences (frequency, filters)
- [ ] Unsubscribe functionality
- [ ] Email analytics tracking
- [ ] Weekly summary generation for Pro tier

**Technical Requirements:**
- Email service API integration
- Template engine
- Subscriber database
- Email queue system
- Weekly summary generation logic

---

### **CAP-15: Trade Alert System**
**Priority:** Critical  
**Estimate:** 3 days  
**Labels:** `backend`, `alerts`, `free-tier`

**Description:**
Create automated alerts for significant trades (large amounts, specific stocks, etc.). This is a key Free tier feature to compete with Capitol Trades.

**Acceptance Criteria:**
- [ ] Basic alert thresholds (Free tier)
- [ ] Real-time trade monitoring
- [ ] Email notification triggers
- [ ] Alert history tracking
- [ ] User alert preferences
- [ ] Multiple buyer alerts (Pro tier)
- [ ] High-value trade alerts (Pro tier)
- [ ] Custom alert configurations (Premium tier)

**Technical Requirements:**
- Real-time data processing
- Alert rule engine
- Notification queuing
- User preference management
- Tier-based alert feature access

---

## 💬 **EPIC: Community Features**

### **CAP-16: Message Board System**
**Priority:** Low  
**Estimate:** 6 days  
**Labels:** `frontend`, `backend`, `community`

**Description:**
Create a community message board where users can discuss congressional trading activity.

**Acceptance Criteria:**
- [ ] Thread-based discussion system
- [ ] User registration and profiles
- [ ] Moderation tools
- [ ] Rich text editor
- [ ] Search and filtering
- [ ] Mobile-responsive design

**Technical Requirements:**
- User authentication system
- Real-time messaging
- Content moderation
- Search functionality

---

### **CAP-17: Trade Discussion Threads**
**Priority:** Low  
**Estimate:** 2 days  
**Labels:** `frontend`, `integration`

**Description:**
Integrate discussion threads with individual trades and member profiles.

**Acceptance Criteria:**
- [ ] Auto-generated discussion threads for large trades
- [ ] Member profile discussion sections
- [ ] Stock-specific discussion boards
- [ ] Thread linking to related trades

---

## 💎 **EPIC: Subscription & Premium Features**

### **CAP-18: Pro Features Infrastructure**
**Priority:** High  
**Estimate:** 5 days  
**Labels:** `backend`, `premium`, `billing`, `pro-tier`

**Description:**
Build the foundation for premium features and subscription management. This enables Pro tier features.

**Acceptance Criteria:**
- [ ] User subscription management
- [ ] Payment processing (Stripe)
- [ ] Feature access control
- [ ] Subscription analytics
- [ ] Billing history
- [ ] Pro tier feature gating
- [ ] Full historical data access for Pro tier
- [ ] Saved portfolios/watchlists for Pro tier

**Technical Requirements:**
- Stripe integration
- Subscription management
- Feature gating system
- Analytics tracking
- Data access controls for tier limitations

---

### **CAP-19: Advanced Analytics Dashboard**
**Priority:** Medium  
**Estimate:** 7 days  
**Labels:** `frontend`, `premium`, `analytics`, `premium-tier`

**Description:**
Create advanced analytics features for Premium and Enterprise tier users.

**Acceptance Criteria:**
- [ ] Advanced portfolio analytics (Premium tier)
- [ ] Trading pattern analysis (Premium tier)
- [ ] Insider trading correlation tools (Premium tier)
- [ ] Custom alert configurations (Premium tier)
- [ ] Data export capabilities (Premium tier)
- [ ] API access for premium users (Premium tier)
- [ ] Advanced analytics dashboard (Enterprise tier)
- [ ] White-label analytics options (Enterprise tier)

**Technical Requirements:**
- Advanced analytics engine
- Pattern recognition algorithms
- Custom reporting system
- API rate limiting
- Tier-based feature access controls

---

## 🔧 **EPIC: Technical Infrastructure**

### **CAP-20: API Development**
**Priority:** Critical  
**Estimate:** 4 days  
**Labels:** `backend`, `api`, `free-tier`

**Description:**
Build RESTful API endpoints for all frontend features. This enables Free tier functionality and Premium tier API access.

**Acceptance Criteria:**
- [ ] Transaction data endpoints (Free tier)
- [ ] Member profile endpoints (Free tier)
- [ ] Portfolio calculation endpoints (Free tier)
- [ ] Search and filtering endpoints (Free tier)
- [ ] API documentation
- [ ] Rate limiting and authentication
- [ ] API access for Premium tier (rate-limited)
- [ ] Increased API limits for Enterprise tier

**Technical Requirements:**
- FastAPI or Django REST Framework
- JWT authentication
- API documentation (Swagger)
- Rate limiting with tier-based limits
- API access controls for Premium/Enterprise tiers

---

### **CAP-21: Database Schema Design**
**Priority:** Critical  
**Estimate:** 3 days  
**Labels:** `backend`, `database`, `free-tier`

**Description:**
Design and implement the complete database schema for all features. This is foundational for Free tier and all subsequent tiers.

**Acceptance Criteria:**
- [ ] User management tables
- [ ] Transaction data tables
- [ ] Portfolio tracking tables
- [ ] Subscription/billing tables (for Pro+ tiers)
- [ ] Alert and notification tables
- [ ] API usage tracking tables (for Premium+ tiers)
- [ ] Proper indexing for performance
- [ ] Data access controls for tier limitations

**Technical Requirements:**
- PostgreSQL database
- Migration system
- Performance optimization
- Backup strategy
- Tier-based data access controls

---

## 🚀 **EPIC: Deployment & DevOps**

### **CAP-22: Production Deployment**
**Priority:** High  
**Estimate:** 3 days  
**Labels:** `devops`, `deployment`

**Description:**
Deploy the application to production with proper monitoring and scaling.

**Acceptance Criteria:**
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production environment setup
- [ ] Monitoring and logging
- [ ] SSL certificate setup
- [ ] Domain configuration

**Technical Requirements:**
- AWS/GCP deployment
- Docker containers
- CI/CD pipeline
- Monitoring tools

---

### **CAP-23: Performance Optimization**
**Priority:** Medium  
**Estimate:** 4 days  
**Labels:** `performance`, `optimization`

**Description:**
Optimize application performance for large datasets and high traffic.

**Acceptance Criteria:**
- [ ] Database query optimization
- [ ] Frontend performance improvements
- [ ] Caching implementation
- [ ] CDN setup
- [ ] Load testing
- [ ] Performance monitoring

### **CAP-28: Transaction Accuracy Improvement**
**Priority:** High  
**Estimate:** 3 days  
**Labels:** `backend`, `improvement`, `core-feature`

**Description:**
Improve the accuracy and reliability of transaction data processing and display.

**Acceptance Criteria:**
- [ ] Enhanced transaction data validation
- [ ] Improved error handling for malformed data
- [ ] Better duplicate detection and resolution
- [ ] Data consistency checks
- [ ] Transaction reconciliation tools
- [ ] Audit trail for data changes

**Technical Requirements:**
- Data validation algorithms
- Error handling and logging
- Duplicate detection logic
- Data reconciliation system

---

### **CAP-29: User Authentication & Profile System**
**Priority:** High  
**Estimate:** 4 days  
**Labels:** `auth`, `backend`, `frontend`

**Description:**
Implement comprehensive user authentication and profile management system.

**Acceptance Criteria:**
- [ ] User registration and login
- [ ] Password reset functionality
- [ ] Email verification
- [ ] User profile management
- [ ] Two-factor authentication
- [ ] Session management
- [ ] User preferences and settings
- [ ] Account deletion

**Technical Requirements:**
- JWT authentication system
- Password hashing and security
- Email service integration
- User database schema
- Session management
- Security best practices

---







### **CAP-31: Export to CSV Feature**
**Priority:** Critical  
**Estimate:** 2 days  
**Labels:** `frontend`, `export`, `free-tier`

**Description:**
Implement CSV export functionality for transaction data. This is a key Free tier feature to compete with Capitol Trades.

**Acceptance Criteria:**
- [ ] Export transaction data to CSV
- [ ] Export member portfolio data to CSV
- [ ] Configurable export options (date range, filters)
- [ ] Large dataset handling
- [ ] Download progress indicators
- [ ] Free tier access controls

**Technical Requirements:**
- CSV generation library
- File download handling
- Data filtering and processing
- Progress tracking for large exports

---

### **CAP-32: Saved Portfolios / Watchlists**
**Priority:** High  
**Estimate:** 3 days  
**Labels:** `frontend`, `backend`, `pro-tier`

**Description:**
Implement saved portfolios and watchlists functionality for Pro tier users.

**Acceptance Criteria:**
- [ ] Save member portfolios to watchlist
- [ ] Create custom watchlists
- [ ] Watchlist management (add/remove)
- [ ] Watchlist notifications
- [ ] Share watchlists (optional)
- [ ] Pro tier access controls

**Technical Requirements:**
- User watchlist database schema
- Watchlist CRUD operations
- Notification integration
- Pro tier feature gating

---

### **CAP-33: Sector/Committee-based Filters**
**Priority:** Medium  
**Estimate:** 3 days  
**Labels:** `frontend`, `backend`, `premium-tier`

**Description:**
Implement advanced filtering by congressional committees and sectors for Premium tier users.

**Acceptance Criteria:**
- [ ] Filter by congressional committees
- [ ] Filter by industry sectors
- [ ] Combined committee/sector filters
- [ ] Filter presets and saved filters
- [ ] Premium tier access controls

**Technical Requirements:**
- Committee and sector data mapping
- Advanced filter engine
- Filter persistence
- Premium tier feature gating

---

### **CAP-34: White-Label Dashboard Options**
**Priority:** Low  
**Estimate:** 5 days  
**Labels:** `frontend`, `backend`, `enterprise-tier`

**Description:**
Implement white-label dashboard options for Enterprise tier customers.

**Acceptance Criteria:**
- [ ] Custom branding options
- [ ] Custom domain support
- [ ] Branded email templates
- [ ] Custom color schemes
- [ ] Enterprise tier access controls

**Technical Requirements:**
- Dynamic theming system
- Custom domain handling
- Branded template engine
- Enterprise tier feature gating

---

### **CAP-35: Team Management System**
**Priority:** Low  
**Estimate:** 4 days  
**Labels:** `frontend`, `backend`, `enterprise-tier`

**Description:**
Implement team management and admin panel for Enterprise tier customers.

**Acceptance Criteria:**
- [ ] Team member invitation system
- [ ] Role-based access controls
- [ ] Team admin panel
- [ ] Usage analytics per team member
- [ ] Enterprise tier access controls

**Technical Requirements:**
- Team management database schema
- Role-based permissions
- Admin dashboard
- Enterprise tier feature gating



---

## 📋 **MILESTONE: Free Tier Foundation (Phase 1)**
**Target Date:** 4 weeks  
**Total Estimate:** 25 days
**Critical Path:** CAP-24 → CAP-25 → CAP-10 → CAP-11 → CAP-15

**Tickets:**
- CAP-24: Comprehensive Stock Database Setup (5 days)
- CAP-25: Daily Price Data Ingestion System (6 days)
- CAP-10: Transaction List Page (3 days)
- CAP-11: Individual Member Profile Page (4 days)
- CAP-15: Trade Alert System (3 days)
- CAP-26: Portfolio Performance Engine (4 days)
- CAP-20: API Development (4 days)
- CAP-21: Database Schema Design (3 days)
- CAP-29: User Authentication & Profile System (4 days)
- CAP-31: Export to CSV Feature (2 days)

## 📋 **MILESTONE: Pro Tier Features (Phase 2)**
**Target Date:** 7 weeks  
**Total Estimate:** 15 days

**Tickets:**
- CAP-18: Pro Features Infrastructure (5 days)
- CAP-14: Email Newsletter Infrastructure (4 days)
- CAP-32: Saved Portfolios / Watchlists (3 days)
- Enhanced Alert System (CAP-15 extension) (3 days)

## 📋 **MILESTONE: Premium Tier Features (Phase 3)**
**Target Date:** 10 weeks  
**Total Estimate:** 18 days

**Tickets:**
- CAP-30: TradingView-Style Stock Charts (5 days)
- CAP-19: Advanced Analytics Dashboard (7 days)
- CAP-33: Sector/Committee-based Filters (3 days)
- API Rate Limiting (CAP-20 extension) (3 days)

## 📋 **MILESTONE: Enterprise Tier Features (Phase 4)**
**Target Date:** 12 weeks  
**Total Estimate:** 12 days

**Tickets:**
- CAP-34: White-Label Dashboard Options (5 days)
- CAP-35: Team Management System (4 days)
- Advanced Analytics Dashboard (CAP-19 extension) (3 days)

## 📋 **MILESTONE: Production Launch**
**Target Date:** 12 weeks  
**Total Estimate:** 10 days

**Tickets:**
- CAP-22: Production Deployment (3 days)
- CAP-23: Performance Optimization (4 days)
- CAP-15: Trade Alert System (3 days)

## 📋 **MILESTONE: Community & Premium (CAP-16, CAP-18, CAP-19)**
**Target Date:** 16 weeks  
**Total Estimate:** 18 days

---

## 🎯 **Priority Matrix by Tier:**

### **Free Tier (Critical - Launch ASAP):**
- CAP-24: Comprehensive Stock Database Setup
- CAP-25: Daily Price Data Ingestion System
- CAP-10: Transaction List Page
- CAP-11: Individual Member Profile Page
- CAP-15: Trade Alert System
- CAP-26: Portfolio Performance Engine
- CAP-20: API Development
- CAP-21: Database Schema Design
- CAP-29: User Authentication & Profile System
- CAP-31: Export to CSV Feature

### **Pro Tier (High Priority - 2-3 weeks post-launch):**
- CAP-18: Pro Features Infrastructure
- CAP-14: Email Newsletter Infrastructure
- CAP-32: Saved Portfolios / Watchlists
- Enhanced Alert System (CAP-15 extension)

### **Premium Tier (Medium Priority - 4-6 weeks post-launch):**
- CAP-30: TradingView-Style Stock Charts
- CAP-19: Advanced Analytics Dashboard
- CAP-33: Sector/Committee-based Filters
- API Rate Limiting (CAP-20 extension)

### **Enterprise Tier (Low Priority - 8-10 weeks post-launch):**
- CAP-34: White-Label Dashboard Options
- CAP-35: Team Management System
- Advanced Analytics Dashboard (CAP-19 extension)

### **Infrastructure (Ongoing):**
- CAP-22: Production Deployment
- CAP-23: Performance Optimization 