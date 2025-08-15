# CapitolScope Data Quality Audit

## Overview
This document tracks data quality issues discovered during the Analytics implementation and provides a systematic approach to fixing them.

## Current Issues Identified

### 1. Member Data Issues
- **Issue**: "Top Trading Members" chart shows empty bars despite listing member names
- **Root Cause**: Likely `trade_count` or `total_value` fields are null/zero
- **Impact**: Analytics dashboard shows misleading member statistics
- **Priority**: HIGH

### 2. Party Distribution Issues
- **Issue**: Large "Unknown" category in party distribution (red slice in pie chart)
- **Root Cause**: Missing or null party data in trades
- **Impact**: Political analysis is incomplete
- **Priority**: HIGH

### 3. Chamber Distribution Issues
- **Issue**: Large "Unknown" category in chamber distribution
- **Root Cause**: Missing or null chamber data in trades
- **Impact**: Congressional analysis is incomplete
- **Priority**: HIGH

### 4. Amount Distribution Skew
- **Issue**: Heavily skewed towards high-value trades ($500K+)
- **Root Cause**: Possible data quality issues or real pattern
- **Impact**: Amount analysis may be misleading
- **Priority**: MEDIUM

### 5. Member Count Discrepancy
- **Issue**: Analytics shows only 10 members total
- **Root Cause**: Likely filtering or aggregation issue
- **Impact**: Dashboard statistics are incorrect
- **Priority**: HIGH

## Data Quality Metrics to Track

### Member Data Quality
- [ ] Members with null `trade_count`
- [ ] Members with null `total_value`
- [ ] Members with null `party`
- [ ] Members with null `chamber`
- [ ] Members with null `state`

### Trade Data Quality
- [ ] Trades with null `member_name`
- [ ] Trades with null `ticker`
- [ ] Trades with null `transaction_type`
- [ ] Trades with null `estimated_value`
- [ ] Trades with null `transaction_date`

### Data Completeness
- [ ] Percentage of trades with complete member data
- [ ] Percentage of trades with complete ticker data
- [ ] Percentage of trades with complete amount data
- [ ] Percentage of trades with complete date data

## SQL Queries for Data Audit

### 1. Member Data Completeness
```sql
-- Members with missing trade counts
SELECT COUNT(*) as members_without_trade_count
FROM congress_members 
WHERE trade_count IS NULL OR trade_count = 0;

-- Members with missing party data
SELECT COUNT(*) as members_without_party
FROM congress_members 
WHERE party IS NULL OR party = '';

-- Members with missing chamber data
SELECT COUNT(*) as members_without_chamber
FROM congress_members 
WHERE chamber IS NULL OR chamber = '';
```

### 2. Trade Data Completeness
```sql
-- Trades with missing member data
SELECT COUNT(*) as trades_without_member
FROM congressional_trades 
WHERE member_name IS NULL OR member_name = '';

-- Trades with missing ticker data
SELECT COUNT(*) as trades_without_ticker
FROM congressional_trades 
WHERE ticker IS NULL OR ticker = '';

-- Trades with missing amount data
SELECT COUNT(*) as trades_without_amount
FROM congressional_trades 
WHERE estimated_value IS NULL OR estimated_value = 0;
```

### 3. Data Distribution Analysis
```sql
-- Party distribution
SELECT party, COUNT(*) as count
FROM congressional_trades 
GROUP BY party 
ORDER BY count DESC;

-- Chamber distribution
SELECT chamber, COUNT(*) as count
FROM congressional_trades 
GROUP BY chamber 
ORDER BY count DESC;

-- Amount range distribution
SELECT 
  CASE 
    WHEN estimated_value <= 1000 THEN '$1 - $1,000'
    WHEN estimated_value <= 15000 THEN '$1,001 - $15,000'
    WHEN estimated_value <= 50000 THEN '$15,001 - $50,000'
    WHEN estimated_value <= 100000 THEN '$50,001 - $100,000'
    WHEN estimated_value <= 250000 THEN '$100,001 - $250,000'
    WHEN estimated_value <= 500000 THEN '$250,001 - $500,000'
    WHEN estimated_value <= 1000000 THEN '$500,001 - $1,000,000'
    ELSE '$1,000,001+'
  END as amount_range,
  COUNT(*) as count
FROM congressional_trades 
WHERE estimated_value IS NOT NULL
GROUP BY amount_range
ORDER BY count DESC;
```

## Action Plan

### Phase 1: Data Audit (Week 1)
1. **Run SQL audit queries** to identify data quality issues
2. **Create data quality dashboard** with metrics
3. **Document specific issues** with examples
4. **Prioritize fixes** based on impact

### Phase 2: Data Cleaning (Week 2)
1. **Fix member data** (party, chamber, state)
2. **Fix trade data** (member associations, tickers)
3. **Update aggregation queries** for accurate counts
4. **Test analytics endpoints** with cleaned data

### Phase 3: Data Import Improvements (Week 3)
1. **Enhance import scripts** with validation
2. **Add data quality checks** during import
3. **Create data validation rules**
4. **Implement automated data quality monitoring**

### Phase 4: Analytics Refinement (Week 4)
1. **Update chart configurations** for better visualization
2. **Add data quality indicators** to dashboard
3. **Implement data filtering** options
4. **Add export functionality**

## Success Metrics
- [ ] Zero "Unknown" categories in party/chamber charts
- [ ] Accurate member counts in analytics
- [ ] Complete trade data for all records
- [ ] Balanced amount distribution
- [ ] Real-time data quality monitoring

## Tools Needed
1. **SQL query runner** for data audit
2. **Data quality dashboard** for monitoring
3. **Import script improvements** for validation
4. **Analytics endpoint testing** tools 