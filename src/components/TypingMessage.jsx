import Avatar from "./Avatar.jsx";

function TypingMessage({ avatarClassName = "small", avatarSrc, message }) {
  if (!message) return null;

  return (
    <div className={`conversation-message ${message.className} typing-message`} aria-label={`${message.speaker} is typing`}>
      <Avatar src={avatarSrc} alt={message.speaker} className={avatarClassName} />
      <div className="speech typing-speech">
        <strong>{message.speaker}</strong>
        <span className="typing-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    </div>
  );
}

export default TypingMessage;
