export type TierId =
  | "plankton"
  | "tooclever"
  | "schooler"
  | "rare"
  | "deepcut"
  | "krillion";

export type Tier = {
  id: TierId;
  name: string;
  score: number;
  emoji: string;
  blurb: string;
  /** доля пути до дна впадины, 0..1 */
  depth: number;
  color: string;
};

export const TIERS: Record<TierId, Tier> = {
  plankton: {
    id: "plankton",
    name: "Планктон",
    score: 10,
    emoji: "🫧",
    blurb: "Ответ, который выпаливают все.",
    depth: 0.08,
    color: "var(--tier-plankton)",
  },
  tooclever: {
    id: "tooclever",
    name: "Слишком умно",
    score: 15,
    emoji: "🤡",
    blurb: "Знаменито «редкий» вариант. За него хватаются все.",
    depth: 0.18,
    color: "var(--tier-tooclever)",
  },
  schooler: {
    id: "schooler",
    name: "Стайный",
    score: 30,
    emoji: "🐟",
    blurb: "Крепко — плывёшь вместе со стаей.",
    depth: 0.36,
    color: "var(--tier-schooler)",
  },
  rare: {
    id: "rare",
    name: "Редкий",
    score: 60,
    emoji: "🦑",
    blurb: "Правда нечастый. Хороший улов.",
    depth: 0.6,
    color: "var(--tier-rare)",
  },
  deepcut: {
    id: "deepcut",
    name: "Глубокий рез",
    score: 85,
    emoji: "🏮",
    blurb: "Настоящая редкость. Мало кто заходит так глубоко.",
    depth: 0.82,
    color: "var(--tier-deepcut)",
  },
  krillion: {
    id: "krillion",
    name: "Один на криллион",
    score: 100,
    emoji: "🌟",
    blurb: "Заветная жемчужина. Дно впадины.",
    depth: 0.97,
    color: "var(--tier-krillion)",
  },
};

export const TIER_IDS = Object.keys(TIERS) as TierId[];

export const ROUNDS_PER_DAY = 7;
export const MAX_DAY_SCORE = 700;
export const MISS_EMOJI = "⬛";

/** каждое очко опускает на 10 метров; 700 очков = 7000 м, дно впадины */
export const METRES_PER_POINT = 10;

export type ScoreBand = {
  min: number;
  tier: TierId;
  range: string;
  verdict: string;
};

export const SCORE_BANDS: ScoreBand[] = [
  {
    min: 0,
    tier: "plankton",
    range: "0–150",
    verdict: "Планктон. Под тобой ещё целый океан.",
  },
  {
    min: 151,
    tier: "schooler",
    range: "151–250",
    verdict: "Стая. Плывёшь вместе со всеми.",
  },
  {
    min: 251,
    tier: "rare",
    range: "251–350",
    verdict: "Редко. Ниже термоклина. Достойно.",
  },
  {
    min: 351,
    tier: "deepcut",
    range: "351–449",
    verdict: "Глубокий рез. Серьёзное погружение.",
  },
  {
    min: 450,
    tier: "krillion",
    range: "450+",
    verdict: "Один на криллион. Житель впадины. Абсурд.",
  },
];

export function bandFor(score: number): ScoreBand {
  return [...SCORE_BANDS].reverse().find((b) => score >= b.min) ?? SCORE_BANDS[0];
}
