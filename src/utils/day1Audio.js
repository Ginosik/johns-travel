import { conversation } from "../data/day1Content.js";

export function getDay1AudioPath(message, messageIndex) {
  const speakerMessageNumber = conversation
    .slice(0, messageIndex + 1)
    .filter((item) => item.speaker === message.speaker).length;
  const audioNumber = String(speakerMessageNumber).padStart(2, "0");

  return new URL(`../../assets/audios/${message.speaker}-${audioNumber}.mp3`, import.meta.url).href;
}
