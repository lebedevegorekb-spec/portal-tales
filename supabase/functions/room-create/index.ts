// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const json = (b: any, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const genCode = () => String(Math.floor(100000 + Math.random() * 900000));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const scenarioId: string | undefined = body?.scenario_id;
    const minPlayers: number = Math.min(8, Math.max(2, Number(body?.min_players) || 4));

    if (!scenarioId) return json({ error: "scenario_id required" }, 400);

    let room: any = null;
    let lastErr: any = null;

    for (let i = 0; i < 5; i++) {
      const code = genCode();
      const { data, error } = await supabase
        .from("rooms")
        .insert({
          code,
          host_user_id: auth.userId,
          scenario_id: scenarioId,
          status: "waiting",
          min_players: minPlayers,
        })
        .select("*")
        .single();
      if (!error) { room = data; break; }
      lastErr = error;
    }

    if (!room) return json({ error: lastErr?.message || "Failed to create room" }, 500);

    // Хост НЕ добавляется в room_players автоматически
    // Он может присоединиться как игрок через /join или начать игру без участия

    return json({ room });
  } catch (e: any) {
    return json({ error: e?.message || "Internal error" }, 500);
  }
});

