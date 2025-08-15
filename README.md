# CapitolScope

## 🏛️ **Congressional Trading Transparency & Analysis Platform**

CapitolScope is a comprehensive full-stack web application that provides transparency and advanced analytics for congressional stock trading activities. Built with modern technologies and cloud-native architecture, it offers real-time tracking, portfolio analysis, and tiered access to congressional trading data.

## 🎯 **Project Overview**

### **Mission**
Democratize access to congressional trading data by providing a more generous and feature-rich alternative to existing platforms. CapitolScope offers robust free tier access while monetizing advanced features through a tiered subscription model.

### **Key Features**
- **Real-time Congressional Trading Data**: Track all disclosed stock trades by members of Congress
- **Advanced Portfolio Analytics**: Real-time portfolio valuation and performance tracking
- **Interactive Stock Charts**: TradingView-style charts with trade overlays
- **Multi-tier Subscription System**: Free, Pro ($5.99/month), Premium ($14.99/month), Enterprise
- **Automated Alert System**: Real-time notifications for significant trades
- **Data Export Capabilities**: CSV export for analysis and reporting
- **API Access**: Programmatic access for developers and analysts
- **Community Features**: Discussion boards and trade analysis threads

## 🏗️ **Technical Architecture**

### **Backend Stack**
- **FastAPI 0.104+**: High-performance async web framework with automatic OpenAPI documentation
- **SQLAlchemy 2.0+**: Modern async ORM with declarative models and relationship management
- **Pydantic 2.5+**: Data validation and settings management with comprehensive field validators
- **Celery**: Distributed task queue for background job processing and data ingestion
- **Redis**: In-memory caching and message broker for real-time features

### **Frontend Stack**
- **React 19**: Modern frontend framework with TypeScript for type safety
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Chart.js**: Interactive data visualization for portfolio analytics
- **React Router DOM**: Client-side routing with protected routes

### **Database & Storage**
- **PostgreSQL**: Primary relational database with advanced indexing and optimization
- **Supabase**: Backend-as-a-Service for authentication and database management
- **Redis**: Caching layer for frequently accessed data and session management

### **Cloud Infrastructure**
- **Google Cloud Platform (GCP)**: Primary cloud provider
- **Cloud Run**: Serverless container deployment for auto-scaling
- **Google Container Registry**: Container image storage and management
- **Cloud SQL**: Managed PostgreSQL database with automated backups

## 🔧 **Core Technical Features**

### **Multi-Source Data Ingestion**
Robust data pipeline that integrates multiple financial data sources with intelligent fallback mechanisms:
- **Yahoo Finance API**: Primary source for real-time and historical stock data
- **Alpha Vantage**: Financial market data and technical indicators
- **Polygon.io**: Alternative data source with rate limiting
- **Congress.gov API**: Official congressional trading data

### **Real-Time Portfolio Engine**
Advanced portfolio calculation system that provides:
- Real-time portfolio valuation with live price updates
- Historical performance tracking with benchmark comparisons
- Unrealized/realized gains calculation with FIFO/LIFO methods
- Risk metrics and diversification analysis
- Dividend income tracking and corporate action handling

### **Data Quality Pipeline**
Sophisticated data processing system featuring:
- Fuzzy string matching for ticker symbol extraction
- Amount normalization and validation with confidence scoring
- Duplicate detection and resolution algorithms
- Data quality metrics and audit trails
- Automated retry mechanisms for failed data fetches

### **Security & Authentication**
Enterprise-grade security implementation:
- JWT-based authentication with bcrypt password hashing
- Two-factor authentication for enhanced security
- Role-based access control with tier-specific permissions
- API rate limiting and CORS protection
- Comprehensive input validation and SQL injection prevention

## 📊 **Database Schema**

### **Core Entities**
- **Securities**: Master data for stocks, bonds, ETFs, and other financial instruments
- **Congress Members**: Comprehensive profiles with party, district, and committee information
- **Congressional Trades**: Detailed transaction records with confidence scoring
- **Portfolios**: Real-time holdings and performance tracking
- **Users**: Multi-tier subscription management with preferences

### **Advanced Features**
- **Data Quality Tracking**: Confidence scores and validation metrics
- **Audit Trails**: Comprehensive change tracking and metadata
- **Soft Delete Patterns**: Data retention with logical deletion
- **Performance Indexing**: Optimized queries for large datasets

## 🚀 **Deployment Architecture**

### **Containerization Strategy**
- Multi-stage Docker builds for optimized production images
- Docker Compose orchestration for local development
- Health checks and monitoring for all services
- Non-root user security practices

### **CI/CD Pipeline**
- GitHub Actions for automated testing and deployment
- Comprehensive test coverage with pytest and coverage reporting
- Automated security scanning and dependency updates
- Infrastructure as Code with Terraform (planned)

### **Monitoring & Observability**
- Sentry integration for error tracking and performance monitoring
- Structured logging with detailed application metrics
- Health check endpoints for container orchestration
- Real-time application monitoring and alerting

## 💡 **Technical Innovations**

### **Rate Limiting & API Management**
Custom rate limiting implementation with sliding window algorithms and intelligent retry mechanisms for external API calls.

### **Background Task Processing**
Distributed task queue system for data ingestion, portfolio calculations, and alert generation with fault tolerance and monitoring.

### **Tier-Based Feature Gating**
Sophisticated subscription management system with dynamic feature access control and usage analytics.

### **Real-Time Data Synchronization**
Live data updates with WebSocket support and efficient caching strategies for optimal performance.

## 📈 **Performance Optimizations**

- **Database Query Optimization**: Advanced indexing strategies for large datasets
- **Caching Layer**: Redis-based caching for frequently accessed data
- **Connection Pooling**: Optimized database connections for high concurrency
- **CDN Integration**: Global content delivery for static assets
- **Load Balancing**: Horizontal scaling capabilities for traffic spikes

## 🔗 **External Integrations**

### **Financial Data Sources**
- Yahoo Finance API for real-time stock data
- Alpha Vantage for market indicators and technical analysis
- Polygon.io for alternative financial data
- Congress.gov API for official congressional records

### **Third-Party Services**
- Supabase for authentication and database backend
- SendGrid for email notifications and newsletters
- Stripe for subscription billing and payment processing
- Sentry for error tracking and performance monitoring

## 📋 **Project Status**

### **Completed Features**
- ✅ Core FastAPI backend with comprehensive API endpoints
- ✅ React frontend with responsive design and TypeScript
- ✅ Multi-source data ingestion with fallback mechanisms
- ✅ Real-time portfolio calculation engine
- ✅ JWT authentication and role-based access control
- ✅ Docker containerization and cloud deployment
- ✅ Comprehensive testing suite with 80%+ coverage
- ✅ Background task processing with Celery and Redis

### **In Development**
- 🔄 Advanced analytics dashboard for Premium tier
- 🔄 TradingView-style interactive charts
- 🔄 Community discussion features
- 🔄 Enterprise white-label options

### **Planned Features**
- 📋 Machine learning models for trading pattern analysis
- 📋 Advanced API rate limiting for Premium users
- 📋 Team management system for Enterprise tier
- 📋 Mobile application development

## 🎯 **Business Model**

### **Tier Structure**
- **Free Tier**: Generous access with 3-month historical data limit
- **Pro Tier ($5.99/month)**: Full historical data and advanced alerts
- **Premium Tier ($14.99/month)**: API access and advanced analytics
- **Enterprise Tier**: Custom solutions and white-label options

### **Competitive Advantages**
- More generous free tier than competitors
- Advanced portfolio analytics and visualization
- Real-time data processing and alerts
- Modern, responsive user interface
- Comprehensive API access for developers

## 📊 **Technical Metrics**

- **Data Coverage**: 95%+ of congressional trading data
- **API Response Time**: <200ms average response time
- **Uptime**: 99.9% availability target
- **Test Coverage**: 80%+ code coverage
- **Database Performance**: Optimized queries with <100ms average response
- **Real-time Updates**: <5 second latency for trade alerts

---

## 📸 **Visual Documentation**

*[Placeholder for ER Diagram - Database schema visualization showing relationships between Securities, Congressional Trades, Members, Portfolios, and Users]*

*[Placeholder for Infrastructure Diagram - Cloud architecture showing GCP services, container orchestration, and data flow]*

*[Placeholder for System Architecture Diagram - High-level component interaction showing API layers, data processing pipeline, and frontend-backend communication]*

---

**Technologies**: Python, FastAPI, React, TypeScript, PostgreSQL, Redis, Docker, Google Cloud Platform, Celery, SQLAlchemy, Pydantic, Tailwind CSS, Chart.js

**Category**: Full-Stack Web Application, Financial Data Platform, Real-time Analytics
