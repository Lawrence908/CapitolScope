"""
Base Pydantic schemas for CapitolScope.

This module contains base models, common types, and shared configurations
for all API request/response validation across domains.
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any, Union
from decimal import Decimal
from enum import Enum
import uuid
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, field_validator
from pydantic import EmailStr, HttpUrl

import logging
logger = logging.getLogger(__name__)


# ============================================================================
# BASE SCHEMA CONFIGURATION
# ============================================================================

class CapitolScopeBaseSchema(BaseModel):
    """Base schema with common configuration for all CapitolScope schemas."""
    
    model_config = ConfigDict(
        # Enable ORM mode for SQLAlchemy integration
        from_attributes=True,
        # Use enum values instead of enum objects
        use_enum_values=True,
        # Validate assignment after model creation
        validate_assignment=True,
        # Allow population by field name or alias
        populate_by_name=True,
        # Serialize datetime as ISO format
        json_encoders={
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
            Decimal: lambda v: float(v),
        },
        arbitrary_types_allowed=True
    )


# Legacy alias for backward compatibility
CapitolScopeBaseModel = CapitolScopeBaseSchema


class TimestampMixin(BaseModel):
    """Mixin for schemas with created_at and updated_at timestamps."""
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")


class UUIDMixin(BaseModel):
    """Mixin for schemas with UUID ID primary key."""
    id: UUID = Field(..., description="Unique identifier (UUID)")


# ============================================================================
# COMMON ENUMS AND TYPES
# ============================================================================

class PoliticalParty(str, Enum):
    """Political party enumeration."""
    DEMOCRAT = "D"
    REPUBLICAN = "R" 
    INDEPENDENT = "I"


class Chamber(str, Enum):
    """Congressional chamber enumeration."""
    HOUSE = "House"
    SENATE = "Senate"


class TransactionType(str, Enum):
    """Transaction type enumeration."""
    PURCHASE = "P"
    SALE = "S"
    EXCHANGE = "E"


class SubscriptionTier(str, Enum):
    """User subscription tier enumeration."""
    FREE = "FREE"
    PRO = "PRO"
    PREMIUM = "PREMIUM"
    ENTERPRISE = "ENTERPRISE"


class SubscriptionStatus(str, Enum):
    """Subscription status enumeration."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAST_DUE = "past_due"


class SocialPlatform(str, Enum):
    """Social media platform enumeration."""
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    DISCORD = "discord"
    TELEGRAM = "telegram"
    REDDIT = "reddit"
    FACEBOOK = "facebook"


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


class PaginatedResponse(CapitolScopeBaseSchema):
    """Standard paginated response wrapper."""
    items: List[Any] = Field(..., description="List of items")
    total: int = Field(..., ge=0, description="Total number of items")
    page: int = Field(..., ge=1, description="Current page number")
    size: int = Field(..., ge=1, description="Items per page")
    pages: int = Field(..., ge=0, description="Total number of pages")
    
    @field_validator('pages', mode='before')
    @classmethod
    def calculate_pages(cls, v, values):
        """Calculate total pages from total and size."""
        total = values.get('total', 0)
        size = values.get('size', 1)
        return (total + size - 1) // size if total > 0 else 0


class APIResponse(CapitolScopeBaseSchema):
    """Standard API response wrapper."""
    success: bool = Field(True, description="Whether the request was successful")
    message: Optional[str] = Field(None, description="Human-readable message")
    data: Optional[Any] = Field(None, description="Response data")
    errors: Optional[List[str]] = Field(None, description="List of error messages")


class ErrorResponse(CapitolScopeBaseSchema):
    """Standard error response."""
    error: Dict[str, Any] = Field(..., description="Error details")
    
    class ErrorDetail(CapitolScopeBaseSchema):
        type: str = Field(..., description="Error type")
        code: int = Field(..., description="Error code")
        message: str = Field(..., description="Error message")
        path: Optional[str] = Field(None, description="Request path")
        details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


# ============================================================================
# FINANCIAL DATA TYPES
# ============================================================================

class AmountRange(CapitolScopeBaseSchema):
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


class PerformanceMetrics(CapitolScopeBaseSchema):
    """Standard performance metrics."""
    total_return: Optional[float] = Field(None, description="Total return percentage")
    daily_return: Optional[float] = Field(None, description="Daily return percentage")
    sharpe_ratio: Optional[float] = Field(None, description="Sharpe ratio")
    sortino_ratio: Optional[float] = Field(None, description="Sortino ratio")
    max_drawdown: Optional[float] = Field(None, description="Maximum drawdown percentage")
    alpha: Optional[float] = Field(None, description="Alpha vs benchmark")
    beta: Optional[float] = Field(None, description="Beta vs benchmark")


class TechnicalIndicators(CapitolScopeBaseSchema):
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

class SocialMediaLinks(CapitolScopeBaseSchema):
    """Social media links collection."""
    twitter_handle: Optional[str] = Field(None, description="Twitter handle without @")
    linkedin_url: Optional[HttpUrl] = Field(None, description="LinkedIn profile URL")
    facebook_url: Optional[HttpUrl] = Field(None, description="Facebook profile URL") 
    instagram_handle: Optional[str] = Field(None, description="Instagram handle without @")
    youtube_channel: Optional[HttpUrl] = Field(None, description="YouTube channel URL")
    website_url: Optional[HttpUrl] = Field(None, description="Personal/official website")


class ResearchLinks(CapitolScopeBaseSchema):
    """Research and information links."""
    wikipedia_url: Optional[HttpUrl] = Field(None, description="Wikipedia page URL")
    ballotpedia_url: Optional[HttpUrl] = Field(None, description="Ballotpedia profile URL")
    opensecrets_url: Optional[HttpUrl] = Field(None, description="OpenSecrets profile URL")
    bioguide_id: Optional[str] = Field(None, description="Congressional Bioguide ID")
    congress_gov_id: Optional[str] = Field(None, description="Congress.gov ID")
    fec_id: Optional[str] = Field(None, description="FEC candidate ID")


class NotificationPreferences(CapitolScopeBaseSchema):
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

class BasicHealthResponse(CapitolScopeBaseSchema):
    """Basic health check response."""
    status: str = Field(..., description="Health status")
    timestamp: float = Field(..., description="Unix timestamp")
    environment: str = Field(..., description="Environment name")
    version: str = Field(..., description="API version")
    service: str = Field(..., description="Service name")


class LivenessResponse(CapitolScopeBaseSchema):
    """Liveness check response."""
    status: str = Field(..., description="Liveness status")
    timestamp: float = Field(..., description="Unix timestamp")
    service: str = Field(..., description="Service name")


class ReadinessResponse(CapitolScopeBaseSchema):
    """Readiness check response."""
    status: str = Field(..., description="Readiness status")
    timestamp: float = Field(..., description="Unix timestamp")


class DatabaseHealth(CapitolScopeBaseSchema):
    """Database health status."""
    status: str = Field(..., description="Database status")
    connection_ok: bool = Field(..., description="Connection status")
    response_time_ms: Optional[float] = Field(None, description="Response time in milliseconds")
    last_check: datetime = Field(..., description="Last health check")
    error_message: Optional[str] = Field(None, description="Error message if unhealthy")


class RedisHealth(CapitolScopeBaseSchema):
    """Redis health status."""
    status: str = Field(..., description="Redis status")
    connection_ok: bool = Field(..., description="Connection status")
    response_time_ms: Optional[float] = Field(None, description="Response time in milliseconds")
    memory_usage: Optional[float] = Field(None, description="Memory usage percentage")
    error_message: Optional[str] = Field(None, description="Error message if unhealthy")


class CongressAPIHealth(CapitolScopeBaseSchema):
    """Congress.gov API health status."""
    status: str = Field(..., description="API status")
    api_key_configured: bool = Field(..., description="API key configured")
    connectivity: bool = Field(..., description="Connectivity status")
    authentication: bool = Field(..., description="Authentication status")
    data_availability: bool = Field(..., description="Data availability")
    last_successful_sync: Optional[str] = Field(None, description="Last successful sync")
    error_message: Optional[str] = Field(None, description="Error message if unhealthy")
    response_time_ms: Optional[float] = Field(None, description="Response time in milliseconds")
    timestamp: Optional[float] = Field(None, description="Health check timestamp")


class ServiceChecks(CapitolScopeBaseSchema):
    """Service health checks."""
    database: DatabaseHealth = Field(..., description="Database health")
    redis: RedisHealth = Field(..., description="Redis health")
    congress_api: CongressAPIHealth = Field(..., description="Congress API health")


class ConfigurationInfo(CapitolScopeBaseSchema):
    """Configuration information."""
    debug: bool = Field(..., description="Debug mode enabled")
    environment: str = Field(..., description="Environment name")
    congress_api_configured: bool = Field(..., description="Congress API configured")


class DetailedHealthResponse(CapitolScopeBaseSchema):
    """Detailed health check response."""
    status: str = Field(..., description="Overall health status")
    timestamp: float = Field(..., description="Unix timestamp")
    response_time_ms: float = Field(..., description="Health check response time")
    environment: str = Field(..., description="Environment name")
    version: str = Field(..., description="API version")
    service: str = Field(..., description="Service name")
    checks: ServiceChecks = Field(..., description="Service health checks")
    configuration: ConfigurationInfo = Field(..., description="Configuration information")


class SystemMetrics(CapitolScopeBaseSchema):
    """System metrics."""
    cpu_usage: Optional[float] = Field(None, description="CPU usage percentage")
    memory_usage: Optional[float] = Field(None, description="Memory usage percentage")
    disk_usage: Optional[float] = Field(None, description="Disk usage percentage")
    active_connections: Optional[int] = Field(None, description="Active database connections")
    uptime_seconds: Optional[float] = Field(None, description="Service uptime in seconds")


class SystemPerformanceMetrics(CapitolScopeBaseSchema):
    """System performance metrics."""
    average_response_time_ms: Optional[float] = Field(None, description="Average response time")
    requests_per_second: Optional[float] = Field(None, description="Requests per second")
    error_rate: Optional[float] = Field(None, description="Error rate percentage")
    cache_hit_rate: Optional[float] = Field(None, description="Cache hit rate")


class SystemStatusResponse(CapitolScopeBaseSchema):
    """System status response."""
    status: str = Field(..., description="System status")
    timestamp: float = Field(..., description="Status timestamp")
    metrics: Optional[SystemMetrics] = Field(None, description="System metrics")
    performance: Optional[SystemPerformanceMetrics] = Field(None, description="Performance metrics")
    warnings: List[str] = Field(default_factory=list, description="System warnings")
    errors: List[str] = Field(default_factory=list, description="System errors")


# Legacy aliases for backward compatibility
HealthCheckResponse = BasicHealthResponse
DetailedHealthCheckResponse = DetailedHealthResponse


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


# Export all base components
__all__ = [
    "CapitolScopeBaseSchema",
    "TimestampMixin",
    "UUIDMixin",
    "PoliticalParty",
    "Chamber",
    "TransactionType",
    "SubscriptionTier",
    "SubscriptionStatus",
    "SocialPlatform",
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
    # Health check schemas
    "BasicHealthResponse",
    "LivenessResponse",
    "ReadinessResponse",
    "DatabaseHealth",
    "RedisHealth",
    "CongressAPIHealth",
    "ServiceChecks",
    "ConfigurationInfo",
    "DetailedHealthResponse",
    "SystemMetrics",
    "SystemPerformanceMetrics",
    "SystemStatusResponse",
    # Legacy aliases
    "HealthCheckResponse",
    "DetailedHealthCheckResponse",
    "validate_ticker_symbol",
    "validate_political_party",
    "validate_chamber",
    "validate_transaction_type"
] 