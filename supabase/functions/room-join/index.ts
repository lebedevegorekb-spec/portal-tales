// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const json = (b: any, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const code: string | undefined = (body?.code as string)?.trim();
    const displayName: string = (body?.display_name as string)?.trim() || "Игрок";
    const userId: string | null = body?.user_id || null;

    if (!code) return json({ error: "code required" }, 400);

    const { data: room, error: rErr } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (rErr || !room) return json({ error: "Комната не найдена" }, 404);
    if (room.status !== "waiting") return json({ error: "Комната уже стартовала" }, 409);

    const { count } = await supabase
      .from("room_players")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room.id);
    if ((count ?? 0) >= room.max_players) {
      return json({ error: "Комната заполнена" }, 409);
    }

    const { data: player, error: pErr } = await supabase
      .from("room_players")
      .insert({
        room_id: room.id,
        user_id: userId,
        display_name: displayName,
        is_host: false,
      })
      .select("*")
      .single();
    if (pErr) return json({ error: pErr.message }, 500);

    return json({ room, player });
  } catch (e: any) {
    return json({ error: e?.message || "Internal error" }, 500);
  }
});
