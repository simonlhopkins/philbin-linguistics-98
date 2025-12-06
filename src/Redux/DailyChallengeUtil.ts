import type { FlashCardData } from "../Flashcards/Flashcards";

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

// PRNG using mulberry32 algorithm
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export default class DailyChallengeUtil {
  static GetDailyChallenge(cards: FlashCardData[]) {
    const dateString = new Date().getDate().toLocaleString();
    const seed = xmur3(dateString)(); // Seed based on string
    const random = mulberry32(seed);
    const newCards = [];
    for (let i = 0; i < 5; i++) {
      var index = Math.floor(random() * cards.length);
      newCards.push(cards[index]);
    }
    return newCards;
  }
}
