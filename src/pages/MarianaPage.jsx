import { useEffect, useRef, useState } from "react";
import FeedLayout from "../components/FeedLayout.jsx";
import MarianaAvatar from "../components/mariana/MarianaAvatar.jsx";
import MarianaLesson from "../components/mariana/MarianaLesson.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { marianaContent } from "../data/marianaContent.js";
import { posts } from "../data/posts.js";
import useMessageAudio from "../hooks/useMessageAudio.js";
import { trackEvent } from "../utils/analytics.js";

const PROGRESS_STORAGE_KEY = "conversante:mariana-progress";

function readProgress() {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function MarianaPage() {
  const { language, toggleLanguage } = useLanguage();
  const strings = marianaContent[language];
  const profileAvatar = posts[0].author.avatar;
  const [progress, setProgress] = useState(readProgress);
  const { audioState, playMessageAudioWhenPossible } = useMessageAudio();
  const hasTrackedOpen = useRef(false);

  useEffect(() => {
    if (hasTrackedOpen.current) return;
    hasTrackedOpen.current = true;
    trackEvent("mariana_opened", { language, lesson_count: strings.lessons.length });
  }, [language, strings.lessons.length]);

  useEffect(() => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  function selectAnswer(lessonId, activityId, level) {
    setProgress((currentProgress) => {
      const previousLevel = currentProgress[lessonId]?.[activityId];
      if (!previousLevel) {
        trackEvent("mariana_activity_completed", { lesson_id: lessonId, activity_id: activityId, selected_level: level });
      }

      return {
        ...currentProgress,
        [lessonId]: {
          ...(currentProgress[lessonId] ?? {}),
          [activityId]: level
        }
      };
    });
  }

  function getLessonCompletion(lesson) {
    const activities = lesson.steps.filter((step) => step.type === "activity");
    const completed = activities.filter((step) => progress[lesson.id]?.[step.activity.id]).length;
    return { completed, total: activities.length };
  }

  function trackCtaClick(location) {
    trackEvent("mariana_cta_clicked", {
      destination: strings.ctaHref.includes("wa.me") ? "whatsapp" : strings.ctaHref.startsWith("mailto:") ? "email" : "url",
      language,
      location
    });
  }

  return (
    <FeedLayout
      isPortuguese={language === "pt"}
      onToggleLanguage={toggleLanguage}
      profileAvatar={profileAvatar}
      profileName="Conversante"
      toggleLabel={language === "pt" ? "English" : "Portuguese"}
    >
      <article className="mariana-page">
        <section className="mariana-hero" aria-labelledby="mariana-title">
          <div className="mariana-hero-copy">
            <p className="feed-kicker">{strings.pageKicker}</p>
            <h1 id="mariana-title">{strings.pageTitle}</h1>
            <p>{strings.pageIntro}</p>
            <a className="mariana-cta-link" href={strings.ctaHref} target="_blank" rel="noreferrer" onClick={() => trackCtaClick("hero")}>{strings.ctaButton}</a>
          </div>
          <MarianaAvatar />
        </section>

        <section className="mariana-lesson-list" aria-labelledby="mariana-lessons-title">
          <div>
            <h2 id="mariana-lessons-title">{strings.lessonListTitle}</h2>
            <p>{strings.lessonListCopy}</p>
          </div>
          <div className="mariana-lesson-cards">
            {strings.lessons.map((lesson) => {
              const completion = getLessonCompletion(lesson);
              return (
                <a className="mariana-lesson-card" href={`#lesson-${lesson.slug}`} key={lesson.id}>
                  <span>{lesson.label}</span>
                  <strong>{lesson.title}</strong>
                  <p>{lesson.summary}</p>
                  <small>{strings.progressLabel}: {completion.completed}/{completion.total}</small>
                </a>
              );
            })}
          </div>
        </section>

        {strings.lessons.map((lesson) => (
          <div id={`lesson-${lesson.slug}`} key={lesson.id}>
            <MarianaLesson
              audioState={audioState}
              labels={strings}
              lesson={lesson}
              onPlayAudio={playMessageAudioWhenPossible}
              onSelectAnswer={(activityId, level) => selectAnswer(lesson.id, activityId, level)}
              progress={progress[lesson.id]}
            />
          </div>
        ))}

        <section className="mariana-rescue" aria-labelledby="rescue-title">
          <div>
            <h2 id="rescue-title">{strings.rescueTitle}</h2>
            <p>{strings.rescueCopy}</p>
          </div>
          <ul>
            {strings.lessons[0].rescuePhrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
          </ul>
        </section>

        <section className="mariana-booking" id="booking" aria-labelledby="booking-title">
          <h2 id="booking-title">{strings.ctaTitle}</h2>
          <p>{strings.ctaCopy}</p>
          <a className="mariana-primary-button" href={strings.ctaHref} target="_blank" rel="noreferrer" onClick={() => trackCtaClick("booking")}>{strings.ctaButton}</a>
        </section>
      </article>
    </FeedLayout>
  );
}

export default MarianaPage;
