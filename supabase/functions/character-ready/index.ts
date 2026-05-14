import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { run_id, room_id, player_id, guest_user_id } = await req.json();
    if (!run_id || !room_id || !player_id) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Получить текущий state
    const { data: run } = await supabase.from("runs").select("state_json").eq("id", run_id).single();
    if (!run) return new Response(JSON.stringify({ error: "Run not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const pg = run.state_json?.party_game ?? {};
    const ready: string[] = pg.characters_ready ?? [];
    if (!ready.includes(player_id)) ready.push(player_id);

    // Получить кол-во игроков (без хоста)
    const { count } = await supabase.from("room_players").select("id", { count: "exact" }).eq("room_id", room_id).eq("is_host", false);
    const allReady = ready.length >= (count ?? 999);

    const newState = {
      ...run.state_json,
      party_game: {
        ...pg,
        characters_ready: ready,
        ui_phase: allReady ? "playing" : "chars_reveal",
      }
    };
    await supabase.from("runs").update({ state_json: newState }).eq("id", run_id);

    return new Response(JSON.stringify({ ok: true, all_ready: allReady, ready_count: ready.length, total: count }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
