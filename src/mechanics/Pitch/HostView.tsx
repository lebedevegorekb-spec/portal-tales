import { useState, useEffect, useMemo } from "react";
import type { MechanicViewProps, PitchRound } from "@/mechanics/types";

interface Player {
  id: string;
  display_name: string;
}

interface PitchHostProps extends MechanicViewProps<PitchRound> {
  players?: Player[];
}

export function PitchHost({ round, submissions, playerCount, onAdvance, players = [] }: PitchHostProps) {
  const [phase, setPhase] = useState<"pitching" | "voting">("pitching");
  const [currentPitcher, setCurrentPitcher] = useState(0);
  const [timeLeft, setTimeLeft] = useState(round.pitch_time_seconds ?? 30);

  useEffect(() => {
    if (phase !== "pitching") return;
    if (timeLeft <= 0) {
      if (currentPitcher < players.length - 1) {
        setCurrentPitcher((p) => p + 1);
        setTimeLeft(round.pitch_time_seconds ?? 30);
      } else {
        setPhase("voting");
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, currentPitcher, players.length, round.pitch_time_seconds]);

  const votes = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of submissions.filter((s) => s.payload?.vote_for_option_index !== undefined)) {
      const idx = String(s.payload.vote_for_option_index);
      counts[idx] = (counts[idx] ?? 0) + 1;
    }
    return counts;
  }, [submissions]);

  const allVoted = submissions.filter((s) => s.payload?.vote_for_option_index !== undefined).length >= playerCount;
  const pitcher = players[currentPitcher];

  useEffect(() => {
    if (!allVoted || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }, [allVoted]);

  return (
    <div className="min-h-screen text-foreground relative z-10 flex flex-col items-center justify-center p-8">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
        Раунд — Питч
      </p>
      <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>

      {phase === "pitching" && pitcher && (
        <>
          <p className="text-2xl text-muted-foreground mb-2">Питчует:</p>
          <p className="text-4xl font-display text-portal mb-8">{pitcher.display_name}</p>
          <div className={`text-6xl font-display mb-4 ${timeLeft <= 5 ? "text-destructive" : "text-foreground"}`}>
            {timeLeft}с
          </div>
          <div className="w-full max-w-md bg-muted rounded-full h-2 mb-8">
            <div
              className="bg-portal h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / (round.pitch_time_seconds ?? 30)) * 100}%` }}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            {currentPitcher + 1} / {players.length}
          </p>
        </>
      )}

      {phase === "voting" && (
        <>
          <p className="text-xl text-muted-foreground mb-8">Голосуйте за лучшую идею!</p>
          <div className="grid gap-3 w-full max-w-2xl mb-8">
            {round.player_options.slice(0, players.length).map((opt, i) => {
              const count = votes[String(i)] ?? 0;
              const player = players[i];
              return (
                <div key={i} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{player?.display_name}</p>
                    <p className="text-base">{opt}</p>
                  </div>
                  <span className="font-display text-2xl text-portal">{count}</span>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Проголосовали: {submissions.filter((s) => s.payload?.vote_for_option_index !== undefined).length} / {playerCount}
          </p>
          
        </>
      )}
    </div>
  );
}
