import { useEffect, useRef } from "react";

function ConversationTranslation({ messages, missingText, progressText, title, translations, waitingText }) {
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages.length]);

  return (
    <aside className="conversation-translation" id="conversation-translation" aria-labelledby="translation-title">
      <div className="translation-panel-heading">
        <span className="translation-language" aria-hidden="true">PT</span>
        <h2 id="translation-title">{title}</h2>
        <span className="translation-panel-progress">{progressText}</span>
      </div>

      <div className="translation-transcript" aria-live="polite" ref={transcriptRef}>
        {messages.length === 0 ? (
          <p className="translation-waiting">{waitingText}</p>
        ) : messages.map((message, index) => (
          <div
            className={`translation-line ${message.className}${index === messages.length - 1 ? " is-new" : ""}`}
            key={`${message.speaker}-${index}`}
          >
            <strong>{message.speaker}</strong>
            {translations[index] ? (
              <p>{translations[index]}</p>
            ) : (
              <p className="translation-missing" role="status">{missingText}</p>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default ConversationTranslation;
