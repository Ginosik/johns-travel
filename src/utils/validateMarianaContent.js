function addMissingValueError(errors, value, path) {
  if (value === undefined || value === null || value === "") {
    errors.push(`${path} is required`);
  }
}

function validateAnswers(errors, answers, path) {
  const expectedLevels = ["safe", "better", "natural"];

  if (!Array.isArray(answers) || answers.length !== expectedLevels.length) {
    errors.push(`${path} must include safe, better, and natural answers`);
    return;
  }

  expectedLevels.forEach((level) => {
    const answer = answers.find((item) => item.level === level);
    if (!answer) {
      errors.push(`${path} is missing ${level} answer`);
      return;
    }

    addMissingValueError(errors, answer.text, `${path}.${level}.text`);
    addMissingValueError(errors, answer.note, `${path}.${level}.note`);
  });
}

export function validateMarianaContent(content) {
  const errors = [];
  const languages = ["en", "pt"];
  const lessonIdsByLanguage = new Map();

  languages.forEach((language) => {
    const section = content?.[language];
    const path = `marianaContent.${language}`;

    addMissingValueError(errors, section?.navLabel, `${path}.navLabel`);
    addMissingValueError(errors, section?.feedTitle, `${path}.feedTitle`);
    addMissingValueError(errors, section?.pageTitle, `${path}.pageTitle`);
    addMissingValueError(errors, section?.ctaButton, `${path}.ctaButton`);
    addMissingValueError(errors, section?.ctaHref, `${path}.ctaHref`);
    addMissingValueError(errors, section?.freezeHelpLabel, `${path}.freezeHelpLabel`);
    addMissingValueError(errors, section?.hideRescueLabel, `${path}.hideRescueLabel`);
    addMissingValueError(errors, section?.playAudioLabel, `${path}.playAudioLabel`);
    addMissingValueError(errors, section?.playModelAnswerLabel, `${path}.playModelAnswerLabel`);
    addMissingValueError(errors, section?.sayItTitle, `${path}.sayItTitle`);
    addMissingValueError(errors, section?.sayItCopy, `${path}.sayItCopy`);

    if (!Array.isArray(section?.lessons) || section.lessons.length === 0) {
      errors.push(`${path}.lessons must contain at least one lesson`);
      return;
    }

    const ids = [];
    const slugs = new Set();

    section.lessons.forEach((lesson, lessonIndex) => {
      const lessonPath = `${path}.lessons[${lessonIndex}]`;
      ids.push(lesson?.id);
      addMissingValueError(errors, lesson?.id, `${lessonPath}.id`);
      addMissingValueError(errors, lesson?.slug, `${lessonPath}.slug`);
      addMissingValueError(errors, lesson?.title, `${lessonPath}.title`);
      addMissingValueError(errors, lesson?.label, `${lessonPath}.label`);
      addMissingValueError(errors, lesson?.storySetup, `${lessonPath}.storySetup`);

      if (lesson?.slug) {
        if (slugs.has(lesson.slug)) errors.push(`${lessonPath}.slug duplicates ${lesson.slug}`);
        slugs.add(lesson.slug);
      }

      if (!Array.isArray(lesson?.steps) || lesson.steps.length === 0) {
        errors.push(`${lessonPath}.steps must contain at least one step`);
      } else {
        lesson.steps.forEach((step, stepIndex) => {
          const stepPath = `${lessonPath}.steps[${stepIndex}]`;
          addMissingValueError(errors, step?.type, `${stepPath}.type`);

          if (step?.type === "message") {
            addMissingValueError(errors, step.message?.speaker, `${stepPath}.message.speaker`);
            addMissingValueError(errors, step.message?.text, `${stepPath}.message.text`);
          } else if (step?.type === "thought") {
            addMissingValueError(errors, step.text, `${stepPath}.text`);
          } else if (step?.type === "activity") {
            addMissingValueError(errors, step.activity?.id, `${stepPath}.activity.id`);
            addMissingValueError(errors, step.activity?.prompt, `${stepPath}.activity.prompt`);
            validateAnswers(errors, step.activity?.answers, `${stepPath}.activity.answers`);
          } else {
            errors.push(`${stepPath}.type must be message, thought, or activity`);
          }
        });
      }

      if (!Array.isArray(lesson?.rescuePhrases) || lesson.rescuePhrases.length === 0) {
        errors.push(`${lessonPath}.rescuePhrases must contain at least one phrase`);
      }
    });

    lessonIdsByLanguage.set(language, ids);
  });

  const enIds = lessonIdsByLanguage.get("en") ?? [];
  const ptIds = lessonIdsByLanguage.get("pt") ?? [];
  if (enIds.length === ptIds.length && enIds.some((id, index) => id !== ptIds[index])) {
    errors.push("Mariana lesson IDs must match between English and Portuguese content");
  }

  if (errors.length > 0) {
    throw new Error(`Invalid Mariana content:\n- ${errors.join("\n- ")}`);
  }

  return content;
}
