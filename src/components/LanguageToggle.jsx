function LanguageToggle({ isPortuguese, label, onToggle }) {
  return (
    <button
      className="language-toggle"
      type="button"
      aria-pressed={isPortuguese}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}

export default LanguageToggle;
