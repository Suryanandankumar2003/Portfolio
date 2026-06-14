"""
chatbot.py
==========
Session-aware chatbot manager wrapping the RAG engine.
Handles per-session chat history and delegates to rag.py.
"""

import logging
import time
import uuid
from typing import Dict, List, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

MAX_SESSIONS   = 500
SESSION_TTL    = 3600  # 1 hour
MAX_HISTORY    = 10    # messages per session


@dataclass
class ChatSession:
    session_id: str
    history: List[Dict[str, str]] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    last_active: float = field(default_factory=time.time)

    def add(self, role: str, text: str):
        self.history.append({"role": role, "text": text})
        if len(self.history) > MAX_HISTORY * 2:
            self.history = self.history[-MAX_HISTORY * 2:]
        self.last_active = time.time()

    def is_expired(self) -> bool:
        return (time.time() - self.last_active) > SESSION_TTL


class ChatbotManager:
    """Manages multiple user chat sessions."""

    def __init__(self):
        self._sessions: Dict[str, ChatSession] = {}
        self._bot = None

    def _get_bot(self):
        if self._bot is None:
            from rag import get_chatbot
            self._bot = get_chatbot()
        return self._bot

    def _cleanup(self):
        """Remove expired sessions."""
        expired = [sid for sid, s in self._sessions.items() if s.is_expired()]
        for sid in expired:
            del self._sessions[sid]
        # If still too many, evict oldest
        if len(self._sessions) > MAX_SESSIONS:
            sorted_sessions = sorted(self._sessions.items(), key=lambda x: x[1].last_active)
            for sid, _ in sorted_sessions[:len(self._sessions) - MAX_SESSIONS]:
                del self._sessions[sid]

    def new_session(self) -> str:
        self._cleanup()
        sid = str(uuid.uuid4())
        self._sessions[sid] = ChatSession(session_id=sid)
        return sid

    def get_session(self, session_id: Optional[str]) -> ChatSession:
        if not session_id or session_id not in self._sessions:
            sid = self.new_session()
            return self._sessions[sid]
        s = self._sessions[session_id]
        if s.is_expired():
            del self._sessions[session_id]
            sid = self.new_session()
            return self._sessions[sid]
        return s

    def chat(self, question: str, session_id: Optional[str] = None) -> Dict:
        session = self.get_session(session_id)
        session.add("user", question)

        try:
            bot = self._get_bot()
            answer = bot.ask(question)
        except Exception as e:
            logger.error(f"Bot error: {e}")
            answer = (
                "I'm having a moment — please try again shortly, "
                "or contact Suryanandan at suryanandankumar2003@gmail.com"
            )

        session.add("bot", answer)
        logger.info(f"[{session.session_id[:8]}] Q: {question[:60]} → A: {answer[:60]}")

        return {
            "answer": answer,
            "session_id": session.session_id,
            "history_length": len(session.history) // 2,
        }

    def clear_session(self, session_id: str):
        if session_id in self._sessions:
            del self._sessions[session_id]


# Global instance
_manager: Optional[ChatbotManager] = None

def get_manager() -> ChatbotManager:
    global _manager
    if _manager is None:
        _manager = ChatbotManager()
    return _manager
