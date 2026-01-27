"""
XAPPY AI WhatsApp Webhook Endpoints

Meta WhatsApp Business API webhook handlers.
"""

import copy
import hmac
import hashlib
from datetime import datetime, timezone
from typing import Optional

import structlog
from fastapi import APIRouter, Request, HTTPException, status, Query, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User, UserStatus
from app.models.conversation import (
    Conversation,
    ConversationStatus,
    ConversationContext,
    Message,
    MessageDirection,
    MessageType,
)
from app.services.agent.graph_agent import run_agent
from app.services.chat_reporting import create_report_from_draft

router = APIRouter()
logger = structlog.get_logger()


def handle_slash_command(command_text: str) -> Optional[str]:
    """
    Handle WhatsApp slash commands and convert them to natural language.

    Commands:
    - /report - Start a new safety report
    - /nearmiss - Report a near miss
    - /incident - Report an incident
    - /inspection - Log an inspection
    - /handover - Create shift handover
    - /help - Get help
    - /status - Check report status
    - /cancel - Cancel current report
    """
    command = command_text.lower().strip()

    # Map commands to natural language that the agent understands
    command_mappings = {
        "/report": "I want to create a safety report",
        "/nearmiss": "I want to report a near miss",
        "/incident": "I want to report an incident",
        "/inspection": "I want to log an inspection report",
        "/handover": "I want to create a shift handover report",
        "/toolbox": "I want to log a toolbox talk",
        "/spill": "I want to report a spill",
        "/ptw": "I want to log permit to work evidence",
        "/help": "help",
        "/status": "What is the status of my reports?",
        "/cancel": "cancel",
        "/reset": "cancel",
    }

    # Check for exact match
    if command in command_mappings:
        logger.info("Slash command recognized", command=command)
        return command_mappings[command]

    # Check for partial match (e.g., "/report near miss")
    for cmd, response in command_mappings.items():
        if command.startswith(cmd):
            # Append any additional text after the command
            extra_text = command_text[len(cmd):].strip()
            if extra_text:
                logger.info("Slash command with extra text", command=cmd, extra=extra_text)
                return f"{response}: {extra_text}"
            return response

    # Unknown command - pass through as is
    logger.info("Unknown slash command", command=command)
    return None


@router.get("/webhook")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    """
    WhatsApp webhook verification endpoint.

    Called by Meta when setting up the webhook.
    """
    logger.info(
        "WhatsApp webhook verification",
        mode=hub_mode,
        token_received=bool(hub_verify_token),
    )

    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified successfully")
        return PlainTextResponse(content=hub_challenge)

    logger.warning("WhatsApp webhook verification failed")
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Verification failed",
    )


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    WhatsApp webhook handler.

    Receives all WhatsApp events (messages, status updates, etc.)
    Always returns 200 immediately, processes asynchronously.
    """
    # Get raw body for signature verification
    body = await request.body()

    # Verify signature in production
    if settings.is_production:
        signature = request.headers.get("X-Hub-Signature-256", "")
        if not verify_signature(body, signature):
            logger.warning("Invalid WhatsApp webhook signature")
            # Still return 200 to prevent retries
            return {"status": "error", "message": "Invalid signature"}

    # Parse payload
    try:
        payload = await request.json()
    except Exception as e:
        logger.error("Failed to parse WhatsApp webhook payload", error=str(e))
        return {"status": "error", "message": "Invalid JSON"}

    logger.info(
        "WhatsApp webhook received",
        entry_count=len(payload.get("entry", [])),
    )

    # Process the webhook (would be async in production)
    try:
        await process_webhook(payload, db, request)
    except Exception as e:
        logger.error("Error processing WhatsApp webhook", error=str(e))
        # Still return 200 to prevent retries

    return {"status": "ok"}


def verify_signature(body: bytes, signature: str) -> bool:
    """Verify WhatsApp webhook signature"""
    if not signature.startswith("sha256="):
        return False

    expected_signature = signature[7:]  # Remove "sha256=" prefix

    # Compute HMAC
    app_secret = (settings.WHATSAPP_APP_SECRET or "").encode()
    if not app_secret:
        return False
    computed = hmac.new(app_secret, body, hashlib.sha256).hexdigest()

    return hmac.compare_digest(computed, expected_signature)


async def process_webhook(payload: dict, db: AsyncSession, request: Request):
    """
    Process WhatsApp webhook payload.

    This is where the magic happens:
    1. Extract message content
    2. Identify user
    3. Route to LangGraph agent
    4. Send response
    """
    # Extract entry
    entry = payload.get("entry", [])
    if not entry:
        return

    for e in entry:
        changes = e.get("changes", [])
        for change in changes:
            if change.get("field") != "messages":
                continue

            value = change.get("value", {})

            # Handle status updates
            statuses = value.get("statuses", [])
            for status_update in statuses:
                await handle_status_update(status_update)

            # Handle incoming messages
            messages = value.get("messages", [])
            contacts = value.get("contacts", [])
            metadata = value.get("metadata", {})

            for message in messages:
                await handle_message(message, contacts, metadata, db, request)


async def handle_status_update(status_update: dict):
    """Handle message status updates (sent, delivered, read)"""
    message_id = status_update.get("id")
    status_value = status_update.get("status")
    timestamp = status_update.get("timestamp")

    logger.info(
        "WhatsApp message status update",
        message_id=message_id,
        status=status_value,
        timestamp=timestamp,
    )

    # TODO: Update message status in database


async def handle_message(
    message: dict,
    contacts: list,
    metadata: dict,
    db: AsyncSession,
    request: Request,
):
    """
    Handle incoming WhatsApp message.

    Message types:
    - text: Plain text message
    - image: Photo with optional caption
    - audio: Voice note
    - video: Video with optional caption
    - document: Document/file
    - location: GPS location
    - interactive: Button/list response
    """
    message_id = message.get("id")
    from_number = message.get("from")
    message_type = message.get("type")
    timestamp = message.get("timestamp")

    # Get contact name
    contact_name = None
    for contact in contacts:
        if contact.get("wa_id") == from_number:
            contact_name = contact.get("profile", {}).get("name")
            break

    masked_number = f"{from_number[:-2]}**" if from_number and len(from_number) > 2 else "**"
    logger.info(
        "WhatsApp message received",
        message_id=message_id,
        from_number=masked_number,
        message_type=message_type,
        contact_name=contact_name,
    )

    # Mark message as read immediately (shows blue ticks to user)
    if message_id:
        await mark_message_as_read(message_id)

    # Send typing indicator to show bot is processing
    if from_number:
        await send_typing_indicator(from_number)

    # Extract content based on type
    content = None
    media_id = None
    media_mime_type = None

    if message_type == "text":
        content = message.get("text", {}).get("body", "")

        # Handle slash commands
        if content.startswith("/"):
            command_response = handle_slash_command(content)
            if command_response:
                # Override content with the command interpretation
                content = command_response

    elif message_type == "image":
        media_id = message.get("image", {}).get("id")
        content = message.get("image", {}).get("caption", "[Image received]")

    elif message_type == "audio":
        media_id = message.get("audio", {}).get("id")
        media_mime_type = message.get("audio", {}).get("mime_type")
        content = None

    elif message_type == "video":
        media_id = message.get("video", {}).get("id")
        content = message.get("video", {}).get("caption", "[Video received]")

    elif message_type == "document":
        media_id = message.get("document", {}).get("id")
        filename = message.get("document", {}).get("filename", "document")
        content = f"[Document received: {filename}]"

    elif message_type == "location":
        location = message.get("location", {})
        lat = location.get("latitude")
        lng = location.get("longitude")
        name = location.get("name", "")
        address = location.get("address", "")
        content = f"[Location: {name} {address}]"
        # Store coordinates for report

    elif message_type == "interactive":
        interactive = message.get("interactive", {})
        interactive_type = interactive.get("type")
        if interactive_type == "button_reply":
            content = interactive.get("button_reply", {}).get("title", "")
        elif interactive_type == "list_reply":
            content = interactive.get("list_reply", {}).get("title", "")

    elif message_type == "button":
        content = message.get("button", {}).get("text", "")

    else:
        content = f"[Unsupported message type: {message_type}]"

    logger.info(
        "Message content extracted",
        message_type=message_type,
        has_media=bool(media_id),
    )

    # Get phone number first (needed for error handling)
    phone = f"+{from_number}" if from_number and not from_number.startswith("+") else from_number
    if not phone:
        logger.warning("No phone number in message, skipping")
        return

    # Handle voice messages - transcribe to text
    if message_type == "audio" and media_id:
        logger.info(
            "Voice message received - starting transcription",
            from_number=masked_number,
            media_id=media_id,
            mime_type=media_mime_type,
        )
        transcript = await transcribe_whatsapp_audio(media_id, media_mime_type)
        if transcript:
            logger.info(
                "Voice message transcribed successfully",
                from_number=masked_number,
                transcript_length=len(transcript),
                transcript_preview=transcript[:100] if len(transcript) > 100 else transcript,
            )
            content = transcript
        else:
            logger.warning(
                "Voice message transcription failed",
                from_number=masked_number,
                media_id=media_id,
            )
            content = None

    # Handle case where content could not be extracted (e.g., failed audio transcription)
    if not content:
        user = await get_or_create_user(db, phone, contact_name)
        conversation = await get_or_create_conversation(db, user)

        inbound = Message(
            conversation_id=conversation.id,
            direction=MessageDirection.INBOUND,
            message_type=MessageType.AUDIO if message_type == "audio" else MessageType.TEXT,
            content=None,
            external_id=message_id,
            media_id=media_id,
            media_mime_type=media_mime_type,
        )
        db.add(inbound)

        response_text = "I could not transcribe the voice note. Please describe the report in text."
        outbound = Message(
            conversation_id=conversation.id,
            direction=MessageDirection.OUTBOUND,
            message_type=MessageType.TEXT,
            content=response_text,
        )
        db.add(outbound)

        conversation.last_message_at = datetime.now(timezone.utc)
        conversation.turn_count = (conversation.turn_count or 0) + 1
        await db.commit()
        await send_whatsapp_message(phone, response_text)
        return

    # Continue with normal message processing
    user = await get_or_create_user(db, phone, contact_name)
    conversation = await get_or_create_conversation(db, user)

    inbound_message_type = {
        "text": MessageType.TEXT,
        "audio": MessageType.AUDIO,
        "image": MessageType.IMAGE,
        "video": MessageType.VIDEO,
        "document": MessageType.DOCUMENT,
        "location": MessageType.LOCATION,
    }.get(message_type, MessageType.TEXT)
    inbound = Message(
        conversation_id=conversation.id,
        direction=MessageDirection.INBOUND,
        message_type=inbound_message_type,
        content=content,
        external_id=message_id,
        media_id=media_id,
        media_mime_type=media_mime_type,
    )
    db.add(inbound)

    draft = copy.deepcopy((conversation.context_data or {}).get("draft"))
    agent_state = await run_agent(content, draft)
    draft = agent_state.get("draft")
    response_text = agent_state.get("response") or "Please provide more details."
    action = agent_state.get("action")

    # Log voice message processing completion
    if message_type == "audio":
        logger.info(
            "Voice message processed by agent",
            from_number=masked_number,
            action=action,
            has_draft=bool(draft),
            report_type=draft.get("report_type") if draft else None,
        )

    if action == "submit":
        report = await create_report_from_draft(
            db=db,
            user=user,
            conversation_id=conversation.id,
            draft=draft,
            request_meta={
                "request_id": getattr(request.state, "request_id", None),
                "client_ip": getattr(request.state, "client_ip", None),
                "user_agent": request.headers.get("user-agent"),
            },
        )
        response_text = f"Report submitted. Reference number: {report.reference_number}."
        conversation.status = ConversationStatus.COMPLETED
        conversation.current_context = ConversationContext.OTHER
        conversation.context_data = None
    elif action == "cancel":
        conversation.status = ConversationStatus.ACTIVE
        conversation.current_context = ConversationContext.MAIN_MENU
        conversation.context_data = None
    else:
        conversation.context_data = {"draft": draft} if draft else None
        conversation.current_context = ConversationContext.OTHER if draft else ConversationContext.MAIN_MENU

    conversation.last_message_at = datetime.now(timezone.utc)
    conversation.turn_count = (conversation.turn_count or 0) + 1

    outbound = Message(
        conversation_id=conversation.id,
        direction=MessageDirection.OUTBOUND,
        message_type=MessageType.TEXT,
        content=response_text,
    )
    db.add(outbound)
    await db.commit()

    await send_whatsapp_message(phone, response_text)


async def get_or_create_user(
    db: AsyncSession,
    phone_number: Optional[str],
    full_name: Optional[str],
) -> User:
    result = await db.execute(select(User).where(User.phone_number == phone_number))
    user = result.scalar_one_or_none()
    if user:
        return user

    user = User(
        phone_number=phone_number,
        full_name=full_name or "WhatsApp User",
        status=UserStatus.ACTIVE,
        phone_verified=True,
    )
    db.add(user)
    await db.flush()
    return user


async def get_or_create_conversation(db: AsyncSession, user: User) -> Conversation:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .where(Conversation.platform == "whatsapp")
        .where(Conversation.status == ConversationStatus.ACTIVE)
        .order_by(Conversation.created_at.desc())
    )
    conversation = result.scalar_one_or_none()
    if conversation:
        return conversation

    conversation = Conversation(
        user_id=user.id,
        platform="whatsapp",
        status=ConversationStatus.ACTIVE,
        current_context=ConversationContext.MAIN_MENU,
        last_message_at=datetime.now(timezone.utc),
    )
    db.add(conversation)
    await db.flush()
    return conversation


async def mark_message_as_read(message_id: str) -> None:
    """Mark an incoming WhatsApp message as read (blue ticks)."""
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        return

    url = (
        f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/"
        f"{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    )
    payload = {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": message_id,
    }
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    import httpx
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code < 400:
                logger.info("Message marked as read", message_id=message_id[:20] + "...")
            else:
                logger.warning("Failed to mark as read", status=resp.status_code)
    except Exception as e:
        logger.warning("Error marking message as read", error=str(e))


async def send_typing_indicator(to_number: str) -> None:
    """Send typing indicator to show bot is processing (WhatsApp reaction as presence)."""
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        return

    # Remove "+" prefix if present
    clean_number = to_number.lstrip("+") if to_number else to_number

    # WhatsApp Cloud API doesn't have direct typing indicator
    # We use a small delay to simulate "thinking" - the read receipt serves as acknowledgment
    import asyncio
    await asyncio.sleep(0.5)  # Brief pause to show we received the message
    logger.info("Typing indicator simulated", to=clean_number[:6] + "****")


async def send_whatsapp_message(to_number: Optional[str], text: str) -> None:
    if not to_number:
        return
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        logger.warning("WhatsApp credentials not configured")
        return

    # Remove "+" prefix if present - WhatsApp API expects numbers without "+"
    clean_number = to_number.lstrip("+") if to_number else to_number

    url = (
        f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/"
        f"{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    )
    payload = {
        "messaging_product": "whatsapp",
        "to": clean_number,
        "type": "text",
        "text": {"body": text},
    }
    logger.info("Sending WhatsApp message", to=clean_number[:6] + "****")
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    import httpx
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code >= 400:
            logger.error("WhatsApp send FAILED", status=resp.status_code, body=resp.text)
        else:
            logger.info("WhatsApp send SUCCESS", status=resp.status_code, response=resp.text[:200])


async def transcribe_whatsapp_audio(media_id: str, mime_type: Optional[str]) -> Optional[str]:
    """
    Transcribe WhatsApp voice message to text using OpenAI Whisper.

    WhatsApp sends audio in OGG/Opus format which needs conversion to MP3
    for OpenAI compatibility.
    """
    if not settings.OPENAI_API_KEY:
        logger.warning("OpenAI API key not configured for transcription")
        return None

    audio_bytes = await fetch_whatsapp_media(media_id)
    if not audio_bytes:
        logger.warning("Failed to fetch WhatsApp media", media_id=media_id)
        return None

    import io
    from openai import AsyncOpenAI

    # Convert OGG/Opus to MP3 for OpenAI compatibility
    converted_audio = await convert_audio_to_mp3(audio_bytes, mime_type)
    if not converted_audio:
        logger.warning("Audio conversion failed, trying original format")
        converted_audio = audio_bytes
        filename = "audio.ogg"
    else:
        filename = "audio.mp3"

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        result = await client.audio.transcriptions.create(
            model=settings.OPENAI_TRANSCRIBE_MODEL,
            file=(filename, io.BytesIO(converted_audio)),
            response_format="text",
        )
        transcript = result.strip() if isinstance(result, str) else getattr(result, "text", None)
        logger.info(
            "Audio transcription completed",
            media_id=media_id,
            transcript_length=len(transcript) if transcript else 0,
        )
        return transcript
    except Exception as exc:
        logger.warning("Audio transcription failed", error=str(exc), media_id=media_id)
        return None


async def convert_audio_to_mp3(audio_bytes: bytes, mime_type: Optional[str]) -> Optional[bytes]:
    """
    Convert audio bytes to MP3 format using pydub/ffmpeg.

    WhatsApp voice notes are typically in OGG/Opus format which OpenAI
    doesn't support directly.
    """
    import io
    import tempfile
    import os

    try:
        from pydub import AudioSegment

        # Determine input format from mime type
        input_format = "ogg"
        if mime_type:
            if "opus" in mime_type:
                input_format = "ogg"
            elif "ogg" in mime_type:
                input_format = "ogg"
            elif "mp4" in mime_type or "m4a" in mime_type:
                input_format = "mp4"
            elif "webm" in mime_type:
                input_format = "webm"
            elif "wav" in mime_type:
                input_format = "wav"

        # Load audio from bytes
        audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format=input_format)

        # Export as MP3
        output_buffer = io.BytesIO()
        audio.export(output_buffer, format="mp3", bitrate="128k")
        output_buffer.seek(0)

        logger.info(
            "Audio converted to MP3",
            input_format=input_format,
            input_size=len(audio_bytes),
            output_size=output_buffer.getbuffer().nbytes,
        )
        return output_buffer.read()

    except ImportError:
        logger.warning("pydub not installed, cannot convert audio format")
        return None
    except Exception as exc:
        logger.warning("Audio conversion failed", error=str(exc))
        return None


@router.get("/commands-config")
async def get_commands_config():
    """
    Get the recommended commands configuration for WhatsApp Business Manager.

    These commands need to be set up manually in WhatsApp Business Manager:
    1. Go to business.facebook.com
    2. Navigate to WhatsApp Manager > Account Tools > Phone Numbers
    3. Click Settings (gear icon) next to your phone number
    4. Find "Conversational Components" under Automations
    5. Add the commands listed below

    Commands appear when users type "/" in the chat.
    """
    commands = [
        {"command": "report", "hint": "Start a new safety report"},
        {"command": "nearmiss", "hint": "Report a near miss incident"},
        {"command": "incident", "hint": "Report a safety incident"},
        {"command": "inspection", "hint": "Log an inspection report"},
        {"command": "handover", "hint": "Create shift handover report"},
        {"command": "toolbox", "hint": "Log a toolbox talk"},
        {"command": "spill", "hint": "Report a spill incident"},
        {"command": "help", "hint": "Get help and available commands"},
        {"command": "status", "hint": "Check your report status"},
        {"command": "cancel", "hint": "Cancel current report"},
    ]

    ice_breakers = [
        "Report a near miss",
        "Report an incident",
        "Check report status",
        "Help",
    ]

    return {
        "setup_instructions": {
            "step_1": "Go to business.facebook.com",
            "step_2": "Navigate to: WhatsApp Manager > Account Tools > Phone Numbers",
            "step_3": "Click the Settings (gear icon) next to your phone number",
            "step_4": "Find 'Conversational Components' under Automations",
            "step_5": "Toggle ON 'Welcome Messages'",
            "step_6": "Add Ice Breakers (up to 4, max 80 chars each)",
            "step_7": "Add Commands (up to 30, command max 32 chars, hint max 256 chars)",
        },
        "welcome_message": "Welcome to XAPPY Safety! I help you report safety incidents quickly. Type / to see available commands, or just describe what happened.",
        "ice_breakers": ice_breakers,
        "commands": commands,
        "note": "Commands must be configured in WhatsApp Business Manager UI. API access is not yet available from Meta."
    }


async def fetch_whatsapp_media(media_id: str) -> Optional[bytes]:
    if not settings.WHATSAPP_ACCESS_TOKEN:
        return None
    url = f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{media_id}"
    headers = {"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"}
    import httpx
    async with httpx.AsyncClient(timeout=10) as client:
        meta = await client.get(url, headers=headers)
        if meta.status_code >= 400:
            logger.warning("WhatsApp media metadata failed", status=meta.status_code, body=meta.text)
            return None
        data = meta.json()
        media_url = data.get("url")
        if not media_url:
            return None
        resp = await client.get(media_url, headers=headers)
        if resp.status_code >= 400:
            logger.warning("WhatsApp media download failed", status=resp.status_code, body=resp.text)
            return None
        return resp.content
