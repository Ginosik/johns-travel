import Avatar from "./Avatar.jsx";

function Composer({ avatar, isDrafting, onStartDraft, photoLabel, prompt }) {
  return (
    <section className="composer" aria-label="Create post">
      <div className="composer-top">
        <Avatar src={avatar} alt="John" />
        <button
          className="composer-input"
          type="button"
          onClick={onStartDraft}
          style={isDrafting ? { color: "#1d2129" } : undefined}
        >
          {prompt}
        </button>
      </div>
      <div className="composer-actions">
        <button className="action-btn" type="button">
          <span style={{ color: "var(--green)" }}>P</span>
          <span>{photoLabel}</span>
        </button>
      </div>
    </section>
  );
}

export default Composer;
