import MarianaAudioButton from "./MarianaAudioButton.jsx";

function AnswerBuilder({ activity, audioState, labels, onPlayAudio, onSelectAnswer, selectedLevel }) {
  const selectedAnswer = activity.answers.find((answer) => answer.level === selectedLevel);

  return (
    <section className="answer-builder" aria-labelledby={activity.id}>
      <div className="answer-builder-heading">
        <span>{labels.activityLabel}</span>
        <h3 id={activity.id}>{activity.prompt}</h3>
      </div>
      <div className="answer-options">
        {activity.answers.map((answer) => {
          const isSelected = selectedLevel === answer.level;

          return (
            <div className={`answer-option is-${answer.level}${isSelected ? " is-selected" : ""}`} key={answer.level}>
              <button
                className="answer-select-button"
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectAnswer(activity.id, answer.level)}
              >
                <span>{labels[answer.level]}</span>
                <p className="answer-text">{answer.text}</p>
                <p className="answer-note"><strong>{labels.coachingLabel}:</strong> {answer.note}</p>
                {isSelected && <p className="answer-selected">{labels.selectedLabel}</p>}
              </button>
              <MarianaAudioButton
                audioPath={answer.audioPath}
                audioState={audioState}
                label={`${labels.playModelAnswerLabel}: ${answer.text}`}
                onPlayAudio={onPlayAudio}
              />
            </div>
          );
        })}
      </div>
      {selectedAnswer && (
        <div className="mariana-say-it">
          <strong>{labels.sayItTitle}</strong>
          <p>{labels.sayItCopy}</p>
          <p className="mariana-say-it-line">{selectedAnswer.text}</p>
        </div>
      )}
    </section>
  );
}

export default AnswerBuilder;
