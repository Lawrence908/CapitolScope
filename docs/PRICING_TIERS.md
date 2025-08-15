# CapitolScope Pricing Tiers

## 🎯 **Competitive Strategy**

CapitolScope positions itself as a more generous alternative to existing congressional trading platforms:

- **Capitol Trades & Unusual Whales:** 100% free but limited in export, alerts, and API
- **Quiver Quantitative:** ~$12.50–75/month for similar features
- **CapitolScope:** More than Capitol Trades for free, paid tiers at roughly half of Quiver's pricing

## 💰 **Tier Structure**

### 🆓 **Free — "Get Started with Transparency"**
**Price:** $0/month  
**Purpose:** Get users hooked with robust, useful access—better than Capitol Trades' free tier.

#### **Features:**
- ✅ **Basic Search & Browse** - Search and filter congressional trading data
- ✅ **Member Profiles** - Detailed profiles of congress members and their trading history
- ✅ **Two-Factor Authentication** - Enhanced security for your account
- ✅ **Active Sessions** - Manage your login sessions across devices
- ✅ **Trade Alerts** - Get notified of new congressional trades in real-time
- ✅ **Basic Portfolio Analytics** - Basic portfolio performance and analytics
- ✅ **Export to CSV** - Export trading data to CSV format
- 🚫 **Limited Historical Data** - Access to 3 months of historical trade data only

#### **Implementation Priority:** ASAP (Foundation for user acquisition)

---

### 💼 **Pro — "Power for Retail Investors"**
**Price:** $5.99/month  
**Purpose:** Light subscription for active users, power filters, and full data access.

#### **Features:**
- ✅ **Everything in Free**
- ✅ **Full Historical Data** - Complete access to all historical trading data
- ✅ **Weekly Summaries** - Comprehensive weekly trading activity reports
- ✅ **Multiple Buyer Alerts** - Alerts when 5+ members buy same stock in 3 months
- ✅ **High-Value Trade Alerts** - Alerts for trades over $1M
- ✅ **Saved Portfolios / Watchlists** - Save and track your favorite portfolios

#### **Implementation Priority:** After Free tier is stable (2-3 weeks post-launch)

---

### 💎 **Premium — "For Analysts and Devs"**
**Price:** $14.99/month  
**Purpose:** Monetize devs and analysts with technical access.

#### **Features:**
- ✅ **Everything in Pro**
- ✅ **TradingView-Style Charts** - Interactive stock charts with trade overlays
- ✅ **Advanced Portfolio Analytics** - Advanced trading patterns and insights
- ✅ **Sector/Committee-based Filters** - Filter trades by congressional committees and sectors
- ✅ **API Access (Rate-limited)** - Programmatic access to trading data
- ✅ **Custom Alert Configurations** - Create custom alerts for specific criteria

#### **Implementation Priority:** After Pro tier (4-6 weeks post-launch)

---

### 🏢 **Enterprise — "Custom Integrations & Teams"**
**Price:** Contact Sales (Starts ~$49.99/month)  
**Purpose:** Custom solutions for organizations.

#### **Features:**
- ✅ **Everything in Premium**
- ✅ **Advanced Analytics Dashboard** - Advanced analytics and pattern recognition
- ✅ **White-Label Dashboard Options** - Custom branding and deployment options
- ✅ **Priority Support** - Priority customer support and assistance
- ✅ **Increased API Limits** - Higher rate limits for API access
- ✅ **Team Seats / Admin Panel** - Manage team access and permissions

#### **Implementation Priority:** After Premium tier (8-10 weeks post-launch)

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Free Tier Foundation (Weeks 1-4)**
**Goal:** Launch with generous free tier to compete with Capitol Trades

**Core Features:**
- Basic Search & Browse (CAP-10)
- Member Profiles (CAP-11)
- Trade Alerts (CAP-15)
- Basic Portfolio Analytics (CAP-26)
- Export to CSV
- Limited Historical Data (3 months)

**Technical Requirements:**
- Transaction List Page (CAP-10)
- Individual Member Profile Page (CAP-11)
- Email Alert System (CAP-15)
- Basic Portfolio Performance Engine (CAP-26)
- Database Schema Design (CAP-21)
- API Development (CAP-20)

### **Phase 2: Pro Tier (Weeks 5-7)**
**Goal:** Add subscription features for active users

**New Features:**
- Full Historical Data
- Weekly Summaries
- Multiple Buyer Alerts
- High-Value Trade Alerts
- Saved Portfolios / Watchlists

**Technical Requirements:**
- Pro Features Infrastructure (CAP-18)
- Enhanced Alert System
- Portfolio Watchlist System
- Weekly Summary Generation

### **Phase 3: Premium Tier (Weeks 8-10)**
**Goal:** Target analysts and developers

**New Features:**
- TradingView-Style Charts (CAP-27)
- Advanced Portfolio Analytics
- Sector/Committee-based Filters
- API Access (Rate-limited)
- Custom Alert Configurations

**Technical Requirements:**
- TradingView-Style Stock Charts (CAP-27)
- Advanced Analytics Dashboard (CAP-19)
- API Rate Limiting
- Custom Alert Engine

### **Phase 4: Enterprise Tier (Weeks 11-12)**
**Goal:** Custom solutions for organizations

**New Features:**
- Advanced Analytics Dashboard
- White-Label Options
- Priority Support
- Increased API Limits
- Team Seats / Admin Panel

**Technical Requirements:**
- White-Label System
- Team Management System
- Advanced Analytics Engine
- Priority Support Infrastructure

---

## 📊 **Feature Mapping to Linear Tickets**

### **Free Tier Features:**
- CAP-10: Transaction List Page (Basic Search & Browse)
- CAP-11: Individual Member Profile Page (Member Profiles)
- CAP-15: Trade Alert System (Trade Alerts)
- CAP-26: Portfolio Performance Engine (Basic Portfolio Analytics)
- Export to CSV (New ticket needed)
- Limited Historical Data (New ticket needed)

### **Pro Tier Features:**
- CAP-18: Pro Features Infrastructure (Subscription management)
- Full Historical Data (New ticket needed)
- CAP-14: Email Newsletter Infrastructure (Weekly Summaries)
- Enhanced Alert System (CAP-15 extension)
- Saved Portfolios / Watchlists (New ticket needed)

### **Premium Tier Features:**
- CAP-27: TradingView-Style Stock Charts
- CAP-19: Advanced Analytics Dashboard
- Sector/Committee-based Filters (New ticket needed)
- API Access (CAP-20 extension)
- Custom Alert Configurations (CAP-15 extension)

### **Enterprise Tier Features:**
- Advanced Analytics Dashboard (CAP-19 extension)
- White-Label Options (New ticket needed)
- Priority Support (New ticket needed)
- Increased API Limits (CAP-20 extension)
- Team Seats / Admin Panel (New ticket needed)

---

## 🎯 **Success Metrics**

### **Free Tier Success:**
- User registration rate
- Daily active users
- Feature adoption (alerts, exports)
- User retention (7-day, 30-day)

### **Pro Tier Success:**
- Conversion rate from Free to Pro
- Monthly recurring revenue
- Feature usage analytics
- Customer satisfaction scores

### **Premium Tier Success:**
- Developer/analyst adoption
- API usage metrics
- Chart feature engagement
- Advanced analytics usage

### **Enterprise Tier Success:**
- Enterprise customer acquisition
- Average contract value
- Team seat utilization
- White-label deployments

---

## 🔧 **Technical Considerations**

### **Feature Gating:**
- Implement subscription-based feature access
- Rate limiting for API endpoints
- Data access controls based on tier
- Export limitations for free users

### **Payment Processing:**
- Stripe integration for subscription management
- Prorated billing for upgrades/downgrades
- Free trial implementation
- Invoice and receipt generation

### **Analytics:**
- Feature usage tracking
- Conversion funnel analysis
- Revenue analytics
- User behavior insights

### **Support:**
- Tier-based support response times
- Knowledge base for self-service
- Priority support for Enterprise
- Community support for Free tier 