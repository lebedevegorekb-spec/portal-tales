import { useMemo } from "react";
import type { MechanicViewProps, VoteSaboteurRound } from "@/mechanics/types";

interface Player {
  id: string;
  display_name: string;
}

interface VoteSaboteurHostProps extends MechanicViewProps<VoteSaboteurRound> {
  players?: Player[];
}

export function VoteSaboteurHost({ round, submissions, playerCount, onAdvance, players = [] }: VoteSaboteurHostProps) {
  const votes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of submissions) {
      const accused = s.payload?.accused_player_id;
      if (accused) counts[accused] = (counts[accused] ?? 0) + 1;
    }
    return counts;
  }, [submissions]);

  const allVoted = submissions.length >= playerCount;
  const topAccused = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="min-h-screen bg-background text-foreground scanlines flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Финальное голосование
      </p>
      <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl mb-10">
        {round.intro_host}
      </p>

      {players.length > 0 && (
        <div className="grid gap-3 w-full max-w-2xl mb-8">
          {players.map((p) => {
            const count = votes[p.id] ?? 0;
            const pct = submissions.length > 0 ? Math.round((count / submissions.length) * 100) : 0;
            return (
              <div key={p.id} className={`glass-card p-4 relative overflow-hidden transition-all ${topAccused === p.id ? "border border-destructive" : ""}`}>
                <div
                  className="absolute inset-y-0 left-0 bg-destructive/10 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-lg">{p.display_name}</span>
                  <span className="font-display text-2xl text-destructive">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-6">
        Проголосовали: {submissions.length} / {playerCount}
      </p>

      {onAdvance && (
        <button
          onClick={onAdvance}
          disabled={!allVoted}
          className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {allVoted ? "Раскрыть саботажника →" : `Ждём (${submissions.length}/${playerCount})`}
        </button>
      )}
    </div>
  );
}
