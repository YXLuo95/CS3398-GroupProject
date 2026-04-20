"""
Forum endpoints.
- Only whitelisted users (ForumAuthor) can create posts.
- Any authenticated user can reply.
- Delete is admin-only (via sqladmin).
"""
 
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
 
from src.core.database import get_session
from src.core.auth import get_current_user
from src.model import User, ForumPost, ForumReply
from src.schemas import (
    ForumPostCreate,
    ForumPostRead,
    ForumPostDetail,
    ForumReplyCreate,
    ForumReplyRead,
    ForumAuthorStatus,
)
from src.crud.forum import (
    is_forum_author,
    create_post,
    get_all_posts,
    get_post_with_replies,
    create_reply,
    get_post_by_id,
)
 
router = APIRouter()
 
 
@router.get("/status", response_model=ForumAuthorStatus)
async def get_author_status(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Check whether the current user can create forum posts."""
    can_post = await is_forum_author(session, current_user.id)
    return ForumAuthorStatus(can_post=can_post)
 
 
@router.get("/posts", response_model=List[ForumPostRead])
async def list_posts(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """List all forum posts, newest first."""
    return await get_all_posts(session, limit)
 
 
@router.post("/posts", response_model=ForumPostRead, status_code=status.HTTP_201_CREATED)
async def create_post_endpoint(
    data: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Create a new post. Only whitelisted users (ForumAuthor) can post."""
    if not await is_forum_author(session, current_user.id):
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to create posts. Contact admin for posting rights.",
        )
 
    post = ForumPost(
        user_id=current_user.id,
        title=data.title,
        content=data.content,
    )
    saved = await create_post(session, post)
    return {
        "id": saved.id,
        "user_id": saved.user_id,
        "username": current_user.username,
        "title": saved.title,
        "content": saved.content,
        "reply_count": 0,
        "created_at": saved.created_at,
    }
 
 
@router.get("/posts/{post_id}", response_model=ForumPostDetail)
async def get_post_detail(
    post_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get a post with all replies."""
    post = await get_post_with_replies(session, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post
 
 
@router.post("/posts/{post_id}/replies", response_model=ForumReplyRead, status_code=status.HTTP_201_CREATED)
async def create_reply_endpoint(
    post_id: int,
    data: ForumReplyCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Reply to a post. Any authenticated user can reply."""
    post = await get_post_by_id(session, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
 
    reply = ForumReply(
        post_id=post_id,
        user_id=current_user.id,
        content=data.content,
    )
    saved = await create_reply(session, reply)
    return {
        "id": saved.id,
        "post_id": saved.post_id,
        "user_id": saved.user_id,
        "username": current_user.username,
        "content": saved.content,
        "created_at": saved.created_at,
    }
 