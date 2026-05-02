import type { RoundConfig, MechanicType, MechanicViewProps } from "@/mechanics/types";
import { JokeVoteHost, JokeVotePlayer } from "@/mechanics/JokeVote";
import { ForkHost, ForkPlayer } from "@/mechanics/Fork";
import { GuessAuthorHost, GuessAuthorPlayer } from "@/mechanics/GuessAuthor";
import { PitchHost, PitchPlayer } from "@/mechanics/Pitch";
import { BlitzHost, BlitzPlayer } from "@/mechanics/Blitz";
import { QuizHost, QuizPlayer } from "@/mechanics/Quiz";
import { VoteSaboteurHost, VoteSaboteurPlayer } from "@/mechanics/VoteSaboteur";

const HostViews: Record<MechanicType, React.ComponentType<MechanicViewProps<any>>> = {
  joke_vote: JokeVoteHost,
  fork: ForkHost,
  guess_author: GuessAuthorHost,
  pitch: PitchHost,
  blitz: BlitzHost,
  quiz: QuizHost,
  vote_saboteur: VoteSaboteurHost,
};

const PlayerViews: Record<MechanicType, React.ComponentType<MechanicViewProps<any>>> = {
  joke_vote: JokeVotePlayer,
  fork: ForkPlayer,
  guess_author: GuessAuthorPlayer,
  pitch: PitchPlayer,
  blitz: BlitzPlayer,
  quiz: QuizPlayer,
  vote_saboteur: VoteSaboteurPlayer,
};

interface RoundRouterProps extends MechanicViewProps {
  isHost: boolean;
}

export function RoundRouter({ isHost, round, ...props }: RoundRouterProps) {
  const views = isHost ? HostViews : PlayerViews;
  const View = views[round.mechanic];

  if (!View) {
    console.error("Unknown mechanic:", round.mechanic);
    return (
      <div className="text-destructive text-center p-8">
        Неизвестная механика: {round.mechanic}
      </div>
    );
  }

  return <View round={round} {...props} />;
}
