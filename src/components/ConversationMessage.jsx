import { forwardRef } from "react";
import Avatar from "./Avatar.jsx";
import HoverableText from "./HoverableText.jsx";

const ConversationMessage = forwardRef(function ConversationMessage({
  audioPath,
  audioLabels,
  audioStatus = "idle",
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
          className={`message-play-button${isPlaying ? " is-playing" : ""} is-${audioStatus}`}
          type="button"
          aria-label={audioStatus === "error" ? audioLabels.retry : audioLabels.replay.replace("{speaker}", message.speaker)}
          aria-busy={audioStatus === "loading"}
          onClick={() => onPlay(audioPath)}
        />
        {["loading", "waiting", "error"].includes(audioStatus) && (
          <span className={`message-audio-feedback is-${audioStatus}`} role="status">
            {audioLabels[audioStatus]}
          </span>
        )}
      </div>
    </div>
  );
});

export default ConversationMessage;
