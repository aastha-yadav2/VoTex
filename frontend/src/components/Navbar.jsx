import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const NAV_LINKS = [
  { label: 'Home',        path: '/',            icon: '🏠' },
  { label: 'Chat',        path: '/chat',         icon: '💬' },
  { label: 'Timeline',    path: '/timeline',     icon: '📅' },
  { label: 'Eligibility', path: '/eligibility',  icon: '✅' },
  { label: 'Quiz',        path: '/quiz',         icon: '🧠' },
];

export default function Navbar({ language, onToggleLanguage }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container navbar-inner">

          {/* Logo */}
          <button className="navbar-logo" onClick={() => handleNav('/')}>
            <div className="navbar-logo-icon">🗳️</div>
            <div className="navbar-logo-text">
              <span className="navbar-logo-title">VoTex</span>
              <span className="navbar-logo-sub">Understand · Decide · Vote</span>
            </div>
          </button>

          {/* Desktop Links */}
          <ul className="navbar-links">
            {NAV_LINKS.map(link => (
              <li key={link.path}>
                <button
                  className={`nav-link${location.pathname === link.path ? ' active' : ''}`}
                  onClick={() => handleNav(link.path)}
                >
                  <span className="nav-link-icon">{link.icon}</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right Controls */}
          <div className="navbar-right">
            {/* Language Toggle Switch */}
            <div className="lang-toggle">
              <button
                className={`lang-btn${language === 'en' ? ' active' : ''}`}
                onClick={() => onToggleLanguage('en')}
                title="English"
              >EN</button>
              <button
                className={`lang-btn${language === 'hi' ? ' active' : ''}`}
                onClick={() => onToggleLanguage('hi')}
                title="Hindi"
              >हिं</button>
            </div>

            {/* Hamburger */}
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(link => (
          <button
            key={link.path}
            className={`nav-link${location.pathname === link.path ? ' active' : ''}`}
            onClick={() => handleNav(link.path)}
          >
            <span className="nav-link-icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
        <div className="mobile-menu-lang">
          <button
            className={`lang-btn${language === 'en' ? ' active' : ''}`}
            onClick={() => { onToggleLanguage('en'); setMenuOpen(false); }}
          >🌐 English</button>
          <button
            className={`lang-btn${language === 'hi' ? ' active' : ''}`}
            onClick={() => { onToggleLanguage('hi'); setMenuOpen(false); }}
          >🇮🇳 हिंदी</button>
        </div>
      </div>
    </>
  );
}
