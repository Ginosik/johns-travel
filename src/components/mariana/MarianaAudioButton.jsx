function getStatusClass(status) {
  if (status === "playing") return " is-playing";
  if (status === "loading") return " is-loading";
  if (status === "error") return " is-error";
  return "";
}

function MarianaAudioButton({ audioPath, audioState, label, onPlayAudio }) {
  if (!audioPath) return null;

  const isCurrentAudio = audioState?.audioPath === audioPath;
  const status = isCurrentAudio ? audioState.status : "idle";

  return (
    <button
      className={`mariana-audio-button${getStatusClass(status)}`}
      type="button"
      aria-label={label}
      onClick={() => onPlayAudio(audioPath)}
    />
  );
}

export default MarianaAudioButton;
