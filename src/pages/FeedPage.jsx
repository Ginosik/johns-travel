import { useEffect, useState } from "react";
import johnAvatar from "../../assets/John.png";
import Composer from "../components/Composer.jsx";
import FeedLayout from "../components/FeedLayout.jsx";
import PostPreview from "../components/PostPreview.jsx";
import { feedTranslations } from "../data/feedTranslations.js";
import { posts } from "../data/posts.js";

function FeedPage({ onOpenDay1 }) {
  const [language, setLanguage] = useState("en");
  const [composerDrafting, setComposerDrafting] = useState(false);
  const strings = feedTranslations[language];
  const feedPosts = posts.map((post) => ({
    ...post,
    ariaLabel: strings[post.ariaLabelKey],
    authorName: strings[post.authorNameKey],
    copy: strings[post.copyKey],
    openLabel: strings[post.openLabelKey],
    subtitle: strings[post.subtitleKey]
  }));

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  }, [language]);

  return (
    <FeedLayout
      isPortuguese={language === "pt"}
      onToggleLanguage={() => setLanguage(language === "en" ? "pt" : "en")}
      profileAvatar={johnAvatar}
      profileName={strings.profileName}
      searchPlaceholder={strings.search}
      toggleLabel={strings.toggle}
    >
      <Composer
        avatar={johnAvatar}
        isDrafting={composerDrafting}
        onStartDraft={() => setComposerDrafting(true)}
        photoLabel={strings.photo}
        prompt={composerDrafting ? strings.composerDraft : strings.composer}
      />

      {feedPosts.map((post) => (
        <PostPreview post={post} onOpen={post.id === "day-1" ? onOpenDay1 : undefined} key={post.id} />
      ))}
    </FeedLayout>
  );
}

export default FeedPage;
