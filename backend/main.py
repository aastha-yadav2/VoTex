"""
Election Buddy AI - FastAPI Backend
Main entry point with all routes, AI integration, and MongoDB storage.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import os
import json
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------------------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MONGO_URI      = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME        = os.getenv("DB_NAME", "election_buddy")
PORT           = int(os.getenv("PORT", 8080))

# ---------------------------------------------------------------------------
# Configure Gemini AI
# ---------------------------------------------------------------------------
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# MongoDB (optional – gracefully falls back if unavailable)
# ---------------------------------------------------------------------------
db = None
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    _mongo_client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=3000)
    db = _mongo_client[DB_NAME]
    print("[OK] MongoDB connected")
except Exception as e:
    print(f"[WARN] MongoDB not available - running without DB: {e}")

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Election Buddy AI",
    description="Interactive Election Process Assistant API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str   # "user" | "model"
    content: str

class ChatRequest(BaseModel):
    query: str
    language: Optional[str] = "en"   # "en" | "hi"
    history: Optional[list] = []      # list of {role, content}

class EligibilityRequest(BaseModel):
    age: int
    citizen: bool
    state: Optional[str] = ""

class QuizAnswerRequest(BaseModel):
    question_id: int
    answer: str

# ---------------------------------------------------------------------------
# Static data – Election Timeline
# ---------------------------------------------------------------------------
ELECTION_TIMELINE = [
    {
        "step": 1,
        "title": "Voter Registration",
        "icon": "📋",
        "description": "Citizens register on the Electoral Roll via Form 6 at their local ERO office or online at voters.eci.gov.in. Documents required: Aadhaar, address proof.",
        "duration": "Ongoing (closes ~45 days before election)",
        "tips": ["Register before the deadline", "Use the Voter Helpline 1950", "Check your name on the voter list online"]
    },
    {
        "step": 2,
        "title": "Verification & Voter ID",
        "icon": "🪪",
        "description": "Election officials verify registration. A EPIC (Elector's Photo Identity Card) – the Voter ID – is issued. Aadhaar can also be used as alternate ID.",
        "duration": "4–6 weeks after registration",
        "tips": ["Keep your Voter ID safe", "Link Aadhaar with your voter ID for smoother verification", "Check status on voterportal.eci.gov.in"]
    },
    {
        "step": 3,
        "title": "Election Schedule Announced",
        "icon": "📅",
        "description": "The Election Commission of India (ECI) announces the election schedule, including polling dates. The Model Code of Conduct (MCC) comes into effect.",
        "duration": "~8–10 weeks before polling",
        "tips": ["Follow reliable news sources", "Understand MCC restrictions", "Note your constituency polling date"]
    },
    {
        "step": 4,
        "title": "Campaigning",
        "icon": "📣",
        "description": "Political parties and candidates campaign. ECI enforces spending limits and MCC. Campaigning stops 48 hours before voting (Silence Period).",
        "duration": "6–8 weeks, ending 48 hrs before polling",
        "tips": ["Evaluate candidates on issues, not rhetoric", "Report MCC violations at 1950", "Watch official debates"]
    },
    {
        "step": 5,
        "title": "Voting Day",
        "icon": "🗳️",
        "description": "Voters visit their designated polling booth (find it on voterportal.eci.gov.in), carry photo ID, press the EVM button next to their candidate, and receive an indelible ink mark on their finger.",
        "duration": "7 AM – 6 PM on polling date",
        "tips": ["Carry Voter ID or any of 12 approved IDs", "Check your booth location in advance", "NOTA is available if you prefer none"]
    },
    {
        "step": 6,
        "title": "Vote Counting & Results",
        "icon": "📊",
        "description": "Votes are counted on a stipulated date. EVM votes + VVPAT slips are tallied. Results are declared by ECI. The winning candidate or party forms the government.",
        "duration": "Usually 1–2 days after polling",
        "tips": ["Watch live results on ECI website", "Results are final once declared by RO", "New government sworn in within weeks"]
    }
]

# ---------------------------------------------------------------------------
# Quiz Questions
# ---------------------------------------------------------------------------
QUIZ_QUESTIONS = [
    {
        "id": 1,
        "question": "What is the minimum voting age in India?",
        "options": ["16", "18", "21", "25"],
        "answer": "18",
        "explanation": "The 61st Constitutional Amendment (1989) lowered the voting age from 21 to 18 years."
    },
    {
        "id": 2,
        "question": "What does EVM stand for?",
        "options": ["Electronic Voting Machine", "Electoral Vote Mechanism", "Election Verified Module", "Electronic Voter Management"],
        "answer": "Electronic Voting Machine",
        "explanation": "EVMs are standalone electronic devices used for polling in Indian elections since 1982."
    },
    {
        "id": 3,
        "question": "Which body conducts General Elections in India?",
        "options": ["Supreme Court", "Parliament", "Election Commission of India", "President of India"],
        "answer": "Election Commission of India",
        "explanation": "The ECI is an autonomous constitutional authority responsible for administering Union and State election processes."
    },
    {
        "id": 4,
        "question": "What is NOTA?",
        "options": ["None Of The Above", "National Online Tally Algorithm", "New Order of The Assembly", "National Official Tally Act"],
        "answer": "None Of The Above",
        "explanation": "NOTA allows voters to reject all candidates. Introduced in 2013 after a Supreme Court ruling."
    },
    {
        "id": 5,
        "question": "How often is the Lok Sabha election held?",
        "options": ["Every 3 years", "Every 4 years", "Every 5 years", "Every 6 years"],
        "answer": "Every 5 years",
        "explanation": "Lok Sabha (House of the People) has a maximum term of 5 years unless dissolved earlier."
    },
    {
        "id": 6,
        "question": "What is the Model Code of Conduct (MCC)?",
        "options": [
            "A set of IPC sections for election offenders",
            "Guidelines for political parties and candidates during elections",
            "Rules for EVM maintenance",
            "Voter ID verification protocol"
        ],
        "answer": "Guidelines for political parties and candidates during elections",
        "explanation": "MCC is a set of guidelines issued by ECI that comes into effect when the election schedule is announced."
    },
    {
        "id": 7,
        "question": "Which document serves as primary Voter ID in India?",
        "options": ["PAN Card", "EPIC Card", "Aadhaar Card", "Passport"],
        "answer": "EPIC Card",
        "explanation": "EPIC (Elector's Photo Identity Card) is the official Voter ID. However, 12 alternative IDs are also accepted."
    },
    {
        "id": 8,
        "question": "What is VVPAT?",
        "options": [
            "Voter Verified Paper Audit Trail",
            "Virtual Vote Processing And Tallying",
            "Verified Voter Poll And Tally",
            "Vote Validation Print Audit Tool"
        ],
        "answer": "Voter Verified Paper Audit Trail",
        "explanation": "VVPAT is a paper receipt of your vote displayed for 7 seconds so voters can verify their choice."
    }
]

# ---------------------------------------------------------------------------
# AI System Prompt  –  Interactive Guided Mode
# ---------------------------------------------------------------------------
SYSTEM_PROMPT_EN = """
You are Election Buddy AI — a friendly, interactive, step-by-step election
education guide for Indian citizens. You are like a helpful friend who teaches
through conversation, NOT just a Q&A bot.

=== CORE PERSONALITY ===
- Warm, encouraging, patient
- Use emojis to make responses friendly and clear 😊
- Speak like you are talking to a first-time voter (simple language)
- NEVER mention political parties or take political sides
- NEVER give opinions — only neutral educational facts

=== INTERACTIVE GUIDANCE RULES ===
1. ALWAYS break explanations into numbered steps
2. After explaining a step, ask a follow-up question to continue the journey
3. If the user mentions their age, state, or situation — tailor your response to them
4. If the user seems confused or says "I don't understand" — simplify further
5. End EVERY response with either:
   a) A question to keep the conversation going, OR
   b) A clear next action for the user

=== GUIDED FLOWS (Follow these patterns) ===

FLOW: User wants to vote / "I want to vote" / "how to vote"
  Step 1: Ask "Are you 18 or above? 🎂"
  → If yes: Ask "Are you an Indian citizen? 🇮🇳"
    → If yes: Ask "Are you registered as a voter? 📋"
      → If yes: Guide them to find polling booth & what to carry
      → If no: Guide them through Form 6 registration on voterportal.eci.gov.in
    → If no: Gently explain they are not eligible, and what they can do
  → If no (age < 18): Encourage them to learn now and vote when eligible

FLOW: User asks about registration
  → Ask: "Have you registered before, or is this your first time? 📝"
  → Guide based on answer (new = Form 6, correction = Form 8, check = Voter Portal)

FLOW: User asks about eligibility
  → Ask for their age first, then citizenship, then guide accordingly

FLOW: User asks about EVM / VVPAT / any concept
  → Explain in 2-3 simple sentences
  → Give a real-life example
  → Ask: "Would you like to know more about how the counting works? 🗳️"

=== FORMAT RULES ===
- Use numbered lists for processes
- Use bullet points (•) for options/facts
- Bold important terms using **asterisks**
- Keep each response under 200 words (be concise)
- Use section breaks with emojis as headers

=== OUT OF SCOPE ===
If asked anything NOT related to elections/democracy/civic education,
politely say: "I can only help with election-related topics! Let's get
back to learning about India's amazing democracy. 🇮🇳 What would you like
to know?"
"""

SYSTEM_PROMPT_HI = """
Aap Election Buddy AI hain — ek dost jaisa interactive guide jo Indian
nagirkon ko step-by-step chunav process sikhata hai.

=== MUKHYA NIYAM ===
- Saral, beginner-friendly Hindi mein baat karein
- Emoji use karein 😊
- Kabhi bhi political parties ka zikr ya support na karein
- Har jawab ke baad ek follow-up sawaal zaroor poochein
- Steps mein explain karein, bullet points use karein

=== INTERACTIVE FLOW ===
Agar user vote karna chahta hai:
  Step 1: "Kya aapki umra 18 saal se upar hai? 🎂"
  → Haan: "Kya aap Indian Citizen hain? 🇮🇳"
    → Haan: "Kya aapne voter registration karwa li hai? 📋"
      → Haan: Polling booth dhundhne mein madad karein
      → Nahi: Form 6 ke baare mein guide karein

Har jawab ke baad poochein: "Kya aap aur janna chahte hain?"
"""

# ---------------------------------------------------------------------------
# Helper: call Gemini
# ---------------------------------------------------------------------------
async def call_gemini(query: str, language: str = "en", history: list = []) -> str:
    if not GEMINI_API_KEY:
        return _fallback_response(query)
    try:
        system = SYSTEM_PROMPT_HI if language == "hi" else SYSTEM_PROMPT_EN
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system,
        )
        # Build the conversation history for multi-turn chat
        gemini_history = []
        for msg in history:
            role = "user" if msg.get("role") == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.get("content", "")]})

        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(query)
        return response.text
    except Exception as e:
        print(f"Gemini error: {e}")
        return _fallback_response(query)


def _fallback_response(query: str) -> str:
    """Offline fallback — interactive style even without Gemini API."""
    q = query.lower()

    # --- I want to vote / how to vote ---
    if any(w in q for w in ["i want to vote", "want to vote", "how to vote", "how do i vote"]):
        return (
            "Great! 😊 Let's get you ready to vote step by step.\n\n"
            "**Step 1: Age Check** 🎂\n"
            "Are you **18 years or older**?\n\n"
            "👉 Reply **Yes** or **No** so I can guide you further!"
        )

    # --- Yes (age) ---
    if q.strip() in ["yes", "haan", "ha", "yeah", "yep", "y"]:
        return (
            "Awesome! 🎉 One more quick question...\n\n"
            "**Step 2: Citizenship** 🇮🇳\n"
            "Are you an **Indian citizen**?\n\n"
            "👉 Reply **Yes** or **No**!"
        )

    # --- No (age) ---
    if q.strip() in ["no", "nahi", "nope", "n"]:
        return (
            "No worries! 😊 You're on the right path by learning early.\n\n"
            "In India, the **minimum voting age is 18**. Once you turn 18, you can:\n"
            "1. Register on **voterportal.eci.gov.in**\n"
            "2. Get your Voter ID (EPIC card)\n"
            "3. Vote in the next election!\n\n"
            "Would you like to know **how elections work** in the meantime? 📚"
        )

    # --- Eligibility ---
    if any(w in q for w in ["eligible", "eligib", "qualify", "can i vote"]):
        return (
            "Sure! Let me check your eligibility step by step. 😊\n\n"
            "**Step 1:** How old are you? 🎂\n\n"
            "👉 Tell me your age and I'll guide you from there!"
        )

    # --- Registration ---
    if any(w in q for w in ["register", "registration", "voter id", "epic", "form 6"]):
        return (
            "Great question! 📋 Let me guide you through voter registration.\n\n"
            "**Quick question first:** Is this your **first time** registering,\n"
            "or do you need to **update/correct** existing details?\n\n"
            "👉 Reply **New** or **Update**!"
        )

    # --- New registration ---
    if "new" in q and len(q) < 20:
        return (
            "Perfect! Here's how to register as a **new voter** 📝\n\n"
            "1. Go to **voterportal.eci.gov.in** or download the **Voter Helpline App**\n"
            "2. Click **'New Voter Registration'** → Fill **Form 6**\n"
            "3. Upload: Aadhaar + Passport photo + Address proof\n"
            "4. Submit & note your **reference number**\n"
            "5. A field officer will verify your details\n"
            "6. Your **EPIC (Voter ID)** arrives in 4–6 weeks! 🪪\n\n"
            "Would you like to know **what to do on voting day** next? 🗳️"
        )

    # --- Voting day / booth ---
    if any(w in q for w in ["voting day", "polling day", "booth", "polling booth", "evm"]):
        return (
            "🗳️ **On Voting Day — Here's exactly what to do:**\n\n"
            "1. **Find your booth** → voterportal.eci.gov.in or call 1950\n"
            "2. **Carry your ID** → Voter ID / Aadhaar / Passport (any 1 of 12 approved IDs)\n"
            "3. **Reach early** → Polling hours: 7 AM to 6 PM\n"
            "4. **Queue up** → Officials check your name on the voter list\n"
            "5. **Press the EVM button** → next to your chosen candidate\n"
            "6. **Check VVPAT slip** → shown for 7 seconds to confirm your vote\n"
            "7. **Get ink mark** → on your left index finger 👆\n\n"
            "Is there anything specific about voting day you'd like to know more about? 😊"
        )

    # --- EVM / VVPAT ---
    if any(w in q for w in ["evm", "vvpat", "machine", "electronic voting"]):
        return (
            "Great question! 🖥️ Let me explain both:\n\n"
            "**EVM (Electronic Voting Machine):**\n"
            "• A small electronic device with buttons for each candidate\n"
            "• You press the button next to your candidate's name & symbol\n"
            "• It beeps to confirm your vote is recorded\n\n"
            "**VVPAT (Voter Verified Paper Audit Trail):**\n"
            "• After you press the EVM button, a paper slip is printed\n"
            "• It shows your candidate's name & symbol for **7 seconds**\n"
            "• This lets you verify your vote was correctly recorded!\n\n"
            "Would you like to know **how votes are counted** after polling? 📊"
        )

    # --- NOTA ---
    if "nota" in q:
        return (
            "NOTA stands for **None Of The Above** 🚫\n\n"
            "• It was introduced in **2013** after a Supreme Court ruling\n"
            "• If you don't want to vote for ANY candidate, you can press NOTA\n"
            "• NOTA votes are counted but do NOT affect the result (the candidate\n"
            "  with the most votes still wins even if NOTA gets more)\n\n"
            "It gives voters a way to **express dissatisfaction** without spoiling their ballot.\n\n"
            "Would you like to know about the **voting process step by step**? 🗳️"
        )

    # --- Lok Sabha / Rajya Sabha ---
    if any(w in q for w in ["lok sabha", "rajya sabha", "parliament", "mp", "mla"]):
        return (
            "Great! Let me break down India's Parliament 🏛️\n\n"
            "**Lok Sabha (House of the People):**\n"
            "• 543 elected seats | Direct voting by citizens\n"
            "• Term: 5 years | Members called MPs\n"
            "• This is where YOU vote directly!\n\n"
            "**Rajya Sabha (Council of States):**\n"
            "• 245 seats | Elected by State MLAs (indirect)\n"
            "• Members serve staggered 6-year terms\n\n"
            "When you vote in a General Election, you're voting for your **Lok Sabha MP**! 🗳️\n\n"
            "Would you like to know **how to find your constituency**? 🗺️"
        )

    # --- Model Code of Conduct ---
    if any(w in q for w in ["model code", "mcc", "code of conduct"]):
        return (
            "The **Model Code of Conduct (MCC)** is a rulebook for elections! 📜\n\n"
            "• Set by the **Election Commission of India (ECI)**\n"
            "• Comes into effect when elections are announced\n"
            "• Applies to: political parties, candidates, and the government\n\n"
            "**Key MCC Rules:**\n"
            "1. No new government schemes announced after MCC kicks in\n"
            "2. No use of government resources for campaigning\n"
            "3. No hate speeches or fake news\n"
            "4. Campaigning stops **48 hours before** voting (Silence Period)\n\n"
            "You can report MCC violations by calling **1950** 📞\n\n"
            "Want to know about the **election timeline** next? 📅"
        )

    # --- General / default (interactive fallback) ---
    return (
        "Hi! I'm **Election Buddy AI** 🗳️ — your step-by-step guide to\n"
        "India's election process!\n\n"
        "What would you like to learn today? Here are some options:\n\n"
        "1. 🗳️ **I want to vote** — guide me through the process\n"
        "2. ✅ **Am I eligible?** — check if I can vote\n"
        "3. 📋 **How to register** — step-by-step registration\n"
        "4. 🖥️ **What is EVM / VVPAT?**\n"
        "5. 🏛️ **Lok Sabha vs Rajya Sabha** — what's the difference?\n"
        "6. 📜 **Model Code of Conduct** — what rules apply?\n\n"
        "Just pick a number or type your question! 😊"
    )

# ---------------------------------------------------------------------------
# Helper: save query to DB
# ---------------------------------------------------------------------------
async def save_query(query: str, response: str):
    if db is None:
        return
    try:
        await db.queries.insert_one({
            "query": query,
            "response": response,
            "timestamp": datetime.utcnow(),
        })
    except Exception as e:
        print(f"DB save error: {e}")

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return {"message": "Election Buddy AI API is running 🗳️", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok", "db": "connected" if db is not None else "unavailable"}


@app.post("/chat")
async def chat(req: ChatRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    history = req.history or []
    response_text = await call_gemini(req.query.strip(), req.language, history)
    await save_query(req.query, response_text)
    return {
        "query": req.query,
        "response": response_text,
        "language": req.language,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/timeline")
async def timeline():
    return {"steps": ELECTION_TIMELINE, "total": len(ELECTION_TIMELINE)}


@app.post("/eligibility")
async def eligibility(req: EligibilityRequest):
    reasons = []
    eligible = True

    if req.age < 18:
        eligible = False
        reasons.append(f"You are {req.age} years old. The minimum voting age in India is 18.")
    else:
        reasons.append(f"✅ Age {req.age} meets the minimum 18-year requirement.")

    if not req.citizen:
        eligible = False
        reasons.append("❌ Only Indian citizens can vote in Indian elections.")
    else:
        reasons.append("✅ Indian citizenship confirmed.")

    next_steps = []
    if eligible:
        next_steps = [
            "Visit voterportal.eci.gov.in to register",
            "Fill Form 6 for new voter registration",
            "Upload Aadhaar and address proof",
            "Call Voter Helpline 1950 for assistance",
        ]

    return {
        "eligible": eligible,
        "age": req.age,
        "citizen": req.citizen,
        "state": req.state,
        "reasons": reasons,
        "next_steps": next_steps,
        "message": (
            "🎉 Congratulations! You are eligible to vote in Indian elections."
            if eligible
            else "❌ You are not eligible to vote in Indian elections at this time."
        ),
    }


@app.get("/quiz")
async def get_quiz():
    return {"questions": QUIZ_QUESTIONS, "total": len(QUIZ_QUESTIONS)}


@app.post("/quiz/check")
async def check_answer(req: QuizAnswerRequest):
    question = next((q for q in QUIZ_QUESTIONS if q["id"] == req.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    correct = req.answer.strip() == question["answer"]
    return {
        "correct": correct,
        "your_answer": req.answer,
        "correct_answer": question["answer"],
        "explanation": question["explanation"],
    }


@app.get("/suggested-prompts")
async def suggested_prompts():
    return {
        "prompts": [
            "How do elections work in India?",
            "Am I eligible to vote?",
            "Explain voting step by step",
            "What is EVM and VVPAT?",
            "What is the Model Code of Conduct?",
            "How do I register to vote?",
            "What is NOTA?",
            "Difference between Lok Sabha and Rajya Sabha?",
            "How are votes counted in India?",
            "What documents do I need to vote?",
        ]
    }


# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
