import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const DASHBOARD_CARDS = [
  {
    icon: '🗳️',
    title: 'How to Vote',
    desc: 'Step-by-step guide from voter ID to casting your ballot on polling day.',
    cta: 'Start Guide',
    path: '/chat',
    prompt: 'I want to vote — guide me step by step',
    cls: 'dc-blue',
  },
  {
    icon: '✅',
    title: 'Check Eligibility',
    desc: 'Find out in 10 seconds if you qualify to vote in Indian elections.',
    cta: 'Check Now',
    path: '/eligibility',
    prompt: null,
    cls: 'dc-green',
  },
  {
    icon: '📅',
    title: 'Election Timeline',
    desc: "Visualize every phase of India's democratic election process.",
    cta: 'View Timeline',
    path: '/timeline',
    prompt: null,
    cls: 'dc-accent',
  },
  {
    icon: '🧠',
    title: 'Take Quiz',
    desc: 'Test your election IQ with our interactive knowledge quiz.',
    cta: 'Play Quiz',
    path: '/quiz',
    prompt: null,
    cls: 'dc-purple',
  },
];

const FEATURES = [
  {
    icon: '💬',
    title: 'AI Chat Assistant',
    desc: 'Ask anything about Indian elections in plain language and get instant, educational answers.',
  },
  {
    icon: '📅',
    title: 'Election Timeline',
    desc: 'Explore the complete step-by-step election journey from registration to results.',
  },
  {
    icon: '✅',
    title: 'Eligibility Checker',
    desc: 'Find out instantly if you qualify to vote and what steps to take next.',
  },
  {
    icon: '🧠',
    title: 'Knowledge Quiz',
    desc: 'Test your election knowledge with our interactive quiz and track your score.',
  },
];

const SAMPLE_PROMPTS = [
  'How do elections work in India?',
  'What is EVM and VVPAT?',
  'How do I register to vote?',
  'What is NOTA?',
  'Difference between Lok Sabha & Rajya Sabha?',
  'What is Model Code of Conduct?',
  'How are votes counted?',
  'Am I eligible to vote?',
];

// Simple scroll-reveal hook
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const navigate = useNavigate();
  const dashRef  = useReveal();
  const featRef  = useReveal();
  const ctaRef   = useReveal();

  const goToChat = (prompt) => {
    if (prompt) sessionStorage.setItem('initialPrompt', prompt);
    navigate('/chat');
  };

  const handleDashCard = (card) => {
    if (card.prompt) goToChat(card.prompt);
    else navigate(card.path);
  };

  return (
    <main className="home-page">

      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="hero-glow-blue" />
        <div className="hero-glow-accent" />
        <div className="hero-grid" />

        <div className="container hero-content">

          {/* Left */}
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span>🇮🇳</span> India's Election Education Platform
            </div>

            <h1 className="hero-title">
              <span className="gradient-text-blue">VoTex</span>
              <span className="hero-tagline">Understand · Decide · Vote</span>
            </h1>

            <p className="hero-subtitle">
              AI-powered civic education for every Indian citizen. Learn how democracy works,
              check your eligibility, and take the quiz — all in one place.
            </p>

            <div className="hero-cta-group">
              <button className="btn btn-primary btn-lg" onClick={() => goToChat()}>
                💬 Start Exploring
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/eligibility')}>
                ✅ Check Eligibility
              </button>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-item">
                <h3>96.8Cr</h3>
                <p>Eligible voters</p>
              </div>
              <div className="hero-stat-item">
                <h3>543</h3>
                <p>Lok Sabha seats</p>
              </div>
              <div className="hero-stat-item">
                <h3>1950</h3>
                <p>Voter helpline</p>
              </div>
            </div>
          </div>

          {/* Right – floating cards */}
          <div className="hero-right">
            <div className="hero-card-stack">
              {/* Main card */}
              <div className="hero-card-main">
                <div className="hero-card-emoji">🗳️</div>
                <div className="hero-card-label">Election Overview</div>
                <div className="hero-card-value" style={{ color: 'var(--text-primary)', fontSize:'1.25rem', fontWeight:800 }}>
                  Lok Sabha 2024
                </div>
                <div className="india-tricolor" style={{ margin:'12px 0' }} />
                <div className="hero-card-stat-row">
                  <div className="hero-card-stat">
                    <span className="hero-card-stat-num">7</span>
                    <span className="hero-card-stat-label">Phases</span>
                  </div>
                  <div className="hero-card-stat">
                    <span className="hero-card-stat-num">64.2%</span>
                    <span className="hero-card-stat-label">Turnout</span>
                  </div>
                  <div className="hero-card-stat">
                    <span className="hero-card-stat-num">543</span>
                    <span className="hero-card-stat-label">Seats</span>
                  </div>
                </div>
              </div>

              {/* Float 1 – eligibility */}
              <div className="hero-card-float hero-card-float-1">
                <div style={{ fontSize:'1.4rem', marginBottom:'6px' }}>✅</div>
                <div className="hero-card-label">Eligibility</div>
                <div className="hero-card-value" style={{ color:'var(--color-success-light)', fontSize:'0.9rem', fontWeight:700 }}>
                  Check in 10 sec →
                </div>
              </div>

              {/* Float 2 – AI accuracy */}
              <div className="hero-card-float hero-card-float-2">
                <div style={{ fontSize:'1.4rem', marginBottom:'6px' }}>🤖</div>
                <div className="hero-card-label">AI Accuracy</div>
                <div className="hero-card-value" style={{ color:'var(--color-accent-light)', fontSize:'1.1rem', fontWeight:800 }}>
                  98.5%
                </div>
              </div>

              {/* Float 3 – quiz */}
              <div className="hero-card-float hero-card-float-3">
                <div style={{ fontSize:'1.4rem', marginBottom:'6px' }}>🧠</div>
                <div className="hero-card-label">Quiz Mode</div>
                <div className="hero-card-value" style={{ color:'#A78BFA', fontSize:'0.9rem', fontWeight:700 }}>
                  Play Now →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Interactive Dashboard ===== */}
      <section className="dashboard-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2>Start <span className="gradient-text-blue">Exploring</span></h2>
            <p>Click any card to instantly dive into a guided experience</p>
          </div>

          <div className="dashboard-grid reveal stagger-children" ref={dashRef}>
            {DASHBOARD_CARDS.map((card, i) => (
              <button
                key={i}
                className={`dashboard-card ${card.cls} animate-fade-up`}
                onClick={() => handleDashCard(card)}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="dc-icon">{card.icon}</div>
                <div className="dc-title">{card.title}</div>
                <div className="dc-desc">{card.desc}</div>
                <div className="dc-cta">
                  {card.cta} <span>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to <span className="gradient-text">Understand Elections</span></h2>
            <p>Four powerful tools designed for every Indian citizen — beginner or expert.</p>
          </div>
          <div className="features-grid reveal stagger-children" ref={featRef}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card feature-card animate-fade-up" style={{ animationDelay:`${i*80}ms` }}>
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Sample Prompts ===== */}
      <section className="prompts-section">
        <div className="container">
          <div className="section-header">
            <h2>Try Asking <span className="gradient-text-blue">VoTex AI</span></h2>
            <p>Click any prompt to start an instant AI conversation.</p>
          </div>
          <div className="prompt-chips-wrap">
            {SAMPLE_PROMPTS.map((p, i) => (
              <button key={i} className="prompt-chip" onClick={() => goToChat(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Banner ===== */}
      <div className="container">
        <div className="cta-banner reveal" ref={ctaRef}>
          <h2>Ready to Become an <span className="gradient-text">Informed Voter?</span></h2>
          <p>Join millions of Indians learning about their democratic rights.</p>
          <div className="cta-banner-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/chat')}>
              💬 Chat with AI
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/eligibility')}>
              ✅ Check Eligibility
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/quiz')}>
              🧠 Take Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="india-tricolor" style={{ maxWidth:'180px', margin:'0 auto var(--space-md)' }} />
          <p>🗳️ <strong>VoTex</strong> — Educational tool for Indian citizens. Not affiliated with ECI or any political party.</p>
          <p style={{ marginTop:'6px' }}>
            Built with ❤️ for India's democracy | Voter Helpline:{' '}
            <strong style={{ color:'var(--color-primary-light)' }}>1950</strong>
          </p>
        </div>
      </footer>
    </main>
  );
}
