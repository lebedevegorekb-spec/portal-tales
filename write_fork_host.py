f = open('src/mechanics/Fork/HostView.tsx', 'w', encoding='utf-8', newline='\n')
f.write("""import { useMemo, useState } from "react";
import type { MechanicViewProps, ForkRound } from "@/mechanics/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
function getUrl(path?: string) {
  if (!path) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/scenario-media/${path}`;
}

export function ForkHost({ round, submissions, playerCount, onAdvance }: MechanicViewProps<ForkRound>) {
  const [showResult, setShowResult] = useState(false);
  const [jokeOpt, setJokeOpt] = useState<any>(null);

  const votes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of submissions) {
      const opt = s.payload?.option_id;
      if (opt) counts[opt] = (counts[opt] ?? 0) + 1;
    }
    return counts;
  }, [submissions]);

  const totalVotes = submissions.length;

  const winnerOptId = useMemo(() => {
    return Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [votes]);

  const handleShowResult = () => {
    const winner = round.options.find((o: any) => o.id === winnerOptId);
    if (winner?.is_joke) setJokeOpt(winner);
    setShowResult(true);
  };

  if (showResult && jokeOpt) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 gap-6">
        {jokeOpt.joke_image && (
          <img src={getUrl(jokeOpt.joke_image)} alt="" className="max-h-64 rounded-xl border border-border object-contain" />
        )}
        <div className="glass-card p-6 max-w-2xl w-full border-l-2 border-yellow-500">
          <p className="text-xs uppercase tracking-widest text-yellow-500 mb-2">🃏 Шутливый вариант выбран!</p>
          {jokeOpt.joke_host_line && (
            <p className="text-lg mb-2">🧪 Рик: «{jokeOpt.joke_host_line}»</p>
          )}
          {jokeOpt.joke_morty_line && (
            <p className="text-lg text-muted-foreground">😰 Морти: «{jokeOpt.joke_morty_line}»</p>
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

  if (showResult) {
    const winner = round.options.find((o: any) => o.id === winnerOptId);
    const isCorrect = winner?.is_correct;
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 gap-6">
        <h1 className="text-5xl font-display text-center">{round.title}</h1>
        <div className={`glass-card p-6 max-w-2xl w-full border-l-2 ${isCorrect ? "border-portal" : "border-destructive"}`}>
          <p className={`text-xs uppercase tracking-widest mb-2 ${isCorrect ? "text-portal" : "text-destructive"}`}>
            {isCorrect ? "✓ Правильно!" : "✗ Неверно"}
          </p>
          <p className="text-lg mb-1">Выбран вариант {winnerOptId}: {winner?.label}</p>
          <p className="text-muted-foreground text-sm mt-4">
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

  return (
    <div className="min-h-screen bg-background text-foreground scanlines flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Раунд — Развилка</p>
      <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl mb-10">{round.situation}</p>
      <div className="grid gap-4 w-full max-w-2xl mb-8">
        {round.options.map((opt: any) => {
          const count = votes[opt.id] ?? 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return (
            <div key={opt.id} className="glass-card p-5 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-portal/10 transition-all duration-500" style={{ width: `${pct}%` }} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`font-display text-2xl ${opt.is_joke ? "text-yellow-500" : "text-portal"}`}>{opt.id}</span>
                  <span className="text-lg">{opt.label}</span>
                  {opt.is_joke && <span className="text-xs text-yellow-500 border border-yellow-500/30 px-1.5 py-0.5 rounded">шутка</span>}
                </div>
                <span className="text-2xl font-display text-portal">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mb-2">Проголосовали: {totalVotes} / {playerCount}</p>
      <p className="text-muted-foreground italic text-center max-w-xl mb-8">💬 Рик: «{round.hint}»</p>
      <button
        onClick={handleShowResult}
        disabled={totalVotes === 0}
        className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {totalVotes > 0 ? `Подвести итог (${totalVotes}/${playerCount})` : "Ждём голосов..."}
      </button>
    </div>
  );
}
""")
f.close()
print('done')
