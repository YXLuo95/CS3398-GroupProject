import asyncio
import json
import logging
from typing import List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from jose import JWTError, jwt

from src.core.database import get_session, engine
from src.core.config import settings
from src.model import ChatMessage
from src.crud.user import get_user_by_username

logger = logging.getLogger("Chat")

router = APIRouter()

# ==========================================
# Active WebSocket connections
# ==========================================
connected_clients: dict[WebSocket, str] = {}  # websocket -> username


async def verify_ws_token(token: str) -> str | None:
    """Verify JWT token from WebSocket connection, return username if valid."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        token_type = payload.get("type", "access")
        if username and token_type == "access":
            return username
    except JWTError:
        pass
    return None


async def broadcast(message: dict, app):
    """Publish message to Redis Pub/Sub for all subscribers."""
    await app.state.redis_queue.publish("chat:lobby", json.dumps(message))


async def redis_listener(websocket: WebSocket, app):
    """Subscribe to Redis Pub/Sub and forward messages to this WebSocket."""
    pubsub = app.state.redis_queue.pubsub()
    await pubsub.subscribe("chat:lobby")
    try:
        async for msg in pubsub.listen():
            if msg["type"] == "message":
                await websocket.send_text(msg["data"])
    except Exception:
        pass
    finally:
        await pubsub.unsubscribe("chat:lobby")
        await pubsub.aclose()


# ==========================================
# WebSocket Chat Endpoint
# ==========================================
@router.websocket("/chat")
async def chat_endpoint(
    websocket: WebSocket,
    token: str = Query(None),
):
    # 1. Verify token
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return

    username = await verify_ws_token(token)
    if not username:
        await websocket.close(code=4003, reason="Invalid token")
        return

    # 2. Accept connection
    await websocket.accept()
    connected_clients[websocket] = username
    app = websocket.app

    # 3. Broadcast join notification
    join_msg = {"type": "system", "content": f"{username} joined the chat"}
    await broadcast(join_msg, app)

    # 4. Start Redis listener in background
    listener_task = asyncio.create_task(redis_listener(websocket, app))

    # 5. Listen for incoming messages
    try:
        while True:
            data = await websocket.receive_text()

            # Save to DB using existing CRUD function
            try:
                async with AsyncSession(engine) as session:
                    user = await get_user_by_username(session, username)

                    if user:
                        msg = ChatMessage(
                            user_id=user.id,
                            username=username,
                            content=data,
                        )
                        session.add(msg)
                        await session.commit()
            except Exception as e:
                logger.error(f"[Chat] DB save failed: {e}")

            # Broadcast via Redis Pub/Sub
            chat_msg = {
                "type": "message",
                "username": username,
                "content": data,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            await broadcast(chat_msg, app)

    except WebSocketDisconnect:
        pass
    finally:
        connected_clients.pop(websocket, None)
        listener_task.cancel()
        leave_msg = {"type": "system", "content": f"{username} left the chat"}
        await broadcast(leave_msg, app)


# ==========================================
# Chat History REST Endpoint
# ==========================================
@router.get("/chat/history")
async def get_chat_history(
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
):
    """Pull recent chat messages for loading on page open."""
    statement = (
        select(ChatMessage)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    result = await session.execute(statement)
    messages = result.scalars().all()

    return [
        {
            "type": "message",
            "username": msg.username,
            "content": msg.content,
            "timestamp": msg.created_at.isoformat(),
        }
        for msg in reversed(messages)
    ]