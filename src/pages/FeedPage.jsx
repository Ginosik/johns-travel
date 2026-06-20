import { useState } from "react";
import Composer from "../components/Composer.jsx";
import FeedLayout from "../components/FeedLayout.jsx";
import PostPreview from "../components/PostPreview.jsx";
import { feedTranslations } from "../data/feedTranslations.js";
import { posts } from "../data/posts.js";
import { useLanguage } from "../context/LanguageContext.jsx";

function FeedPage({ onOpenPost }) {
  const [composerDrafting, setComposerDrafting] = useState(false);
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
      profileName={strings.profileName}
      searchPlaceholder={strings.search}
      toggleLabel={strings.toggle}
    >
      <Composer
        avatar={profileAvatar}
        isDrafting={composerDrafting}
        onStartDraft={() => setComposerDrafting(true)}
        photoLabel={strings.photo}
        prompt={composerDrafting ? strings.composerDraft : strings.composer}
      />

      {feedPosts.map((post) => (
        <PostPreview post={post} onOpen={(event) => onOpenPost(post.id, event)} key={post.id} />
      ))}
    </FeedLayout>
  );
}

export default FeedPage;
