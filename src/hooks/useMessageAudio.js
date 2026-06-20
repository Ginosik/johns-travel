import { useCallback, useEffect, useRef, useState } from "react";

function useMessageAudio(initialPlayback = null) {
  const [playingPath, setPlayingPath] = useState(null);
  const [audioState, setAudioState] = useState({ audioPath: null, status: "idle" });
  const currentAudioRef = useRef(null);
  const pendingAutoplayRef = useRef(null);

  const clearPendingAutoplay = useCallback(() => {
    pendingAutoplayRef.current = null;
  }, []);

  const stopCurrentAudio = useCallback(() => {
    if (!currentAudioRef.current) return;

    currentAudioRef.current.pause();
    currentAudioRef.current.currentTime = 0;
    currentAudioRef.current = null;
    setPlayingPath(null);
    setAudioState({ audioPath: null, status: "idle" });
  }, []);

  const playMessageAudio = useCallback((audioPath, audio = new Audio(audioPath)) => {
    stopCurrentAudio();

    audio.preload = "none";
    currentAudioRef.current = audio;
    setAudioState({ audioPath, status: "loading" });

    const completePlayingAudio = () => {
      if (currentAudioRef.current === audio) {
        currentAudioRef.current = null;
        setPlayingPath(null);
        setAudioState({ audioPath, status: "completed" });
      }
    };

    const failPlayingAudio = () => {
      if (currentAudioRef.current === audio) {
        currentAudioRef.current = null;
        setPlayingPath(null);
        setAudioState({ audioPath, status: "error" });
      }
    };

    audio.addEventListener("ended", completePlayingAudio, { once: true });
    audio.addEventListener("error", failPlayingAudio, { once: true });

    return audio.play().then(() => {
      if (currentAudioRef.current === audio) {
        setPlayingPath(audioPath);
        setAudioState({ audioPath, status: "playing" });
      }
      return true;
    }).catch(() => {
      if (currentAudioRef.current === audio) {
        setPlayingPath(null);
        setAudioState({ audioPath, status: "waiting" });
      }
      return false;
    });
  }, [stopCurrentAudio]);

  const playPendingAutoplay = useCallback(() => {
    if (!pendingAutoplayRef.current) return;

    const { audioPath, audio } = pendingAutoplayRef.current;
    clearPendingAutoplay();
    playMessageAudio(audioPath, audio);
  }, [clearPendingAutoplay, playMessageAudio]);

  const waitForAudioUnlock = useCallback((audioPath, audio = new Audio(audioPath)) => {
    pendingAutoplayRef.current = { audioPath, audio };
    setAudioState({ audioPath, status: "waiting" });
    document.addEventListener("pointerdown", playPendingAutoplay, { once: true, capture: true });
    document.addEventListener("keydown", playPendingAutoplay, { once: true, capture: true });
  }, [playPendingAutoplay]);

  const playMessageAudioWhenPossible = useCallback((audioPath) => {
    const audio = new Audio(audioPath);

    playMessageAudio(audioPath, audio).then((started) => {
      if (!started) waitForAudioUnlock(audioPath, audio);
    });
  }, [playMessageAudio, waitForAudioUnlock]);

  useEffect(() => {
    if (!initialPlayback) return;

    const { audio, audioPath } = initialPlayback;
    currentAudioRef.current = audio;
    setPlayingPath(audioPath);
    setAudioState({ audioPath, status: "playing" });

    const clearPlayingAudio = () => {
      if (currentAudioRef.current === audio) {
        currentAudioRef.current = null;
        setPlayingPath(null);
        setAudioState({ audioPath, status: "completed" });
      }
    };

    audio.addEventListener("ended", clearPlayingAudio, { once: true });
    const failPlayingAudio = () => {
      if (currentAudioRef.current === audio) {
        currentAudioRef.current = null;
        setPlayingPath(null);
        setAudioState({ audioPath, status: "error" });
      }
    };

    audio.addEventListener("error", failPlayingAudio, { once: true });

    return () => {
      audio.removeEventListener("ended", clearPlayingAudio);
      audio.removeEventListener("error", failPlayingAudio);
    };
  }, [initialPlayback]);

  useEffect(() => () => {
    clearPendingAutoplay();
    stopCurrentAudio();
  }, [clearPendingAutoplay, stopCurrentAudio]);

  return {
    audioState,
    playMessageAudio,
    playMessageAudioWhenPossible,
    playingPath,
    stopCurrentAudio
  };
}

export default useMessageAudio;
