export type MechanicType =
  | "joke_vote"
  | "fork"
  | "guess_author"
  | "pitch"
  | "blitz"
  | "quiz"
  | "vote_saboteur"
  | "situation_deduction";

export interface RoundBase {
  id: string;
  mechanic: MechanicType;
  title: string;
  intro_host?: string;
  intro_host_audio?: string;
  intro_morty?: string;
  intro_morty_audio?: string;
  success_host?: string;
  success_host_audio?: string;
  success_morty?: string;
  success_morty_audio?: string;
  fail_host?: string;
  fail_host_audio?: string;
  fail_morty?: string;
  fail_morty_audio?: string;
  background_image?: string;
  background_music?: string;
  points: {
    team_success: number;
    saboteur_success: number;
  };
  time_limit_seconds?: number;
}

export interface JokeVoteRound extends RoundBase {
  mechanic: "joke_vote";
  prompt: string;
  tie_host?: string;
  tie_host_audio?: string;
  tie_morty?: string;
  tie_morty_audio?: string;
}

export interface ForkOption {
  id: string;
  label: string;
  is_correct: boolean;
  is_joke?: boolean;
  joke_host_line?: string;
  joke_morty_line?: string;
}

export interface ForkRound extends RoundBase {
  mechanic: "fork";
  situation: string;
  options: ForkOption[];
  hint: string;
}

export interface GuessAuthorRound extends RoundBase {
  mechanic: "guess_author";
  prompt_prefix: string;
}

export interface PitchRound extends RoundBase {
  mechanic: "pitch";
  situation: string;
  player_options: string[];
  pitch_time_seconds: number;
}

export interface BlitzQuestion {
  id: string;
  text: string;
  options: { id: string; label: string }[];
  correct_id: string;
}

export interface BlitzRound extends RoundBase {
  mechanic: "blitz";
  questions: BlitzQuestion[];
  points_saboteur_self: number;
  points_saboteur_team_fail: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; label: string }[];
  correct_id: string;
}

export interface QuizRound extends RoundBase {
  mechanic: "quiz";
  questions: QuizQuestion[];
}

export interface SituationOption {
  id: string;
  label: string;
}

export interface SituationDeductionRound extends RoundBase {
  mechanic: "situation_deduction";
  situation_real: string;
  situation_fake: string;
  forbidden_words: string[];
  question_time_seconds: number;
  options: SituationOption[];
  correct_option_id: string;
}

export interface VoteSaboteurRound extends RoundBase {
  mechanic: "vote_saboteur";
  tie_host?: string;
  tie_morty?: string;
  tie_host_audio?: string;
  tie_morty_audio?: string;
}

export type RoundConfig =
  | JokeVoteRound
  | ForkRound
  | GuessAuthorRound
  | PitchRound
  | BlitzRound
  | QuizRound
  | VoteSaboteurRound
  | SituationDeductionRound;

export interface RoundResult {
  round_id: string;
  mechanic: MechanicType;
  team_scored: boolean;
  saboteur_scored: boolean;
  team_points: number;
  saboteur_points: number;
}

export interface PartyGameState {
  current_round_index: number;
  phase: "intro" | "round" | "final";
  scores: {
    team: number;
    saboteur: number;
  };
  round_results: RoundResult[];
  saboteur_player_id: string;
  player_roles: Record<string, string>;
  saboteur_actions?: Record<string, Record<string, string>>;
}

export interface PartyGameIntro {
  host_line?: string;
  host_line_audio?: string;
  morty_line?: string;
  morty_line_audio?: string;
  situation?: string;
  background_image?: string;
  background_music?: string;
}

export interface PartyGameEnding {
  host_line?: string;
  morty_line?: string;
  host_line_audio?: string;
  morty_line_audio?: string;
}

export interface ComicFrame {
  id: string;
  caption?: string;
  image?: string;
  host_line?: string;
  host_line_audio?: string;
  morty_line?: string;
  morty_line_audio?: string;
}

export interface PartyGameConfig {
  title?: string;
  intro: PartyGameIntro;
  rounds: RoundConfig[];
  scoring: {
    team_win_threshold: number;
    saboteur_win_threshold: number;
  };
  endings: {
    team_wins: PartyGameEnding;
    saboteur_wins: PartyGameEnding;
    team_found_but_lost?: PartyGameEnding;
    team_won_but_missed?: PartyGameEnding;
  };
}

export interface RoundSubmission {
  id: string;
  run_id: string;
  room_id: string;
  player_id: string;
  round_id: string;
  mechanic: MechanicType;
  payload: Record<string, any>;
  submitted_at: string;
}

export interface MechanicViewProps<T extends RoundConfig = RoundConfig> {
  round: T;
  runId: string;
  roomId: string;
  playerId: string;
  isSaboteur?: boolean;
  submissions: RoundSubmission[];
  playerCount: number;
  onSubmit: (payload: Record<string, any>) => Promise<void>;
  onAdvance?: () => Promise<void>;
}

