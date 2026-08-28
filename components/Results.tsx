"use client";

import { useMemo, useState } from "react";
import {
  MAX_DAY_SCORE,
  METRES_PER_POINT,
  MISS_EMOJI,
  SCORE_BANDS,
  TIERS,
  bandFor,
} from "@/lib/tiers";
import type { RoundResult, Stats } from "@/lib/storage";
import { WORLDS, type WorldId } from "@/lib/worlds";
import { plural } from "@/lib/plural";
import type { DayComparison } from "./types";
import type { AnswerSheet as Sheet } from "@/lib/sheet";
import AnswerSheetView from "./AnswerSheet";
import TodayStats from "./TodayStats";

function shareText(
  dayNumber: number,
  packName: string,
  score: number,
  results: RoundResult[],
): string {
  const line = results
    .map((r) => (r.tier ? TIERS[r.tier].emoji : MISS_EMOJI))
    .join("");
  return [
    `Криллион · ${packName} #${dayNumber}`,
    `${line} ${score} очк. · ${score * METRES_PER_POINT} м`,
    typeof window !== "undefined" ? window.location.origin : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export default function Results({
  dayNumber,
  score,
  results,
  stats,
  comparison,
  resetsAt,
  world,
  sheet,
  packName,
}: {
  dayNumber: number;
  score: number;
  results: RoundResult[];
  stats: Stats;
  comparison: DayComparison | null;
  resetsAt: string;
  world: WorldId;
  sheet: Sheet | null;
  packName: string;
}) {
  const COPY = WORLDS[world].copy;
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const band = bandFor(score);
  const depth = score * METRES_PER_POINT;

  const countdown = useMemo(() => {
    const ms = Date.parse(resetsAt) - Date.now();
    if (!Number.isFinite(ms) || ms <= 0) return null;
    const h = Math.floor(ms / 3600_000);
    const m = Math.floor((ms % 3600_000) / 60_000);
    return `${h} ч ${m} мин`;
  }, [resetsAt]);

  async function share() {
    const text = shareText(dayNumber, packName, score, results);
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* пользователь закрыл окно — падаем в копирование */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* буфер недоступен */
    }
  }

  return (
    <div className="results">
      <div className="results-head">
        <p className="results-kicker">{COPY.completeLabel}</p>
        <p className="results-score">
          {score}
          <span className="results-max"> / {MAX_DAY_SCORE}</span>
        </p>
        <p className="results-depth">
          {depth.toLocaleString("ru-RU")}
          {COPY.unit}
        </p>
        <p className="results-verdict" style={{ color: TIERS[band.tier].color }}>
          {band.verdict}
        </p>
      </div>

      <ol className="rounds">
        {results.map((r, i) => {
          const tier = r.tier ? TIERS[r.tier] : null;
          const isOpen = open === r.promptId;
          return (
            <li key={r.promptId}>
              <button
                type="button"
                className="round"
                onClick={() => setOpen(isOpen ? null : r.promptId)}
                aria-expanded={isOpen}
              >
                <span className="round-n">{i + 1}</span>
                <span className="round-emoji">{tier ? tier.emoji : MISS_EMOJI}</span>
                <span className="round-answer">
                  {r.answer ?? (r.rawAnswer ? `«${r.rawAnswer}»` : "—")}
                </span>
                <span
                  className="round-score"
                  style={{ color: tier ? tier.color : "var(--tier-miss)" }}
                >
                  {r.score}
                </span>
              </button>
              {isOpen && (
                <div className="round-detail">
                  <p className="round-prompt">{r.promptText}</p>
                  <p className="round-quip">{r.quip}</p>
                  {tier && <p className="round-tier" style={{ color: tier.color }}>{tier.name}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {sheet && <AnswerSheetView sheet={sheet} results={results} />}

      <div className="bands">
        {SCORE_BANDS.map((b) => (
          <div key={b.min} className={`band${b === band ? " band-on" : ""}`}>
            <span style={{ color: TIERS[b.tier].color }}>{TIERS[b.tier].emoji}</span>
            <span className="band-range">{b.range}</span>
            <span className="band-name" style={{ color: TIERS[b.tier].color }}>
              {TIERS[b.tier].name}
            </span>
          </div>
        ))}
      </div>

      <TodayStats comparison={comparison} score={score} />

      <div className="stats">
        <div>
          <span className="stat-n">{stats.gamesPlayed}</span>
          <span className="stat-l">
            {plural(stats.gamesPlayed, "погружение", "погружения", "погружений")}
          </span>
        </div>
        <div>
          <span className="stat-n">{stats.currentStreak}</span>
          <span className="stat-l">серия</span>
        </div>
        <div>
          <span className="stat-n">{stats.bestScore}</span>
          <span className="stat-l">рекорд</span>
        </div>
      </div>

      <button type="button" className="btn btn-primary px" onClick={share}>
        {copied ? "СКОПИРОВАНО" : "ПОДЕЛИТЬСЯ"}
      </button>

      <p className="foot-note">
        на сегодня хватит — всплывай завтра.
        {countdown && <> следующее погружение через {countdown}.</>}
      </p>
    </div>
  );
}
