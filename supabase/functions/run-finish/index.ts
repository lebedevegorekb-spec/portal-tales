import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { run_id } = await req.json();
    if (!run_id) return json({ error: "run_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Получить run + сценарий
    const { data: run } = await supabase
      .from("runs")
      .select("state_json, scenario_id")
      .eq("id", run_id)
      .single();

    if (!run) return json({ error: "Run not found" }, 404);

    const { data: scenario } = await supabase
      .from("scenarios")
      .select("scenario_json")
      .eq("id", run.scenario_id)
      .single();

    const endings: any[] = (scenario?.scenario_json as any)?.endings ?? [];
    const state: Record<string, number> = (run.state_json as any) ?? {};

    // Найти подходящую концовку по conditions
    let chosen = endings.find((e) => {
      if (!e.conditions) return false;
      return Object.entries(e.conditions).every(([key, val]: [string, any]) => {
        const s = state[key] ?? 0;
        if (val.min !== undefined && s < val.min) return false;
        if (val.max !== undefined && s > val.max) return false;
        return true;
      });
    });

    // Fallback — первая концовка или дефолт
    if (!chosen) chosen = endings.find((e) => e.is_default) ?? endings[0] ?? { id: "default", title: "Игра завершена", text: "Хаос победил." };

    // Обновить run
    await supabase
      .from("runs")
      .update({
        status: "finished",
        finished_at: new Date().toISOString(),
        state_json: { ...state, ending_id: chosen.id },
      })
      .eq("id", run_id);

    return json({ ok: true, ending: chosen });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
