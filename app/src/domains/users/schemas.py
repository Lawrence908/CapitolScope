"""
User domain Pydantic schemas for request/response validation.
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, validator, Field
from enum import Enum
import re

from domains.users.models import UserStatus, AuthProvider, NotificationChannel, NotificationType

# Email validation pattern
EMAIL_PATTERN = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

PASSWORD_MIN_LENGTH = 8


# ============================================================================
# AUTHENTICATION SCHEMAS
# ============================================================================

class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr
    password: str = Field(..., min_length=1)  # Just require non-empty for login
    remember_me: bool = False
    
    @validator('email')
    @classmethod
    def validate_email_format(cls, v):
        """Validate email format using regex."""
        if not re.match(EMAIL_PATTERN, v):
            raise ValueError("Invalid email format")
        return v
    
    @validator('remember_me')
    @classmethod
    def validate_remember_me(cls, v):
        """Validate remember me option."""
        if not isinstance(v, bool):
            raise ValueError("Remember me must be a boolean value")
        return v
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "examples": [
                {
                    "email": "chrislawrencedev@gmail.com",
                    "password": "r!4$gs5syHWkuML",
                    "remember_me": True
                }
            ]
        }  


class RegisterRequest(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    username: Optional[str] = Field(None, max_length=50)
    terms_accepted: bool = True
    
    @validator('email')
    @classmethod
    def validate_email_format(cls, v):
        """Validate email format using regex."""
        if not re.match(EMAIL_PATTERN, v):
            raise ValueError("Invalid email format")
        return v

    @validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        """Validate password strength using the same rules as AuthService."""
        errors = []
        if len(v) < PASSWORD_MIN_LENGTH:
            errors.append(f"Password must be at least {PASSWORD_MIN_LENGTH} characters long")
        if not re.search(r"[A-Z]", v):
            errors.append("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            errors.append("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            errors.append("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*]", v):
            errors.append("Password must contain at least one special character (!@#$%^&*)")
        if errors:
            raise ValueError(", ".join(errors))
        return v
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "examples": [
                {
                    "email": "chrislawrencedev@gmail.com",
                    "password": "r!4$gs5syHWkuML",
                    "first_name": "Chris",
                    "last_name": "Lawrence",
                    "username": "CapitolScopeAdmin",
                    "terms_accepted": True
                }
            ]
        }  


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserResponse"


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    """Change password request."""
    current_password: str
    new_password: str = Field(..., min_length=6)
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('New password must be at least 6 characters long')
        return v


class ResetPasswordRequest(BaseModel):
    """Reset password request."""
    email: EmailStr


class ResetPasswordConfirmRequest(BaseModel):
    """Reset password confirmation request."""
    token: str
    new_password: str = Field(..., min_length=6)


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website_url: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(..., min_length=6)
    auth_provider: AuthProvider = AuthProvider.EMAIL


class UserUpdate(BaseModel):
    """User update schema."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website_url: Optional[str] = None
    is_public_profile: Optional[bool] = None
    show_portfolio: Optional[bool] = None
    show_trading_activity: Optional[bool] = None
    marketing_emails_enabled: Optional[bool] = None


class UserResponse(BaseModel):
    """User response schema."""
    id: str  # Changed from int to str to handle UUIDs
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    display_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website_url: Optional[str] = None
    
    # Status
    status: UserStatus
    is_verified: bool
    is_active: bool
    last_login_at: Optional[datetime] = None
    
    # Subscription
    subscription_tier: str
    is_premium: bool
    
    # Privacy
    is_public_profile: bool
    show_portfolio: bool
    show_trading_activity: bool
    
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserProfileResponse(UserResponse):
    """Extended user profile response."""
    email_verified_at: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    beta_features_enabled: bool
    marketing_emails_enabled: bool
    
    # Subscription details
    subscription_status: Optional[str] = None
    subscription_start_date: Optional[date] = None
    subscription_end_date: Optional[date] = None


# ============================================================================
# PREFERENCE SCHEMAS
# ============================================================================

class UserPreferenceUpdate(BaseModel):
    """User preference update schema."""
    theme: Optional[str] = Field(None, pattern="^(light|dark|auto)$")
    language: Optional[str] = Field(None, max_length=5)
    timezone: Optional[str] = Field(None, max_length=50)
    currency: Optional[str] = Field(None, max_length=3)
    
    # Trading preferences
    preferred_chart_timeframe: Optional[str] = None
    show_after_hours_trading: Optional[bool] = None
    
    # Notification preferences
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    
    # Alert thresholds
    large_trade_threshold: Optional[int] = None
    price_movement_threshold: Optional[int] = None
    
    # Privacy preferences
    public_watchlists: Optional[bool] = None
    share_analytics: Optional[bool] = None
    
    # Custom settings
    custom_settings: Optional[Dict[str, Any]] = None


class UpdatePreferencesRequest(BaseModel):
    """Update user preferences request schema."""
    # Basic notification preferences
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    
    # Specific notification types
    trade_alerts: Optional[bool] = None
    weekly_summary: Optional[bool] = None
    multiple_buyer_alerts: Optional[bool] = None
    high_value_alerts: Optional[bool] = None


class UserPreferenceResponse(BaseModel):
    """User preference response schema."""
    user_id: int
    theme: str
    language: str
    timezone: str
    currency: str
    
    # Trading preferences
    preferred_chart_timeframe: str
    show_after_hours_trading: bool
    
    # Notification preferences
    email_notifications: bool
    push_notifications: bool
    sms_notifications: bool
    
    # Alert thresholds
    large_trade_threshold: int
    price_movement_threshold: int
    
    # Privacy preferences
    public_watchlists: bool
    share_analytics: bool
    
    # Custom settings
    custom_settings: Dict[str, Any]
    
    # Timestamps
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# WATCHLIST SCHEMAS
# ============================================================================

class WatchlistCreate(BaseModel):
    """Watchlist creation schema."""
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    watchlist_type: str = Field(..., pattern="^(securities|members|mixed)$")
    is_public: bool = False
    is_default: bool = False


class WatchlistUpdate(BaseModel):
    """Watchlist update schema."""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_public: Optional[bool] = None
    is_default: Optional[bool] = None


class WatchlistResponse(BaseModel):
    """Watchlist response schema."""
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    watchlist_type: str
    is_public: bool
    is_default: bool
    item_count: int
    watched_securities: List[int]
    watched_members: List[int]
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_updated: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# ALERT SCHEMAS
# ============================================================================

class AlertCreate(BaseModel):
    """Alert creation schema."""
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    alert_type: str = Field(..., pattern="^(new_trade|large_trade|price_movement|volume_spike|portfolio_change|member_activity|market_event)$")
    target_type: Optional[str] = Field(None, pattern="^(security|member|portfolio|market)$")
    target_id: Optional[int] = None
    target_criteria: Optional[Dict[str, Any]] = None
    conditions: Dict[str, Any]
    threshold_value: Optional[int] = None
    comparison_operator: Optional[str] = Field(None, pattern="^(>|<|>=|<=|=|!=)$")
    notification_channels: Optional[List[str]] = None
    frequency_limit: Optional[str] = "immediate"


class AlertUpdate(BaseModel):
    """Alert update schema."""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    conditions: Optional[Dict[str, Any]] = None
    threshold_value: Optional[int] = None
    comparison_operator: Optional[str] = Field(None, pattern="^(>|<|>=|<=|=|!=)$")
    notification_channels: Optional[List[str]] = None
    frequency_limit: Optional[str] = None


class AlertResponse(BaseModel):
    """Alert response schema."""
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    alert_type: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    target_criteria: Optional[Dict[str, Any]] = None
    conditions: Dict[str, Any]
    threshold_value: Optional[int] = None
    comparison_operator: Optional[str] = None
    is_active: bool
    notification_channels: Optional[List[str]] = None
    frequency_limit: str
    last_triggered: Optional[datetime] = None
    trigger_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# NOTIFICATION SCHEMAS
# ============================================================================

class NotificationResponse(BaseModel):
    """Notification response schema."""
    id: int
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    channel: NotificationChannel
    priority: str
    is_read: bool
    read_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    delivery_status: str
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[int] = None
    extra_data: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationMarkReadRequest(BaseModel):
    """Mark notification as read request."""
    notification_ids: List[int]


# ============================================================================
# SUBSCRIPTION SCHEMAS
# ============================================================================

class SubscriptionUpdate(BaseModel):
    """Subscription update schema."""
    tier: str = Field(..., pattern="^(FREE|PRO|PREMIUM|ENTERPRISE)$")


class SubscriptionResponse(BaseModel):
    """Subscription response schema."""
    tier: str
    status: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_premium: bool
    stripe_customer_id: Optional[str] = None


# ============================================================================
# ERROR SCHEMAS
# ============================================================================

class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
    error_code: Optional[str] = None
    field_errors: Optional[Dict[str, List[str]]] = None


# Update forward references
TokenResponse.model_rebuild() 