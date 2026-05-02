import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { run_id, round_id, question_id, hide_option_id } = await req.json();

    if (!run_id || !round_id || !question_id || !hide_option_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Загрузить run
    const { data: run } = await supabase
      .from("runs")
      .select("state_json")
      .eq("id", run_id)
      .single();

    if (!run) {
      return new Response(JSON.stringify({ error: "Run not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const state = run.state_json;
    const saboteurPlayerId = state?.party_game?.saboteur_player_id ?? state?.saboteur_player_id;

    // Найти player_id текущего пользователя в этой игре
    const { data: runRow } = await supabase
      .from("runs")
      .select("id")
      .eq("id", run_id)
      .single();

    // Проверить что пользователь — саботажник
    const { data: playerRow } = await supabase
      .from("room_players")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", saboteurPlayerId)
      .maybeSingle();

    if (!playerRow) {
      return new Response(JSON.stringify({ error: "Only saboteur can perform this action" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Записать скрытый вариант в state_json
    const saboteurActions = state?.party_game?.saboteur_actions ?? {};
    if (!saboteurActions[round_id]) saboteurActions[round_id] = {};
    saboteurActions[round_id][question_id] = hide_option_id;

    const newState = {
      ...state,
      party_game: {
        ...state.party_game,
        saboteur_actions: saboteurActions,
      },
    };

    await supabase
      .from("runs")
      .update({ state_json: newState })
      .eq("id", run_id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
