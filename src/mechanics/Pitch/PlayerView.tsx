import { useState } from "react";
import type { MechanicViewProps, PitchRound } from "@/mechanics/types";

interface Player {
  id: string;
  display_name: string;
}

interface PitchPlayerProps extends MechanicViewProps<PitchRound> {
  players?: Player[];
  myOptionIndex?: number;
}

export function PitchPlayer({ round, submissions, playerId, onSubmit, players = [], myOptionIndex = 0 }: PitchPlayerProps) {
  const [vote, setVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const myPitchSubmission = submissions.find(
    (s) => s.player_id === playerId && s.payload?.my_option_index !== undefined
  );
  const myVoteSubmission = submissions.find(
    (s) => s.player_id === playerId && s.payload?.vote_for_option_index !== undefined
  );

  const myIdea = round.player_options[myOptionIndex];

  const handleVote = async (idx: number) => {
    if (loading || myVoteSubmission) return;
    setVote(idx);
    setLoading(true);
    await onSubmit({ vote_for_option_index: idx, my_option_index: myOptionIndex });
    setLoading(false);
  };

  if (myVoteSubmission) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Голос отдан</h2>
          <p className="text-muted-foreground">Ждём итогов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Питч</p>
        <h1 className="text-3xl font-display mb-4">{round.title}</h1>

        <div className="glass-card p-5 border border-portal mb-8">
          <p className="text-xs uppercase tracking-widest text-portal mb-2">Твоя идея</p>
          <p className="text-lg">{myIdea}</p>
        </div>

        <p className="text-muted-foreground mb-6">Проголосуй за лучшую идею:</p>
        <div className="grid gap-3">
          {round.player_options.slice(0, players.length).map((opt, i) => (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={loading || i === myOptionIndex}
              className={`glass-card p-4 text-left border-2 transition-all ${
                vote === i
                  ? "border-portal bg-portal/10"
                  : i === myOptionIndex
                  ? "border-muted opacity-50 cursor-not-allowed"
                  : "border-transparent hover:border-border"
              }`}
            >
              <p className="text-sm text-muted-foreground mb-1">{players[i]?.display_name}</p>
              <p className="text-base">{opt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
