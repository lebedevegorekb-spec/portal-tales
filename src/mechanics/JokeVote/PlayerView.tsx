import { useState } from "react";
import type { MechanicViewProps, JokeVoteRound } from "@/mechanics/types";

export function JokeVotePlayer({ round, submissions, playerId, onSubmit }: MechanicViewProps<JokeVoteRound>) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const alreadySubmitted = submissions.some(
    (s) => s.player_id === playerId && s.payload?.answer !== undefined
  );

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    await onSubmit({ answer: answer.trim() });
    setLoading(false);
  };

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Ответ отправлен</h2>
          <p className="text-muted-foreground">Ждём остальных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Раунд — Шутка
        </p>
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
            onClick={handleSubmit}
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
