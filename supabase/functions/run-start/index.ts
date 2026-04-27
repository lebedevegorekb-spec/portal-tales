// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Unauthorized" }, 401);
    }

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
    const scenarioId: string | undefined = body?.scenario_id;
    if (!scenarioId) return json({ error: "scenario_id required" }, 400);

    // Check scenario
    const { data: scenario, error: sErr } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", scenarioId)
      .eq("is_active", true)
      .maybeSingle();
    if (sErr || !scenario) return json({ error: "Scenario not found" }, 404);

    // Free scenarios — open to everyone authenticated
    const FREE_SCENARIOS = new Set(["S01"]);

    if (!FREE_SCENARIOS.has(scenarioId)) {
      // Check entitlements
      const { data: ent } = await supabase
        .from("entitlements")
        .select("*")
        .eq("user_id", userId)
        .eq("active", true);
      const now = Date.now();
      const has = (ent ?? []).some(
        (e: any) =>
          (e.scope === "all" || e.scope === scenarioId) &&
          (!e.expires_at || new Date(e.expires_at).getTime() > now),
      );
      if (!has) return json({ error: "No access to this scenario" }, 403);
    }

    // Reuse existing active run if any
    const { data: existing } = await supabase
      .from("runs")
      .select("id")
      .eq("user_id", userId)
      .eq("scenario_id", scenarioId)
      .eq("status", "active")
      .maybeSingle();
    if (existing) return json({ run_id: existing.id, resumed: true });

    const startSceneId = (scenario.scenario_json as any)?.start_scene_id ?? "start";
    const startScene = ((scenario.scenario_json as any)?.scenes ?? []).find(
      (s: any) => s.scene_id === startSceneId,
    );

    const { data: run, error: rErr } = await supabase
      .from("runs")
      .insert({
        user_id: userId,
        scenario_id: scenarioId,
        status: "active",
        current_scene_id: startSceneId,
        state_json: { flags: {}, inventory: [], relationships: {}, resources: { health: 100 } },
      })
      .select()
      .single();
    if (rErr || !run) return json({ error: rErr?.message ?? "Failed to create run" }, 500);

    const intro = `Привет, Морти! Сценарий: «${scenario.title}». ${scenario.description}\n\nЦель: ${startScene?.goal_hint ?? "разберись на месте"}.\n\nЧто делаешь?`;

    await supabase.from("messages").insert([
      {
        run_id: run.id,
        role: "system",
        content: `Scenario ${scenarioId} v${scenario.version} started.`,
        char_count: 0,
      },
      {
        run_id: run.id,
        role: "assistant",
        content: intro,
        char_count: intro.length,
      },
    ]);

    return json({ run_id: run.id, resumed: false, intro });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
