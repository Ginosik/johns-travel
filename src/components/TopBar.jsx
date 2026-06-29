import { Link } from "react-router-dom";
import conversanteLogo from "../../assets/conversante-logo.png";
import Avatar from "./Avatar.jsx";
import LanguageToggle from "./LanguageToggle.jsx";

function TopBar({ isPortuguese, navLinks = [], onToggleLanguage, profileAvatar, profileName, toggleLabel }) {
  return (
    <header className="topbar">
      <div className="brand-area">
        <Link className="brand-link" to="/" aria-label={profileName}>
          <img className="brand-logo" src={conversanteLogo} alt="" />
        </Link>
        {navLinks.length > 0 && (
          <nav className="top-nav" aria-label="Primary">
            {navLinks.map((link) => (
              <Link className="top-nav-link" to={link.href} key={link.href}>{link.label}</Link>
            ))}
          </nav>
        )}
      </div>

      <div className="quick-actions">
        <LanguageToggle
          isPortuguese={isPortuguese}
          label={toggleLabel}
          onToggle={onToggleLanguage}
        />
        <Avatar src={profileAvatar} alt="John" title={profileName} />
      </div>
    </header>
  );
}

export default TopBar;
