let activeAudio = null;

export function setActiveAudio(audio) {
  if (activeAudio && activeAudio !== audio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }

  activeAudio = audio;
}

export function clearActiveAudio(audio) {
  if (activeAudio === audio) {
    activeAudio = null;
  }
}

export function stopActiveAudio() {
  if (!activeAudio) return;

  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}
