import { useEffect, useRef } from "react";

function ConversationTranslation({
  languageBadge,
  languageCode,
  meaningLabel,
  meaningNotes,
  messages,
  missingText,
  progressText,
  title,
  translations,
  transliterationLabel,
  transliterations,
  waitingText
}) {
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (!transcriptRef.current) return;
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [messages.length]);

  return (
    <aside className={`conversation-translation is-${languageCode}`} id="conversation-translation" aria-labelledby="translation-title">
      <div className="translation-panel-heading">
        <span className="translation-language" aria-hidden="true">{languageBadge}</span>
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
              <>
                <p className="translation-native" lang={languageCode}>{translations[index]}</p>
                {transliterations?.[index] && (
                  <p className="translation-transliteration">
                    <span>{transliterationLabel}</span>
                    {transliterations[index]}
                  </p>
                )}
                {meaningNotes?.[index] && (
                  <p className="translation-meaning">
                    <span>{meaningLabel}</span>
                    {meaningNotes[index]}
                  </p>
                )}
              </>
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
