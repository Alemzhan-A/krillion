import type { PromptDef } from "./prompts";
import { PROMPTS } from "./prompts";
import { FOOTBALL_PROMPTS } from "./prompts-football";
import { KAZAKH_PROMPTS } from "./prompts-kazakh";
import type { WorldId } from "./worlds";

export type PackId = "classic" | "football" | "kazakh";

export type Pack = {
  id: PackId;
  name: string;
  tagline: string;
  emoji: string;
  world: WorldId;
  prompts: PromptDef[];
};

export const PACKS: Pack[] = [
  {
    id: "classic",
    name: "КЛАССИКА",
    tagline: "обо всём на свете",
    emoji: "🦐",
    world: "ocean",
    prompts: PROMPTS,
  },
  {
    id: "football",
    name: "ФУТБОЛ",
    tagline: "вниз по футбольной пирамиде",
    emoji: "⚽",
    world: "stadium",
    prompts: FOOTBALL_PROMPTS,
  },
  {
    id: "kazakh",
    name: "КАЗАХСТАН",
    tagline: "вглубь степи",
    emoji: "🐎",
    world: "steppe",
    prompts: KAZAKH_PROMPTS,
  },
];

export const DEFAULT_PACK: PackId = "classic";

export function getPack(id?: string | null): Pack {
  return PACKS.find((p) => p.id === id) ?? PACKS[0];
}

export function isPackId(id: string): id is PackId {
  return PACKS.some((p) => p.id === id);
}
