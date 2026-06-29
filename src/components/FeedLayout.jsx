import TopBar from "./TopBar.jsx";

function FeedLayout({
  children,
  isPortuguese,
  navLinks,
  onToggleLanguage,
  profileAvatar,
  profileName,
  toggleLabel
}) {
  return (
    <>
      <TopBar
        isPortuguese={isPortuguese}
        navLinks={navLinks}
        onToggleLanguage={onToggleLanguage}
        profileAvatar={profileAvatar}
        profileName={profileName}
        toggleLabel={toggleLabel}
      />

      <main className="shell">
        <section className="feed" aria-label="Feed">
          {children}
        </section>
      </main>
    </>
  );
}

export default FeedLayout;
