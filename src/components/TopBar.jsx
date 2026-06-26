import Avatar from "./Avatar.jsx";
import LanguageToggle from "./LanguageToggle.jsx";

function TopBar({ isPortuguese, onToggleLanguage, profileAvatar, profileName, toggleLabel }) {
  return (
    <header className="topbar">
      <div className="brand-area">
        <div className="brand" aria-hidden="true">JT</div>
        <strong className="brand-name">{profileName}</strong>
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
