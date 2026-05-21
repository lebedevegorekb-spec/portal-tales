import { useState, useMemo } from "react";
import type { MechanicViewProps, GuessAuthorRound } from "@/mechanics/types";

export function GuessAuthorHost({ round, submissions, playerCount, onAdvance }: MechanicViewProps<GuessAuthorRound>) {
  const [phase, setPhase] = useState<"writing" | "guessing" | "done">("writing");

  const answers = useMemo(
    () => submissions.filter((s) => s.payload?.completion !== undefined),
    [submissions]
  );

  const allWrote = answers.length >= playerCount;

  return (
    <div className="min-h-screen text-foreground relative z-10 flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Раунд — Угадай автора
      </p>
      <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>

      {phase === "writing" && (
        <>
          <p className="text-2xl text-center text-muted-foreground mb-4">
            «{round.prompt_prefix}»
          </p>
          <p className="text-muted-foreground mb-8">{round.intro_host}</p>
          <p className="text-sm text-muted-foreground mb-8">
            Написали: {answers.length} / {playerCount}
          </p>
          <button
            onClick={() => setPhase("guessing")}
            disabled={!allWrote}
            className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl disabled:opacity-40"
          >
            {allWrote ? "Показать ответы →" : `Ждём (${answers.length}/${playerCount})`}
          </button>
        </>
      )}

      {phase === "guessing" && (
        <>
          <p className="text-lg text-muted-foreground mb-8">
            Игроки угадывают авторов. Обсуждайте вслух!
          </p>
          <div className="grid gap-4 w-full max-w-2xl mb-8">
            {answers.map((s, i) => (
              <div key={s.id} className="glass-card p-5">
                <p className="text-sm text-muted-foreground mb-1">Ответ {i + 1}</p>
                <p className="text-lg">«{round.prompt_prefix} {s.payload.completion}»</p>
              </div>
            ))}
          </div>
          {onAdvance && (
            <button
              onClick={onAdvance}
              className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl"
            >
              Подвести итог →
            </button>
          )}
        </>
      )}
    </div>
  );
}
