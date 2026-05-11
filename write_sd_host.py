import os
os.makedirs('src/mechanics/SituationDeduction', exist_ok=True)
f = open('src/mechanics/SituationDeduction/HostView.tsx', 'w', encoding='utf-8', newline='\n')
f.write("""import { useState, useEffect, useMemo } from "react";
import type { MechanicViewProps, SituationDeductionRound } from "@/mechanics/types";

export function SituationDeductionHost({
  round, submissions, playerCount, onAdvance
}: MechanicViewProps<SituationDeductionRound>) {
  const [phase, setPhase] = useState<"questions" | "voting" | "result">("questions");
  const [timer, setTimer] = useState(round.question_time_seconds ?? 20);
  const [currentQ, setCurrentQ] = useState(0);

  const questionSubs = useMemo(
    () => submissions.filter(s => s.payload?.type === "question"),
    [submissions]
  );
  const voteSubs = useMemo(
    () => submissions.filter(s => s.payload?.type === "final_vote" || s.payload?.type === "final_guess"),
    [submissions]
  );

  useEffect(() => {
    if (phase !== "questions") return;
    if (timer <= 0) {
      if (currentQ < playerCount - 1) {
        setCurrentQ(q => q + 1);
        setTimer(round.question_time_seconds ?? 20);
      } else {
        setPhase("voting");
      }
      return;
    }
    const t = setTimeout(() => setTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timer, currentQ, playerCount, round.question_time_seconds]);

  const voteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of voteSubs) {
      const opt = s.payload?.option_id;
      if (opt) counts[opt] = (counts[opt] ?? 0) + 1;
    }
    return counts;
  }, [voteSubs]);

  const winnerOptId = useMemo(
    () => Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0],
    [voteCounts]
  );

  if (phase === "questions") {
    return (
      <div className="min-h-screen bg-background text-foreground scanlines flex flex-col items-center justify-center p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Раунд — Не спали ситуацию</p>
        <h1 className="text-5xl font-display text-center mb-6">{round.title}</h1>
        <div className="glass-card p-6 max-w-2xl w-full mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Игрок {currentQ + 1} задаёт вопрос</p>
          <div className={`text-6xl font-display mb-4 ${timer <= 5 ? "text-destructive" : "text-portal"}`}>{timer}с</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-portal h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timer / (round.question_time_seconds ?? 20)) * 100}%` }} />
          </div>
        </div>
        <div className="glass-card p-5 max-w-2xl w-full mb-6">
          <p className="text-xs uppercase tracking-widest text-destructive mb-2">Запрещённые слова</p>
          <div className="flex flex-wrap gap-2">
            {round.forbidden_words.map(w => (
              <span key={w} className="text-xs border border-destructive/30 text-destructive px-2 py-1 rounded">{w}</span>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Вопросов задано: {questionSubs.length}
        </p>
        <button onClick={() => setPhase("voting")}
          className="bg-portal text-portal-foreground px-8 py-3 rounded-lg font-display">
          Перейти к голосованию →
        </button>
      </div>
    );
  }

  if (phase === "voting") {
    return (
      <div className="min-h-screen bg-background text-foreground scanlines flex flex-col items-center justify-center p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Голосование</p>
        <h1 className="text-4xl font-display text-center mb-8">Выберите настоящую ситуацию</h1>
        <div className="grid gap-4 w-full max-w-2xl mb-8">
          {round.options.map(opt => {
            const count = voteCounts[opt.id] ?? 0;
            const pct = voteSubs.length > 0 ? Math.round((count / voteSubs.length) * 100) : 0;
            return (
              <div key={opt.id} className="glass-card p-5 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-portal/10 transition-all duration-500" style={{ width: `${pct}%` }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-portal font-display text-xl">{opt.id}</span>
                    <span className="text-sm">{opt.label}</span>
                  </div>
                  <span className="font-display text-xl text-portal">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Проголосовали: {voteSubs.length} / {playerCount}
        </p>
        <button onClick={() => setPhase("result")}
          disabled={voteSubs.length === 0}
          className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl disabled:opacity-40">
          Раскрыть результат →
        </button>
      </div>
    );
  }

  const isCorrect = winnerOptId === round.correct_option_id;
  const correctOpt = round.options.find(o => o.id === round.correct_option_id);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-4xl font-display text-center">Результат</h1>
      <div className={`glass-card p-6 max-w-2xl w-full border-l-4 ${isCorrect ? "border-portal" : "border-destructive"}`}>
        <p className={`text-sm uppercase tracking-widest mb-3 ${isCorrect ? "text-portal" : "text-destructive"}`}>
          {isCorrect ? "✓ Команда угадала!" : "✗ Саботажник обманул всех!"}
        </p>
        <p className="text-lg mb-4">Правильная ситуация: <strong>{correctOpt?.label}</strong></p>
        <p className="text-muted-foreground text-sm">
          🧪 Рик: «{isCorrect ? round.success_host : round.fail_host}»
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          😰 Морти: «{isCorrect ? round.success_morty : round.fail_morty}»
        </p>
      </div>
      {onAdvance && (
        <button onClick={onAdvance}
          className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl">
          Далее →
        </button>
      )}
    </div>
  );
}
""")
f.close()
print('done')
