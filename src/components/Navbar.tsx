import { Link, useLocation } from 'react-router-dom';

const LightningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const navLinks = [
  { label: 'Problems', to: '/problems' },
  { label: 'Contests', to: '#' },
  { label: 'Leaderboard', to: '#' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="cx-navbar">
      {/* Logo */}
      <Link to="/problems" className="cx-logo" style={{ marginRight: 8 }}>
        <span style={{ color: 'var(--accent-green)' }}><LightningIcon /></span>
        Code<span className="accent">X</span>
      </Link>

      {/* Nav links */}
      <div className="cx-nav-links">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className={`cx-nav-link ${location.pathname.startsWith(link.to) && link.to !== '#' ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="cx-navbar-right">
        <div style={{
          fontSize: '0.78rem', color: 'var(--text-muted)',
          padding: '4px 10px', background: 'var(--bg-tertiary)',
          borderRadius: '6px', border: '1px solid var(--border)',
          whiteSpace: 'nowrap'
        }}>
          🔥 <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>7</span> day streak
        </div>

        <div className="cx-avatar" title="Profile">U</div>
      </div>
    </nav>
  );
}
