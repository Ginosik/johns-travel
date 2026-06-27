import { useState } from "react";

function ConversationTranslation({ detail, isNew, lessLabel = "Less", message, missingText, moreLabel = "More?", note, noteLabel, translation }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const showDetail = detail && isDetailOpen;

  return (
    <div className={`translation-line ${message.className}${isNew ? " is-new" : ""}`}>
      <strong>{message.speaker}</strong>
      {translation ? (
        <p>{translation}</p>
      ) : (
        <p className="translation-missing" role="status">{missingText}</p>
      )}
      {note && (
        <div className="translation-note">
          <span>{noteLabel}</span>
          <p>{note}</p>
          {detail && (
            <>
              <button
                className="translation-note-more"
                type="button"
                aria-expanded={isDetailOpen}
                onClick={() => setIsDetailOpen((isOpen) => !isOpen)}
              >
                {isDetailOpen ? lessLabel : moreLabel}
              </button>
              {showDetail && <p className="translation-note-detail">{detail}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ConversationTranslation;
