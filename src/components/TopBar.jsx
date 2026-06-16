import Avatar from "./Avatar.jsx";
import LanguageToggle from "./LanguageToggle.jsx";

function TopBar({ isPortuguese, onToggleLanguage, profileAvatar, searchPlaceholder, toggleLabel }) {
  return (
    <header className="topbar">
      <div className="brand-area">
        <div className="brand" aria-label="Social Feed">C</div>
        <label className="search" aria-label="Search">
          <span>?</span>
          <input type="search" placeholder={searchPlaceholder} />
        </label>
      </div>

      <nav className="tabs" aria-label="Main">
        <button className="tab active" title="Home">H</button>
      </nav>

      <div className="quick-actions">
        <LanguageToggle
          isPortuguese={isPortuguese}
          label={toggleLabel}
          onToggle={onToggleLanguage}
        />
        <Avatar src={profileAvatar} alt="John" title="Your profile" />
      </div>
    </header>
  );
}

export default TopBar;
