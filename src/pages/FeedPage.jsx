import { Link } from "react-router-dom";
import FeedLayout from "../components/FeedLayout.jsx";
import MarianaAvatar from "../components/mariana/MarianaAvatar.jsx";
import PostPreview from "../components/PostPreview.jsx";
import { feedTranslations } from "../data/feedTranslations.js";
import { marianaContent } from "../data/marianaContent.js";
import { posts } from "../data/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";

function FeedPage({ onOpenPost }) {
  const { language, toggleLanguage } = useLanguage();
  const strings = feedTranslations[language];
  const profileAvatar = posts[0].author.avatar;
  const marianaStrings = marianaContent[language];
  const feedPosts = posts.map((post) => ({
    ...post,
    ariaLabel: strings[post.feed.ariaLabelKey],
    authorAlt: post.author.avatarAlt,
    authorAvatar: post.author.avatar,
    authorName: strings[post.feed.authorNameKey],
    copy: strings[post.feed.copyKey],
    coverAlt: post.feed.coverAltKey ? strings[post.feed.coverAltKey] : undefined,
    coverImage: post.feed.coverImage,
    openLabel: strings[post.feed.openLabelKey],
    subtitle: strings[post.feed.subtitleKey]
  }));

  return (
    <FeedLayout
      isPortuguese={language === "pt"}
      onToggleLanguage={toggleLanguage}
      profileAvatar={profileAvatar}
      profileName="Conversante"
      toggleLabel={strings.toggle}
    >
      <section className="feed-intro" aria-labelledby="feed-title">
        <p className="feed-kicker">{strings.kicker}</p>
        <h1 id="feed-title">{strings.feedTitle}</h1>
        <p>{strings.feedIntro}</p>
        <div className="feed-highlights" aria-label={strings.highlightsLabel}>
          <span>{strings.highlightStories}</span>
          <span>{strings.highlightTranslations}</span>
          <span>{strings.highlightVocabulary}</span>
        </div>
      </section>

      <aside className="character-rail" aria-label={language === "pt" ? "Personagens" : "Characters"}>
        <Link className="character-rail-item" to="/day/1" aria-label={language === "pt" ? "Abrir as hist\u00f3rias de John" : "Open John's stories"} data-tooltip="John">
          <img src={profileAvatar} alt="" />
        </Link>
        <Link className="character-rail-item" to="/mariana" aria-label={marianaStrings.feedAria} data-tooltip="Mariana">
          <MarianaAvatar className="character-rail-avatar" />
        </Link>
        <div className="character-rail-item is-coming-soon" role="button" aria-disabled="true" tabIndex="0" data-tooltip={language === "pt" ? "Em breve" : "Soon"}>
          <span className="mystery-avatar" aria-hidden="true" />
        </div>
      </aside>

      <Link className="post-preview mariana-feed-preview" to="/mariana" aria-label={marianaStrings.feedAria}>
        <article className="post mariana-preview-card">
          <div className="mariana-preview-header">
            <MarianaAvatar className="mariana-mini-avatar" />
            <div>
              <h2>{marianaStrings.feedTitle}</h2>
              <p>{marianaStrings.feedSubtitle}</p>
            </div>
          </div>
          <p className="post-copy">{marianaStrings.feedCopy}</p>
          <div className="mariana-preview-practice">
            <span>Sorry, can you repeat that?</span>
            <span>Let me think for a second.</span>
          </div>
          <div className="post-open">{marianaStrings.feedOpen}</div>
        </article>
      </Link>

      {feedPosts.map((post) => (
        <PostPreview post={post} onOpen={(event) => onOpenPost(post.id, event)} key={post.id} />
      ))}
    </FeedLayout>
  );
}

export default FeedPage;
