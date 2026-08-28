"use client";

import type { DayComparison } from "./types";
import { MAX_DAY_SCORE, METRES_PER_POINT } from "@/lib/tiers";
import { plural } from "@/lib/plural";

/** Как ты выглядишь на фоне тех, кто нырял сегодня. */
export default function TodayStats({
  comparison,
  score,
}: {
  comparison: DayComparison | null;
  score: number;
}) {
  if (!comparison || comparison.plays === 0) return null;

  const { plays, betterThan, rank, median, best, dist } = comparison;
  const alone = betterThan === null;

  return (
    <div className="tstats">
      <p className="tstats-title">СЕГОДНЯ</p>

      {alone ? (
        <p className="tstats-head">
          <b>ты первый</b>
          <span className="tstats-sub">сегодня в этом режиме ещё никто не нырял</span>
        </p>
      ) : (
        <p className="tstats-head">
          <span className="tstats-big">{betterThan}%</span>
          <span className="tstats-line">
            нырявших сегодня ты обошёл
          </span>
          <span className="tstats-sub">
            {rank === 1 ? (
              <>лучший результат дня — пока твой</>
            ) : (
              <>
                {rank}-е место из {plays}
              </>
            )}
          </span>
        </p>
      )}

      {!alone && (
        <div className="tstats-grid">
          <div>
            <span className="tstats-n">{plays}</span>
            <span className="tstats-l">
              {plural(plays, "погружение", "погружения", "погружений")}
            </span>
          </div>
          <div>
            <span className="tstats-n">{median ?? "—"}</span>
            <span className="tstats-l">медиана дня</span>
          </div>
          <div>
            <span className="tstats-n">{best ?? "—"}</span>
            <span className="tstats-l">рекорд дня</span>
          </div>
        </div>
      )}

      {dist && (
        <>
          <div className="dist" aria-label="распределение очков за сегодня">
            {dist.map((n, i) => {
              const peak = Math.max(...dist, 1);
              const mine = Math.min(6, Math.floor(score / 100)) === i;
              return (
                <div key={i} className="dist-col">
                  <div
                    className={`dist-bar${mine ? " dist-bar-mine" : ""}`}
                    style={{ height: `${Math.max(3, (n / peak) * 100)}%` }}
                    title={`${i * 100}–${i * 100 + 99}: ${n}`}
                  />
                  <span className="dist-x">{i * 100}</span>
                </div>
              );
            })}
          </div>
          <p className="tstats-foot">
            твои {score} очк. — это {(score * METRES_PER_POINT).toLocaleString("ru-RU")} м
            из {(MAX_DAY_SCORE * METRES_PER_POINT).toLocaleString("ru-RU")}
          </p>
        </>
      )}

      {comparison.backend === "memory" && (
        <p className="tstats-note">
          общая база не подключена — цифры считаются только по этому серверу
        </p>
      )}
    </div>
  );
}
