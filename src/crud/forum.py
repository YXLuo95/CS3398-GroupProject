"""CRUD operations for forum posts, replies, and author whitelist."""
 
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select, func
from src.model import ForumPost, ForumReply, ForumAuthor, User
 
 
async def is_forum_author(session: AsyncSession, user_id: int) -> bool:
    """Check if a user is on the forum author whitelist."""
    statement = select(ForumAuthor).where(ForumAuthor.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().first() is not None
 
 
async def create_post(session: AsyncSession, post: ForumPost) -> ForumPost:
    session.add(post)
    await session.commit()
    await session.refresh(post)
    return post
 
 
async def get_all_posts(session: AsyncSession, limit: int = 50) -> List[dict]:
    """Return posts with username and reply count, newest first."""
    # Get posts with their authors
    statement = (
        select(
            ForumPost,
            User.username,
            func.count(ForumReply.id).label("reply_count"),
        )
        .join(User, User.id == ForumPost.user_id)
        .outerjoin(ForumReply, ForumReply.post_id == ForumPost.id)
        .group_by(ForumPost.id, User.username)
        .order_by(ForumPost.created_at.desc())
        .limit(limit)
    )
    result = await session.execute(statement)
    rows = result.all()
 
    return [
        {
            "id": post.id,
            "user_id": post.user_id,
            "username": username,
            "title": post.title,
            "content": post.content,
            "reply_count": reply_count,
            "created_at": post.created_at,
        }
        for post, username, reply_count in rows
    ]
 
 
async def get_post_with_replies(session: AsyncSession, post_id: int) -> Optional[dict]:
    """Get a single post with all replies and usernames joined."""
    # Fetch post + author
    post_stmt = (
        select(ForumPost, User.username)
        .join(User, User.id == ForumPost.user_id)
        .where(ForumPost.id == post_id)
    )
    post_result = await session.execute(post_stmt)
    post_row = post_result.first()
    if not post_row:
        return None
    post, post_username = post_row
 
    # Fetch replies + authors
    reply_stmt = (
        select(ForumReply, User.username)
        .join(User, User.id == ForumReply.user_id)
        .where(ForumReply.post_id == post_id)
        .order_by(ForumReply.created_at.asc())
    )
    reply_result = await session.execute(reply_stmt)
    reply_rows = reply_result.all()
 
    replies = [
        {
            "id": reply.id,
            "post_id": reply.post_id,
            "user_id": reply.user_id,
            "username": username,
            "content": reply.content,
            "created_at": reply.created_at,
        }
        for reply, username in reply_rows
    ]
 
    return {
        "id": post.id,
        "user_id": post.user_id,
        "username": post_username,
        "title": post.title,
        "content": post.content,
        "reply_count": len(replies),
        "created_at": post.created_at,
        "replies": replies,
    }
 
 
async def create_reply(session: AsyncSession, reply: ForumReply) -> ForumReply:
    session.add(reply)
    await session.commit()
    await session.refresh(reply)
    return reply
 
 
async def get_post_by_id(session: AsyncSession, post_id: int) -> Optional[ForumPost]:
    return await session.get(ForumPost, post_id)
 