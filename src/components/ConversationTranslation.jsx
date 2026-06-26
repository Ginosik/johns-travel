function ConversationTranslation({ isNew, message, missingText, note, noteLabel, translation }) {
  return (
    <div className={`translation-line ${message.className}${isNew ? " is-new" : ""}`}>
      <strong>{message.speaker}</strong>
      {translation ? (
        <p>{translation}</p>
      ) : (
        <p className="translation-missing" role="status">{missingText}</p>
      )}
      {note && (
        <p className="translation-note">
          <span>{noteLabel}</span>
          {note}
        </p>
      )}
    </div>
  );
}

export default ConversationTranslation;
