"""
Authentication API endpoints.
"""

from typing import Dict, Any
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from core.database import get_db_session
import logging
logger = logging.getLogger(__name__)
from core.responses import success_response, error_response
from core.auth import (
    authenticate_user, get_current_user, get_current_active_user,
    create_token_response, verify_token, get_password_hash,
    verify_password, AuthenticationError
)
from core.email import email_service
from domains.users.models import User, UserStatus, AuthProvider, PasswordResetToken, SubscriptionTier
from domains.users.schemas import (
    LoginRequest, RegisterRequest, TokenResponse, RefreshTokenRequest,
    UserResponse, ChangePasswordRequest, ResetPasswordRequest, ResetPasswordConfirmRequest,
    UpdatePreferencesRequest
)
from schemas.base import ResponseEnvelope
from core.responses import create_response

router = APIRouter()


@router.post(
    "/login",
    response_model=ResponseEnvelope[TokenResponse],
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
        500: {"description": "Internal server error"}
    }
)
async def login(
    request: LoginRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ResponseEnvelope[TokenResponse]:
    """
    User login endpoint.
    
    Returns JWT tokens for valid credentials.
    """
    logger.info(f"User login attempt: email={request.email}")
    
    # Authenticate user
    user = await authenticate_user(request.email, request.password, session)
    if not user:
        return create_response(error={"message": "Incorrect email or password"})
    
    # Update last login
    from sqlalchemy.sql import func
    user.last_login_at = func.now()
    await session.commit()
    
    # Create token response
    token_data = create_token_response(user)
    
    logger.info(f"User login successful: user_id={user.id}, email={user.email}")
    return create_response(data=token_data)


@router.post(
    "/register",
    response_model=ResponseEnvelope[TokenResponse],
    responses={
        200: {"description": "Registration successful"},
        400: {"description": "Email already exists"},
        500: {"description": "Internal server error"}
    }
)
async def register(
    request: RegisterRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ResponseEnvelope[TokenResponse]:
    """
    User registration endpoint.
    
    Creates a new user account and returns JWT tokens.
    """
    logger.info(f"User registration attempt: email={request.email}")
    
    try:
        # Check if user already exists
        result = await session.execute(
            select(User).where(User.email == request.email)
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            return create_response(error={"message": "Email already registered"})
        
        # Create new user
        user = User(
            email=request.email,
            username=request.username,
            first_name=request.first_name,
            last_name=request.last_name,
            password_hash=get_password_hash(request.password),
            auth_provider=AuthProvider.EMAIL,
            status=UserStatus.ACTIVE,  # For demo, auto-activate
            is_verified=False,
            subscription_tier=SubscriptionTier.FREE,
            is_public_profile=True,
            show_portfolio=False,
            show_trading_activity=True,
            beta_features_enabled=False,
            marketing_emails_enabled=True,
        )
        
        # Set full name
        if request.first_name and request.last_name:
            user.full_name = f"{request.first_name} {request.last_name}"
        
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        # Send welcome email
        try:
            await email_service.send_welcome_email(user)
        except Exception as e:
            logger.warning(f"Failed to send welcome email: {e}")
        
        # Create token response
        token_data = create_token_response(user)
        
        logger.info(f"User registration successful: user_id={user.id}, email={user.email}")
        return create_response(data=token_data)
        
    except IntegrityError as e:
        await session.rollback()
        logger.error(f"Registration integrity error: {str(e)}")
        
        # Check which constraint was violated
        error_message = str(e)
        if "ix_users_username" in error_message:
            return create_response(error={"message": "Username is already taken. Please choose a different username."})
        elif "ix_users_email" in error_message:
            return create_response(error={"message": "An account with this email already exists. Please sign in instead."})
        else:
            return create_response(error={"message": "Registration failed. Please try again with different information."})
    except Exception as e:
        await session.rollback()
        logger.error(f"Registration error: {str(e)}")
        return create_response(error={"message": "Registration failed"})


@router.get(
    "/me",
    response_model=ResponseEnvelope[UserResponse],
    responses={
        200: {"description": "User information retrieved successfully"},
        401: {"description": "Invalid token"},
        500: {"description": "Internal server error"}
    }
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> ResponseEnvelope[UserResponse]:
    """
    Get current user information.
    
    Returns the authenticated user's profile information.
    """
    logger.info(f"User info request: user_id={current_user.id}")
    
    # Convert user model to response schema
    user_data = {
        "id": str(current_user.id),  # Convert UUID to string
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "full_name": current_user.full_name,
        "display_name": current_user.display_name,
        "avatar_url": current_user.avatar_url,
        "bio": current_user.bio,
        "location": current_user.location,
        "website_url": current_user.website_url,
        "status": current_user.status,
        "is_verified": current_user.is_verified,
        "is_active": current_user.is_active,
        "last_login_at": current_user.last_login_at,
        "subscription_tier": current_user.subscription_tier,
        "is_premium": current_user.is_premium,
        "is_public_profile": current_user.is_public_profile,
        "show_portfolio": current_user.show_portfolio,
        "show_trading_activity": current_user.show_trading_activity,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
    }
    
    return create_response(data=user_data)


@router.post(
    "/refresh",
    response_model=ResponseEnvelope[TokenResponse],
    responses={
        200: {"description": "Token refreshed successfully"},
        401: {"description": "Invalid refresh token"},
        500: {"description": "Internal server error"}
    }
)
async def refresh_token(
    request: RefreshTokenRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ResponseEnvelope[TokenResponse]:
    """
    Refresh authentication token.
    
    Returns new access token for valid refresh token.
    """
    logger.info("Token refresh attempt")
    
    try:
        # Verify refresh token
        payload = verify_token(request.refresh_token)
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            return create_response(error={"message": "Invalid token type"})
        
        user_id = payload.get("sub")
        if not user_id:
            return create_response(error={"message": "Invalid token payload"})
        
        # Get user from database
        result = await session.execute(
            select(User).where(User.id == int(user_id), User.is_deleted == False)
        )
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            return create_response(error={"message": "User not found or inactive"})
        
        # Create new token response
        token_data = create_token_response(user)
        
        logger.info(f"Token refresh successful: user_id={user.id}")
        return create_response(data=token_data)
        
    except AuthenticationError as e:
        logger.error(f"Token refresh failed: {str(e)}")
        return create_response(error={"message": str(e)})
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        return create_response(error={"message": "Token refresh failed"})


@router.post(
    "/logout",
    responses={
        200: {"description": "Logout successful"},
        401: {"description": "Invalid token"},
        500: {"description": "Internal server error"}
    }
)
async def logout(
    current_user: User = Depends(get_current_user),
) -> ResponseEnvelope[Dict[str, str]]:
    """
    User logout endpoint.
    
    Invalidates the current session.
    """
    logger.info(f"User logout: user_id={current_user.id}")
    
    # In a real implementation, you would invalidate the token
    # For now, we'll just return success
    return create_response(data={"message": "Logged out successfully"})


@router.post(
    "/change-password",
    response_model=ResponseEnvelope[Dict[str, str]],
    responses={
        200: {"description": "Password changed successfully"},
        400: {"description": "Invalid current password"},
        401: {"description": "Invalid token"},
        500: {"description": "Internal server error"}
    }
)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ResponseEnvelope[Dict[str, str]]:
    """
    Change user password.
    
    Updates the user's password after verifying the current password.
    """
    logger.info(f"Password change attempt: user_id={current_user.id}")
    
    # Verify current password
    if not verify_password(request.current_password, current_user.password_hash):
        return create_response(error={"message": "Current password is incorrect"})
    
    # Update password
    current_user.password_hash = get_password_hash(request.new_password)
    await session.commit()
    
    logger.info(f"Password change successful: user_id={current_user.id}")
    return create_response(data={"message": "Password changed successfully"})


@router.post(
    "/reset-password",
    response_model=ResponseEnvelope[Dict[str, str]],
    responses={
        200: {"description": "Password reset email sent"},
        404: {"description": "User not found"},
        500: {"description": "Internal server error"}
    }
)
async def reset_password_request(
    request: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ResponseEnvelope[Dict[str, str]]:
    """
    Request password reset.
    
    Sends a password reset email to the user.
    """
    logger.info(f"Password reset request: email={request.email}")
    
    # Check if user exists
    result = await session.execute(
        select(User).where(User.email == request.email, User.is_deleted == False)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Don't reveal if user exists or not
        logger.info(f"Password reset request for non-existent user: email={request.email}")
        return create_response(data={"message": "If an account exists, a reset email has been sent"})
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    token_hash = get_password_hash(reset_token)  # Hash the token for storage
    
    # Create password reset token record
    reset_token_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        ip_address=request.client.host if hasattr(request, 'client') else None,
        user_agent=request.headers.get('user-agent')
    )
    
    session.add(reset_token_record)
    await session.commit()
    
    # Send password reset email
    try:
        await email_service.send_password_reset_email(user, reset_token)
        logger.info(f"Password reset email sent: user_id={user.id}")
        return create_response(data={"message": "If an account exists, a reset email has been sent"})
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")
        return create_response(data={"message": "If an account exists, a reset email has been sent"})


@router.post(
    "/reset-password-confirm",
    response_model=ResponseEnvelope[Dict[str, str]],
    responses={
        200: {"description": "Password reset successful"},
        400: {"description": "Invalid or expired token"},
        500: {"description": "Internal server error"}
    }
)
async def reset_password_confirm(
    request: ResetPasswordConfirmRequest,
    session: AsyncSession = Depends(get_db_session),
) -> ResponseEnvelope[Dict[str, str]]:
    """
    Confirm password reset with token.
    
    Resets the user's password using the provided token.
    """
    logger.info("Password reset confirmation attempt")
    
    try:
        # Find the password reset token
        result = await session.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.token_hash == get_password_hash(request.token)
            )
        )
        reset_token = result.scalar_one_or_none()
        
        if not reset_token:
            logger.warning("Password reset attempt with invalid token")
            return create_response(error={"message": "Invalid or expired reset token"})
        
        # Check if token is valid and not expired
        if not reset_token.is_valid():
            logger.warning(f"Password reset attempt with expired/used token: user_id={reset_token.user_id}")
            return create_response(error={"message": "Invalid or expired reset token"})
        
        # Get the user
        user_result = await session.execute(
            select(User).where(User.id == reset_token.user_id)
        )
        user = user_result.scalar_one_or_none()
        
        if not user:
            logger.error(f"User not found for password reset: user_id={reset_token.user_id}")
            return create_response(error={"message": "Invalid or expired reset token"})
        
        # Update user's password
        user.password_hash = get_password_hash(request.new_password)
        
        # Mark token as used
        reset_token.mark_as_used()
        
        await session.commit()
        
        logger.info(f"Password reset successful: user_id={user.id}")
        return create_response(data={"message": "Password reset successful"})
        
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        await session.rollback()
        return create_response(error={"message": "Invalid or expired reset token"})


@router.post(
    "/update-preferences",
    response_model=ResponseEnvelope[Dict[str, str]],
    responses={
        200: {"description": "Preferences updated successfully"},
        401: {"description": "Invalid token"},
        500: {"description": "Internal server error"}
    }
)
async def update_preferences(
    request: UpdatePreferencesRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ResponseEnvelope[Dict[str, str]]:
    """
    Update user preferences including notification settings.
    """
    logger.info(f"Preferences update attempt: user_id={current_user.id}")
    
    try:
        # Get or create user preferences
        from domains.users.models import UserPreference
        result = await session.execute(
            select(UserPreference).where(UserPreference.user_id == current_user.id)
        )
        preferences = result.scalar_one_or_none()
        
        if not preferences:
            preferences = UserPreference(user_id=current_user.id)
            session.add(preferences)
        
        # Update notification preferences
        if request.email_notifications is not None:
            preferences.email_notifications = request.email_notifications
        if request.push_notifications is not None:
            preferences.push_notifications = request.push_notifications
        if request.sms_notifications is not None:
            preferences.sms_notifications = request.sms_notifications
        if request.trade_alerts is not None:
            preferences.trade_alerts = request.trade_alerts
        if request.weekly_summary is not None:
            preferences.weekly_summary = request.weekly_summary
        if request.multiple_buyer_alerts is not None:
            preferences.multiple_buyer_alerts = request.multiple_buyer_alerts
        if request.high_value_alerts is not None:
            preferences.high_value_alerts = request.high_value_alerts
        
        await session.commit()
        
        logger.info(f"Preferences update successful: user_id={current_user.id}")
        return create_response(data={"message": "Preferences updated successfully"})
        
    except Exception as e:
        logger.error(f"Preferences update failed: {e}")
        return create_response(error={"message": "Failed to update preferences"})


@router.get(
    "/preferences",
    response_model=ResponseEnvelope[Dict[str, Any]],
    responses={
        200: {"description": "User preferences retrieved successfully"},
        401: {"description": "Invalid token"},
        500: {"description": "Internal server error"}
    }
)
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> ResponseEnvelope[Dict[str, Any]]:
    """
    Get user preferences including notification settings.
    """
    logger.info(f"Preferences request: user_id={current_user.id}")
    
    try:
        # Get user preferences
        from domains.users.models import UserPreference
        result = await session.execute(
            select(UserPreference).where(UserPreference.user_id == current_user.id)
        )
        preferences = result.scalar_one_or_none()
        
        if not preferences:
            # Return default preferences if none exist
            preferences_data = {
                "email_notifications": True,
                "push_notifications": True,
                "sms_notifications": False,
                "trade_alerts": False,
                "weekly_summary": False,
                "multiple_buyer_alerts": False,
                "high_value_alerts": False,
            }
        else:
            preferences_data = {
                "email_notifications": preferences.email_notifications,
                "push_notifications": preferences.push_notifications,
                "sms_notifications": preferences.sms_notifications,
                "trade_alerts": preferences.trade_alerts,
                "weekly_summary": preferences.weekly_summary,
                "multiple_buyer_alerts": preferences.multiple_buyer_alerts,
                "high_value_alerts": preferences.high_value_alerts,
            }
        
        logger.info(f"Preferences retrieved successfully: user_id={current_user.id}")
        return create_response(data=preferences_data)
        
    except Exception as e:
        logger.error(f"Preferences retrieval failed: {e}")
        return create_response(error={"message": "Failed to retrieve preferences"})




 