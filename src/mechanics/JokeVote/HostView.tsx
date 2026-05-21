import { useMemo } from "react";
import type { MechanicViewProps, JokeVoteRound } from "@/mechanics/types";

export function JokeVoteHost({ round, submissions, playerCount, onAdvance }: MechanicViewProps<JokeVoteRound>) {
  const answerSubmissions = useMemo(
    () => submissions.filter((s) => s.payload?.answer !== undefined),
    [submissions]
  );

  const voteSubmissions = useMemo(
    () => submissions.filter((s) => s.payload?.vote_for_submission_id !== undefined),
    [submissions]
  );

  const allAnswered = answerSubmissions.length >= playerCount;
  const allVoted = voteSubmissions.length >= playerCount;

  const votes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of voteSubmissions) {
      const id = s.payload.vote_for_submission_id;
      if (id) counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, [voteSubmissions]);

  const sortedVotes = useMemo(
    () => Object.entries(votes).sort((a, b) => b[1] - a[1]),
    [votes]
  );
  const topVotedId = sortedVotes[0]?.[0];
  const isTie = sortedVotes.length > 1 && sortedVotes[0]?.[1] === sortedVotes[1]?.[1];

  if (!allAnswered) {
    return (
      <div className="min-h-screen text-foreground relative z-10 scanlines flex flex-col items-center justify-center p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Раунд — Шутка</p>
        <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl mb-8">{round.prompt}</p>
        <p className="text-sm text-muted-foreground mb-8">Ответов получено: {answerSubmissions.length} / {playerCount}</p>
        <button disabled className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl opacity-40 cursor-not-allowed">
          Ждём ({answerSubmissions.length}/{playerCount})
        </button>
      </div>
    );
  }

  if (!allVoted) {
    return (
      <div className="min-h-screen text-foreground relative z-10 scanlines flex flex-col items-center justify-center p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Раунд — Шутка</p>
        <h1 className="text-5xl font-display text-center mb-8">{round.title}</h1>
        <div className="grid gap-4 w-full max-w-2xl mb-8">
          {answerSubmissions.map((s) => (
            <div key={s.id} className="glass-card p-5 flex items-center justify-between">
              <span className="text-lg flex-1">{s.payload.answer}</span>
              <span className="ml-4 text-2xl font-display text-portal">{votes[s.id] ?? 0}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Проголосовали: {voteSubmissions.length} / {playerCount}</p>
      </div>
    );
  }

  const winner = answerSubmissions.find((s) => s.id === topVotedId);
  return (
    <div className="min-h-screen text-foreground relative z-10 scanlines flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Раунд — Шутка</p>
      <h1 className="text-5xl font-display text-center mb-8">{round.title}</h1>
      <div className="grid gap-4 w-full max-w-2xl mb-8">
        {answerSubmissions
          .sort((a, b) => (votes[b.id] ?? 0) - (votes[a.id] ?? 0))
          .map((s) => (
            <div key={s.id} className={`glass-card p-5 flex items-center justify-between transition-all ${s.id === topVotedId ? "border-portal shadow-[var(--shadow-portal)]" : ""}`}>
              <span className="text-lg flex-1">{s.payload.answer}</span>
              <span className={`ml-4 text-2xl font-display ${s.id === topVotedId ? "text-portal" : "text-muted-foreground"}`}>{votes[s.id] ?? 0} 👍</span>
            </div>
          ))}
      </div>
      {winner && <p className="text-muted-foreground mb-8">Победитель: <span className="text-portal font-display">{winner.payload.answer}</span></p>}
      {onAdvance && (
        <button onClick={onAdvance} className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl">
          Подвести итог →
        </button>
      )}
    </div>
  );
}

