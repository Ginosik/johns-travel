import { useState } from "react";

function FormattedNoteText({ children, className }) {
  const value = String(children ?? "");
  const parts = value.split(/(\*\*\*[^*]+\*\*\*)/g);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("***") && part.endsWith("***")) {
          return (
            <strong key={index}>
              <em>{part.slice(3, -3)}</em>
            </strong>
          );
        }

        return part;
      })}
    </p>
  );
}

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
          <FormattedNoteText>{note}</FormattedNoteText>
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
              {showDetail && <FormattedNoteText className="translation-note-detail">{detail}</FormattedNoteText>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ConversationTranslation;
