"""
Subscription endpoints.
- GET /status — check current user's subscription
- POST /redeem — redeem a coupon to unlock a tier
"""
 
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
 
from src.core.database import get_session
from src.core.auth import get_current_user
from src.core.config import settings
from src.model import User
from src.schemas import SubscriptionStatus, CouponRedeem, SubscriptionRead
from src.crud.subscription import (
    get_subscription_by_user,
    create_or_extend_subscription,
    is_user_premium,
)
 
router = APIRouter()
 
VALID_TIERS = {"basic", "premium", "pro"}
 
 
@router.get("/status", response_model=SubscriptionStatus)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return whether the current user has an active subscription."""
    sub = await get_subscription_by_user(session, current_user.id)
    if not sub:
        return SubscriptionStatus(is_premium=False)
 
    # Check expiry
    now = datetime.now(timezone.utc)
    expires = sub.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
 
    is_active = expires > now
    return SubscriptionStatus(
        is_premium=is_active,
        tier=sub.tier if is_active else None,
        expires_at=sub.expires_at if is_active else None,
    )
 
 
@router.post("/redeem", response_model=SubscriptionRead, status_code=status.HTTP_201_CREATED)
async def redeem_coupon(
    data: CouponRedeem,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Redeem a coupon to activate a subscription tier.
    One coupon unlocks any tier (chosen by the user at checkout).
    """
    # Validate tier
    if data.tier not in VALID_TIERS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid tier. Must be one of: {', '.join(VALID_TIERS)}",
        )
 
    # Validate coupon against .env
    if data.coupon.strip() != settings.PREMIUM_COUPON:
        raise HTTPException(
            status_code=400,
            detail="Invalid coupon code.",
        )
 
    sub = await create_or_extend_subscription(
        session=session,
        user_id=current_user.id,
        tier=data.tier,
        coupon=data.coupon.strip(),
    )
 
    return SubscriptionRead(
        tier=sub.tier,
        started_at=sub.started_at,
        expires_at=sub.expires_at,
        is_active=True,
    )