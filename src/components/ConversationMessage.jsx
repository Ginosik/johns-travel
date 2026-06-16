import { forwardRef } from "react";
import Avatar from "./Avatar.jsx";
import HoverableText from "./HoverableText.jsx";

const ConversationMessage = forwardRef(function ConversationMessage({
  audioPath,
  avatarClassName = "small",
  avatarSrc,
  isPlaying,
  message,
  onPlay,
  wordTranslations
}, ref) {
  return (
    <div className={`conversation-message ${message.className}`} ref={ref}>
      <Avatar src={avatarSrc} alt={message.speaker} className={avatarClassName} />
      <div className="message-content">
        <div className="speech">
          <strong>{message.speaker}</strong>
          <p><HoverableText text={message.text} translations={wordTranslations} /></p>
        </div>
        <button
          className={`message-play-button${isPlaying ? " is-playing" : ""}`}
          type="button"
          aria-label={`Replay ${message.speaker}'s message`}
          onClick={() => onPlay(audioPath)}
        />
      </div>
    </div>
  );
});

export default ConversationMessage;
