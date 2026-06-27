import FeedLayout from "../components/FeedLayout.jsx";
import PostPreview from "../components/PostPreview.jsx";
import { feedTranslations } from "../data/feedTranslations.js";
import { posts } from "../data/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";

function FeedPage({ onOpenPost }) {
  const { language, toggleLanguage } = useLanguage();
  const strings = feedTranslations[language];
  const profileAvatar = posts[0].author.avatar;
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
      profileName={strings.siteName}
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

      {feedPosts.map((post) => (
        <PostPreview post={post} onOpen={(event) => onOpenPost(post.id, event)} key={post.id} />
      ))}
    </FeedLayout>
  );
}

export default FeedPage;
