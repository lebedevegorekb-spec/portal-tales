import { useMemo } from "react";
import type { MechanicViewProps, ForkRound } from "@/mechanics/types";

export function ForkHost({ round, submissions, playerCount, onAdvance }: MechanicViewProps<ForkRound>) {
  const votes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of submissions) {
      const opt = s.payload?.option_id;
      if (opt) counts[opt] = (counts[opt] ?? 0) + 1;
    }
    return counts;
  }, [submissions]);

  const totalVotes = submissions.length;
  const allVoted = totalVotes >= playerCount;

  return (
    <div className="min-h-screen bg-background text-foreground scanlines flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Раунд — Развилка
      </p>
      <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl mb-10">
        {round.situation}
      </p>

      <div className="grid gap-4 w-full max-w-2xl mb-8">
        {round.options.map((opt) => {
          const count = votes[opt.id] ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <div key={opt.id} className="glass-card p-5 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-portal/10 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-portal font-display text-2xl">{opt.id}</span>
                  <span className="text-lg">{opt.label}</span>
                </div>
                <span className="text-2xl font-display text-portal">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground mb-2">
        Проголосовали: {totalVotes} / {playerCount}
      </p>

      <p className="text-muted-foreground italic text-center max-w-xl mb-8">
        💬 Рик: «{round.hint}»
      </p>

      {onAdvance && (
        <button
          onClick={onAdvance}
          disabled={!allVoted}
          className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {allVoted ? "Подвести итог →" : `Ждём голосов (${totalVotes}/${playerCount})`}
        </button>
      )}
    </div>
  );
}
