import conversanteLogo from "../../assets/conversante-logo.png";
import Avatar from "./Avatar.jsx";
import LanguageToggle from "./LanguageToggle.jsx";

function TopBar({ isPortuguese, onToggleLanguage, profileAvatar, profileName, toggleLabel }) {
  return (
    <header className="topbar">
      <div className="brand-area">
        <img className="brand-logo" src={conversanteLogo} alt={profileName} />
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
