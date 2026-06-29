import { useState } from "react";
import AnswerBuilder from "./AnswerBuilder.jsx";
import MarianaChatMessage from "./MarianaChatMessage.jsx";
import MarianaThought from "./MarianaThought.jsx";

function MarianaLesson({ audioState, labels, lesson, onPlayAudio, onSelectAnswer, progress }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const activityCount = lesson.steps.filter((step) => step.type === "activity").length;
  const completedCount = lesson.steps.filter((step) => step.type === "activity" && progress?.[step.activity.id]).length;

  return (
    <section className="mariana-lesson" aria-labelledby={`mariana-lesson-${lesson.id}`}>
      <div className="mariana-lesson-header">
        <span>{lesson.label}</span>
        <h2 id={`mariana-lesson-${lesson.id}`}>{lesson.title}</h2>
        <p>{lesson.storySetup}</p>
        <p className="mariana-progress">{labels.progressLabel}: {completedCount}/{activityCount} {labels.completeLabel}</p>
        <button
          className="mariana-help-button"
          type="button"
          aria-expanded={isHelpOpen}
          onClick={() => setIsHelpOpen((current) => !current)}
        >
          {isHelpOpen ? labels.hideRescueLabel : labels.freezeHelpLabel}
        </button>
        {isHelpOpen && (
          <div className="mariana-help-panel">
            <strong>{labels.rescueTitle}</strong>
            <p>{labels.rescueCopy}</p>
            <ul>
              {lesson.rescuePhrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="mariana-chat" aria-label={lesson.title}>
        {lesson.steps.map((step, index) => {
          if (step.type === "message") {
            return (
              <MarianaChatMessage
                audioState={audioState}
                labels={labels}
                message={step.message}
                onPlayAudio={onPlayAudio}
                key={`${lesson.id}-message-${index}`}
              />
            );
          }

          if (step.type === "thought") {
            return <MarianaThought label={labels.thoughtLabel} key={`${lesson.id}-thought-${index}`}>{step.text}</MarianaThought>;
          }

          return (
            <AnswerBuilder
              activity={step.activity}
              audioState={audioState}
              labels={labels}
              onPlayAudio={onPlayAudio}
              onSelectAnswer={onSelectAnswer}
              selectedLevel={progress?.[step.activity.id]}
              key={step.activity.id}
            />
          );
        })}
      </div>
    </section>
  );
}

export default MarianaLesson;
