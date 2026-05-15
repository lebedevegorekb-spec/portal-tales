import os
os.makedirs('src/utils', exist_ok=True)

calc = '''import type { RoundConfig, RoundSubmission, MechanicType } from "@/mechanics/types";

export interface TestPlayer {
  id: string;
  display_name: string;
}

export const TEST_PLAYERS: TestPlayer[] = [
  { id: "player-1", display_name: "Игрок 1" },
  { id: "player-2", display_name: "Игрок 2" },
  { id: "player-3", display_name: "Игрок 3" },
  { id: "player-4", display_name: "Игрок 4" },
];

export interface RoundCalcResult {
  team_scored: boolean;
  saboteur_scored: boolean;
  team_points: number;
  saboteur_points: number;
  is_tie?: boolean;
  is_joke?: boolean;
  joke_option?: any;
}

export function makeSubmission(playerId: string, roundId: string, mechanic: string, payload: Record<string, any>): RoundSubmission {
  return {
    id: "test-" + Math.random().toString(36).slice(2),
    run_id: "test-run",
    room_id: "test-room",
    player_id: playerId,
    round_id: roundId,
    mechanic: mechanic as MechanicType,
    payload,
    submitted_at: new Date().toISOString(),
  };
}

export function calcRoundResult(round: RoundConfig, submissions: RoundSubmission[], saboteurId: string, playerCount: number): RoundCalcResult {
  const mech = round.mechanic;

  if (mech === "joke_vote") {
    const votes: Record<string, number> = {};
    for (const s of submissions) {
      const v = s.payload?.vote_for_submission_id;
      if (v) votes[v] = (votes[v] ?? 0) + 1;
    }
    const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    const isTie = sorted.length > 1 && sorted[0]?.[1] === sorted[1]?.[1];
    if (isTie) return { team_scored: false, saboteur_scored: false, team_points: 0, saboteur_points: 0, is_tie: true };
    const winnerId = sorted[0]?.[0];
    const winner = submissions.find((s) => s.id === winnerId);
    const saboteurWon = winner?.player_id === saboteurId;
    return { team_scored: !saboteurWon, saboteur_scored: saboteurWon, team_points: saboteurWon ? 0 : (round as any).points?.team_success ?? 1, saboteur_points: saboteurWon ? (round as any).points?.saboteur_success ?? 1 : 0 };
  }

  if (mech === "fork") {
    const votes: Record<string, number> = {};
    for (const s of submissions) {
      const opt = s.payload?.option_id;
      if (opt) votes[opt] = (votes[opt] ?? 0) + 1;
    }
    const winnerId = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
    const correctOption = (round as any).options?.find((o: any) => o.is_correct);
    const jokeOption = (round as any).options?.find((o: any) => o.is_joke);
    const isJoke = winnerId === jokeOption?.id;
    const teamWon = winnerId === correctOption?.id;
    return { team_scored: teamWon, saboteur_scored: !teamWon && !isJoke, team_points: teamWon ? (round as any).points?.team_success ?? 1 : 0, saboteur_points: teamWon || isJoke ? 0 : (round as any).points?.saboteur_success ?? 1, is_joke: isJoke, joke_option: isJoke ? jokeOption : null };
  }

  if (mech === "vote_saboteur") {
    const votes: Record<string, number> = {};
    for (const s of submissions) {
      const accused = s.payload?.accused_player_id;
      if (accused) votes[accused] = (votes[accused] ?? 0) + 1;
    }
    const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    const isTie = sorted.length > 1 && sorted[0]?.[1] === sorted[1]?.[1];
    if (isTie) return { team_scored: false, saboteur_scored: false, team_points: 0, saboteur_points: 0, is_tie: true };
    const teamWon = sorted[0]?.[0] === saboteurId;
    return { team_scored: teamWon, saboteur_scored: !teamWon, team_points: teamWon ? (round as any).points?.team_success ?? 1 : 0, saboteur_points: teamWon ? 0 : (round as any).points?.saboteur_success ?? 1 };
  }

  return { team_scored: true, saboteur_scored: false, team_points: 1, saboteur_points: 0 };
}
'''

open('src/utils/roundCalc.ts', 'w', encoding='utf-8', newline='\n').write(calc)
print('roundCalc.ts done')
