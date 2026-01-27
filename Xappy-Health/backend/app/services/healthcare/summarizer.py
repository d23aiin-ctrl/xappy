from typing import Any, Dict, Tuple, Optional

from openai import AsyncOpenAI

from app.core.config import settings

SYSTEM_PROMPT = (
    "You are a warm, empathetic healthcare companion named Xappy. You speak like a caring friend, not a robot. "
    "Your personality: Kind, patient, genuinely helpful, and conversational. "
    "IMPORTANT RULES: "
    "1. NEVER use bullet points or lists for conversational responses. Write in flowing, natural sentences. "
    "2. Use simple, everyday language - avoid medical jargon unless explaining something specific. "
    "3. Show empathy first, then provide information. Acknowledge feelings before giving advice. "
    "4. Keep responses concise but warm (2-4 sentences for casual chat, more for health queries). "
    "5. Use the provided JSON context for specific data, but wrap it in human-friendly language. "
    "6. NEVER diagnose or prescribe - gently suggest seeing a healthcare provider when appropriate. "
    "7. End responses naturally - sometimes with a question, sometimes with encouragement. "
    "8. For directory results, mention the key details conversationally, not as a data dump."
)

HUMAN_CHAT_PROMPT = (
    "You are Xappy, a warm and caring healthcare assistant. You chat like a supportive friend who happens "
    "to know a lot about health. Your responses should feel like texting with a knowledgeable friend, not "
    "talking to a bot. "
    "Key traits: "
    "- Empathetic and understanding "
    "- Uses casual, friendly language (contractions like 'I'm', 'you're', 'don't') "
    "- Acknowledges emotions before giving information "
    "- Asks follow-up questions to understand better "
    "- Never lists things with bullet points in conversation "
    "- Keeps responses brief and natural (1-3 sentences for chat, more for health questions) "
    "- Uses phrases like 'I hear you', 'That makes sense', 'I understand' "
    "- Gently redirects to healthcare topics when appropriate "
    "NEVER: Use bullet points, sound robotic, give medical diagnoses, or be cold/clinical."
)

LANGUAGE_LABELS = {
    "en": "English",
    "ta": "Tamil",
    "si": "Sinhala",
}

DISCLAIMER_TRANSLATIONS = {
    "ta": "தகவல் மட்டுமே. மருத்துவ ஆலோசனை, நோய்க் கணிப்பு, அல்லது மருந்துகள் அல்ல.",
    "si": "තොරතුරු පමණි. වෛද්‍ය උපදෙස්, රෝග නිර்ணය, හෝ ඖෂධ නියම කිරීම නොවේ.",
}

FALLBACK_TRANSLATIONS = {
    "ta": {
        "Hi! How can I help you today?": "வணக்கம்! இன்று எவ்வாறு உதவலாம்?",
        "- Find a hospital or doctor nearby": "- அருகிலுள்ள மருத்துவமனை அல்லது மருத்துவரை கண்டறிய",
        "- Check symptoms for basic guidance": "- அறிகுறிகளை அடிப்படை வழிகாட்டலுக்காக பார்க்க",
        "- Vaccination and health programs": "- தடுப்பூசி மற்றும் சுகாதார திட்டங்கள்",
        "- Lab report understanding": "- ஆய்வு அறிக்கை விளக்கம்",
        "- Health tips and prevention": "- ஆரோக்கிய குறிப்புகள் மற்றும் தடுப்பு",
        "- Pregnancy and childcare guidance": "- கர்ப்பம் மற்றும் குழந்தை பராமரிப்பு வழிகாட்டல்",
        "- Health alerts and advisories": "- சுகாதார எச்சரிக்கைகள் மற்றும் அறிவுறுத்தல்கள்",
        "- Emergency contacts and urgent care guidance": "- அவசர தொடர்புகள் மற்றும் அவசர உதவி வழிகாட்டல்",
        "- Feedback or complaint": "- பின்னூட்டம் அல்லது புகார்",
        "General guidance (not from the local directory):": "பொது வழிகாட்டல் (உள்ளூர் தரவகத்திலிருந்து அல்ல):",
        "- Stay hydrated, rest, and monitor symptoms.": "- உடல் நீர்வாரா, ஓய்வு எடுத்து, அறிகுறிகளை கவனிக்கவும்.",
        "- Seek urgent care for severe pain, breathing trouble, confusion, or heavy bleeding.": "- கடுமையான வலி, மூச்சுத்திணறல், குழப்பம், அல்லது அதிக ரத்தக்கசிவு இருந்தால் உடனடி மருத்துவ உதவி பெறுங்கள்.",
        "- For specific services, ask about hospitals, doctors, vaccinations, or lab reports.": "- குறிப்பிட்ட சேவைகளுக்கு மருத்துவமனைகள், மருத்துவர்கள், தடுப்பூசிகள், அல்லது ஆய்வு அறிக்கைகள் பற்றி கேளுங்கள்.",
        "Choose a service: hospital/doctor, symptoms, vaccination, lab reports, or complaints.": "ஒரு சேவையை தேர்வு செய்யுங்கள்: மருத்துவமனை/மருத்துவர், அறிகுறிகள், தடுப்பூசி, ஆய்வு அறிக்கைகள், அல்லது புகார்கள்.",
        "Which district or specialty should I search? (e.g., Colombo, Kandy, Cardiology)": "எந்த மாவட்டம் அல்லது சிறப்புத் துறையை தேட வேண்டும்? (உதா: Colombo, Kandy, Cardiology)",
        "Which district or campaign should I check? (e.g., Kandy polio, Colombo dengue)": "எந்த மாவட்டம் அல்லது பிரச்சாரத்தை பார்க்க வேண்டும்? (உதா: Kandy polio, Colombo dengue)",
        "Which lab test should I explain? (e.g., fasting blood sugar, HbA1c)": "எந்த ஆய்வு சோதனையை விளக்க வேண்டும்? (உதா: fasting blood sugar, HbA1c)",
        "Which topic would you like tips for? (diabetes, blood pressure, diet, exercise)": "எந்த தலைப்புக்கு குறிப்புகள் வேண்டும்? (diabetes, blood pressure, diet, exercise)",
        "Do you need antenatal care info or child development milestones?": "கர்ப்ப பராமரிப்பு தகவல்களா அல்லது குழந்தை வளர்ச்சி மைல்கற்களா வேண்டும்?",
        "Which district should I check alerts for?": "எந்த மாவட்டத்திற்கு எச்சரிக்கைகள் பார்க்க வேண்டும்?",
        "Please share your district for the nearest ambulance contacts.": "அருகிலுள்ள ஆம்புலன்ஸ் தொடர்புகளுக்கு உங்கள் மாவட்டத்தை பகிரவும்.",
        "What would you like help with: hospitals, doctors, symptoms, vaccinations, lab reports, or complaints?": "எதில் உதவி வேண்டும்: மருத்துவமனைகள், மருத்துவர்கள், அறிகுறிகள், தடுப்பூசிகள், ஆய்வு அறிக்கைகள், அல்லது புகார்கள்?",
        "I can help with hospitals, doctors, symptoms, vaccinations, lab reports, alerts, pregnancy/childcare, and complaints. What would you like to do?": "மருத்துவமனைகள், மருத்துவர்கள், அறிகுறிகள், தடுப்பூசிகள், ஆய்வு அறிக்கைகள், எச்சரிக்கைகள், கர்ப்பம்/குழந்தை பராமரிப்பு, மற்றும் புகார்கள் பற்றி உதவ முடியும். எதை செய்ய விரும்புகிறீர்கள்?",
    },
    "si": {
        "Hi! How can I help you today?": "හෙලෝ! අද ඔබට කොහෙද උදව් කරන්නද?",
        "- Find a hospital or doctor nearby": "- අසල රෝහලක් හෝ වෛද්‍යවරයෙක් සොයන්න",
        "- Check symptoms for basic guidance": "- මූලික මඟපෙන්වීම සඳහා රෝග ලක්ෂණ පරීක්ෂා කරන්න",
        "- Vaccination and health programs": "- එන්නත්කරණය හා සෞඛ්‍ය වැඩසටහන්",
        "- Lab report understanding": "- පරීක්ෂණ වාර්තා අවබෝධය",
        "- Health tips and prevention": "- සෞඛ්‍ය උපදෙස් හා වැළැක්වීම",
        "- Pregnancy and childcare guidance": "- ගැබ්ධාරණ හා ළමා සත්කාර මඟපෙන්වීම",
        "- Health alerts and advisories": "- සෞඛ්‍ය අවධානම් හා උපදේශන",
        "- Emergency contacts and urgent care guidance": "- හදිසි සම්බන්ධතා හා හදිසි සත්කාර මඟපෙන්වීම",
        "- Feedback or complaint": "- ප්‍රතිචාරය හෝ පැමිණිල්ල",
        "General guidance (not from the local directory):": "පොදු මඟපෙන්වීම (දේශීය දත්ත සංග්‍රහයෙන් නොවේ):",
        "- Stay hydrated, rest, and monitor symptoms.": "- ජලය ප්‍රමාණවත් ලෙස පානය කරමින් විවේක ගන්න සහ රෝග ලක්ෂණ නිරීක්ෂණය කරන්න.",
        "- Seek urgent care for severe pain, breathing trouble, confusion, or heavy bleeding.": "- දැඩි වේදනාව, හුස්ම ගැනීමට අපහසුතාව, අවුල්වීම, හෝ වැඩි රුධිර වහනයක් ඇත්නම් හදිසි සත්කාර ලබා ගන්න.",
        "- For specific services, ask about hospitals, doctors, vaccinations, or lab reports.": "- විශේෂ සේවා සඳහා රෝහල්, වෛද්‍යවරු, එන්නත්කරණය, හෝ පරීක්ෂණ වාර්තා ගැන විමසන්න.",
        "Choose a service: hospital/doctor, symptoms, vaccination, lab reports, or complaints.": "සේවාවක් තෝරන්න: රෝහල/වෛද්‍යවරයා, රෝග ලක්ෂණ, එන්නත්කරණය, පරීක්ෂණ වාර්තා, හෝ පැමිණිලි.",
        "Which district or specialty should I search? (e.g., Colombo, Kandy, Cardiology)": "ඔබට සොයන්න ඕන දිස්ත්‍රික්කය හෝ විශේෂත්වය කුමක්ද? (උදා: Colombo, Kandy, Cardiology)",
        "Which district or campaign should I check? (e.g., Kandy polio, Colombo dengue)": "ඔබට බලන්න ඕන දිස්ත්‍රික්කය හෝ ව්‍යාපාරය කුමක්ද? (උදා: Kandy polio, Colombo dengue)",
        "Which lab test should I explain? (e.g., fasting blood sugar, HbA1c)": "මොන පරීක්ෂණය 설명 කරන්නද? (උදා: fasting blood sugar, HbA1c)",
        "Which topic would you like tips for? (diabetes, blood pressure, diet, exercise)": "උපදෙස් අවශ්‍ය විෂය කුමක්ද? (diabetes, blood pressure, diet, exercise)",
        "Do you need antenatal care info or child development milestones?": "ඔබට ගර්භ සත්කාර තොරතුරුද නැද්ද ළමා වර්ධන මැයිල්ස්ටෝන් ද අවශ්‍යද?",
        "Which district should I check alerts for?": "ඇඟවීම් බලන්න ඕන දිස්ත්‍රික්කය කුමක්ද?",
        "Please share your district for the nearest ambulance contacts.": "අසන්නාම ගිලන් රථ සම්බන්ධතා සඳහා ඔබගේ දිස්ත්‍රික්කය සඳහන් කරන්න.",
        "What would you like help with: hospitals, doctors, symptoms, vaccinations, lab reports, or complaints?": "ඔබට උදව් අවශ්‍ය දේ කුමක්ද: රෝහල්, වෛද්‍යවරු, රෝග ලක්ෂණ, එන්නත්කරණය, පරීක්ෂණ වාර්තා, හෝ පැමිණිලි?",
        "I can help with hospitals, doctors, symptoms, vaccinations, lab reports, alerts, pregnancy/childcare, and complaints. What would you like to do?": "රෝහල්, වෛද්‍යවරු, රෝග ලක්ෂණ, එන්නත්කරණය, පරීක්ෂණ වාර්තා, අවධානම්, ගැබ්ධාරණ/ළමා සත්කාර සහ පැමිණිලි සමඟ උදව් කළ හැක. ඔබට කිරීමට අවශ්‍ය කුමක්ද?",
    },
}

OUT_OF_SCOPE_TERMS = [
    "hotel",
    "restaurant",
    "flight",
    "bus",
    "train",
    "booking",
    "movie",
    "concert",
    "shopping",
    "weather",
]

# Health-related terms that should trigger AI responses even without database matches
HEALTH_QUERY_TERMS = [
    # Conditions & symptoms
    "sugar", "diabetes", "diabetic", "blood sugar", "glucose",
    "pressure", "bp", "blood pressure", "hypertension", "hypotension",
    "headache", "migraine", "head pain", "head ache",
    "fever", "temperature", "cold", "flu", "cough", "sore throat",
    "stomach", "stomach ache", "stomachache", "digestion", "acidity", "gas",
    "pain", "ache", "hurt", "hurting", "sore",
    "tired", "fatigue", "weakness", "weak", "exhausted",
    "dizzy", "dizziness", "vertigo", "nausea", "vomiting",
    "allergy", "allergic", "rash", "itching", "itchy", "skin",
    "breathing", "breathless", "asthma", "wheezing",
    "chest pain", "heart", "palpitation", "heartbeat",
    "anxiety", "stress", "depression", "mental", "sleep", "insomnia",
    "weight", "obesity", "overweight", "underweight", "diet",
    "cholesterol", "thyroid", "anemia", "vitamin",
    "back pain", "joint", "arthritis", "knee", "shoulder",
    "eye", "vision", "ear", "hearing",
    "pregnant", "pregnancy", "period", "menstrual", "menstruation",
    "infection", "infected", "virus", "bacterial",
    # General feeling unwell
    "not feeling well", "feeling well", "not well", "unwell", "feel unwell",
    "feeling sick", "feel sick", "am sick", "i'm sick", "im sick",
    "feeling bad", "feel bad", "not good", "feeling unwell",
    "under the weather", "not okay", "not ok",
    # Actions and questions
    "what to do", "what should i do", "what can i do",
    "how to", "how do i", "how can i",
    "help me", "i have", "i feel", "i am feeling", "im feeling",
    "suffering", "problem", "issue", "concern",
    "treatment", "remedy", "cure", "medicine", "medication",
    "prevent", "prevention", "avoid", "manage", "control",
    "exercise", "workout", "fitness", "yoga",
    "eat", "eating", "food", "nutrition", "healthy",
    # Services and healthcare topics
    "alert", "alerts", "health alert", "health alerts",
    "emergency", "ambulance", "urgent", "urgent care",
    "hospital", "hospitals", "doctor", "doctors", "clinic",
    "vaccination", "vaccine", "vaccinations", "immunization",
    "lab report", "lab test", "blood test", "test results",
    "symptom", "symptoms", "check symptoms",
    "tips", "health tips", "advice", "guidance",
    "childcare", "child care", "baby", "infant", "newborn",
    # Location-based queries
    "nearby", "near me", "my area", "around me", "closest", "nearest",
    "find", "search", "show", "list", "get", "where",
]

SMALL_TALK_TERMS = [
    # How are you variations
    "how are you",
    "how r you",
    "how are u",
    "how r u",
    "how're you",
    "how you doing",
    "how u doing",
    "how are you doing",
    "how are u doing",
    "how are you feeling",
    "how are u feeling",
    "how r u feeling",
    "hows it going",
    "how's it going",
    "howdy",
    # Who are you
    "who are you",
    "who r u",
    "who are u",
    "what's your name",
    "whats your name",
    "your name",
    # What can you do
    "what can you do",
    "what can u do",
    "what do you do",
    "what do u do",
    "help",
    "help me",
    # Thanks
    "thank you",
    "thanks",
    "thank u",
    "thankyou",
    "thx",
    "ty",
    "appreciate it",
    # Greetings with time
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "gm",
    "gn",
    # Casual
    "what's up",
    "whats up",
    "wassup",
    "sup",
    "hey there",
    "hi there",
    "hello there",
    "yo",
    # Feelings
    "i'm good",
    "im good",
    "i am good",
    "i'm fine",
    "im fine",
    "i am fine",
    "doing good",
    "doing well",
    "not bad",
    "pretty good",
    # Casual chat
    "nice to meet you",
    "nice meeting you",
    "pleasure",
    "bye",
    "goodbye",
    "see you",
    "see ya",
    "later",
    "take care",
    "ok",
    "okay",
    "alright",
    "cool",
    "great",
    "awesome",
]

GREETING_TERMS = [
    "hi",
    "hello",
    "hey",
    "hola",
    "namaste",
    "good morning",
    "good afternoon",
    "good evening",
]


def get_match_count(context: Dict[str, Any]) -> int:
    context_type = context.get("type", "general")
    filters = context.get("filters") or {}
    filter_districts = filters.get("districts") or []
    filter_specialties = filters.get("specialties") or []

    if context_type == "directory":
        facilities = context.get("facilities", [])
        doctors = context.get("doctors", [])
        if filter_districts:
            facilities = [f for f in facilities if f.get("district") in filter_districts]
            doctors = [d for d in doctors if d.get("district") in filter_districts]
        if filter_specialties:
            doctors = [d for d in doctors if d.get("specialty") in filter_specialties]
        return len(facilities) + len(doctors)

    if context_type == "vaccination":
        campaigns = context.get("campaigns", [])
        if filter_districts:
            campaigns = [c for c in campaigns if c.get("district") in filter_districts]
        return len(campaigns)

    if context_type == "lab_explain":
        return len(context.get("ranges", []))

    if context_type == "health_tips":
        return len(context.get("tips", []))

    if context_type == "symptom_guidance":
        return 1

    if context_type == "pregnancy_childcare":
        return len(context.get("topics", []))

    if context_type == "alerts":
        alerts = context.get("alerts", [])
        if filter_districts:
            alerts = [a for a in alerts if a.get("district") in filter_districts]
        return len(alerts)

    if context_type == "emergency":
        ambulances = context.get("ambulances", [])
        if filter_districts:
            ambulances = [a for a in ambulances if a.get("coverage") in filter_districts or a.get("coverage") == "Nationwide"]
        return len(ambulances) + len(context.get("emergency", {}).get("numbers", []))

    return 0


def is_out_of_scope(query: str) -> bool:
    text = query.lower()
    return any(term in text for term in OUT_OF_SCOPE_TERMS)


def is_small_talk(query: str) -> bool:
    text = query.lower().strip()
    return any(term in text for term in SMALL_TALK_TERMS)


def is_greeting(query: str) -> bool:
    text = query.lower().strip()
    # Check if it's primarily a greeting (short message with greeting term)
    words = text.split()
    if len(words) <= 3:
        return any(term in text for term in GREETING_TERMS)
    return False


def is_health_query(query: str) -> bool:
    """Check if the query is a general health question that should get an AI response."""
    text = query.lower().strip()
    return any(term in text for term in HEALTH_QUERY_TERMS)


async def _conversational_response(
    query: str,
    language: str,
    disclaimer: Optional[str],
) -> Tuple[str, bool]:
    """Generate a natural, human-like conversational response using AI."""

    # Fallback for no API key - still try to be friendly
    if not settings.OPENAI_API_KEY:
        fallback_text = (
            "Hey there! I'm Xappy, your healthcare companion. I'm here to help you with "
            "finding doctors, understanding symptoms, health tips, and more. What's on your mind?"
        )
        if disclaimer:
            fallback_text = f"{fallback_text}\n\n{disclaimer}"
        return fallback_text, False

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    language_label = LANGUAGE_LABELS.get(language, "English")

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": HUMAN_CHAT_PROMPT,
            },
            {
                "role": "user",
                "content": f"Respond in {language_label}. The user says: \"{query}\"",
            },
        ],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    text = content.strip() if content else "Hello! How can I help you with your healthcare questions today?"

    if language != "en":
        text = await _translate_response(text, language)

    localized_disclaimer = _localize_disclaimer(disclaimer, language)
    if localized_disclaimer and localized_disclaimer not in text:
        text = f"{text}\n\n{localized_disclaimer}"

    return text, True


async def _redirect_response(
    query: str,
    language: str,
    disclaimer: Optional[str],
) -> Tuple[str, bool]:
    """Politely redirect out-of-scope queries back to healthcare topics."""

    if not settings.OPENAI_API_KEY:
        text = (
            "I appreciate you reaching out! I'm Xappy, your healthcare assistant. "
            "While I can't help with that specific topic, I'm here for all your health-related questions - "
            "finding doctors, understanding symptoms, health tips, vaccinations, and more. "
            "What health topic can I help you with?"
        )
        if disclaimer:
            text = f"{text}\n\n{disclaimer}"
        return text, False

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    language_label = LANGUAGE_LABELS.get(language, "English")

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Xappy, a warm healthcare assistant. The user asked about something outside your expertise "
                    "(non-health related). Politely and warmly acknowledge their question, explain you specialize in "
                    "healthcare topics, and gently redirect them. Be friendly, not dismissive. Suggest what health "
                    "topics you CAN help with. Keep it brief (2-3 sentences). Sound like a caring friend, not a robot."
                ),
            },
            {
                "role": "user",
                "content": f"Respond in {language_label}. User asked: \"{query}\"",
            },
        ],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    text = content.strip() if content else "I'm here to help with health questions! What's on your mind?"

    if language != "en":
        text = await _translate_response(text, language)

    localized_disclaimer = _localize_disclaimer(disclaimer, language)
    if localized_disclaimer and localized_disclaimer not in text:
        text = f"{text}\n\n{localized_disclaimer}"

    return text, True


def _health_tip_filters(query: str) -> list[str]:
    text = query.lower()
    filters = []
    if any(term in text for term in ["blood pressure", "bp", "pressure"]):
        filters.append("blood pressure")
    if "diabetes" in text or "sugar" in text:
        filters.append("diabetes")
    if any(term in text for term in ["diet", "nutrition"]):
        filters.append("diet")
    if any(term in text for term in ["exercise", "fitness", "walking"]):
        filters.append("exercise")
    if any(term in text for term in ["mental", "stress", "anxiety", "depression"]):
        filters.append("mental health")
    return filters


def _health_tip_matches(query: str, tips: list[dict[str, Any]]) -> int:
    filters = _health_tip_filters(query)
    if not filters:
        return len(tips)
    return len(
        [
            tip
            for tip in tips
            if any(filt in (tip.get("topic", "").lower()) for filt in filters)
        ]
    )


def _localize_text(text: str, language: str) -> str:
    if language == "en":
        return text
    mapping = FALLBACK_TRANSLATIONS.get(language, {})
    return mapping.get(text, text)


def _localize_disclaimer(disclaimer: Optional[str], language: str) -> Optional[str]:
    if not disclaimer:
        return None
    if language == "en":
        return disclaimer
    translated = DISCLAIMER_TRANSLATIONS.get(language)
    if translated:
        return translated
    return disclaimer


def build_clarification_prompt(context: Dict[str, Any], language: str = "en") -> str:
    context_type = context.get("type", "general")
    if context_type == "directory":
        return _localize_text(
            "Which district or specialty should I search? (e.g., Colombo, Kandy, Cardiology)",
            language,
        )
    if context_type == "vaccination":
        return _localize_text(
            "Which district or campaign should I check? (e.g., Kandy polio, Colombo dengue)",
            language,
        )
    if context_type == "lab_explain":
        return _localize_text(
            "Which lab test should I explain? (e.g., fasting blood sugar, HbA1c)",
            language,
        )
    if context_type == "health_tips":
        return _localize_text(
            "Which topic would you like tips for? (diabetes, blood pressure, diet, exercise)",
            language,
        )
    if context_type == "pregnancy_childcare":
        return _localize_text(
            "Do you need antenatal care info or child development milestones?",
            language,
        )
    if context_type == "alerts":
        return _localize_text(
            "Which district should I check alerts for?",
            language,
        )
    if context_type == "emergency":
        return _localize_text(
            "Please share your district for the nearest ambulance contacts.",
            language,
        )
    return _localize_text(
        "What would you like help with: hospitals, doctors, symptoms, vaccinations, lab reports, or complaints?",
        language,
    )


async def summarize_from_context(
    query: str,
    context: Dict[str, Any],
    allow_generic: bool = False,
    language: str = "en",
) -> Tuple[str, bool]:
    match_count = get_match_count(context)
    if context.get("type") == "health_tips":
        tips = context.get("tips", [])
        if _health_tip_matches(query, tips) == 0:
            return await _generic_llm_response(query, language, context.get("disclaimer"))
    if is_small_talk(query) or is_greeting(query):
        return await _conversational_response(query, language, context.get("disclaimer"))
    if is_out_of_scope(query):
        # Use AI to politely redirect even for out-of-scope queries
        return await _redirect_response(query, language, context.get("disclaimer"))

    # If there's no database match, use AI for health-related queries
    # But if there ARE database results (match_count > 0), let them through to be displayed
    if match_count == 0:
        # For health-related queries with no DB match, use AI to give helpful advice
        if is_health_query(query) or allow_generic:
            return await _generic_llm_response(query, language, context.get("disclaimer"))
        # For non-health queries with no match, ask for clarification
        clarification = build_clarification_prompt(context, language=language)
        disclaimer = _localize_disclaimer(context.get("disclaimer"), language)
        text = "\n".join([clarification, disclaimer]) if disclaimer else clarification
        return text, False

    if not settings.OPENAI_API_KEY:
        return _fallback_summary(query, context, allow_generic=allow_generic, language=language), False

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    language_label = LANGUAGE_LABELS.get(language, "English")

    # Build a human-friendly context summary
    context_type = context.get("type", "general")
    context_summary = f"Context type: {context_type}, Matches: {match_count}"

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"The user asked: \"{query}\"\n\n"
                    f"I found {match_count} relevant results. Here's the data:\n{context}\n\n"
                    "IMPORTANT: Present this information like a helpful friend would - conversationally and warmly. "
                    "Don't just list data mechanically. For doctors/hospitals, mention the most relevant ones naturally. "
                    "For health tips, share them as friendly advice. "
                    "Keep key details (phone numbers, addresses) but present them in a human way. "
                    f"Respond in {language_label}."
                ),
            },
        ],
        temperature=0.5,
    )
    content = response.choices[0].message.content
    text = content.strip() if content else "Information unavailable right now."
    disclaimer = _localize_disclaimer(context.get("disclaimer"), language)
    if disclaimer and disclaimer not in text:
        text = f"{text}\n{disclaimer}"

    if language != "en":
        text = await _translate_response(text, language)
    return text, True


async def _generic_llm_response(
    query: str,
    language: str,
    disclaimer: Optional[str],
) -> Tuple[str, bool]:
    """Generate a human-like response for general health queries."""

    if not settings.OPENAI_API_KEY:
        text = (
            "I hear you! While I don't have specific information about that in my database, "
            "I'd recommend speaking with a healthcare provider for personalized advice. "
            "In the meantime, is there anything else I can help you with - like finding a doctor nearby?"
        )
        if disclaimer:
            text = f"{text}\n\n{disclaimer}"
        return text, False

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    language_label = LANGUAGE_LABELS.get(language, "English")
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Xappy, a warm and caring healthcare companion. Someone is asking about their health. "
                    "Respond like a knowledgeable friend who genuinely cares about their wellbeing. "
                    "IMPORTANT RULES: "
                    "1. Start by showing you understand their concern with empathy "
                    "2. Provide SPECIFIC, ACTIONABLE health guidance based on their question "
                    "3. For conditions like diabetes/sugar: share practical lifestyle tips, diet advice, monitoring suggestions "
                    "4. For symptoms: explain what might help and when to see a doctor "
                    "5. Keep responses conversational but informative (4-6 sentences) "
                    "6. NEVER diagnose or prescribe medications - but DO share helpful general health information "
                    "7. Gently suggest seeing a healthcare provider for personalized advice "
                    "8. Write in flowing, natural sentences - NO bullet points "
                    "9. Use contractions and casual language (I'm, you're, don't) "
                    "10. End with something supportive or offer to help find a doctor nearby "
                    "Remember: Be helpful and informative, not just generic. Give real health tips!"
                ),
            },
            {
                "role": "user",
                "content": f"Respond in {language_label}. The user asks: \"{query}\"",
            },
        ],
        temperature=0.6,
    )
    content = response.choices[0].message.content
    text = content.strip() if content else "I'm here to help! Could you tell me more about what you're experiencing?"
    if language != "en":
        text = await _translate_response(text, language)
    localized_disclaimer = _localize_disclaimer(disclaimer, language)
    if localized_disclaimer and localized_disclaimer not in text:
        text = f"{text}\n\n{localized_disclaimer}"
    return text, True


async def _translate_response(text: str, language: str) -> str:
    if not settings.OPENAI_API_KEY or language == "en":
        return text

    language_label = LANGUAGE_LABELS.get(language, "English")
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "Translate the text. Keep formatting and bullets."},
            {"role": "user", "content": f"Target language: {language_label}\nText:\n{text}"},
        ],
        temperature=0.2,
    )
    content = response.choices[0].message.content
    return content.strip() if content else text


def _fallback_summary(
    query: str,
    context: Dict[str, Any],
    allow_generic: bool = False,
    language: str = "en",
) -> str:
    context_type = context.get("type", "general")
    disclaimer = context.get("disclaimer")
    greeting_terms = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]
    query_text = query.lower()
    greeting_hits = any(
        term in query_text.split() for term in greeting_terms if " " not in term
    ) or any(term in query_text for term in greeting_terms if " " in term)
    if greeting_hits:
        lines = [
            "Hi! How can I help you today?",
            "- Find a hospital or doctor nearby",
            "- Check symptoms for basic guidance",
            "- Vaccination and health programs",
            "- Lab report understanding",
            "- Health tips and prevention",
            "- Pregnancy and childcare guidance",
            "- Health alerts and advisories",
            "- Emergency contacts and urgent care guidance",
            "- Feedback or complaint",
        ]
        if disclaimer:
            lines.append(disclaimer)
        if language != "en":
            return "\n".join(_localize_text(line, language) for line in lines)
        return "\n".join(lines)

    lines = []
    filters = context.get("filters") or {}
    filter_districts = filters.get("districts") or []
    filter_specialties = filters.get("specialties") or []

    if filter_districts:
        lines.append("District: " + ", ".join(filter_districts))
    if filter_specialties:
        lines.append("Specialty: " + ", ".join(filter_specialties))
    if context.get("nearest_district") and not filter_districts:
        lines.append(f"Nearest district: {context.get('nearest_district')}")

    match_count = get_match_count(context)
    if match_count == 0 and not allow_generic:
        clarification = build_clarification_prompt(context, language=language)
        localized_disclaimer = _localize_disclaimer(disclaimer, language)
        text = "\n".join([clarification, localized_disclaimer]) if localized_disclaimer else clarification
        return text

    if context_type == "directory":
        facilities = context.get("facilities", [])
        doctors = context.get("doctors", [])
        if filter_districts:
            facilities = [f for f in facilities if f.get("district") in filter_districts]
            doctors = [d for d in doctors if d.get("district") in filter_districts]
        if filter_specialties:
            doctors = [d for d in doctors if d.get("specialty") in filter_specialties]

        if facilities:
            lines.append("Facilities:")
            for item in facilities[:3]:
                specialties = item.get("specialties") or []
                specialties_text = ", ".join(specialties[:4]) if specialties else "General care"
                emergency = "Emergency: Yes" if item.get("emergency") else "Emergency: No"
                rating = item.get("rating") or "N/A"
                address = item.get("address") or "N/A"
                map_url = item.get("map_url") or "N/A"
                lines.append(
                    f"- {item.get('name')} ({item.get('district')}) | {item.get('type')} | OPD: {item.get('opd_hours')} | {emergency}"
                )
                lines.append(f"  Call: {item.get('phone')} | Rating: {rating} | Map: {map_url}")
                lines.append(f"  Address: {address} | Specialties: {specialties_text}")
        if doctors:
            lines.append("Doctors:")
            for item in doctors[:3]:
                rating = item.get("rating") or "N/A"
                address = item.get("address") or "N/A"
                map_url = item.get("map_url") or "N/A"
                lines.append(
                    f"- {item.get('name')} | {item.get('specialty')} | {item.get('availability')} | {item.get('facility')} | Rating: {rating}"
                )
                lines.append(f"  Call: {item.get('phone')} | Address: {address} | Map: {map_url}")
        if not facilities and not doctors:
            lines.append("No matching facilities or doctors found in the demo data.")
            lines.append("Try a district (Colombo, Gampaha, Kandy, Jaffna, Galle) or a specialty.")
    elif context_type == "vaccination":
        campaigns = context.get("campaigns", [])
        programs = context.get("programs", [])
        if filter_districts:
            campaigns = [c for c in campaigns if c.get("district") in filter_districts]
        if campaigns:
            lines.append("Vaccination campaigns:")
            for item in campaigns[:3]:
                lines.append(
                    f"- {item.get('name')} | {item.get('district')} | {item.get('date')} | {item.get('eligibility')}"
                )
        if programs:
            lines.append("Vaccination programs:")
            for item in programs[:3]:
                lines.append(
                    f"- {item.get('program_name')} | {item.get('type')} | {item.get('target_population')}"
                )
        if not campaigns and not programs:
            lines.append("No matching campaigns found.")
            lines.append("Ask for a district or a campaign name (polio, dengue).")
    elif context_type == "lab_explain":
        ranges = context.get("ranges", [])[:4]
        lines.append("Lab reference ranges:")
        for item in ranges:
            lines.append(f"- {item.get('test')}: {item.get('range')} ({item.get('note')})")
    elif context_type == "symptom_guidance":
        emergency = context.get("emergency", {})
        lines.append("Here is basic symptom guidance:")
        lines.append("- Rest, drink fluids, and monitor symptoms.")
        lines.append("- Seek a clinician if symptoms last more than 2-3 days or worsen.")
        guidance = emergency.get("guidance")
        if guidance:
            lines.append(guidance)
    elif context_type == "health_tips":
        tips = context.get("tips", [])
        topic_filters = _health_tip_filters(query)

        if topic_filters:
            filtered = [
                t for t in tips
                if any(filt in (t.get("topic", "").lower()) for filt in topic_filters)
            ]
        else:
            filtered = tips

        if filtered:
            lines.append("Here are friendly health tips:")
            for item in filtered[:2]:
                lines.append(f"- {item.get('topic')}")
                for tip in item.get("do", [])[:2]:
                    lines.append(f"  - Do: {tip}")
                for avoid in item.get("avoid", [])[:1]:
                    lines.append(f"  - Avoid: {avoid}")
                seek = item.get("seek_care")
                if seek:
                    lines.append(f"  - See a clinician if: {seek}")
            lines.append("Tell me a topic (diabetes, blood pressure, diet, exercise) for more.")
        else:
            lines.append("I can share tips on diabetes, blood pressure, diet, exercise, or wellbeing.")
    elif context_type == "pregnancy_childcare":
        topics = context.get("topics", [])
        if topics:
            lines.append("Here is childcare and pregnancy guidance:")
            for item in topics[:3]:
                lines.append(f"- {item.get('topic')}: {item.get('detail')}")
            lines.append("Tell me if you need antenatal care, baby care, or milestones.")
        else:
            lines.append("I can help with antenatal care, baby care, and development milestones.")
    elif context_type == "complaint":
        lines.append("Complaint categories: " + ", ".join(context.get("categories", [])))
        acknowledgement = context.get("acknowledgement")
        if acknowledgement:
            lines.append(acknowledgement)
    elif context_type == "emergency":
        emergency = context.get("emergency", {})
        ambulances = context.get("ambulances", [])
        ambulance_details = context.get("ambulance_details", {})
        if filter_districts:
            ambulances = [a for a in ambulances if a.get("coverage") in filter_districts or a.get("coverage") == "Nationwide"]
        if not ambulances and context.get("nearest_district"):
            district = context.get("nearest_district")
            ambulances = [a for a in ambulances if a.get("coverage") in [district, "Nationwide"]]

        services = ambulance_details.get("services", []) if isinstance(ambulance_details, dict) else []
        if services:
            lines.append("National ambulance service:")
            for service in services[:1]:
                lines.append(
                    f"- {service.get('service_name')} | {service.get('type')} | Call: {service.get('emergency_number')} | Availability: {service.get('availability')}"
                )
                coverage = service.get("coverage")
                if coverage:
                    lines.append(f"  Coverage: {coverage}")
                instructions = service.get("usage_instructions") or []
                if instructions:
                    lines.append("  Steps:")
                    for step in instructions[:3]:
                        lines.append(f"  - {step}")
                exclusions = service.get("exclusions") or []
                if exclusions:
                    lines.append("  Not for:")
                    for item in exclusions[:2]:
                        lines.append(f"  - {item}")

        if ambulances:
            lines.append("Ambulance services:")
            for item in ambulances[:3]:
                lines.append(
                    f"- {item.get('name')} | {item.get('coverage')} | Call: {item.get('phone')} | {item.get('notes')}"
                )
        numbers = emergency.get("numbers", [])
        if numbers:
            lines.append("Emergency contacts: " + ", ".join(numbers))
        guidance = emergency.get("guidance")
        if guidance:
            lines.append(guidance)
    else:
        if allow_generic:
            lines.append("General guidance (not from the local directory):")
            lines.append("- Stay hydrated, rest, and monitor symptoms.")
            lines.append("- Seek urgent care for severe pain, breathing trouble, confusion, or heavy bleeding.")
            lines.append("- For specific services, ask about hospitals, doctors, vaccinations, or lab reports.")
        else:
            lines.append("Choose a service: hospital/doctor, symptoms, vaccination, lab reports, or complaints.")

    if disclaimer:
        localized_disclaimer = _localize_disclaimer(disclaimer, language)
        lines.append(localized_disclaimer or disclaimer)
    if language != "en":
        return "\n".join(_localize_text(line, language) for line in lines)
    return "\n".join(lines)
