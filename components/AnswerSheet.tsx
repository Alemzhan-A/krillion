"use client";

import { useState } from "react";
import type { AnswerSheet as Sheet } from "@/lib/sheet";
import type { RoundResult } from "@/lib/storage";
import { TIERS, TIER_IDS, type TierId } from "@/lib/tiers";
import { normalize } from "@/lib/match";

/**
 * Что ещё принималось в каждом раунде и сколько бы за это дали.
 * Открывается только после погружения.
 */
export default function AnswerSheet({
  sheet,
  results,
}: {
  sheet: Sheet;
  results: RoundResult[];
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="asheet">
      <p className="asheet-title">ЛИСТ ОТВЕТОВ</p>
      <p className="asheet-sub">что ещё принималось и сколько бы дали</p>

      <ol className="asheet-list">
        {sheet.map((entry, i) => {
          const mine = results.find((r) => r.promptId === entry.promptId);
          const isOpen = open === entry.promptId;
          const best = entry.answers[0]?.score ?? 0;

          // группируем по тирам, чтобы шкала читалась сверху вниз
          const byTier = new Map<TierId, string[]>();
          for (const a of entry.answers) {
            const list = byTier.get(a.t) ?? [];
            list.push(a.n);
            byTier.set(a.t, list);
          }

          return (
            <li key={entry.promptId}>
              <button
                type="button"
                className="asheet-row"
                onClick={() => setOpen(isOpen ? null : entry.promptId)}
                aria-expanded={isOpen}
              >
                <span className="asheet-n">{i + 1}</span>
                <span className="asheet-q">{entry.promptText}</span>
                <span className="asheet-mine">
                  {mine?.tier ? `${mine.score}` : "0"}
                  <span className="asheet-of"> / {best}</span>
                </span>
                <span className="asheet-caret">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="asheet-body">
                  {[...TIER_IDS].reverse().map((t) => {
                    const list = byTier.get(t);
                    if (!list?.length) return null;
                    const tier = TIERS[t];
                    return (
                      <div key={t} className="asheet-tier">
                        <div className="asheet-tier-head" style={{ color: tier.color }}>
                          <span>{tier.emoji}</span>
                          <span className="asheet-tier-name">{tier.name}</span>
                          <span className="asheet-tier-pts">{tier.score} очк.</span>
                        </div>
                        <p className="asheet-words">
                          {list.map((n, k) => {
                            const isMine =
                              mine?.answer != null &&
                              normalize(mine.answer) === normalize(n);
                            return (
                              <span
                                key={n}
                                className={isMine ? "asheet-word asheet-word-mine" : "asheet-word"}
                                style={isMine ? { color: tier.color } : undefined}
                              >
                                {n}
                                {k < list.length - 1 ? " · " : ""}
                              </span>
                            );
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
