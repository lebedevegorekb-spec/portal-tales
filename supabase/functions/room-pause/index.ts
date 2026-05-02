// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const json = (b: any, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { room_id } = await req.json();
    if (!room_id) return json({ error: "room_id required" }, 400);

    // Проверить что вызывает хост
    const { data: room } = await supabase
      .from("rooms")
      .select("host_user_id, status")
      .eq("id", room_id)
      .single();

    if (!room) return json({ error: "Room not found" }, 404);
    if (room.host_user_id !== auth.userId) return json({ error: "Only host can pause" }, 403);

    const isPaused = room.status === "paused";
    const newStatus = isPaused ? "playing" : "paused";
    const pausedAt = isPaused ? null : new Date().toISOString();

    await supabase
      .from("rooms")
      .update({ status: newStatus, paused_at: pausedAt })
      .eq("id", room_id);

    return json({ ok: true, status: newStatus });
  } catch (e: any) {
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
