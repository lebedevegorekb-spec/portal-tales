import { useState, useEffect } from "react";
import type { MechanicViewProps, BlitzRound } from "@/mechanics/types";

export function BlitzHost({ round, submissions, playerCount, onAdvance }: MechanicViewProps<BlitzRound>) {
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      if (currentQ < round.questions.length - 1) {
        setCurrentQ((q) => q + 1);
        setTimeLeft(10);
      } else {
        setFinished(true);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft, currentQ, finished, round.questions.length]);

  const question = round.questions[currentQ];
  const answeredCount = submissions.filter(
    (s) => s.payload?.answers?.[question?.id] !== undefined
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground scanlines flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Раунд — Блиц
      </p>
      <h1 className="text-5xl font-display text-center mb-8">{round.title}</h1>

      {!started && !finished && (
        <>
          <p className="text-xl text-muted-foreground mb-8">{round.intro_host}</p>
          <button
            onClick={() => setStarted(true)}
            className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl"
          >
            Начать блиц →
          </button>
        </>
      )}

      {started && !finished && question && (
        <>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-muted-foreground text-sm">
              Вопрос {currentQ + 1} / {round.questions.length}
            </span>
            <span className={`font-display text-4xl ${timeLeft <= 3 ? "text-destructive" : "text-portal"}`}>
              {timeLeft}с
            </span>
          </div>

          <div className="w-full max-w-2xl bg-muted rounded-full h-2 mb-8">
            <div
              className="bg-portal h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>

          <div className="glass-card p-8 w-full max-w-2xl mb-6">
            <p className="text-2xl text-center">{question.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-6">
            {question.options.map((opt) => (
              <div key={opt.id} className="glass-card p-4 text-center">
                <span className="text-portal font-display mr-2">{opt.id.toUpperCase()}.</span>
                {opt.label}
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Ответили: {answeredCount} / {playerCount}
          </p>
        </>
      )}

      {finished && (
        <>
          <p className="text-2xl text-muted-foreground mb-8">Блиц завершён!</p>
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
