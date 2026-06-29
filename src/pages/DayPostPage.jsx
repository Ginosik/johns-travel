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

function getLocalizedStoryArray(value, language) {
  if (Array.isArray(value)) return value;
  return value?.[language] ?? value?.pt ?? value?.en ?? [];
}

function getInitialTranslationPreference() {
  try {
    const savedPreference = window.sessionStorage.getItem(TRANSLATION_PREFERENCE_KEY);
    return savedPreference === null ? true : savedPreference === "true";
  } catch {
    return true;
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
  const languageNotes = getLocalizedStoryArray(story.languageNotes, language);
  const languageNoteDetails = getLocalizedStoryArray(story.languageNoteDetails, language);
  const nextTypingMessage = hasStarted && !isComplete ? story.conversation[nextMessageIndex] : null;
  const nextTypingAvatar = nextTypingMessage ? story.avatars[nextTypingMessage.speaker] : null;
  const continueButtonLabel = hasStarted ? strings.continue : strings.startConversation;

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

  function renderConversationMessage(message, index) {
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
      />
    );
  }

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
            <section
              className={`conversation-record${isTranslationOpen ? " has-inline-translations translation-transcript" : ""}`}
              aria-label={strings.conversationLabel ?? "Conversation record"}
              aria-live={isTranslationOpen ? "polite" : undefined}
            >
              {isTranslationOpen && (
                <aside className="conversation-translation" id="conversation-translation" aria-labelledby="translation-title">
                  <div className="translation-panel-heading">
                    <span className="translation-language" aria-hidden="true">PT</span>
                    <h2 id="translation-title">{strings.translationTitle}</h2>
                    <span className="translation-panel-progress">{visibleMessages.length} {strings.progressOf} {story.conversation.length}</span>
                  </div>
                </aside>
              )}
              {visibleMessages.length === 0 && isTranslationOpen ? (
                <div className="translation-transcript" aria-live="polite">
                  <p className="translation-waiting">{strings.translationWaiting}</p>
                </div>
              ) : visibleMessages.map((message, index) => (
                isTranslationOpen ? (
                  <div className="conversation-pair" key={`${message.speaker}-${index}`}>
                    {renderConversationMessage(message, index)}
                    <ConversationTranslation
                      isNew={index === visibleMessages.length - 1}
                      message={message}
                      missingText={strings.translationMissing}
                      moreLabel={strings.languageNoteMoreLabel}
                      lessLabel={strings.languageNoteLessLabel}
                      detail={languageNoteDetails[index]}
                      note={languageNotes[index]}
                      noteLabel={strings.languageNoteLabel}
                      translation={story.conversationTranslations[index]}
                    />
                  </div>
                ) : (
                  <div className="conversation-pair" key={`${message.speaker}-${index}`}>
                    {renderConversationMessage(message, index)}
                  </div>
                )
              ))}
              {nextTypingMessage && (
                <TypingMessage
                  avatarClassName={nextTypingAvatar?.className}
                  avatarSrc={nextTypingAvatar?.src}
                  message={nextTypingMessage}
                />
              )}
            </section>

            {isComplete ? (
              <section className="story-completion" aria-labelledby="story-completion-title">
                <p className="story-completion-kicker">{strings.complete}</p>
                <h2 id="story-completion-title">{strings.completionTitle}</h2>
                <p>{strings.completionCopy}</p>
                <div className="story-completion-actions">
                  {nextPost && (
                    <Link className="story-completion-link is-primary" to={nextPost.href}>
                      {strings.completionNextStory}
                    </Link>
                  )}
                  <Link className="story-completion-link" to="/">
                    {strings.completionBackToFeed}
                  </Link>
                </div>
              </section>
            ) : (
              <div className="conversation-controls">
                <button
                  className="continue-button"
                  type="button"
                  onClick={advanceConversation}
                >
                  {continueButtonLabel}
                </button>
              </div>
            )}
          </div>
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
