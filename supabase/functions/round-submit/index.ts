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

    const body = await req.json();
    const { run_id, room_id, player_id, round_id, mechanic, payload, guest_user_id } = body;

    if (!run_id || !room_id || !player_id || !round_id || !mechanic) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let resolvedUserId: string | null = null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: { user } } = await createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      ).auth.getUser();
      if (user) resolvedUserId = user.id;
    }

    if (!resolvedUserId && guest_user_id) {
      resolvedUserId = guest_user_id;
    }

    if (!resolvedUserId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: player, error: playerError } = await supabase
      .from("room_players")
      .select("id, user_id")
      .eq("id", player_id)
      .eq("room_id", room_id)
      .maybeSingle();

    if (playerError || !player) {
      return new Response(JSON.stringify({ error: "Player not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (player.user_id !== resolvedUserId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("round_submissions")
      .select("id")
      .eq("run_id", run_id)
      .eq("player_id", player_id)
      .eq("round_id", round_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Already submitted" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: submission, error: insertError } = await supabase
      .from("round_submissions")
      .insert({
        run_id,
        room_id,
        player_id,
        round_id,
        mechanic,
        payload: payload ?? {},
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, submission_id: submission.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

