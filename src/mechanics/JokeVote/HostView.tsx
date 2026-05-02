import { useState, useMemo } from "react";
import type { MechanicViewProps, JokeVoteRound, RoundSubmission } from "@/mechanics/types";

export function JokeVoteHost({ round, submissions, playerCount, onAdvance }: MechanicViewProps<JokeVoteRound>) {
  const [votingPhase, setVotingPhase] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({});

  const answerSubmissions = useMemo(
    () => submissions.filter((s) => s.payload?.answer !== undefined),
    [submissions]
  );

  const allAnswered = answerSubmissions.length >= playerCount;

  const handleVote = (submissionId: string) => {
    setVotes((prev) => ({ ...prev, [submissionId]: (prev[submissionId] ?? 0) + 1 }));
  };

  const topVoted = useMemo(() => {
    return Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [votes]);

  return (
    <div className="min-h-screen bg-background text-foreground scanlines flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Раунд — Шутка
      </p>
      <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>
      <p className="text-xl text-muted-foreground text-center max-w-2xl mb-8">
        {round.prompt}
      </p>

      {!votingPhase ? (
        <>
          <p className="text-sm text-muted-foreground mb-8">
            Ответов получено: {answerSubmissions.length} / {playerCount}
          </p>
          <button
            onClick={() => setVotingPhase(true)}
            disabled={!allAnswered}
            className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allAnswered ? "Показать ответы →" : `Ждём (${answerSubmissions.length}/${playerCount})`}
          </button>
        </>
      ) : (
        <>
          <div className="grid gap-4 w-full max-w-2xl mb-8">
            {answerSubmissions.map((s, i) => (
              <div key={s.id} className="glass-card p-5 flex items-center justify-between">
                <span className="text-lg flex-1">{s.payload.answer}</span>
                <button
                  onClick={() => handleVote(s.id)}
                  className={`ml-4 px-4 py-2 rounded-lg font-display transition-all ${
                    topVoted === s.id
                      ? "bg-portal text-portal-foreground"
                      : "border border-border hover:border-portal"
                  }`}
                >
                  👍 {votes[s.id] ?? 0}
                </button>
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
