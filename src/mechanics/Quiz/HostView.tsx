import { useMemo } from "react";
import type { MechanicViewProps, QuizRound } from "@/mechanics/types";

export function QuizHost({ round, submissions, playerCount, onAdvance }: MechanicViewProps<QuizRound>) {
  const answeredCount = submissions.filter((s) => s.payload?.answers !== undefined).length;
  const allAnswered = answeredCount >= playerCount;

  return (
    <div className="min-h-screen text-foreground relative z-10 scanlines flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Раунд — Экзамен
      </p>
      <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl mb-10">
        {round.intro_host}
      </p>

      <div className="grid gap-6 w-full max-w-2xl mb-8">
        {round.questions.map((q, i) => (
          <div key={q.id} className="glass-card p-6">
            <p className="text-sm text-muted-foreground mb-2">Вопрос {i + 1}</p>
            <p className="text-lg mb-4">{q.text}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt) => (
                <div key={opt.id} className="border border-border rounded-lg p-3 text-sm">
                  <span className="text-portal font-display mr-1">{opt.id.toUpperCase()}.</span>
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Ответили: {answeredCount} / {playerCount}
      </p>

      {onAdvance && (
        <button
          onClick={onAdvance}
          disabled={!allAnswered}
          className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allAnswered ? "Подвести итог →" : `Ждём (${answeredCount}/${playerCount})`}
        </button>
      )}
    </div>
  );
}
