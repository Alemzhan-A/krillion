export type DayComparison = {
  plays: number;
  betterThan: number | null;
  rank: number | null;
  median: number | null;
  best: number | null;
  dist: number[] | null;
  backend: "redis" | "memory";
};

export type TodayPrompt = { id: string; text: string; placeholder: string };

export type Today = {
  date: string;
  pack: string;
  dayNumber: number;
  resetsAt: string;
  prompts: TodayPrompt[];
};
