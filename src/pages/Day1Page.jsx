import { useCallback, useEffect, useRef, useState } from "react";
import johnAvatar from "../../assets/John.png";
import nickyAvatar from "../../assets/Nicky.png";
import ConversationMessage from "../components/ConversationMessage.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import PostHeader from "../components/PostHeader.jsx";
import TypingMessage from "../components/TypingMessage.jsx";
import { conversation, day1Translations, wordTranslations } from "../data/day1Content.js";
import { getDay1AudioPath } from "../utils/day1Audio.js";

function useMessageAudio(initialPlayback = null) {
  const [playingPath, setPlayingPath] = useState(null);
  const currentAudioRef = useRef(null);
  const pendingAutoplayRef = useRef(null);

  const stopCurrentAudio = useCallback(() => {
    if (!currentAudioRef.current) return;

    currentAudioRef.current.pause();
    currentAudioRef.current.currentTime = 0;
    currentAudioRef.current = null;
    setPlayingPath(null);
  }, []);

  const playMessageAudio = useCallback((audioPath, audio = new Audio(audioPath)) => {
    stopCurrentAudio();

    currentAudioRef.current = audio;
    setPlayingPath(audioPath);

    audio.addEventListener("ended", () => setPlayingPath(null), { once: true });
    audio.addEventListener("error", () => setPlayingPath(null), { once: true });

    return audio.play().then(() => true).catch(() => {
      setPlayingPath(null);
      return false;
    });
  }, [stopCurrentAudio]);

  const playPendingAutoplay = useCallback(() => {
    if (!pendingAutoplayRef.current) return;

    const { audioPath, audio } = pendingAutoplayRef.current;
    pendingAutoplayRef.current = null;
    playMessageAudio(audioPath, audio);
  }, [playMessageAudio]);

  const waitForAudioUnlock = useCallback((audioPath, audio = new Audio(audioPath)) => {
    pendingAutoplayRef.current = { audioPath, audio };
    document.addEventListener("pointerdown", playPendingAutoplay, { once: true, capture: true });
    document.addEventListener("keydown", playPendingAutoplay, { once: true, capture: true });
  }, [playPendingAutoplay]);

  const playMessageAudioWhenPossible = useCallback((audioPath) => {
    const audio = new Audio(audioPath);

    playMessageAudio(audioPath, audio).then((started) => {
      if (!started) {
        waitForAudioUnlock(audioPath, audio);
      }
    });
  }, [playMessageAudio, waitForAudioUnlock]);

  useEffect(() => {
    if (!initialPlayback) return;

    currentAudioRef.current = initialPlayback.audio;
    setPlayingPath(initialPlayback.audioPath);
    initialPlayback.audio.addEventListener("ended", () => setPlayingPath(null), { once: true });
    initialPlayback.audio.addEventListener("error", () => setPlayingPath(null), { once: true });
  }, [initialPlayback]);

  useEffect(() => stopCurrentAudio, [stopCurrentAudio]);

  return {
    playMessageAudio,
    playMessageAudioWhenPossible,
    playingPath,
    stopCurrentAudio
  };
}

function getMessageAvatar(message) {
  const isNicky = message.speaker === "Nicky";

  return {
    className: `small${isNicky ? " nick-avatar" : ""}`,
    src: isNicky ? nickyAvatar : johnAvatar
  };
}

function Day1Page({ initialPlayback = null, onBack }) {
  const [language, setLanguage] = useState("en");
  const [hasStarted, setHasStarted] = useState(Boolean(initialPlayback));
  const [nextMessageIndex, setNextMessageIndex] = useState(initialPlayback ? 1 : 0);
  const latestMessageRef = useRef(null);
  const strings = day1Translations[language];
  const { playMessageAudio, playMessageAudioWhenPossible, playingPath } = useMessageAudio(initialPlayback);
  const isComplete = nextMessageIndex >= conversation.length;
  const visibleMessages = conversation.slice(0, nextMessageIndex);
  const nextTypingMessage = hasStarted && !isComplete ? conversation[nextMessageIndex] : null;
  const nextTypingAvatar = nextTypingMessage ? getMessageAvatar(nextTypingMessage) : null;

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  }, [language]);

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [nextMessageIndex]);

  const advanceConversation = useCallback(() => {
    if (isComplete) return;

    const message = conversation[nextMessageIndex];
    const audioPath = getDay1AudioPath(message, nextMessageIndex);
    setHasStarted(true);
    setNextMessageIndex((index) => index + 1);
    playMessageAudioWhenPossible(audioPath);
  }, [isComplete, nextMessageIndex, playMessageAudioWhenPossible]);

  useEffect(() => {
    function handleKeydown(event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (event.target.closest("a, button, input, textarea, select")) return;

      event.preventDefault();
      advanceConversation();
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [advanceConversation]);

  return (
    <>
      <main className="post-page">
        <div className="post-page-actions">
          <a className="back-link" href="/" onClick={onBack}>{strings.backLink}</a>
          <LanguageToggle
            isPortuguese={language === "pt"}
            label={strings.toggle}
            onToggle={() => setLanguage(language === "en" ? "pt" : "en")}
          />
        </div>

        <article className="post detail-post">
          <PostHeader
            avatar={johnAvatar}
            avatarAlt="John"
            title={strings.title}
            subtitle={strings.subtitle}
          />
          <p className="post-copy">{strings.intro}</p>

          <section className="conversation-record" aria-label="Conversation record">
            {visibleMessages.map((message, index) => {
              const audioPath = getDay1AudioPath(message, index);
              const avatar = getMessageAvatar(message);

              return (
                <ConversationMessage
                  audioPath={audioPath}
                  avatarClassName={avatar.className}
                  avatarSrc={avatar.src}
                  isPlaying={playingPath === audioPath}
                  message={message}
                  onPlay={(path) => playMessageAudio(path)}
                  wordTranslations={wordTranslations}
                  ref={index === visibleMessages.length - 1 ? latestMessageRef : undefined}
                  key={`${message.speaker}-${index}`}
                />
              );
            })}
            {nextTypingMessage && (
              <TypingMessage
                avatarClassName={nextTypingAvatar.className}
                avatarSrc={nextTypingAvatar.src}
                message={nextTypingMessage}
              />
            )}
          </section>

          <div className="conversation-controls">
            <button
              className="continue-button"
              type="button"
              disabled={isComplete}
              onClick={advanceConversation}
            >
              {isComplete ? strings.complete : strings.continue}
            </button>
          </div>
        </article>
      </main>
    </>
  );
}

export default Day1Page;
