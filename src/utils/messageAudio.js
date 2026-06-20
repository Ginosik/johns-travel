export function createSpeakerSequenceAudioPathGetter(conversation, resolveAudioAsset) {
  return (message, messageIndex) => {
    const sequence = conversation
      .slice(0, messageIndex + 1)
      .filter((item) => item.speaker === message.speaker).length;

    return resolveAudioAsset({
      message,
      messageIndex,
      sequence,
      paddedSequence: String(sequence).padStart(2, "0")
    });
  };
}
