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
  messageLanguage = "en",
  onPlay,
  onPronounce,
  pronunciation,
  wordTranslations
}, ref) {
  const pronunciationStatus = pronunciation?.status ?? "idle";
  const hasPronunciationFeedback = ["loading", "unavailable"].includes(pronunciationStatus);

  return (
    <div className={`conversation-message ${message.className}`} ref={ref}>
      <Avatar src={avatarSrc} alt={message.speaker} className={avatarClassName} />
      <div className="message-content">
        <div className="speech">
          <strong>{message.speaker}</strong>
          <p className="speech-text" lang={messageLanguage}>
            <HoverableText text={message.text} translations={wordTranslations} />
          </p>
        </div>
        {audioPath && (
          <button
            className={`message-play-button${isPlaying ? " is-playing" : ""} is-${audioStatus}`}
            type="button"
            aria-label={audioStatus === "error" ? audioLabels.retry : audioLabels.replay.replace("{speaker}", message.speaker)}
            aria-busy={audioStatus === "loading"}
            onClick={() => onPlay(audioPath)}
          />
        )}
        {pronunciation && (
          <button
            className={`message-play-button pronunciation-button${pronunciationStatus === "playing" ? " is-playing" : ""} is-${pronunciationStatus}`}
            type="button"
            aria-label={pronunciationStatus === "unavailable" ? pronunciation.labels.unavailable : pronunciation.labels.replay}
            aria-busy={pronunciationStatus === "loading"}
            onClick={() => onPronounce(pronunciation)}
          />
        )}
        {audioPath && ["loading", "waiting", "error"].includes(audioStatus) && (
          <span className={`message-audio-feedback is-${audioStatus}`} role="status">
            {audioLabels[audioStatus]}
          </span>
        )}
        {pronunciation && hasPronunciationFeedback && (
          <span className={`message-audio-feedback pronunciation-feedback is-${pronunciationStatus}`} role="status">
            {pronunciation.labels[pronunciationStatus]}
          </span>
        )}
      </div>
    </div>
  );
});

export default ConversationMessage;
