import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import '../styles/Chat.css';

const SUGGESTED = [
  '🗳️ I want to vote — guide me',
  '✅ Am I eligible to vote?',
  '📋 How do I register to vote?',
  '🖥️ What is EVM and VVPAT?',
  '🚫 What is NOTA?',
  '🏛️ Lok Sabha vs Rajya Sabha?',
  '📜 What is Model Code of Conduct?',
  '📊 How are votes counted?',
  '📅 Explain the election timeline',
  '📞 What is Voter Helpline 1950?',
];

const QUICK_REPLIES = {
  vote:       ['Yes, I am 18+', 'No, I am under 18', 'Tell me more about voting'],
  citizen:    ['Yes, I am Indian', 'No, I am not'],
  register:   ['New registration', 'Update existing details'],
  more:       ['Tell me more', 'What happens next?', 'Go back to basics'],
};

function detectQuickReplies(text) {
  const t = text.toLowerCase();
  if (t.includes('are you 18') || t.includes('18 or older') || t.includes('age check'))
    return QUICK_REPLIES.vote;
  if (t.includes('indian citizen') && t.includes('step 2'))
    return QUICK_REPLIES.citizen;
  if (t.includes('voter registration') && t.includes('first time'))
    return QUICK_REPLIES.register;
  if (t.includes('voting day') || t.includes('what to do on voting day'))
    return ['Yes, what do I carry?', 'How do I find my booth?', 'What is VVPAT?'];
  if (t.includes('would you like') || t.includes('want to know more') || t.includes('shall we'))
    return QUICK_REPLIES.more;
  return [];
}

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function renderBotText(text) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1
        ? <strong key={j} style={{ color: 'var(--color-primary-light)' }}>{part}</strong>
        : part
    );
    if (/^\d+\.\s/.test(line)) {
      return <p key={i} style={{ paddingLeft: '4px', marginBottom: '4px' }}>{rendered}</p>;
    }
    if (/^[•→]\s/.test(line)) {
      return <p key={i} style={{ paddingLeft: '10px', marginBottom: '3px' }}>{rendered}</p>;
    }
    return <p key={i} style={{ marginBottom: '4px' }}>{rendered}</p>;
  });
}

export default function Chat({ language }) {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [quickReplies,setQuickReplies]= useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  useEffect(() => {
    const initial = sessionStorage.getItem('initialPrompt');
    if (initial) {
      sessionStorage.removeItem('initialPrompt');
      setTimeout(() => sendMessage(initial), 500);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const buildHistory = (msgs) =>
    msgs.map(m => ({ role: m.role === 'bot' ? 'model' : 'user', content: m.content }));

  const sendMessage = useCallback(async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    setInput('');
    setError('');
    setQuickReplies([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg = { id: Date.now(), role: 'user', content: query, time: new Date() };

    setMessages(prev => {
      const updated = [...prev, userMsg];
      doSend(query, buildHistory(updated));
      return updated;
    });
  }, [input, loading, language]);

  const doSend = async (query, history) => {
    setLoading(true);
    try {
      const data = await api.chat(query, language, history.slice(0, -1));
      const botMsg = { id: Date.now() + 1, role: 'bot', content: data.response, time: new Date() };
      setMessages(prev => [...prev, botMsg]);
      setQuickReplies(detectQuickReplies(data.response));
    } catch {
      setError('Could not reach the AI server. Please check if the backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  const clearChat = () => { setMessages([]); setError(''); setQuickReplies([]); };

  const langLabel = language === 'hi' ? 'हिंदी मोड • Interactive Guide' : 'Interactive Step-by-Step Guide';

  return (
    <div className="chat-page">
      <div className="chat-layout">

        {/* ── Sidebar ── */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span className="chat-sidebar-title">💡 Try Asking</span>
          </div>

          <div className="suggested-prompts-list">
            {SUGGESTED.map((p, i) => (
              <button
                key={i}
                className="suggested-prompt-btn"
                onClick={() => sendMessage(p)}
                disabled={loading}
              >
                {p}
              </button>
            ))}
          </div>

          <hr className="sidebar-divider" />

          <div className="sidebar-info-box">
            <div className="sidebar-info-item">
              <span className="chat-sidebar-title">🌐 Language</span>
              <p style={{ marginTop:'6px' }}>
                {language === 'hi' ? '🟠 Hindi mode active' : '🔵 English mode active'}
              </p>
            </div>

            <hr className="sidebar-divider" style={{ margin:'12px 0' }} />

            <div className="sidebar-info-item">
              <strong style={{ color: 'var(--text-secondary)' }}>📌 Voter Helpline</strong>
              <p>Call: <strong style={{ color:'var(--color-primary-light)' }}>1950</strong></p>
              <p>
                Web:{' '}
                <a href="https://voterportal.eci.gov.in" target="_blank" rel="noreferrer">
                  voterportal.eci.gov.in
                </a>
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main Chat ── */}
        <div className="chat-main">

          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🗳️</div>
              <div className="chat-header-text">
                <h3>VoTex AI</h3>
                <p>
                  <span className="pulse-dot" />
                  {langLabel}
                </p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              {messages.length > 0 && (
                <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>
                  {messages.length} msgs
                </span>
              )}
              {messages.length > 0 && (
                <button className="chat-clear-btn" onClick={clearChat}>
                  🗑 Clear
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">

            {/* Welcome */}
            {messages.length === 0 && !loading && (
              <div className="chat-welcome">
                <div className="chat-welcome-icon">🗳️</div>
                <h2>
                  {language === 'hi'
                    ? <>Namaste! Main hoon <span className="gradient-text-blue">VoTex AI</span></>
                    : <>Hello! I'm <span className="gradient-text-blue">VoTex AI</span></>
                  }
                </h2>
                <p>
                  {language === 'hi'
                    ? 'Main aapko step-by-step guide karunga — voter registration se lekar voting day tak! Poochein kuch bhi 😊'
                    : "I'll guide you step-by-step through India's election process — from registration to voting day! Ask me anything 😊"
                  }
                </p>

                <div className="chat-welcome-chips">
                  {[
                    { label:'🗳️ I want to vote',    msg:'I want to vote' },
                    { label:'✅ Am I eligible?',      msg:'Am I eligible to vote?' },
                    { label:'📋 How to register',    msg:'How do I register to vote?' },
                    { label:'🖥️ What is EVM?',       msg:'What is EVM and VVPAT?' },
                    { label:'🚫 What is NOTA?',      msg:'What is NOTA?' },
                    { label:'📅 Election timeline',  msg:'Explain the election timeline' },
                  ].map((item, i) => (
                    <button key={i} className="chat-welcome-chip" onClick={() => sendMessage(item.msg)}>
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="chat-welcome-hint">
                  💡 <strong style={{ color:'var(--color-accent)' }}>Interactive Mode:</strong>
                  {' '}I'll ask follow-up questions to personalize your guide!
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                <div className={`message-avatar ${msg.role}`}>
                  {msg.role === 'bot' ? '🗳️' : '👤'}
                </div>
                <div className="message-content">
                  <div className={`message-bubble ${msg.role}`}>
                    {msg.role === 'bot' ? renderBotText(msg.content) : <p>{msg.content}</p>}
                  </div>
                  <div className="message-time">{formatTime(msg.time)}</div>

                  {/* Quick replies after last bot message */}
                  {msg.role === 'bot' && idx === messages.length - 1 && quickReplies.length > 0 && !loading && (
                    <div className="quick-replies-wrap">
                      {quickReplies.map((qr, qi) => (
                        <button key={qi} className="quick-reply-chip" onClick={() => sendMessage(qr)}>
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="message-wrapper bot">
                <div className="message-avatar bot">🗳️</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                  <div className="message-time" style={{ marginTop:'4px' }}>Thinking…</div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="error-bubble">
                ⚠️ {error}
                <button
                  onClick={() => setError('')}
                  style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--color-danger)', cursor:'pointer', fontSize:'1.1rem' }}
                >×</button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="chat-input-form">
              <div className="chat-input-wrap">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder={
                    language === 'hi'
                      ? 'Kuch bhi poochein ya Yes/No jawab dein…'
                      : 'Ask anything about Indian elections…'
                  }
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={loading}
                />
                <button
                  className="send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                >
                  {loading
                    ? <div className="spinner" style={{ width:'16px', height:'16px', borderWidth:'2px' }} />
                    : '➤'
                  }
                </button>
              </div>
            </div>
            <p className="chat-input-hint">
              <kbd style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'4px', padding:'1px 5px', fontSize:'0.62rem' }}>Enter</kbd>
              {' '}to send ·{' '}
              <kbd style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)', borderRadius:'4px', padding:'1px 5px', fontSize:'0.62rem' }}>Shift+Enter</kbd>
              {' '}for new line · AI guides you step-by-step 🧭
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
