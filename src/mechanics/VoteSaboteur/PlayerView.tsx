import { useState } from "react";
import type { MechanicViewProps, VoteSaboteurRound } from "@/mechanics/types";

interface Player {
  id: string;
  display_name: string;
}

interface VoteSaboteurPlayerProps extends MechanicViewProps<VoteSaboteurRound> {
  players?: Player[];
}

export function VoteSaboteurPlayer({ round, submissions, playerId, onSubmit, players = [] }: VoteSaboteurPlayerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const alreadySubmitted = submissions.some((s) => s.player_id === playerId);

  const handleVote = async (accusedId: string) => {
    if (alreadySubmitted || loading || accusedId === playerId) return;
    setSelected(accusedId);
    setLoading(true);
    await onSubmit({ accused_player_id: accusedId });
    setLoading(false);
  };

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Голос отдан</h2>
          <p className="text-muted-foreground">Ждём остальных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          Кто саботажник?
        </p>
        <h1 className="text-3xl font-display mb-3">{round.title}</h1>
        <p className="text-muted-foreground mb-8">{round.intro_morty}</p>

        <div className="grid gap-3">
          {players
            .filter((p) => p.id !== playerId)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => handleVote(p.id)}
                disabled={loading}
                className={`glass-card p-5 text-left border-2 transition-all ${
                  selected === p.id
                    ? "border-destructive bg-destructive/10"
                    : "border-transparent hover:border-border"
                } disabled:opacity-60`}
              >
                <span className="text-lg">{p.display_name}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
