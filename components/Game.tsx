"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import DescentScene from "./DescentScene";
import Results from "./Results";
import Mascot from "./Mascot";
import type { DayComparison, Today } from "./types";
import { playSfx, setMuted as setAudioMuted } from "@/lib/audio";
import { PACKS, getPack, type PackId } from "@/lib/packs";
import type { AnswerSheet } from "@/lib/sheet";
import {
  ANSWER_MS,
  PREVIEW_MS,
  clearGame,
  getPlayerId,
  loadGame,
  loadMuted,
  loadStats,
  recordFinishedDay,
  saveGame,
  saveMuted,
  type RoundResult,
  type SavedGame,
  type Stats,
} from "@/lib/storage";
import { WORLDS } from "@/lib/worlds";
import {
  METRES_PER_POINT,
  ROUNDS_PER_DAY,
  TIERS,
  TIER_IDS,
  type TierId,
} from "@/lib/tiers";

/** сколько держим баннер приземления перед следующим вопросом */
const LANDING_MS = 3000;
/** с этой секунды таймер «горячий» */
const HOT_S = 5;
const PACK_KEY = "krillion:pack";

type Phase = SavedGame["phase"];

export default function Game() {
  const [packId, setPackId] = useState<PackId>("classic");
  const [today, setToday] = useState<Today | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [score, setScore] = useState(0);

  const [draft, setDraft] = useState("");
  const [rejected, setRejected] = useState<string | null>(null);
  const [landed, setLanded] = useState<RoundResult | null>(null);
  const [landedKey, setLandedKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const [muted, setMutedState] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [comparison, setComparison] = useState<DayComparison | null>(null);
  const [sheet, setSheet] = useState<AnswerSheet | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const tickedAt = useRef(0);

  const pack = getPack(packId);
  const world = WORLDS[pack.world];

  // ——— запомненный режим
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PACK_KEY);
      if (saved && PACKS.some((p) => p.id === saved)) setPackId(saved as PackId);
    } catch {
      /* приватный режим */
    }
    const m = loadMuted();
    setMutedState(m);
    setAudioMuted(m);
  }, []);

  // ——— загрузка дня выбранного режима и восстановление партии
  useEffect(() => {
    let alive = true;
    setToday(null);
    setLoadError(false);
    (async () => {
      try {
        const res = await fetch(`/api/today?pack=${packId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("today failed");
        const data: Today = await res.json();
        if (!alive) return;
        setToday(data);

        const saved = loadGame(data.date, packId);
        setResults(saved?.results ?? []);
        setScore(saved?.score ?? 0);
        setRoundIndex(saved?.roundIndex ?? 0);
        setSheet(saved?.sheet ?? null);
        setComparison(null);
        setLanded(null);
        setDeadline(null);
        setDraft("");
        setPhase(saved?.phase === "done" ? "done" : "intro");
        setStats(saved?.phase === "done" ? loadStats(packId) : null);
      } catch {
        if (alive) setLoadError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [packId]);

  // ——— часы для таймера
  useEffect(() => {
    if (phase !== "preview" && phase !== "answer") return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [phase]);

  const persist = useCallback(
    (next: Partial<SavedGame>) => {
      if (!today) return;
      saveGame({
        date: today.date,
        pack: packId,
        dayNumber: today.dayNumber,
        phase,
        roundIndex,
        results,
        score,
        previewEndsAt: null,
        answerEndsAt: null,
        sheet: sheet ?? undefined,
        ...next,
      });
    },
    [today, packId, phase, roundIndex, results, score, sheet],
  );

  const prompt = today?.prompts[roundIndex] ?? null;
  const remaining = deadline ? Math.max(0, deadline - now) : 0;
  const secondsLeft = Math.ceil(remaining / 1000);
  const hot = phase === "answer" && secondsLeft <= HOT_S;

  const finishRound = useCallback(
    (result: RoundResult) => {
      setLanded(result);
      setLandedKey((k) => k + 1);
      setDeadline(null);
      setDraft("");
      setRejected(null);

      const nextResults = [...results, result];
      const nextScore = score + result.score;
      setResults(nextResults);
      setScore(nextScore);

      if (result.tier === "krillion") playSfx("krillion");
      else if (result.tier === null) playSfx("miss");
      else if (TIERS[result.tier].depth >= 0.6) playSfx("land_big");
      else playSfx("land_small");

      const last = nextResults.length >= ROUNDS_PER_DAY;
      persist({
        results: nextResults,
        score: nextScore,
        roundIndex: last ? roundIndex : roundIndex + 1,
        phase: last ? "done" : "preview",
      });

      setTimeout(() => {
        setLanded(null);
        if (last) {
          setPhase("done");
          playSfx("surface");
          if (today) {
            setStats(recordFinishedDay(today.date, packId, nextScore, nextResults));
            void fetch("/api/today/complete", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                date: today.date,
                pack: packId,
                playerId: getPlayerId(),
                score: nextScore,
              }),
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((d: (DayComparison & { sheet?: AnswerSheet }) | null) => {
                if (!d) return;
                setComparison(d);
                if (d.sheet) {
                  setSheet(d.sheet);
                  // кладём лист рядом с партией, чтобы пережил перезагрузку
                  persist({
                    results: nextResults,
                    score: nextScore,
                    roundIndex,
                    phase: "done",
                    sheet: d.sheet,
                  });
                }
              })
              .catch(() => {});
          }
        } else {
          setRoundIndex((i) => i + 1);
          setPhase("preview");
          setDeadline(Date.now() + PREVIEW_MS);
          playSfx("sink");
        }
      }, LANDING_MS);
    },
    [results, score, roundIndex, persist, today, packId],
  );

  const submit = useCallback(
    async (raw: string) => {
      if (!today || !prompt || submitting.current) return;
      const text = raw.trim();
      if (!text) return;
      submitting.current = true;
      setSending(true);
      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            date: today.date,
            pack: packId,
            promptId: prompt.id,
            answer: text,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          playSfx("submit");
          finishRound({
            promptId: prompt.id,
            promptText: prompt.text,
            answer: data.answer,
            rawAnswer: text,
            tier: data.tier as TierId,
            score: data.score,
            quip: data.quip,
          });
        } else {
          playSfx("reject");
          setRejected(`«${text}»: нет отклика. попробуй ещё`);
        }
      } catch {
        playSfx("reject");
        setRejected("нет связи — попробуй ещё раз");
      } finally {
        submitting.current = false;
        setSending(false);
      }
    },
    [today, prompt, finishRound, packId],
  );

  // ——— переходы по таймеру
  useEffect(() => {
    if (!deadline || remaining > 0) return;
    if (phase === "preview") {
      setPhase("answer");
      setDeadline(Date.now() + ANSWER_MS);
      inputRef.current?.focus();
    } else if (phase === "answer" && prompt) {
      const typed = draft.trim();
      finishRound({
        promptId: prompt.id,
        promptText: prompt.text,
        answer: null,
        rawAnswer: typed || null,
        tier: null,
        score: 0,
        quip: typed ? world.copy.missTyped : world.copy.missEmpty,
      });
    }
  }, [deadline, remaining, phase, prompt, draft, finishRound, world]);

  // ——— тиканье на последних секундах
  useEffect(() => {
    if (phase !== "answer" || !deadline) return;
    if (secondsLeft <= HOT_S && secondsLeft > 0 && tickedAt.current !== secondsLeft) {
      tickedAt.current = secondsLeft;
      playSfx("tick");
    }
  }, [phase, deadline, secondsLeft]);

  function begin() {
    playSfx("descend");
    setPhase("preview");
    setDeadline(Date.now() + PREVIEW_MS);
    persist({ phase: "preview", roundIndex });
  }

  function choosePack(id: PackId) {
    if (id === packId) return;
    playSfx("blub");
    setPackId(id);
    try {
      localStorage.setItem(PACK_KEY, id);
    } catch {
      /* приватный режим */
    }
  }

  function toggleMute() {
    const next = !muted;
    setMutedState(next);
    setAudioMuted(next);
    saveMuted(next);
    if (!next) playSfx("blub");
  }

  const depthM = score * METRES_PER_POINT;

  if (loadError) {
    return (
      <main className="shell shell-center">
        <p className="boot-label">лист с ответами потерян в море</p>
        <button className="btn px" type="button" onClick={() => window.location.reload()}>
          ОБНОВИТЬ
        </button>
      </main>
    );
  }

  if (!today) {
    return (
      <main className="shell shell-center">
        <Mascot world={pack.world} size={64} />
        <p className="boot-label">погружаемся…</p>
      </main>
    );
  }

  return (
    <main className="shell" data-world={pack.world}>
      <DescentScene
        world={pack.world}
        depthM={depthM}
        landedTier={landed?.tier ?? null}
        landedKey={landedKey}
        shake={landed && !landed.tier ? 1 : 0}
        celebrate={landed?.tier === "krillion"}
        sad={landed !== null && landed.tier === null}
      />

      <header className="hud" data-playing={phase !== "intro" || undefined}>
        <Link href="/" className="hud-brand">
          КРИЛЛИОН
        </Link>

        <div className="hud-mid">
          <div className="pod pod-depth px">
            <span className="pod-num">{depthM.toLocaleString("ru-RU")}</span>
            <span className="pod-label">{world.copy.depthLabel}</span>
          </div>

          {phase !== "intro" && (
            <div className="dots" aria-label={`раунд ${roundIndex + 1} из ${ROUNDS_PER_DAY}`}>
              {Array.from({ length: ROUNDS_PER_DAY }, (_, i) => {
                const done = results[i];
                const cls = done
                  ? done.tier
                    ? "done"
                    : "miss"
                  : i === roundIndex && phase !== "done"
                    ? "cur"
                    : "";
                return <i key={i} className={cls} />;
              })}
            </div>
          )}

          <div className="pod pod-score px" data-slam={landed ? landedKey : undefined}>
            <span className="pod-num">{score}</span>
            <span className="pod-label">очки</span>
          </div>
        </div>

        <button
          type="button"
          className="hud-mute"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "включить звук" : "выключить звук"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      <div className="panel">
        {phase === "intro" && (
          <div className="card px">
            <p className="intro-day">
              {pack.name} · погружение №{today.dayNumber}
            </p>
            <h1 className="intro-title">
              {"КРИЛЛИОН".split("").map((ch, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.12}s` }}>
                  {ch}
                </span>
              ))}
            </h1>
            <p className="intro-tagline">7 вопросов в день. одинаковые для всех.</p>
            <p className="hint">{world.copy.hint}</p>

            <div className="packs" role="group" aria-label="режим">
              {PACKS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`pack px${p.id === packId ? " pack-on" : ""}`}
                  onClick={() => choosePack(p.id)}
                  aria-pressed={p.id === packId}
                >
                  <span className="pack-emoji">{p.emoji}</span>
                  <span className="pack-name">{p.name}</span>
                  <span className="pack-tag">{p.tagline}</span>
                </button>
              ))}
            </div>

            <button type="button" className="btn btn-primary px" onClick={begin}>
              ▼ НАЧАТЬ ПОГРУЖЕНИЕ ▼
            </button>
            {results.length > 0 && (
              <p className="intro-resume">продолжаем с раунда {roundIndex + 1}</p>
            )}
            <p>
              <Link href="/kak-igrat" className="link-quiet">
                как играть
              </Link>
            </p>
          </div>
        )}

        {(phase === "preview" || phase === "answer") && prompt && !landed && (
          <>
            <div className="card px">
              <p className="kicker">вопрос {roundIndex + 1}</p>
              <p className="prompt-text">{prompt.text}</p>

              {phase === "preview" ? (
                <p className="hint">{world.copy.hint}</p>
              ) : (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void submit(draft);
                    }}
                  >
                    <input
                      ref={inputRef}
                      className="answer-input px"
                      value={draft}
                      onChange={(e) => {
                        setDraft(e.target.value);
                        setRejected(null);
                      }}
                      placeholder={prompt.placeholder}
                      maxLength={80}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="send"
                      disabled={sending}
                    />
                    <div className="input-row">
                      <div className="sonar" data-hot={hot || undefined} aria-hidden>
                        <div className="sonar-scope">
                          <div className="sonar-sweep" />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary px"
                        disabled={!draft.trim() || sending}
                      >
                        ПОГРУЖАТЬСЯ ▼
                      </button>
                    </div>
                  </form>

                  {rejected && <p className="reject">{rejected}</p>}

                  <div className="fuse" data-hot={hot || undefined}>
                    <div
                      className="fuse-fill"
                      style={{ transform: `scaleX(${remaining / ANSWER_MS})` }}
                    />
                  </div>
                  <p className="fuse-num" data-hot={hot || undefined}>
                    {secondsLeft}
                  </p>
                </>
              )}
            </div>

            <div className="tierline" aria-hidden>
              {TIER_IDS.map((id) => (
                <i key={id} style={{ ["--tc" as string]: TIERS[id].color }} />
              ))}
              <span className="tierline-label">
                планктон ← редкость → один на криллион
              </span>
            </div>
          </>
        )}

        {landed && (
          <div
            className="landed"
            data-gold={landed.tier === "krillion" || undefined}
            style={{
              ["--tc" as string]: landed.tier
                ? TIERS[landed.tier].color
                : "var(--tier-miss)",
            }}
          >
            <div className="landed-icon">
              {landed.tier ? (
                <Mascot
                  world={pack.world}
                  size={68}
                  tier={landed.tier}
                  glow={landed.tier === "krillion"}
                />
              ) : (
                <span style={{ fontSize: 56 }}>⬛</span>
              )}
            </div>
            <p className="landed-name">
              {landed.tier ? TIERS[landed.tier].name : "МИМО"}
            </p>
            <p className="landed-answer">
              {landed.answer ?? (landed.rawAnswer ? `«${landed.rawAnswer}»` : "—")}
            </p>
            <p className="landed-pts">
              +<b>{landed.score}</b>
            </p>
            <p className="landed-quip">{landed.quip}</p>
          </div>
        )}

        {phase === "done" && stats && (
          <div className="card px">
            <Results
              dayNumber={today.dayNumber}
              score={score}
              results={results}
              stats={stats}
              comparison={comparison}
              resetsAt={today.resetsAt}
              world={pack.world}
              sheet={sheet}
              packName={pack.name}
            />

            <div className="packs packs-after" role="group" aria-label="другой режим">
              {PACKS.filter((p) => p.id !== packId).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="pack px"
                  onClick={() => choosePack(p.id)}
                >
                  <span className="pack-emoji">{p.emoji}</span>
                  <span className="pack-name">{p.name}</span>
                  <span className="pack-tag">ещё не пройдено сегодня</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {phase === "done" && (
        <button
          type="button"
          className="dev-reset"
          onClick={() => {
            clearGame(packId);
            window.location.reload();
          }}
        >
          сбросить погружение
        </button>
      )}
    </main>
  );
}
