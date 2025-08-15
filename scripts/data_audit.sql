-- CapitolScope Data Quality Audit Scripts
-- Run these queries to identify data quality issues

-- ============================================================================
-- 1. MEMBER DATA QUALITY AUDIT
-- ============================================================================

-- Members with missing trade counts
SELECT 
    COUNT(*) as members_without_trade_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congress_members), 2) as percentage
FROM congress_members 
WHERE trade_count IS NULL OR trade_count = 0;

-- Members with missing party data
SELECT 
    COUNT(*) as members_without_party,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congress_members), 2) as percentage
FROM congress_members 
WHERE party IS NULL OR party = '';

-- Members with missing chamber data
SELECT 
    COUNT(*) as members_without_chamber,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congress_members), 2) as percentage
FROM congress_members 
WHERE chamber IS NULL OR chamber = '';

-- Members with missing state data
SELECT 
    COUNT(*) as members_without_state,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congress_members), 2) as percentage
FROM congress_members 
WHERE state IS NULL OR state = '';

-- Party distribution in members table
SELECT 
    party,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congress_members), 2) as percentage
FROM congress_members 
GROUP BY party 
ORDER BY count DESC;

-- Chamber distribution in members table
SELECT 
    chamber,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congress_members), 2) as percentage
FROM congress_members 
GROUP BY chamber 
ORDER BY count DESC;

-- ============================================================================
-- 2. TRADE DATA QUALITY AUDIT
-- ============================================================================

-- Trades with missing member data
SELECT 
    COUNT(*) as trades_without_member,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades), 2) as percentage
FROM congressional_trades 
WHERE member_name IS NULL OR member_name = '';

-- Trades with missing ticker data
SELECT 
    COUNT(*) as trades_without_ticker,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades), 2) as percentage
FROM congressional_trades 
WHERE ticker IS NULL OR ticker = '';

-- Trades with missing amount data
SELECT 
    COUNT(*) as trades_without_amount,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades), 2) as percentage
FROM congressional_trades 
WHERE estimated_value IS NULL OR estimated_value = 0;

-- Trades with missing transaction type
SELECT 
    COUNT(*) as trades_without_type,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades), 2) as percentage
FROM congressional_trades 
WHERE transaction_type IS NULL OR transaction_type = '';

-- Trades with missing transaction date
SELECT 
    COUNT(*) as trades_without_date,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades), 2) as percentage
FROM congressional_trades 
WHERE transaction_date IS NULL;

-- ============================================================================
-- 3. DATA DISTRIBUTION ANALYSIS
-- ============================================================================

-- Party distribution in trades (this should match the analytics)
SELECT 
    party,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades), 2) as percentage
FROM congressional_trades 
GROUP BY party 
ORDER BY count DESC;

-- Chamber distribution in trades (this should match the analytics)
SELECT 
    chamber,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades), 2) as percentage
FROM congressional_trades 
GROUP BY chamber 
ORDER BY count DESC;

-- Transaction type distribution
SELECT 
    transaction_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades), 2) as percentage
FROM congressional_trades 
GROUP BY transaction_type 
ORDER BY count DESC;

-- Amount range distribution (this should match the analytics)
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
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM congressional_trades WHERE estimated_value IS NOT NULL), 2) as percentage
FROM congressional_trades 
WHERE estimated_value IS NOT NULL
GROUP BY amount_range
ORDER BY 
    CASE amount_range
        WHEN '$1 - $1,000' THEN 1
        WHEN '$1,001 - $15,000' THEN 2
        WHEN '$15,001 - $50,000' THEN 3
        WHEN '$50,001 - $100,000' THEN 4
        WHEN '$100,001 - $250,000' THEN 5
        WHEN '$250,001 - $500,000' THEN 6
        WHEN '$500,001 - $1,000,000' THEN 7
        WHEN '$1,000,001+' THEN 8
    END;

-- ============================================================================
-- 4. TOP TRADING MEMBERS ANALYSIS
-- ============================================================================

-- Top trading members by trade count (this should match the analytics)
SELECT 
    member_name,
    COUNT(*) as trade_count,
    SUM(estimated_value) as total_value,
    AVG(estimated_value) as avg_value
FROM congressional_trades 
WHERE member_name IS NOT NULL AND member_name != ''
GROUP BY member_name
ORDER BY trade_count DESC
LIMIT 20;

-- Top trading members by total value
SELECT 
    member_name,
    COUNT(*) as trade_count,
    SUM(estimated_value) as total_value,
    AVG(estimated_value) as avg_value
FROM congressional_trades 
WHERE member_name IS NOT NULL AND member_name != '' AND estimated_value IS NOT NULL
GROUP BY member_name
ORDER BY total_value DESC
LIMIT 20;

-- ============================================================================
-- 5. TOP TRADED TICKERS ANALYSIS
-- ============================================================================

-- Top traded tickers by count (this should match the analytics)
SELECT 
    ticker,
    COUNT(*) as count,
    SUM(estimated_value) as total_value,
    AVG(estimated_value) as avg_value
FROM congressional_trades 
WHERE ticker IS NOT NULL AND ticker != ''
GROUP BY ticker
ORDER BY count DESC
LIMIT 20;

-- Top traded tickers by total value
SELECT 
    ticker,
    COUNT(*) as count,
    SUM(estimated_value) as total_value,
    AVG(estimated_value) as avg_value
FROM congressional_trades 
WHERE ticker IS NOT NULL AND ticker != '' AND estimated_value IS NOT NULL
GROUP BY ticker
ORDER BY total_value DESC
LIMIT 20;

-- ============================================================================
-- 6. DATA CONSISTENCY CHECKS
-- ============================================================================

-- Check for members in trades that don't exist in members table
SELECT DISTINCT ct.member_name
FROM congressional_trades ct
LEFT JOIN congress_members cm ON ct.member_name = cm.member_name
WHERE cm.member_name IS NULL AND ct.member_name IS NOT NULL AND ct.member_name != '';

-- Check for duplicate member names in trades
SELECT 
    member_name,
    COUNT(*) as count
FROM congressional_trades 
WHERE member_name IS NOT NULL AND member_name != ''
GROUP BY member_name
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check for trades with invalid dates
SELECT 
    COUNT(*) as trades_with_invalid_dates
FROM congressional_trades 
WHERE transaction_date < '2000-01-01' OR transaction_date > CURRENT_DATE;

-- ============================================================================
-- 7. SUMMARY STATISTICS
-- ============================================================================

-- Overall data quality summary
SELECT 
    'Total Trades' as metric,
    COUNT(*) as value
FROM congressional_trades
UNION ALL
SELECT 
    'Trades with Member Data',
    COUNT(*)
FROM congressional_trades 
WHERE member_name IS NOT NULL AND member_name != ''
UNION ALL
SELECT 
    'Trades with Ticker Data',
    COUNT(*)
FROM congressional_trades 
WHERE ticker IS NOT NULL AND ticker != ''
UNION ALL
SELECT 
    'Trades with Amount Data',
    COUNT(*)
FROM congressional_trades 
WHERE estimated_value IS NOT NULL AND estimated_value > 0
UNION ALL
SELECT 
    'Unique Members',
    COUNT(DISTINCT member_name)
FROM congressional_trades 
WHERE member_name IS NOT NULL AND member_name != ''
UNION ALL
SELECT 
    'Unique Tickers',
    COUNT(DISTINCT ticker)
FROM congressional_trades 
WHERE ticker IS NOT NULL AND ticker != '';

-- Data completeness percentages
SELECT 
    'Member Data Completeness' as metric,
    ROUND(
        (SELECT COUNT(*) FROM congressional_trades WHERE member_name IS NOT NULL AND member_name != '') * 100.0 / 
        (SELECT COUNT(*) FROM congressional_trades), 2
    ) as percentage
UNION ALL
SELECT 
    'Ticker Data Completeness',
    ROUND(
        (SELECT COUNT(*) FROM congressional_trades WHERE ticker IS NOT NULL AND ticker != '') * 100.0 / 
        (SELECT COUNT(*) FROM congressional_trades), 2
    )
UNION ALL
SELECT 
    'Amount Data Completeness',
    ROUND(
        (SELECT COUNT(*) FROM congressional_trades WHERE estimated_value IS NOT NULL AND estimated_value > 0) * 100.0 / 
        (SELECT COUNT(*) FROM congressional_trades), 2
    ); 