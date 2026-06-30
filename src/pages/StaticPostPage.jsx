import { Link } from "react-router-dom";
import LanguageToggle from "../components/LanguageToggle.jsx";
import PostHeader from "../components/PostHeader.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const staticPageStrings = {
  en: {
    ankiDeckLabel: "Download Anki deck",
    ankiDeckTitle: "Anki deck for this post",
    backToFeed: "Back to feed",
    conversationTitle: "Full conversation",
    downloadLabel: "Print / save PDF",
    interactiveLabel: "Open interactive chat",
    noteLabel: "Language note",
    pageKicker: "Static lesson page",
    translationLabel: "Portuguese",
    vocabularyTitle: "Vocabulary in this story"
  },
  pt: {
    ankiDeckLabel: "Baixar deck do Anki",
    ankiDeckTitle: "Deck do Anki deste post",
    backToFeed: "Voltar para o feed",
    conversationTitle: "Conversa completa",
    downloadLabel: "Imprimir / salvar PDF",
    interactiveLabel: "Abrir chat interativo",
    noteLabel: "Nota de idioma",
    pageKicker: "P\u00e1gina est\u00e1tica da li\u00e7\u00e3o",
    translationLabel: "Portugu\u00eas",
    vocabularyTitle: "Vocabul\u00e1rio desta hist\u00f3ria"
  }
};

function getLocalizedStoryArray(value, language) {
  if (Array.isArray(value)) return value;
  return value?.[language] ?? value?.pt ?? value?.en ?? [];
}

function stripNoteMarkup(value) {
  return String(value ?? "").replaceAll("***", "");
}

function normalizeVocabularyValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function isUsefulVocabularyEntry(word, translation) {
  const normalizedWord = normalizeVocabularyValue(word);
  const normalizedTranslations = String(translation ?? "")
    .split("/")
    .map(normalizeVocabularyValue)
    .filter(Boolean);

  return normalizedWord && !normalizedTranslations.includes(normalizedWord);
}

function getVocabularyEntries(wordTranslations) {
  return Object.entries(wordTranslations ?? {})
    .filter(([word, translation]) => isUsefulVocabularyEntry(word, translation))
    .sort(([wordA], [wordB]) => wordA.localeCompare(wordB))
    .map(([word, translation]) => ({ word, translation }));
}

function StaticPostPage({ nextPost, post, previousPost }) {
  const { language, toggleLanguage } = useLanguage();
  const strings = post.story.translations[language];
  const staticStrings = staticPageStrings[language];
  const notes = getLocalizedStoryArray(post.story.languageNotes, language);
  const noteDetails = getLocalizedStoryArray(post.story.languageNoteDetails, language);
  const vocabularyEntries = getVocabularyEntries(post.story.wordTranslations);
  const ankiDeckHref = `/anki/${post.id}.apkg`;

  function printPage() {
    window.print();
  }

  return (
    <main className="static-post-page">
      <div className="post-page-actions static-post-actions">
        <Link className="back-link" to="/">{staticStrings.backToFeed}</Link>
        <div className="static-post-toolbar">
          <Link className="static-post-secondary-link" to={post.href}>{staticStrings.interactiveLabel}</Link>
          <a className="static-post-anki-link" href={ankiDeckHref} download>{staticStrings.ankiDeckLabel}</a>
          <LanguageToggle
            isPortuguese={language === "pt"}
            label={strings.toggle}
            onToggle={toggleLanguage}
          />
          <button className="static-post-print" type="button" onClick={printPage}>{staticStrings.downloadLabel}</button>
        </div>
      </div>

      <article className="post static-post-sheet">
        <p className="static-post-kicker">{staticStrings.pageKicker}</p>
        <PostHeader
          avatar={post.author.avatar}
          avatarAlt={post.author.avatarAlt}
          title={strings.title}
          subtitle={strings.subtitle}
        />
        <p className="post-copy static-post-intro">{strings.intro}</p>

        <section className="static-download-panel" aria-labelledby="static-anki-title">
          <div>
            <h2 id="static-anki-title">{staticStrings.ankiDeckTitle}</h2>
            <p>{vocabularyEntries.length} cards from this post&apos;s vocabulary and sentence context.</p>
          </div>
          <a className="static-post-anki-link is-primary" href={ankiDeckHref} download>{staticStrings.ankiDeckLabel}</a>
        </section>

        {post.feed.coverImage && (
          <img
            className="static-post-cover"
            src={post.feed.coverImage}
            alt=""
            width="960"
            height="640"
            loading="eager"
            decoding="async"
          />
        )}

        <section className="static-post-section" aria-labelledby="static-conversation-title">
          <h2 id="static-conversation-title">{staticStrings.conversationTitle}</h2>
          <ol className="static-transcript-list">
            {post.story.conversation.map((message, index) => (
              <li className={`static-transcript-item ${message.className}`} key={`${message.speaker}-${index}`}>
                <div className="static-transcript-message">
                  <strong>{message.speaker}</strong>
                  <p>{message.text}</p>
                </div>
                <div className="static-transcript-translation">
                  <span>{staticStrings.translationLabel}</span>
                  <p>{post.story.conversationTranslations[index]}</p>
                </div>
                {notes[index] && (
                  <aside className="static-transcript-note">
                    <strong>{staticStrings.noteLabel}</strong>
                    <p>{stripNoteMarkup(notes[index])}</p>
                    {noteDetails[index] && <p>{stripNoteMarkup(noteDetails[index])}</p>}
                  </aside>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className="static-post-section" aria-labelledby="static-vocabulary-title">
          <h2 id="static-vocabulary-title">{staticStrings.vocabularyTitle}</h2>
          <dl className="static-vocabulary-list">
            {vocabularyEntries.map(({ word, translation }) => (
              <div className="static-vocabulary-item" key={word}>
                <dt>{word}</dt>
                <dd>{translation}</dd>
              </div>
            ))}
          </dl>
        </section>

        {(previousPost || nextPost) && (
          <nav className="story-navigation static-post-navigation" aria-label={strings.storyNavigationLabel}>
            {previousPost ? (
              <Link className="story-navigation-link is-previous" to={`${previousPost.href}/static`}>
                <span>{strings.previousStory}</span>
                <strong>{previousPost.tripLabel}</strong>
              </Link>
            ) : <span />}
            {nextPost && (
              <Link className="story-navigation-link is-next" to={`${nextPost.href}/static`}>
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

export default StaticPostPage;
