import { useCallback, useEffect, useRef, useState } from "react";

function getSpeechSynthesis() {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

function chooseVoice(speech, language) {
  return speech
    .getVoices()
    .find((voice) => voice.lang?.toLocaleLowerCase().startsWith(language.toLocaleLowerCase()));
}

function useSpeechPronunciation() {
  const [speechState, setSpeechState] = useState({ id: null, status: "idle" });
  const utteranceRef = useRef(null);

  const stopPronunciation = useCallback(() => {
    const speech = getSpeechSynthesis();
    if (speech) speech.cancel();
    utteranceRef.current = null;
    setSpeechState({ id: null, status: "idle" });
  }, []);

  const speakPronunciation = useCallback(({ id, language, text }) => {
    const speech = getSpeechSynthesis();

    if (!speech || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechState({ id, status: "unavailable" });
      return;
    }

    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.86;
    utterance.pitch = 1;
    utterance.voice = chooseVoice(speech, language) ?? null;
    utteranceRef.current = utterance;
    setSpeechState({ id, status: "loading" });

    utterance.onstart = () => {
      if (utteranceRef.current === utterance) {
        setSpeechState({ id, status: "playing" });
      }
    };

    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setSpeechState({ id, status: "completed" });
      }
    };

    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setSpeechState({ id, status: "unavailable" });
      }
    };

    speech.speak(utterance);
  }, []);

  useEffect(() => () => stopPronunciation(), [stopPronunciation]);

  return {
    speechState,
    speakPronunciation,
    stopPronunciation
  };
}

export default useSpeechPronunciation;
