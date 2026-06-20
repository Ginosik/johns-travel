import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ConversationMessage from "../components/ConversationMessage.jsx";
import ConversationTranslation from "../components/ConversationTranslation.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import PostHeader from "../components/PostHeader.jsx";
import TypingMessage from "../components/TypingMessage.jsx";
import useMessageAudio from "../hooks/useMessageAudio.js";
import { useLanguage } from "../context/LanguageContext.jsx";

const TRANSLATION_PREFERENCE_KEY = "johns-travel:translation-open";

function getInitialTranslationPreference() {
  try {
    return window.sessionStorage.getItem(TRANSLATION_PREFERENCE_KEY) === "true";
  } catch {
    return false;
  }
}

function DayPostPage({ initialPlayback = null, nextPost, post, previousPost }) {
  const [hasStarted, setHasStarted] = useState(Boolean(initialPlayback));
  const [nextMessageIndex, setNextMessageIndex] = useState(initialPlayback ? 1 : 0);
  const [isTranslationOpen, setIsTranslationOpen] = useState(getInitialTranslationPreference);
  const latestMessageRef = useRef(null);
  const translationToggleRef = useRef(null);
  const translationToggleTopRef = useRef(null);
  const { language, toggleLanguage } = useLanguage();
  const story = post.story;
  const strings = story.translations[language];
  const { audioState, playMessageAudio, playMessageAudioWhenPossible, playingPath } = useMessageAudio(initialPlayback);
  const isComplete = nextMessageIndex >= story.conversation.length;
  const visibleMessages = story.conversation.slice(0, nextMessageIndex);
  const nextTypingMessage = hasStarted && !isComplete ? story.conversation[nextMessageIndex] : null;
  const nextTypingAvatar = nextTypingMessage ? story.avatars[nextTypingMessage.speaker] : null;

  useEffect(() => {
    try {
      window.sessionStorage.setItem(TRANSLATION_PREFERENCE_KEY, String(isTranslationOpen));
    } catch {
      // The panel still works when storage is unavailable.
    }
  }, [isTranslationOpen]);

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [nextMessageIndex]);

  useLayoutEffect(() => {
    if (translationToggleTopRef.current === null || !translationToggleRef.current) return;
    const nextTop = translationToggleRef.current.getBoundingClientRect().top;
    window.scrollBy(0, nextTop - translationToggleTopRef.current);
    translationToggleTopRef.current = null;
  }, [isTranslationOpen]);

  function toggleTranslation() {
    translationToggleTopRef.current = translationToggleRef.current?.getBoundingClientRect().top ?? null;
    setIsTranslationOpen((isOpen) => !isOpen);
  }

  useEffect(() => {
    if (!isTranslationOpen) return undefined;

    function closeTranslationWithEscape(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      translationToggleTopRef.current = translationToggleRef.current?.getBoundingClientRect().top ?? null;
      setIsTranslationOpen(false);
      window.requestAnimationFrame(() => translationToggleRef.current?.focus());
    }

    document.addEventListener("keydown", closeTranslationWithEscape);
    return () => document.removeEventListener("keydown", closeTranslationWithEscape);
  }, [isTranslationOpen]);

  const advanceConversation = useCallback(() => {
    if (isComplete) return;

    const message = story.conversation[nextMessageIndex];
    const audioPath = story.getAudioPath(message, nextMessageIndex);
    setHasStarted(true);
    setNextMessageIndex((index) => index + 1);
    playMessageAudioWhenPossible(audioPath);
  }, [isComplete, nextMessageIndex, playMessageAudioWhenPossible, story]);

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
    <main className={`post-page${isTranslationOpen ? " has-translation" : ""}`}>
      <div className="post-page-actions">
        <Link className="back-link" to="/">{strings.backLink}</Link>
        <LanguageToggle
          isPortuguese={language === "pt"}
          label={strings.toggle}
          onToggle={toggleLanguage}
        />
      </div>

      <article className="post detail-post">
        <PostHeader
          avatar={post.author.avatar}
          avatarAlt={post.author.avatarAlt}
          title={strings.title}
          subtitle={strings.subtitle}
        />
        <p className="post-copy">{strings.intro}</p>

        <div className="conversation-toolbar">
          <p
            className="conversation-progress"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax={story.conversation.length}
            aria-valuenow={visibleMessages.length}
            aria-label={strings.progressLabel
              .replace("{current}", visibleMessages.length)
              .replace("{total}", story.conversation.length)}
          >
            <strong>{visibleMessages.length}</strong> {strings.progressOf} {story.conversation.length}
          </p>
          <button
            className="translation-toggle"
            type="button"
            aria-controls="conversation-translation"
            aria-expanded={isTranslationOpen}
            onClick={toggleTranslation}
            ref={translationToggleRef}
          >
            <span aria-hidden="true">PT</span>
            {isTranslationOpen ? strings.hideTranslation : strings.showTranslation}
          </button>
        </div>

        <div className={`conversation-layout${isTranslationOpen ? " is-translation-open" : ""}`}>
          <div className="conversation-column">
            <section className="conversation-record" aria-label={strings.conversationLabel ?? "Conversation record"}>
              {visibleMessages.map((message, index) => {
                const audioPath = story.getAudioPath(message, index);
                const avatar = story.avatars[message.speaker];

                return (
                  <ConversationMessage
                    audioPath={audioPath}
                    audioLabels={{
                      error: strings.audioError,
                      loading: strings.audioLoading,
                      replay: strings.audioReplay,
                      retry: strings.audioRetry,
                      waiting: strings.audioWaiting
                    }}
                    audioStatus={audioState.audioPath === audioPath ? audioState.status : "idle"}
                    avatarClassName={avatar?.className}
                    avatarSrc={avatar?.src}
                    isPlaying={playingPath === audioPath}
                    message={message}
                    onPlay={playMessageAudio}
                    wordTranslations={story.wordTranslations}
                    ref={index === visibleMessages.length - 1 ? latestMessageRef : undefined}
                    key={`${message.speaker}-${index}`}
                  />
                );
              })}
              {nextTypingMessage && (
                <TypingMessage
                  avatarClassName={nextTypingAvatar?.className}
                  avatarSrc={nextTypingAvatar?.src}
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
          </div>

          {isTranslationOpen && (
            <ConversationTranslation
              messages={visibleMessages}
              title={strings.translationTitle}
              translations={story.conversationTranslations}
              missingText={strings.translationMissing}
              progressText={`${visibleMessages.length} ${strings.progressOf} ${story.conversation.length}`}
              waitingText={strings.translationWaiting}
            />
          )}
        </div>

        {(previousPost || nextPost) && (
          <nav className="story-navigation" aria-label={strings.storyNavigationLabel}>
            {previousPost ? (
              <Link className="story-navigation-link is-previous" to={previousPost.href}>
                <span>{strings.previousStory}</span>
                <strong>{previousPost.tripLabel}</strong>
              </Link>
            ) : <span />}
            {nextPost && (
              <Link className="story-navigation-link is-next" to={nextPost.href}>
                <span>{strings.nextStory}</span>
                <strong>{nextPost.tripLabel}</strong>
              </Link>
            )}
          </nav>
        )}
      </article>
    </main>
  );
}

export default DayPostPage;
