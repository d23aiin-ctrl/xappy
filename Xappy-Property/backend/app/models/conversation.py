"""
XAPPY AI Conversation and Message Models

Chat/conversation tracking for WhatsApp, SMS, and web chat.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import String, DateTime, Enum, ForeignKey, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .user import User
    from .report import Report


class ConversationStatus(str, enum.Enum):
    """Conversation status"""
    ACTIVE = "active"
    WAITING_INPUT = "waiting_input"
    COMPLETED = "completed"
    EXPIRED = "expired"
    ESCALATED = "escalated"


class ConversationContext(str, enum.Enum):
    """Current context/flow in the conversation"""
    GREETING = "greeting"
    MAIN_MENU = "main_menu"
    CONSTRUCTION_PROGRESS = "construction_progress"
    DEFECT_SNAG = "defect_snag"
    SAFETY_INCIDENT = "safety_incident"
    SITE_INSPECTION = "site_inspection"
    DAILY_LOG_FILING = "daily_log_filing"
    SHIFT_HANDOVER = "shift_handover"
    TOOLBOX_TALK = "toolbox_talk"
    STATUS_CHECK = "status_check"
    HELP = "help"
    OTHER = "other"


class MessageType(str, enum.Enum):
    """Types of messages"""
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    DOCUMENT = "document"
    LOCATION = "location"
    CONTACT = "contact"
    STICKER = "sticker"
    INTERACTIVE = "interactive"
    BUTTON = "button"
    SYSTEM = "system"


class MessageDirection(str, enum.Enum):
    """Message direction"""
    INBOUND = "inbound"    # From user to system
    OUTBOUND = "outbound"  # From system to user


class MessageStatus(str, enum.Enum):
    """Message delivery status"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class Conversation(Base):
    """
    Conversation model for chat sessions.
    """
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # User
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Platform
    platform: Mapped[str] = mapped_column(
        String(50),
        default="whatsapp",
        comment="Platform: whatsapp, sms, web"
    )
    phone_number: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        index=True
    )

    # Status and context
    status: Mapped[ConversationStatus] = mapped_column(
        Enum(ConversationStatus),
        default=ConversationStatus.ACTIVE,
        nullable=False
    )
    current_context: Mapped[ConversationContext] = mapped_column(
        Enum(ConversationContext),
        default=ConversationContext.GREETING,
        nullable=False
    )

    # State data for multi-step flows
    context_data: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="State data for current context (e.g., report draft)"
    )

    # AI context
    ai_context_summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="AI-generated summary of conversation for context"
    )

    # Turn count
    turn_count: Mapped[int] = mapped_column(default=0)

    # Language
    detected_language: Mapped[str] = mapped_column(
        String(10),
        default="en"
    )

    # Timestamps
    last_message_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When conversation expires (24hr for WhatsApp)"
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="conversations")
    messages: Mapped[List["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at"
    )
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="conversation")

    __table_args__ = (
        Index("ix_conversations_user_status", "user_id", "status"),
        Index("ix_conversations_last_message", "last_message_at"),
    )

    def __repr__(self) -> str:
        return f"<Conversation {self.id} ({self.platform})>"


class Message(Base):
    """
    Message model for individual messages in a conversation.
    """
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Conversation
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Direction and type
    direction: Mapped[MessageDirection] = mapped_column(
        Enum(MessageDirection),
        nullable=False
    )
    message_type: Mapped[MessageType] = mapped_column(
        Enum(MessageType),
        default=MessageType.TEXT,
        nullable=False
    )

    # Content
    content: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Text content or caption"
    )
    content_translated: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Translated content (if applicable)"
    )

    # Media
    media_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )
    media_mime_type: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    media_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="External media ID (WhatsApp media ID)"
    )

    # Location (for location messages)
    location_lat: Mapped[Optional[float]] = mapped_column(nullable=True)
    location_lng: Mapped[Optional[float]] = mapped_column(nullable=True)
    location_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Status
    status: Mapped[MessageStatus] = mapped_column(
        Enum(MessageStatus),
        default=MessageStatus.SENT,
        nullable=False
    )

    # External references
    external_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="External message ID (WhatsApp message ID)"
    )

    # AI processing
    intent_detected: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    entities_extracted: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Extracted entities {type: value}"
    )

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    delivered_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    read_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")

    def __repr__(self) -> str:
        return f"<Message {self.direction.value} ({self.message_type.value})>"
