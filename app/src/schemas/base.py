"""
Base Pydantic schemas and common patterns for CapitolScope API.

This module contains base models, common types, and shared configurations
for all API request/response validation.
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Union, Generic, TypeVar
from decimal import Decimal
import uuid
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, validator, field_validator, EmailStr, HttpUrl
from pydantic import BaseModel

T = TypeVar("T")

class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    pages: int
    has_next: bool
    has_prev: bool

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    meta: PaginationMeta

class ResponseEnvelope(BaseModel, Generic[T]):
    data: Optional[T] = None
    meta: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

def create_response(data, meta=None, error=None):
    return ResponseEnvelope(data=data, meta=meta, error=error)


# Import base schema from domains
from domains.base.schemas import CapitolScopeBaseSchema, CapitolScopeBaseModel

# Legacy alias for backward compatibility
CapitolScopeBaseModel = CapitolScopeBaseSchema


class TimestampMixin(BaseModel):
    """Mixin for models with created_at and updated_at timestamps."""
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class UUIDMixin(BaseModel):
    """Mixin for models with UUID ID primary key."""
    id: UUID = Field(..., description="Unique identifier (UUID)")


# ============================================================================
# COMMON ENUMS AND TYPES
# ============================================================================

class PoliticalParty(str):
    """Political party enumeration."""
    DEMOCRAT = "D"
    REPUBLICAN = "R" 
    INDEPENDENT = "I"


class Chamber(str):
    """Congressional chamber enumeration."""
    HOUSE = "House"
    SENATE = "Senate"


class TransactionType(str):
    """Transaction type enumeration."""
    PURCHASE = "P"
    SALE = "S"
    EXCHANGE = "E"


class AssetType(str):
    """Asset type enumeration."""
    STOCK = "stock"
    BOND = "bond"
    ETF = "etf"
    MUTUAL_FUND = "mutual_fund"
    OPTION = "option"
    FUTURE = "future"
    COMMODITY = "commodity"
    CRYPTO = "crypto"
    REAL_ESTATE = "real_estate"
    CASH = "cash"


class Sector(str):
    """Market sector enumeration."""
    TECHNOLOGY = "technology"
    HEALTHCARE = "healthcare"
    FINANCIAL = "financial"
    CONSUMER_DISCRETIONARY = "consumer_discretionary"
    CONSUMER_STAPLES = "consumer_staples"
    INDUSTRIALS = "industrials"
    ENERGY = "energy"
    MATERIALS = "materials"
    UTILITIES = "utilities"
    REAL_ESTATE = "real_estate"
    COMMUNICATION_SERVICES = "communication_services"


class Exchange(str):
    """Stock exchange enumeration."""
    NYSE = "NYSE"
    NASDAQ = "NASDAQ"
    AMEX = "AMEX"
    OTC = "OTC"
    TSX = "TSX"
    LSE = "LSE"
    TSE = "TSE"
    ASX = "ASX"
    HKEX = "HKEX"
    SGX = "SGX"


class SubscriptionTier(str):
    """User subscription tier enumeration."""
    FREE = "FREE"
    PRO = "PRO"
    PREMIUM = "PREMIUM"
    ENTERPRISE = "ENTERPRISE"


class SubscriptionStatus(str):
    """Subscription status enumeration."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"


class SocialPlatform(str):
    """Social media platform enumeration."""
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    DISCORD = "discord"
    TELEGRAM = "telegram"
    REDDIT = "reddit"
    FACEBOOK = "facebook"


class EngagementType(str):
    """Engagement type enumeration."""
    LIKE = "like"
    SHARE = "share"
    COMMENT = "comment"
    VIEW = "view"
    CLICK = "click"
    BOOKMARK = "bookmark"


class PostStatus(str):
    """Post status enumeration."""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    POSTING = "posting"
    POSTED = "posted"
    FAILED = "failed"
    CANCELLED = "cancelled"


class SystemStatus(str):
    """System status enumeration."""
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
    DEGRADED = "degraded"
    ERROR = "error"


class LogLevel(str):
    """Log level enumeration."""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class FeatureStatus(str):
    """Feature status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    BETA = "beta"
    EXPERIMENTAL = "experimental"


# ============================================================================
# COMMON REQUEST/RESPONSE PATTERNS
# ============================================================================

class PaginationParams(BaseModel):
    """Standard pagination parameters."""
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Items per page")
    
    @property
    def offset(self) -> int:
        """Calculate database offset from page and size."""
        return (self.page - 1) * self.size


class SortParams(BaseModel):
    """Standard sorting parameters."""
    sort_by: str = Field("created_at", description="Field to sort by")
    sort_order: str = Field("desc", pattern=r"^(asc|desc)$", description="Sort order")


class APIResponse(CapitolScopeBaseModel):
    """Standard API response wrapper."""
    success: bool = Field(True, description="Whether the request was successful")
    message: Optional[str] = Field(None, description="Human-readable message")
    data: Optional[Any] = Field(None, description="Response data")
    errors: Optional[List[str]] = Field(None, description="List of error messages")


class ErrorResponse(CapitolScopeBaseModel):
    """Standard error response."""
    error: Dict[str, Any] = Field(..., description="Error details")
    
    class ErrorDetail(CapitolScopeBaseModel):
        type: str = Field(..., description="Error type")
        code: int = Field(..., description="Error code")
        message: str = Field(..., description="Error message")
        path: Optional[str] = Field(None, description="Request path")
        details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


# ============================================================================
# FINANCIAL DATA TYPES
# ============================================================================

class AmountRange(CapitolScopeBaseModel):
    """Financial amount range representation."""
    min_amount: Optional[int] = Field(None, description="Minimum amount in cents")
    max_amount: Optional[int] = Field(None, description="Maximum amount in cents")
    exact_amount: Optional[int] = Field(None, description="Exact amount in cents")
    display_range: Optional[str] = Field(None, description="Human-readable range")
    
    @field_validator('min_amount', 'max_amount', 'exact_amount')
    @classmethod
    def validate_positive_amount(cls, v):
        """Ensure amounts are positive."""
        if v is not None and v < 0:
            raise ValueError('Amount must be positive')
        return v


class PerformanceMetrics(CapitolScopeBaseModel):
    """Standard performance metrics."""
    total_return: Optional[float] = Field(None, description="Total return percentage")
    daily_return: Optional[float] = Field(None, description="Daily return percentage")
    sharpe_ratio: Optional[float] = Field(None, description="Sharpe ratio")
    sortino_ratio: Optional[float] = Field(None, description="Sortino ratio")
    max_drawdown: Optional[float] = Field(None, description="Maximum drawdown percentage")
    alpha: Optional[float] = Field(None, description="Alpha vs benchmark")
    beta: Optional[float] = Field(None, description="Beta vs benchmark")


class TechnicalIndicators(CapitolScopeBaseModel):
    """Technical analysis indicators."""
    rsi_14: Optional[float] = Field(None, description="14-day RSI")
    macd: Optional[float] = Field(None, description="MACD value")
    bollinger_upper: Optional[int] = Field(None, description="Bollinger upper band (cents)")
    bollinger_lower: Optional[int] = Field(None, description="Bollinger lower band (cents)")
    volatility: Optional[float] = Field(None, description="Price volatility")
    volume_avg_30d: Optional[int] = Field(None, description="30-day average volume")


# ============================================================================
# FILTER AND SEARCH SCHEMAS
# ============================================================================

class DateRangeFilter(BaseModel):
    """Date range filter."""
    start_date: Optional[date] = Field(None, description="Start date")
    end_date: Optional[date] = Field(None, description="End date")
    
    @field_validator('end_date')
    @classmethod
    def validate_date_range(cls, v, values):
        """Ensure end date is after start date."""
        start_date = values.get('start_date')
        if start_date and v and v < start_date:
            raise ValueError('End date must be after start date')
        return v


class AmountFilter(BaseModel):
    """Amount range filter."""
    min_amount: Optional[int] = Field(None, description="Minimum amount in cents", ge=0)
    max_amount: Optional[int] = Field(None, description="Maximum amount in cents", ge=0)
    
    @field_validator('max_amount')
    @classmethod
    def validate_amount_range(cls, v, values):
        """Ensure max amount is greater than min amount."""
        min_amount = values.get('min_amount')
        if min_amount and v and v < min_amount:
            raise ValueError('Maximum amount must be greater than minimum amount')
        return v


class SearchParams(BaseModel):
    """Search parameters."""
    query: Optional[str] = Field(None, description="Search query", max_length=200)
    filters: Optional[Dict[str, Any]] = Field(None, description="Additional filters")
    
    @field_validator('query')
    @classmethod
    def validate_query_length(cls, v):
        """Ensure query has minimum length."""
        if v and len(v.strip()) < 2:
            raise ValueError('Search query must be at least 2 characters')
        return v.strip() if v else None


# ============================================================================
# METADATA AND CONFIGURATION
# ============================================================================

class SocialMediaLinks(CapitolScopeBaseModel):
    """Social media links collection."""
    twitter_handle: Optional[str] = Field(None, description="Twitter handle without @")
    linkedin_url: Optional[HttpUrl] = Field(None, description="LinkedIn profile URL")
    facebook_url: Optional[HttpUrl] = Field(None, description="Facebook profile URL") 
    instagram_handle: Optional[str] = Field(None, description="Instagram handle without @")
    youtube_channel: Optional[HttpUrl] = Field(None, description="YouTube channel URL")
    website_url: Optional[HttpUrl] = Field(None, description="Personal/official website")


class ResearchLinks(CapitolScopeBaseModel):
    """Research and information links."""
    wikipedia_url: Optional[HttpUrl] = Field(None, description="Wikipedia page URL")
    ballotpedia_url: Optional[HttpUrl] = Field(None, description="Ballotpedia profile URL")
    opensecrets_url: Optional[HttpUrl] = Field(None, description="OpenSecrets profile URL")
    bioguide_id: Optional[str] = Field(None, description="Congressional Bioguide ID")
    congress_gov_id: Optional[str] = Field(None, description="Congress.gov ID")
    fec_id: Optional[str] = Field(None, description="FEC candidate ID")


class NotificationPreferences(CapitolScopeBaseModel):
    """User notification preferences."""
    email_notifications: bool = Field(True, description="Enable email notifications")
    trade_alerts: bool = Field(False, description="Enable trade alerts")
    newsletter_frequency: str = Field("weekly", description="Newsletter frequency")
    alert_threshold: int = Field(100000, description="Alert threshold amount in cents", ge=0)
    preferred_timezone: str = Field("UTC", description="Preferred timezone")
    
    @field_validator('newsletter_frequency')
    @classmethod
    def validate_newsletter_frequency(cls, v):
        """Validate newsletter frequency."""
        valid_frequencies = ['none', 'daily', 'weekly', 'monthly']
        if v not in valid_frequencies:
            raise ValueError(f'Newsletter frequency must be one of: {valid_frequencies}')
        return v


# ============================================================================
# HEALTH CHECK AND SYSTEM SCHEMAS
# ============================================================================
# Health check schemas have been moved to domains.base.schemas
# Import them from there instead of duplicating here


# ============================================================================
# VALIDATION HELPERS
# ============================================================================

def validate_ticker_symbol(v: str) -> str:
    """Validate stock ticker symbol format."""
    if not v:
        return v
    
    # Remove whitespace and convert to uppercase
    ticker = v.strip().upper()
    
    # Basic validation: 1-5 characters, letters only
    if not ticker.isalpha() or len(ticker) > 5:
        raise ValueError('Ticker symbol must be 1-5 letters')
    
    return ticker


def validate_political_party(v: str) -> str:
    """Validate political party code."""
    if v and v not in ['D', 'R', 'I']:
        raise ValueError('Political party must be D, R, or I')
    return v


def validate_chamber(v: str) -> str:
    """Validate congressional chamber."""
    if v and v not in ['House', 'Senate']:
        raise ValueError('Chamber must be House or Senate')
    return v


def validate_transaction_type(v: str) -> str:
    """Validate transaction type."""
    if v and v not in ['P', 'S', 'E']:
        raise ValueError('Transaction type must be P (Purchase), S (Sale), or E (Exchange)')
    return v 

__all__ = [
    "CapitolScopeBaseModel",
    "BaseModel",
    "UUIDMixin",
    "TimestampMixin",
    "PoliticalParty",
    "Chamber",
    "TransactionType",
    "AssetType",
    "Sector", 
    "Exchange",
    "SubscriptionTier",
    "SubscriptionStatus",
    "SocialPlatform",
    "EngagementType",
    "PostStatus",
    "SystemStatus",
    "LogLevel",
    "FeatureStatus",
    "PaginationParams",
    "SortParams",
    "PaginatedResponse",
    "APIResponse",
    "ErrorResponse",
    "AmountRange",
    "PerformanceMetrics",
    "TechnicalIndicators",
    "DateRangeFilter",
    "AmountFilter",
    "SearchParams",
    "SocialMediaLinks",
    "ResearchLinks",
    "NotificationPreferences",
    "validate_ticker_symbol",
    "validate_political_party",
    "validate_chamber",
    "validate_transaction_type"
] 