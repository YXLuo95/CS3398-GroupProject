"""CRUD operations for user subscriptions."""
 
from typing import Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from src.model import Subscription
 
 
async def get_subscription_by_user(session: AsyncSession, user_id: int) -> Optional[Subscription]:
    statement = select(Subscription).where(Subscription.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().first()
 
 
async def is_user_premium(session: AsyncSession, user_id: int) -> bool:
    """Returns True if user has an active (non-expired) subscription."""
    sub = await get_subscription_by_user(session, user_id)
    if not sub:
        return False
    # Compare as timezone-aware UTC
    now = datetime.now(timezone.utc)
    expires = sub.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    return expires > now
 
 
async def create_or_extend_subscription(
    session: AsyncSession,
    user_id: int,
    tier: str,
    coupon: str,
) -> Subscription:
    """Create a new subscription or update the existing one with a new tier/expiry."""
    existing = await get_subscription_by_user(session, user_id)
    new_expires = datetime.now(timezone.utc) + timedelta(days=365 * 10)  # 10 years
 
    if existing:
        existing.tier = tier
        existing.expires_at = new_expires
        existing.coupon_used = coupon
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing
 
    sub = Subscription(
        user_id=user_id,
        tier=tier,
        expires_at=new_expires,
        coupon_used=coupon,
    )
    session.add(sub)
    await session.commit()
    await session.refresh(sub)
    return sub
 