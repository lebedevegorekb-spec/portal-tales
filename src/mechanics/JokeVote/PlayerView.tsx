import { useState, useMemo } from "react";
import type { MechanicViewProps, JokeVoteRound } from "@/mechanics/types";

export function JokeVotePlayer({ round, submissions, playerId, onSubmit }: MechanicViewProps<JokeVoteRound>) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const myAnswerSubmission = useMemo(
    () => submissions.find((s) => s.player_id === playerId && s.payload?.answer !== undefined),
    [submissions, playerId]
  );

  const myVoteSubmission = useMemo(
    () => submissions.find((s) => s.player_id === playerId && s.payload?.vote_for_submission_id !== undefined),
    [submissions, playerId]
  );

  const answerSubmissions = useMemo(
    () => submissions.filter((s) => s.payload?.answer !== undefined),
    [submissions]
  );

  const allAnswered = answerSubmissions.length > 0 &&
    answerSubmissions.every((s) => s.payload?.answer !== undefined);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    await onSubmit({ answer: answer.trim() });
    setLoading(false);
  };

  const handleVote = async (submissionId: string) => {
    if (loading || myVoteSubmission) return;
    setLoading(true);
    await onSubmit({ vote_for_submission_id: submissionId });
    setLoading(false);
  };

  if (myVoteSubmission) {
    return (
      <div className="min-h-screen text-foreground relative z-10 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Голос отдан!</h2>
          <p className="text-muted-foreground">Ждём остальных...</p>
        </div>
      </div>
    );
  }

  if (myAnswerSubmission && allAnswered) {
    const others = answerSubmissions.filter((s) => s.player_id !== playerId);
    return (
      <div className="min-h-screen text-foreground relative z-10 px-4 py-8">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Раунд — Шутка</p>
          <h1 className="text-3xl font-display mb-2">{round.title}</h1>
          <p className="text-muted-foreground mb-6">Выбери самый смешной ответ!</p>
          <div className="space-y-3">
            {others.map((s) => (
              <button
                key={s.id}
                onClick={() => handleVote(s.id)}
                disabled={loading}
                className="w-full glass-card p-5 text-left rounded-xl hover:border-portal/60 transition-all disabled:opacity-50 text-lg"
              >
                {s.payload.answer}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (myAnswerSubmission && !allAnswered) {
    return (
      <div className="min-h-screen text-foreground relative z-10 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Ответ принят!</h2>
          <div className="glass-card p-4 rounded-xl mb-4 border border-portal/30">
            <p className="text-sm text-muted-foreground mb-1">Твой ответ:</p>
            <p className="text-foreground font-medium">{myAnswerSubmission.payload.answer}</p>
          </div>
          <p className="text-muted-foreground text-sm">Ждём остальных... {answerSubmissions.length} / ? ответили</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground relative z-10 px-4 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Раунд — Шутка</p>
        <h1 className="text-3xl font-display mb-3">{round.title}</h1>
        <p className="text-muted-foreground mb-8">{round.prompt}</p>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Твой ответ..."
          rows={4}
          className="w-full bg-muted border border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground resize-none mb-4 focus:outline-none focus:border-portal"
        />
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <button
            onClick={handleSubmitAnswer}
            disabled={!answer.trim() || loading}
            className="w-full h-14 bg-portal text-portal-foreground rounded-lg font-display text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Отправляем..." : "Отправить ответ"}
          </button>
        </div>
      </div>
    </div>
  );
}

