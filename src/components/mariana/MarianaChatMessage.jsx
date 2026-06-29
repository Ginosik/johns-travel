import { useState } from "react";
import MarianaAudioButton from "./MarianaAudioButton.jsx";

const SPEAKER_AVATARS = {
  Mariana: { fallback: "M", src: "/images/mariana-avatar.png" },
  Teacher: { fallback: "T", src: "/images/teacher-avatar.png" }
};

function SpeakerAvatar({ speaker }) {
  const avatar = SPEAKER_AVATARS[speaker] ?? { fallback: speaker.charAt(0), src: null };
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div className="mariana-chat-avatar" aria-hidden="true">
      {avatar.src && !hasImageError ? (
        <img src={avatar.src} alt="" onError={() => setHasImageError(true)} />
      ) : (
        avatar.fallback
      )}
    </div>
  );
}

function MarianaChatMessage({ audioState, labels, message, onPlayAudio }) {
  const isMariana = message.speaker === "Mariana";

  return (
    <div className={`mariana-chat-message${isMariana ? " is-mariana" : ""}`}>
      <SpeakerAvatar speaker={message.speaker} />
      <div className="mariana-chat-bubble">
        <div className="mariana-chat-meta">
          <strong>{message.speaker}</strong>
          <MarianaAudioButton
            audioPath={message.audioPath}
            audioState={audioState}
            label={`${labels.playAudioLabel}: ${message.text}`}
            onPlayAudio={onPlayAudio}
          />
        </div>
        <p>{message.text}</p>
      </div>
    </div>
  );
}

export default MarianaChatMessage;
