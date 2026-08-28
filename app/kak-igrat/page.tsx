import Link from "next/link";
import type { Metadata } from "next";
import { MAX_DAY_SCORE, METRES_PER_POINT, ROUNDS_PER_DAY, TIERS, TIER_IDS } from "@/lib/tiers";
import { ANSWER_MS } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Как играть · Криллион",
  description: "Правила ежедневного погружения: семь вопросов, редкие ответы, дно впадины.",
};

export default function Page() {
  return (
    <main className="shell">
      <header className="hud">
        <Link href="/" className="hud-brand">
          КРИЛЛИОН
        </Link>
        <Link href="/" className="link-quiet">
          ← к погружению
        </Link>
      </header>

      <div className="prose">
        <h1>КАК ИГРАТЬ</h1>

        <h2>СУТЬ</h2>
        <ul>
          <li>{ROUNDS_PER_DAY} вопросов в день. Одинаковые для всех.</li>
          <li>{ANSWER_MS / 1000} секунд, чтобы назвать одну вещь.</li>
          <li>Одно погружение в сутки. Второй попытки не будет.</li>
        </ul>

        <h2>ПОДВОХ</h2>
        <p>
          Считается не правильность, а редкость. Ответ, который первым приходит
          в голову, приходит в голову и всем остальным — он почти не тянет вниз.
          Редкий ответ утягивает глубоко.
        </p>
        <p>
          И вариант, который кажется тебе хитрым, стая уже придумала. За него
          отдельный тир — и он дешёвый.
        </p>

        <h2>ТИРЫ</h2>
        <div>
          {TIER_IDS.map((id) => {
            const tier = TIERS[id];
            return (
              <div key={id} className="tier-row">
                <span>{tier.emoji}</span>
                <span>
                  <b style={{ color: tier.color }}>{tier.name}</b>
                  <small>{tier.blurb}</small>
                </span>
                <span style={{ color: tier.color }}>{tier.score}</span>
              </div>
            );
          })}
        </div>

        <h2>ГЛУБИНА</h2>
        <p>
          Каждое очко опускает тебя на {METRES_PER_POINT} метров.{" "}
          {MAX_DAY_SCORE} очков — это{" "}
          {(MAX_DAY_SCORE * METRES_PER_POINT).toLocaleString("ru-RU")} метров,
          дно впадины. Идеальное погружение заканчивается там.
        </p>

        <h2>ЕСЛИ ОТВЕТ НЕ ПРИНЯЛИ</h2>
        <p>
          У каждого вопроса свой список принимаемых ответов. Если в ответ тишина —
          «нет отклика» — попробуй другую формулировку или другую вещь; время
          продолжает идти.
        </p>

        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/" className="link-quiet">
            ▼ начать погружение
          </Link>
        </p>
      </div>
    </main>
  );
}
