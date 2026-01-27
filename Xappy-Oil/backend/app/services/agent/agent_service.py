"""
AI Agent Service

This service encapsulates the logic for interacting with Large Language Models,
specifically OpenAI's models in this case. It provides a simple interface
for other parts of the application to get AI-generated responses.
"""

import structlog
from openai import AsyncOpenAI, OpenAIError

from app.core.config import settings

logger = structlog.get_logger(__name__)

# Initialize the async OpenAI client
# It will automatically pick up the OPENAI_API_KEY from the environment
try:
    aclient = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
except Exception as e:
    # This will log an error if the API key is not set, but won't crash the app on import
    logger.error("Failed to initialize OpenAI client", error=str(e))
    aclient = None


async def get_ai_response(message: str) -> str:
    """
    Gets a response from the configured OpenAI model.

    Args:
        message: The user's input message.

    Returns:
        The AI's response as a string.
    """
    if not aclient:
        logger.error("OpenAI client not initialized. Check OPENAI_API_KEY.")
        return "Error: The AI service is not configured."

    logger.info("Getting AI response for message", message_length=len(message))

    try:
        # Create a chat completion request
        chat_completion = await aclient.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant for an industrial safety platform.",
                },
                {
                    "role": "user",
                    "content": message,
                },
            ],
            model=settings.OPENAI_MODEL,
        )

        # Extract the response content
        response_content = chat_completion.choices[0].message.content
        logger.info("Successfully received AI response")
        return response_content or "No response content received."

    except OpenAIError as e:
        logger.error("OpenAI API error", error=str(e))
        return f"Error from AI service: {e}"
    except Exception as e:
        logger.error("An unexpected error occurred while getting AI response", error=str(e))
        return "An unexpected error occurred while contacting the AI service."
