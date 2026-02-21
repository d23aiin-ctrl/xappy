"""
XAPPY Questionnaire Model

Qualification questionnaires for tenant screening.
"""

import enum
import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import (
    String, Boolean, DateTime, Enum, Index, ForeignKey, Text, Integer
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.session import Base

if TYPE_CHECKING:
    from .user import User
    from .property import Property
    from .tenant import Tenant


class QuestionType(str, enum.Enum):
    """Types of questions"""
    TEXT = "text"                       # Free text answer
    NUMBER = "number"                   # Numeric answer
    BOOLEAN = "boolean"                 # Yes/No
    SINGLE_CHOICE = "single_choice"     # Radio buttons
    MULTIPLE_CHOICE = "multiple_choice" # Checkboxes
    DATE = "date"                       # Date picker
    FILE = "file"                       # File upload


class QuestionnaireStatus(str, enum.Enum):
    """Questionnaire status"""
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class ResponseStatus(str, enum.Enum):
    """Qualification response status"""
    PENDING = "pending"           # Not yet submitted
    SUBMITTED = "submitted"       # Submitted, awaiting review
    UNDER_REVIEW = "under_review" # Being reviewed
    APPROVED = "approved"         # Passed qualification
    REJECTED = "rejected"         # Failed qualification
    WITHDRAWN = "withdrawn"       # Tenant withdrew


class Questionnaire(Base):
    """
    Questionnaire template model.

    Questionnaires are used for tenant qualification and can be
    customized per property or used as defaults.
    """
    __tablename__ = "questionnaires"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Identification
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Questionnaire name"
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Scope
    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Use as default for all properties"
    )
    property_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="Specific property this questionnaire is for"
    )

    # Ownership
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Status
    status: Mapped[QuestionnaireStatus] = mapped_column(
        Enum(QuestionnaireStatus),
        default=QuestionnaireStatus.DRAFT,
        nullable=False,
        index=True
    )

    # Scoring
    pass_threshold: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Minimum score to pass (if using scoring)"
    )
    use_scoring: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Whether to use automated scoring"
    )

    # Version control
    version: Mapped[int] = mapped_column(Integer, default=1)

    # Metadata
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Timestamps
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

    # Relationships
    rental_property: Mapped[Optional["Property"]] = relationship(
        "Property",
        backref="questionnaires"
    )
    created_by: Mapped[Optional["User"]] = relationship(
        "User",
        backref="created_questionnaires"
    )
    questions: Mapped[List["QuestionnaireQuestion"]] = relationship(
        "QuestionnaireQuestion",
        back_populates="questionnaire",
        cascade="all, delete-orphan",
        order_by="QuestionnaireQuestion.order"
    )
    responses: Mapped[List["QualificationResponse"]] = relationship(
        "QualificationResponse",
        back_populates="questionnaire",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_questionnaires_property_status", "property_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Questionnaire {self.name} v{self.version}>"


class QuestionnaireQuestion(Base):
    """
    Individual question within a questionnaire.
    """
    __tablename__ = "questionnaire_questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    questionnaire_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questionnaires.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Question content
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    help_text: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Help text shown below question"
    )

    # Question type
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType),
        nullable=False
    )

    # Options for choice questions
    options: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Array of {value, label, score} for choice questions"
    )

    # Validation
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)
    min_value: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Minimum value for number questions"
    )
    max_value: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum value for number questions"
    )
    min_length: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Minimum length for text answers"
    )
    max_length: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum length for text answers"
    )
    regex_pattern: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Regex pattern for validation"
    )

    # Scoring
    score_weight: Mapped[int] = mapped_column(
        Integer,
        default=1,
        comment="Weight for scoring (higher = more important)"
    )
    auto_fail_value: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Answer value that auto-fails qualification"
    )

    # Conditional logic
    depends_on_question_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questionnaire_questions.id", ondelete="SET NULL"),
        nullable=True
    )
    depends_on_value: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Show only if parent question has this value"
    )

    # Ordering
    order: Mapped[int] = mapped_column(Integer, default=0)
    section: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Section grouping"
    )

    # Timestamps
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

    # Relationships
    questionnaire: Mapped["Questionnaire"] = relationship(
        "Questionnaire",
        back_populates="questions"
    )
    depends_on: Mapped[Optional["QuestionnaireQuestion"]] = relationship(
        "QuestionnaireQuestion",
        remote_side="QuestionnaireQuestion.id",
        backref="dependent_questions"
    )

    __table_args__ = (
        Index("ix_questions_questionnaire_order", "questionnaire_id", "order"),
    )

    def __repr__(self) -> str:
        return f"<Question {self.order}: {self.question_text[:50]}...>"


class QualificationResponse(Base):
    """
    Tenant's response to a qualification questionnaire.
    """
    __tablename__ = "qualification_responses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Links
    questionnaire_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questionnaires.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    property_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Property being applied for"
    )

    # Status
    status: Mapped[ResponseStatus] = mapped_column(
        Enum(ResponseStatus),
        default=ResponseStatus.PENDING,
        nullable=False,
        index=True
    )

    # Answers stored as JSONB
    answers: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Map of question_id -> answer_value"
    )

    # Scoring results
    total_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_possible_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    passed_threshold: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    auto_failed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Auto-failed due to a fail trigger answer"
    )
    auto_fail_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Review
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    review_notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Notes from manual review"
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason for rejection (if applicable)"
    )

    # Manual override
    manually_overridden: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Result was manually overridden"
    )
    override_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(
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

    # Relationships
    questionnaire: Mapped["Questionnaire"] = relationship(
        "Questionnaire",
        back_populates="responses"
    )
    tenant: Mapped["Tenant"] = relationship(
        "Tenant",
        back_populates="qualification_responses"
    )
    rental_property: Mapped[Optional["Property"]] = relationship(
        "Property",
        backref="qualification_responses"
    )
    reviewed_by: Mapped[Optional["User"]] = relationship(
        "User",
        backref="reviewed_qualifications"
    )

    __table_args__ = (
        Index("ix_responses_tenant_property", "tenant_id", "property_id"),
        Index("ix_responses_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<QualificationResponse {self.tenant_id}: {self.status.value}>"

    @property
    def score_percentage(self) -> Optional[float]:
        """Calculate score as percentage"""
        if self.total_score is not None and self.max_possible_score:
            return (self.total_score / self.max_possible_score) * 100
        return None
