import type { RoundConfig, RoundSubmission } from "@/mechanics/types";

export interface TestPlayer {
  id: string;
  display_name: string;
  isSaboteur: boolean;
}

export interface RoundCalcResult {
  team_scored: boolean;
  saboteur_scored: boolean;
  team_points: number;
  saboteur_points: number;
  is_tie?: boolean;
  is_joke?: boolean;
  joke_option?: any;
}

export const TEST_PLAYERS: TestPlayer[] = [
  { id: "player-1", display_name: "Игрок 1", isSaboteur: false },
  { id: "player-2", display_name: "Игрок 2", isSaboteur: false },
  { id: "player-3", display_name: "Саботажник", isSaboteur: true },
];

export function calcRoundResult(round: any, submissions: RoundSubmission[], saboteurPlayerId: string, playerCount: number): RoundCalcResult {
  switch (round.mechanic) {
    case "joke_vote": return calcJokeVote(submissions, saboteurPlayerId, round);
    case "fork": return calcFork(submissions, saboteurPlayerId, round);
    case "guess_author": return calcGuessAuthor(submissions, saboteurPlayerId, round, playerCount);
    case "pitch": return calcPitch(submissions, saboteurPlayerId, round);
    case "blitz": return calcBlitz(submissions, saboteurPlayerId, round);
    case "quiz": return calcQuiz(submissions, saboteurPlayerId, round);
    case "vote_saboteur": return calcVoteSaboteur(submissions, saboteurPlayerId, round);
    case "situation_deduction": return calcSituationDeduction(submissions, saboteurPlayerId, round);
    default: return { team_scored: false, saboteur_scored: false, team_points: 0, saboteur_points: 0 };
  }
}

function calcJokeVote(submissions: RoundSubmission[], saboteurPlayerId: string, round: any): RoundCalcResult {
  const votes: Record<string, number> = {};
  for (const s of submissions) { const voted = s.payload?.vote_for_submission_id; if (voted) votes[voted] = (votes[voted] ?? 0) + 1; }
  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const isTie = sorted.length > 1 && sorted[0]?.[1] === sorted[1]?.[1];
  if (isTie) return { team_scored: false, saboteur_scored: false, team_points: 0, saboteur_points: 0, is_tie: true };
  const winnerId = sorted[0]?.[0];
  const winnerSubmission = submissions.find((s) => s.id === winnerId);
  const saboteurWon = winnerSubmission?.player_id === saboteurPlayerId;
  return { team_scored: !saboteurWon, saboteur_scored: saboteurWon, team_points: saboteurWon ? 0 : round.points?.team_success ?? 1, saboteur_points: saboteurWon ? round.points?.saboteur_success ?? 1 : 0, is_tie: false };
}

function calcFork(submissions: RoundSubmission[], saboteurPlayerId: string, round: any): RoundCalcResult {
  const votes: Record<string, number> = {};
  for (const s of submissions) { const opt = s.payload?.option_id; if (opt) votes[opt] = (votes[opt] ?? 0) + 1; }
  const winnerId = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  const correctOption = round.options?.find((o: any) => o.is_correct);
  const jokeOption = round.options?.find((o: any) => o.is_joke);
  const isJoke = winnerId === jokeOption?.id;
  const teamWon = winnerId === correctOption?.id;
  return { team_scored: teamWon, saboteur_scored: !teamWon && !isJoke, team_points: teamWon ? round.points?.team_success ?? 1 : 0, saboteur_points: teamWon || isJoke ? 0 : round.points?.saboteur_success ?? 1, is_joke: isJoke, joke_option: isJoke ? jokeOption : null };
}

function calcGuessAuthor(submissions: RoundSubmission[], saboteurPlayerId: string, round: any, playerCount: number): RoundCalcResult {
  const guessSubmissions = submissions.filter((s) => s.payload?.guesses);
  let correctGuesses = 0;
  for (const s of guessSubmissions) { const guesses: Record<string, string> = s.payload.guesses ?? {}; for (const [, g] of Object.entries(guesses)) { if (g === saboteurPlayerId) correctGuesses++; } }
  const teamWon = correctGuesses > playerCount / 2;
  return { team_scored: teamWon, saboteur_scored: !teamWon, team_points: teamWon ? round.points?.team_success ?? 1 : 0, saboteur_points: teamWon ? 0 : round.points?.saboteur_success ?? 1 };
}

function calcPitch(submissions: RoundSubmission[], saboteurPlayerId: string, round: any): RoundCalcResult {
  const votes: Record<string, number> = {};
  for (const s of submissions) { const opt = s.payload?.vote_for_option_index; if (opt !== undefined) votes[opt] = (votes[opt] ?? 0) + 1; }
  const winnerIndex = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  const pitchSubs = submissions.filter((s) => s.payload?.my_option_index !== undefined);
  const saboteurPitch = pitchSubs.find((s) => s.player_id === saboteurPlayerId);
  const saboteurWon = String(saboteurPitch?.payload?.my_option_index) === String(winnerIndex);
  return { team_scored: !saboteurWon, saboteur_scored: saboteurWon, team_points: saboteurWon ? 0 : round.points?.team_success ?? 1, saboteur_points: saboteurWon ? round.points?.saboteur_success ?? 1 : 0 };
}

function calcBlitz(submissions: RoundSubmission[], saboteurPlayerId: string, round: any): RoundCalcResult {
  const questions = round.questions ?? [];
  let correctCount = 0; let saboteurCorrect = 0;
  for (const s of submissions) {
    const answers: Record<string, string> = s.payload?.answers ?? {};
    const allCorrect = questions.every((q: any) => answers[q.id] === q.correct_id);
    if (allCorrect) correctCount++;
    if (s.player_id === saboteurPlayerId && allCorrect) saboteurCorrect = round.points_saboteur_self ?? 1;
  }
  const teamWon = correctCount >= submissions.length / 2;
  return { team_scored: teamWon, saboteur_scored: saboteurCorrect > 0 || !teamWon, team_points: teamWon ? round.points?.team_success ?? 1 : 0, saboteur_points: saboteurCorrect + (!teamWon ? round.points_saboteur_team_fail ?? 1 : 0) };
}

function calcQuiz(submissions: RoundSubmission[], saboteurPlayerId: string, round: any): RoundCalcResult {
  const questions = round.questions ?? [];
  let correctCount = 0;
  for (const s of submissions) { const answers: Record<string, string> = s.payload?.answers ?? {}; if (questions.every((q: any) => answers[q.id] === q.correct_id)) correctCount++; }
  const teamWon = correctCount >= submissions.length / 2;
  return { team_scored: teamWon, saboteur_scored: !teamWon, team_points: teamWon ? round.points?.team_success ?? 1 : 0, saboteur_points: teamWon ? 0 : round.points?.saboteur_success ?? 1 };
}

function calcVoteSaboteur(submissions: RoundSubmission[], saboteurPlayerId: string, round: any): RoundCalcResult {
  const votes: Record<string, number> = {};
  for (const s of submissions) { const accused = s.payload?.accused_player_id; if (accused) votes[accused] = (votes[accused] ?? 0) + 1; }
  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const isTie = sorted.length > 1 && sorted[0]?.[1] === sorted[1]?.[1];
  if (isTie) return { team_scored: false, saboteur_scored: false, team_points: 0, saboteur_points: 0, is_tie: true };
  const teamWon = sorted[0]?.[0] === saboteurPlayerId;
  return { team_scored: teamWon, saboteur_scored: !teamWon, team_points: teamWon ? round.points?.team_success ?? 1 : 0, saboteur_points: teamWon ? 0 : round.points?.saboteur_success ?? 1 };
}

function calcSituationDeduction(submissions: RoundSubmission[], saboteurPlayerId: string, round: any): RoundCalcResult {
  const sub = submissions.find((s) => s.player_id === saboteurPlayerId && s.payload?.type === "final_guess");
  const saboteurWon = sub?.payload?.option_id === round.correct_option_id;
  return { team_scored: !saboteurWon, saboteur_scored: saboteurWon, team_points: saboteurWon ? 0 : round.points?.team_success ?? 1, saboteur_points: saboteurWon ? round.points?.saboteur_success ?? 1 : 0 };
}

export function makeSubmission(playerId: string, roundId: string, mechanic: string, payload: Record<string, any>): RoundSubmission {
  return { id: 	est---, run_id: "test-run", room_id: "test-room", player_id: playerId, round_id: roundId, mechanic: mechanic as any, payload, submitted_at: new Date().toISOString() };
}
