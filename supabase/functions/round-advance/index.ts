import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function calcJokeVote(submissions: any[], saboteurPlayerId: string, round: any) {
  const votes: Record<string, number> = {};
  for (const s of submissions) {
    const voted = s.payload?.vote_for_submission_id;
    if (voted) votes[voted] = (votes[voted] ?? 0) + 1;
  }
  const winnerId = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  const winnerSubmission = submissions.find((s) => s.id === winnerId);
  const saboteurWon = winnerSubmission?.player_id === saboteurPlayerId;
  return {
    team_scored: !saboteurWon,
    saboteur_scored: saboteurWon,
    team_points: saboteurWon ? 0 : round.points.team_success,
    saboteur_points: saboteurWon ? round.points.saboteur_success : 0,
  };
}

function calcFork(submissions: any[], saboteurPlayerId: string, round: any) {
  const votes: Record<string, number> = {};
  for (const s of submissions) {
    const opt = s.payload?.option_id;
    if (opt) votes[opt] = (votes[opt] ?? 0) + 1;
  }
  const winnerId = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  const correctOption = round.options?.find((o: any) => o.is_correct);
  const teamWon = winnerId === correctOption?.id;
  return {
    team_scored: teamWon,
    saboteur_scored: !teamWon,
    team_points: teamWon ? round.points.team_success : 0,
    saboteur_points: teamWon ? 0 : round.points.saboteur_success,
  };
}

function calcGuessAuthor(submissions: any[], saboteurPlayerId: string, round: any, playerCount: number) {
  const guessSubmissions = submissions.filter((s) => s.payload?.guesses);
  let correctGuesses = 0;
  for (const s of guessSubmissions) {
    const guesses: Record<string, string> = s.payload.guesses ?? {};
    for (const [, guessedPlayerId] of Object.entries(guesses)) {
      if (guessedPlayerId === saboteurPlayerId) correctGuesses++;
    }
  }
  const teamWon = correctGuesses > playerCount / 2;
  return {
    team_scored: teamWon,
    saboteur_scored: !teamWon,
    team_points: teamWon ? round.points.team_success : 0,
    saboteur_points: teamWon ? 0 : round.points.saboteur_success,
  };
}

function calcPitch(submissions: any[], saboteurPlayerId: string, round: any) {
  const votes: Record<string, number> = {};
  for (const s of submissions) {
    const opt = s.payload?.vote_for_option_index;
    if (opt !== undefined) votes[opt] = (votes[opt] ?? 0) + 1;
  }
  const winnerIndex = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  const pitchSubmissions = submissions.filter((s) => s.payload?.my_option_index !== undefined);
  const saboteurPitch = pitchSubmissions.find((s) => s.player_id === saboteurPlayerId);
  const saboteurWon = String(saboteurPitch?.payload?.my_option_index) === String(winnerIndex);
  return {
    team_scored: !saboteurWon,
    saboteur_scored: saboteurWon,
    team_points: saboteurWon ? 0 : round.points.team_success,
    saboteur_points: saboteurWon ? round.points.saboteur_success : 0,
  };
}

function calcBlitz(submissions: any[], saboteurPlayerId: string, round: any) {
  const questions = round.questions ?? [];
  let correctCount = 0;
  let saboteurCorrect = 0;
  const saboteurSub = submissions.find((s) => s.player_id === saboteurPlayerId);

  for (const s of submissions) {
    const answers: Record<string, string> = s.payload?.answers ?? {};
    const allCorrect = questions.every((q: any) => answers[q.id] === q.correct_id);
    if (allCorrect) correctCount++;
    if (s.player_id === saboteurPlayerId) {
      const selfCorrect = questions.every((q: any) => answers[q.id] === q.correct_id);
      if (selfCorrect) saboteurCorrect = round.points_saboteur_self ?? 1;
    }
  }

  const threshold = submissions.length / 2;
  const teamWon = correctCount >= threshold;
  const saboteurTeamBonus = !teamWon ? (round.points_saboteur_team_fail ?? 1) : 0;

  return {
    team_scored: teamWon,
    saboteur_scored: saboteurCorrect > 0 || saboteurTeamBonus > 0,
    team_points: teamWon ? round.points.team_success : 0,
    saboteur_points: saboteurCorrect + saboteurTeamBonus,
  };
}

function calcQuiz(submissions: any[], saboteurPlayerId: string, round: any) {
  const questions = round.questions ?? [];
  let correctCount = 0;
  for (const s of submissions) {
    const answers: Record<string, string> = s.payload?.answers ?? {};
    const allCorrect = questions.every((q: any) => answers[q.id] === q.correct_id);
    if (allCorrect) correctCount++;
  }
  const teamWon = correctCount >= submissions.length / 2;
  return {
    team_scored: teamWon,
    saboteur_scored: !teamWon,
    team_points: teamWon ? round.points.team_success : 0,
    saboteur_points: teamWon ? 0 : round.points.saboteur_success,
  };
}

function calcVoteSaboteur(submissions: any[], saboteurPlayerId: string, round: any) {
  const votes: Record<string, number> = {};
  for (const s of submissions) {
    const accused = s.payload?.accused_player_id;
    if (accused) votes[accused] = (votes[accused] ?? 0) + 1;
  }
  const winnerId = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0];
  const teamWon = winnerId === saboteurPlayerId;
  return {
    team_scored: teamWon,
    saboteur_scored: !teamWon,
    team_points: teamWon ? round.points.team_success : 0,
    saboteur_points: teamWon ? 0 : round.points.saboteur_success,
  };
}

const calculators: Record<string, Function> = {
  joke_vote: calcJokeVote,
  fork: calcFork,
  guess_author: calcGuessAuthor,
  pitch: calcPitch,
  blitz: calcBlitz,
  quiz: calcQuiz,
  vote_saboteur: calcVoteSaboteur,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { run_id, room_id } = await req.json();

    if (!run_id || !room_id) {
      return new Response(JSON.stringify({ error: "Missing run_id or room_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Проверить что вызывает хост
    const { data: room } = await supabase
      .from("rooms")
      .select("host_user_id, scenario_id")
      .eq("id", room_id)
      .single();

    if (!room || room.host_user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Only host can advance" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Загрузить run и scenario
    const { data: run } = await supabase
      .from("runs")
      .select("state_json, scenario_id")
      .eq("id", run_id)
      .single();

    const { data: scenario } = await supabase
      .from("scenarios")
      .select("scenario_json")
      .eq("id", room.scenario_id)
      .single();

    const state = run.state_json?.party_game ?? {
      current_round_index: 0,
      phase: "round",
      scores: { team: 0, saboteur: 0 },
      round_results: [],
      saboteur_player_id: run.state_json?.saboteur_player_id ?? "",
      player_roles: run.state_json?.player_roles ?? {},
    };

    const rounds = scenario.scenario_json?.party_game?.rounds ?? [];
    const currentIndex = state.current_round_index ?? 0;
    const currentRound = rounds[currentIndex];

    if (!currentRound) {
      return new Response(JSON.stringify({ error: "No round at index" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Загрузить submissions текущего раунда
    const { data: submissions } = await supabase
      .from("round_submissions")
      .select("*")
      .eq("run_id", run_id)
      .eq("round_id", currentRound.id);

    // Посчитать очки
    const { data: players } = await supabase
      .from("room_players")
      .select("id")
      .eq("room_id", room_id);

    const playerCount = players?.length ?? 1;
    const calc = calculators[currentRound.mechanic];
    const result = calc
      ? calc(submissions ?? [], state.saboteur_player_id, currentRound, playerCount)
      : { team_scored: false, saboteur_scored: false, team_points: 0, saboteur_points: 0 };

    // Обновить state
    const newScores = {
      team: (state.scores?.team ?? 0) + result.team_points,
      saboteur: (state.scores?.saboteur ?? 0) + result.saboteur_points,
    };

    const newResults = [
      ...(state.round_results ?? []),
      {
        round_id: currentRound.id,
        mechanic: currentRound.mechanic,
        ...result,
      },
    ];

    const nextIndex = currentIndex + 1;
    const isLast = nextIndex >= rounds.length;

    const newState = {
      ...run.state_json,
      party_game: {
        ...state,
        current_round_index: nextIndex,
        phase: isLast ? "final" : "round",
        scores: newScores,
        round_results: newResults,
      },
    };

    await supabase
      .from("runs")
      .update({ state_json: newState })
      .eq("id", run_id);

    return new Response(JSON.stringify({
      ok: true,
      result,
      scores: newScores,
      next_round_index: nextIndex,
      phase: isLast ? "final" : "round",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
