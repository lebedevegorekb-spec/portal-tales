// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const roomId: string | undefined = body?.room_id;
    const hostName: string = body?.host_name ?? "Ð¥Ð¾ÑÑ‚";
    const isTest: boolean = body?.is_test ?? false;

    if (!roomId) return json({ error: "room_id required" }, 400);

    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .maybeSingle();

    if (roomErr || !room) return json({ error: "Room not found" }, 404);
    if (room.host_user_id !== userId) return json({ error: "Only host can start" }, 403);
    if (room.status !== "waiting") return json({ error: "Room already started" }, 400);

    // ÐŸÐ¾Ð»ÑƒÑ‡Ð¸Ñ‚ÑŒ Ð¸Ð³Ñ€Ð¾ÐºÐ¾Ð²
    let { data: players } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId);

    players = players ?? [];

    // ÐŸÑ€Ð¾Ð²ÐµÑ€Ð¸Ñ‚ÑŒ Ð¼Ð¸Ð½Ð¸Ð¼ÑƒÐ¼ Ð¸Ð³Ñ€Ð¾ÐºÐ¾Ð² (ÐºÑ€Ð¾Ð¼Ðµ Ñ‚ÐµÑÑ‚Ð¾Ð²Ð¾Ð³Ð¾ Ñ€ÐµÐ¶Ð¸Ð¼Ð°)
    const minPlayers = isTest ? 1 : (room.min_players ?? 3);
    if (players.length < minPlayers && !isTest) {
      return json({ error: `ÐÑƒÐ¶Ð½Ð¾ Ð¼Ð¸Ð½Ð¸Ð¼ÑƒÐ¼ ${minPlayers} Ð¸Ð³Ñ€Ð¾ÐºÐ°` }, 400);
    }

    // Ð•ÑÐ»Ð¸ Ñ…Ð¾ÑÑ‚ Ð½Ðµ Ð² players â€” Ð´Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ ÐµÐ³Ð¾
    const hostInPlayers = players.some((p: any) => p.user_id === userId);
    if (!hostInPlayers) {
      const { data: hostPlayer } = await supabase
        .from("room_players")
        .insert({
          room_id: roomId,
          user_id: userId,
          display_name: hostName,
          is_host: true,
          ready: true,
        })
        .select()
        .single();
      if (hostPlayer) players = [...players, hostPlayer];
    }

    const { data: scenario, error: sErr } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", room.scenario_id)
      .maybeSingle();

    if (sErr || !scenario) return json({ error: "Scenario not found" }, 404);

    const playerIds = players.map((p: any) => p.id);
    const saboteurIndex = Math.floor(Math.random() * playerIds.length);
    const saboteurPlayerId = playerIds[saboteurIndex];

    const playerRoles: Record<string, string> = {};
    playerIds.forEach((pid: string) => {
      playerRoles[pid] = pid === saboteurPlayerId ? "saboteur" : "team";
    });

    const initialState = {
      party_game: {
        current_round_index: 0,
        phase: "intro",
        scores: { team: 0, saboteur: 0 },
        round_results: [],
        saboteur_player_id: saboteurPlayerId,
        player_roles: playerRoles,
        player_characters: playerCharacters,
        saboteur_actions: {},
      },
      saboteur_player_id: saboteurPlayerId,
      player_roles: playerRoles,
    };

    const { data: run, error: rErr } = await supabase
      .from("runs")
      .insert({
        user_id: userId,
        scenario_id: room.scenario_id,
        status: "active",
        current_scene_id: "party_game",
        state_json: initialState,
      })
      .select()
      .single();

    if (rErr || !run) return json({ error: rErr?.message ?? "Failed to create run" }, 500);

    await supabase
      .from("rooms")
      .update({ status: "playing", run_id: run.id })
      .eq("id", roomId);

    return json({ run_id: run.id, saboteur_player_id: saboteurPlayerId });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});


