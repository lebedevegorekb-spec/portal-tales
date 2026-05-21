import { useMemo, useState } from "react";
import type { MechanicViewProps, VoteSaboteurRound } from "@/mechanics/types";

interface Player {
  id: string;
  display_name: string;
}

interface VoteSaboteurHostProps extends MechanicViewProps<VoteSaboteurRound> {
  players?: Player[];
}

export function VoteSaboteurHost({ round, submissions, playerCount, onAdvance, players = [] }: VoteSaboteurHostProps) {
  const [showResult, setShowResult] = useState(false);

  const votes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of submissions) {
      const accused = s.payload?.accused_player_id;
      if (accused) counts[accused] = (counts[accused] ?? 0) + 1;
    }
    return counts;
  }, [submissions]);

  const allVoted = submissions.length >= playerCount;

  const sorted = useMemo(
    () => Object.entries(votes).sort((a, b) => b[1] - a[1]),
    [votes]
  );

  const topCount = sorted[0]?.[1] ?? 0;
  const topIds = sorted.filter(([, c]) => c === topCount).map(([id]) => id);
  const isTie = topIds.length > 1;
  const topAccused = isTie ? null : topIds[0];

  const getPlayer = (id: string) => players.find(p => p.id === id);

  if (showResult) {
    if (isTie) {
      return (
        <div className="min-h-screen text-foreground flex flex-col items-center justify-center p-8 gap-6">
          <h1 className="text-5xl font-display text-center">Ничья!</h1>
          <div className="glass-card p-6 max-w-2xl w-full border-l-4 border-yellow-500">
            <p className="text-xs uppercase tracking-widest text-yellow-500 mb-3">Голоса разделились поровну</p>
            <div className="flex gap-4 mb-4">
              {topIds.map(id => (
                <span key={id} className="text-lg font-display text-foreground">
                  {getPlayer(id)?.display_name ?? id} — {votes[id]} голосов
                </span>
              ))}
            </div>
            {round.tie_host && (
              <p className="text-muted-foreground text-sm mb-2">🧪 Рик: «{round.tie_host}»</p>
            )}
            {round.tie_morty && (
              <p className="text-muted-foreground text-sm">😰 Морти: «{round.tie_morty}»</p>
            )}
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

    return (
      <div className="min-h-screen text-foreground flex flex-col items-center justify-center p-8 gap-6">
        <h1 className="text-5xl font-display text-center">Решение принято</h1>
        <div className="glass-card p-6 max-w-2xl w-full border-l-4 border-portal">
          <p className="text-xs uppercase tracking-widest text-portal mb-3">Большинство голосов</p>
          <p className="text-2xl font-display mb-4">
            {getPlayer(topAccused!)?.display_name ?? topAccused} — {votes[topAccused!]} голосов
          </p>
          <p className="text-muted-foreground text-sm mb-2">🧪 Рик: «{round.success_host}»</p>
          <p className="text-muted-foreground text-sm">😰 Морти: «{round.success_morty}»</p>
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

  return (
    <div className="min-h-screen text-foreground scanlines flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Финальное голосование</p>
      <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl mb-10">{round.intro_host}</p>

      {players.length > 0 && (
        <div className="grid gap-3 w-full max-w-2xl mb-8">
          {players.map((p) => {
            const count = votes[p.id] ?? 0;
            const pct = submissions.length > 0 ? Math.round((count / submissions.length) * 100) : 0;
            return (
              <div key={p.id} className={`glass-card p-4 relative overflow-hidden transition-all ${topAccused === p.id && submissions.length > 0 ? "border border-destructive" : ""}`}>
                <div className="absolute inset-y-0 left-0 bg-destructive/10 transition-all duration-500" style={{ width: `${pct}%` }} />
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
        {isTie && submissions.length > 0 && <span className="text-yellow-500 ml-2">⚡ Ничья!</span>}
      </p>

      <button
        onClick={() => setShowResult(true)}
        disabled={submissions.length === 0}
        className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl disabled:opacity-40"
      >
        {submissions.length > 0 ? `Раскрыть результат (${submissions.length}/${playerCount})` : "Ждём голосов..."}
      </button>
    </div>
  );
}
