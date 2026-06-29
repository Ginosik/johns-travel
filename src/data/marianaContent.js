import { validateMarianaContent } from "../utils/validateMarianaContent.js";

export const marianaContent = validateMarianaContent({
  en: {
    navLabel: "Mariana",
    feedAria: "Open Mariana Destrava speaking practice",
    feedTitle: "Mariana Destrava",
    feedSubtitle: "Speaking practice for adults who freeze",
    feedCopy: "Mariana understands English, but when it is time to answer, her mind goes blank. Practice safe answers before the conversation disappears.",
    feedOpen: "Practice with Mariana",
    pageKicker: "Mariana Destrava",
    pageTitle: "When it is time to answer, her mind goes blank.",
    pageIntro: "Mariana is not a beginner. She understands more than she can say. Choose a lesson, follow the story, and practice safe answers before the conversation disappears.",
    lessonListTitle: "Practice path",
    lessonListCopy: "Each lesson starts with a small story and turns the freeze moment into a usable answer.",
    thoughtLabel: "Mariana thinks",
    activityLabel: "Answer Builder",
    safe: "Safe",
    better: "Better",
    natural: "More natural",
    selectedLabel: "Selected",
    coachingLabel: "Coach note",
    progressLabel: "Progress",
    completeLabel: "complete",
    ctaTitle: "Freeze like Mariana?",
    ctaCopy: "Private classes can help you turn passive English into answers you can actually use in conversation.",
    ctaButton: "Book a private class",
    ctaHref: "https://wa.me/5548984844747?text=Hi%20Luis%2C%20I%20want%20to%20learn%20more%20about%20Conversante%20private%20English%20classes.",
    rescueTitle: "Rescue phrases",
    rescueCopy: "These phrases buy time without ending the conversation.",
    freezeHelpLabel: "I froze. Help me.",
    hideRescueLabel: "Hide rescue phrases",
    playAudioLabel: "Play line",
    playModelAnswerLabel: "Play model answer",
    sayItTitle: "Say it out loud",
    sayItCopy: "Choose the answer, listen if you want, then say it out loud before moving on.",
    lessons: [
      {
        id: "repeat-that",
        slug: "can-you-repeat-that",
        label: "Lesson 1",
        title: "Can you repeat that?",
        summary: "Practice asking someone to repeat without leaving the conversation.",
        storySetup: "Mariana joins a short online conversation. She understands the first words, but the question arrives too fast and she freezes.",
        steps: [
          { type: "message", message: { speaker: "Teacher", text: "Hi, Mariana. Can you hear me?" } },
          { type: "message", message: { speaker: "Mariana", text: "Yes, I can hear you.", audioPath: "/audio/mariana/repeat-that/mariana-01.mp3" } },
          { type: "message", message: { speaker: "Teacher", text: "Great. Can you tell me what you did after work yesterday?" } },
          { type: "thought", text: "I understood the beginning, but the rest came too fast." },
          {
            type: "activity",
            activity: {
              id: "repeat-safe",
              prompt: "The question came too fast. What can Mariana say?",
              answers: [
                { level: "safe", text: "Repeat, please.", audioPath: "/audio/mariana/repeat-that/repeat-safe-safe.mp3", note: "It works, but it sounds a little abrupt." },
                { level: "better", text: "Can you repeat that, please?", audioPath: "/audio/mariana/repeat-that/repeat-safe-better.mp3", note: "Clear, polite, and easy to remember." },
                { level: "natural", text: "Sorry, can you repeat that?", audioPath: "/audio/mariana/repeat-that/repeat-safe-natural.mp3", note: "Very natural. Sorry softens the request without sounding weak." }
              ]
            }
          },
          { type: "message", message: { speaker: "Mariana", text: "Sorry... can you repeat that?", audioPath: "/audio/mariana/repeat-that/mariana-02.mp3" } },
          { type: "message", message: { speaker: "Teacher", text: "Of course. What did you do after work yesterday?" } },
          { type: "thought", text: "I do not need to answer perfectly. I can ask for time." },
          { type: "message", message: { speaker: "Mariana", text: "After work, I watched a series and studied English for a few minutes.", audioPath: "/audio/mariana/repeat-that/mariana-03.mp3" } },
          {
            type: "activity",
            activity: {
              id: "final-builder",
              prompt: "Choose the answer that keeps the conversation alive and gives Mariana time.",
              answers: [
                { level: "safe", text: "Let me think.", audioPath: "/audio/mariana/repeat-that/final-builder-safe.mp3", note: "Good survival phrase. It gives her a second to organize the answer." },
                { level: "better", text: "Let me think for a second.", audioPath: "/audio/mariana/repeat-that/final-builder-better.mp3", note: "More complete and still simple." },
                { level: "natural", text: "Let me think for a second. After work, I watched a series.", audioPath: "/audio/mariana/repeat-that/final-builder-natural.mp3", note: "Best answer here: it buys time and then answers the question." }
              ]
            }
          }
        ],
        rescuePhrases: [
          "Sorry, can you repeat that?",
          "Can you say that again, please?",
          "Could you speak a little slower?",
          "Let me think for a second."
        ]
      }
    ]
  },
  pt: {
    navLabel: "Mariana",
    feedAria: "Abrir a pr\u00e1tica de fala Mariana Destrava",
    feedTitle: "Mariana Destrava",
    feedSubtitle: "Pr\u00e1tica de fala para adultos que travam",
    feedCopy: "A Mariana entende bem ingl\u00eas, mas s\u00f3 de pensar em falar d\u00e1 um branco! Acompanhe essa jornada e veja como ela ir\u00e1 se sair com essas dicas.",
    feedOpen: "Praticar com Mariana",
    pageKicker: "Mariana Destrava",
    pageTitle: "Na hora de responder, d\u00e1 branco.",
    pageIntro: "A Mariana n\u00e3o \u00e9 iniciante. Ela entende mais do que consegue falar. Escolha uma li\u00e7\u00e3o, acompanhe a hist\u00f3ria e pratique respostas seguras antes que a conversa escape.",
    lessonListTitle: "Caminho de pr\u00e1tica",
    lessonListCopy: "Cada li\u00e7\u00e3o come\u00e7a com uma pequena hist\u00f3ria e transforma o momento de branco em uma resposta us\u00e1vel.",
    thoughtLabel: "Mariana pensa",
    activityLabel: "Answer Builder",
    safe: "Segura",
    better: "Melhor",
    natural: "Mais natural",
    selectedLabel: "Selecionada",
    coachingLabel: "Nota do professor",
    progressLabel: "Progresso",
    completeLabel: "completo",
    ctaTitle: "Voc\u00ea trava como a Mariana?",
    ctaCopy: "Aulas particulares podem te ajudar a transformar ingl\u00eas passivo em respostas que voc\u00ea consegue usar de verdade em uma conversa.",
    ctaButton: "Agendar aula particular",
    ctaHref: "https://wa.me/5548984844747?text=Ol%C3%A1%20Luis%2C%20quero%20saber%20mais%20sobre%20as%20aulas%20particulares%20de%20ingl%C3%AAs%20da%20Conversante.",
    rescueTitle: "Frases de resgate",
    rescueCopy: "Essas frases compram tempo sem encerrar a conversa.",
    freezeHelpLabel: "Travei. Me ajuda.",
    hideRescueLabel: "Esconder frases de resgate",
    playAudioLabel: "Ouvir frase",
    playModelAnswerLabel: "Ouvir resposta modelo",
    sayItTitle: "Fale em voz alta",
    sayItCopy: "Escolha a resposta, ou\u00e7a se quiser e fale em voz alta antes de continuar.",
    lessons: [
      {
        id: "repeat-that",
        slug: "can-you-repeat-that",
        label: "Li\u00e7\u00e3o 1",
        title: "Can you repeat that?",
        summary: "Pratique como pedir para algu\u00e9m repetir sem sair da conversa.",
        storySetup: "Mariana entra em uma conversa r\u00e1pida online. Ela entende as primeiras palavras, mas a pergunta vem r\u00e1pido demais e ela trava.",
        steps: [
          { type: "message", message: { speaker: "Teacher", text: "Hi, Mariana. Can you hear me?" } },
          { type: "message", message: { speaker: "Mariana", text: "Yes, I can hear you.", audioPath: "/audio/mariana/repeat-that/mariana-01.mp3" } },
          { type: "message", message: { speaker: "Teacher", text: "Great. Can you tell me what you did after work yesterday?" } },
          { type: "thought", text: "Eu entendi o come\u00e7o, mas o resto veio r\u00e1pido demais." },
          {
            type: "activity",
            activity: {
              id: "repeat-safe",
              prompt: "A pergunta veio r\u00e1pido demais. O que a Mariana pode dizer?",
              answers: [
                { level: "safe", text: "Repeat, please.", audioPath: "/audio/mariana/repeat-that/repeat-safe-safe.mp3", note: "Funciona, mas soa um pouco seco." },
                { level: "better", text: "Can you repeat that, please?", audioPath: "/audio/mariana/repeat-that/repeat-safe-better.mp3", note: "Clara, educada e f\u00e1cil de lembrar." },
                { level: "natural", text: "Sorry, can you repeat that?", audioPath: "/audio/mariana/repeat-that/repeat-safe-natural.mp3", note: "Bem natural. Sorry suaviza o pedido sem parecer fraqueza." }
              ]
            }
          },
          { type: "message", message: { speaker: "Mariana", text: "Sorry... can you repeat that?", audioPath: "/audio/mariana/repeat-that/mariana-02.mp3" } },
          { type: "message", message: { speaker: "Teacher", text: "Of course. What did you do after work yesterday?" } },
          { type: "thought", text: "Eu n\u00e3o preciso responder perfeito. Eu posso pedir tempo." },
          { type: "message", message: { speaker: "Mariana", text: "After work, I watched a series and studied English for a few minutes.", audioPath: "/audio/mariana/repeat-that/mariana-03.mp3" } },
          {
            type: "activity",
            activity: {
              id: "final-builder",
              prompt: "Escolha a resposta que mant\u00e9m a conversa viva e d\u00e1 tempo para a Mariana.",
              answers: [
                { level: "safe", text: "Let me think.", audioPath: "/audio/mariana/repeat-that/final-builder-safe.mp3", note: "Boa frase de sobreviv\u00eancia. Ela ganha um segundo para organizar a resposta." },
                { level: "better", text: "Let me think for a second.", audioPath: "/audio/mariana/repeat-that/final-builder-better.mp3", note: "Mais completa e ainda simples." },
                { level: "natural", text: "Let me think for a second. After work, I watched a series.", audioPath: "/audio/mariana/repeat-that/final-builder-natural.mp3", note: "Melhor resposta aqui: ela ganha tempo e depois responde \u00e0 pergunta." }
              ]
            }
          }
        ],
        rescuePhrases: [
          "Sorry, can you repeat that?",
          "Can you say that again, please?",
          "Could you speak a little slower?",
          "Let me think for a second."
        ]
      }
    ]
  }
});
