import Avatar from "./Avatar.jsx";
import MobileBar from "./MobileBar.jsx";
import TopBar from "./TopBar.jsx";

function FeedLayout({
  children,
  isPortuguese,
  onToggleLanguage,
  profileAvatar,
  profileName,
  searchPlaceholder,
  toggleLabel
}) {
  return (
    <>
      <TopBar
        isPortuguese={isPortuguese}
        onToggleLanguage={onToggleLanguage}
        profileAvatar={profileAvatar}
        searchPlaceholder={searchPlaceholder}
        toggleLabel={toggleLabel}
      />

      <main className="shell">
        <aside className="left-rail">
          <section className="menu-group" aria-label="Shortcuts">
            <button className="menu-item">
              <Avatar src={profileAvatar} alt="John" className="small" />
              <strong>{profileName}</strong>
            </button>
          </section>
        </aside>

        <section className="feed" aria-label="Feed">
          {children}
        </section>
      </main>

      <MobileBar />
    </>
  );
}

export default FeedLayout;
