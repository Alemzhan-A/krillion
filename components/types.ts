export type DayComparison = {
  plays: number;
  betterThan: number | null;
  dist: number[] | null;
};

export type TodayPrompt = { id: string; text: string; placeholder: string };

export type Today = {
  date: string;
  pack: string;
  dayNumber: number;
  resetsAt: string;
  prompts: TodayPrompt[];
};
