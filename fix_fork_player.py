import { useState } from "react";
import type { MechanicViewProps, ForkRound } from "@/mechanics/types";

export function ForkPlayer({ round, submissions, playerId, onSubmit }: MechanicViewProps<ForkRound>) {
  const [loading, setLoading] = useState(false);

  const mySubmission = submissions.find(
    (s) => s.player_id === playerId && s.payload?.option_id !== undefined
  );

  const handleVote = async (optionId: string) => {
    if (loading || mySubmission) return;
    setLoading(true);
    await onSubmit({ option_id: optionId });
    setLoading(false);
  };

  if (mySubmission) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Выбор сделан!</h2>
          <p className="text-muted-foreground">Ждём остальных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Раунд — Развилка</p>
        <h1 className="text-3xl font-display mb-3">{round.title}</h1>
        <p className="text-muted-foreground mb-8">{round.situation}</p>
        <div className="space-y-3">
          {round.options?.map((opt: any) => (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={loading}
              className="w-full glass-card p-5 text-left rounded-xl hover:border-portal/60 transition-all disabled:opacity-50 flex items-start gap-3"
            >
              <span className="font-display text-portal text-xl shrink-0">{opt.id}</span>
              <span className="text-base">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
