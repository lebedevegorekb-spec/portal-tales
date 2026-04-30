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
    const { run_id, player_id } = await req.json();
    if (!run_id || !player_id) return json({ error: "run_id and player_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Читаем player_results
    const { data: result } = await supabase
      .from("player_results")
      .select("*")
      .eq("run_id", run_id)
      .eq("player_id", player_id)
      .maybeSingle();

    // Получить сценарий для данных о роли
    const { data: run } = await supabase
      .from("runs")
      .select("scenario_id, state_json")
      .eq("id", run_id)
      .single();

    const { data: scenario } = await supabase
      .from("scenarios")
      .select("scenario_json")
      .eq("id", run?.scenario_id)
      .single();

    const roles: any[] = (scenario?.scenario_json as any)?.roles ?? [];
    const roleId = result?.role_id ?? null;
    const roleData = roles.find((r: any) => r.id === roleId) ?? null;

    // Статистика голосов
    const { count: votesCount } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("run_id", run_id)
      .eq("player_id", player_id);

    // Секретные действия
    const { data: secretActions } = await supabase
      .from("secret_actions")
      .select("choice_id")
      .eq("run_id", run_id)
      .eq("player_id", player_id);

    const secretActionsCount = secretActions?.length ?? 0;
    const betrayals = secretActions?.filter((a: any) => a.choice_id === "yes").length ?? 0;

    const state: Record<string, number> = (run?.state_json as any) ?? {};
    const endingId: string = state.ending_id ?? "defeat";
    const scenes: any[] = (scenario?.scenario_json as any)?.scenes ?? [];

    // Outcome — приоритет из player_results.goal_achieved
    let outcome: "win" | "lose" = "lose";
    if (result?.goal_achieved !== null && result?.goal_achieved !== undefined) {
      outcome = result.goal_achieved ? "win" : "lose";
    } else {
      outcome = endingId !== "defeat" ? "win" : "lose";
    }

    return json({
      role:    roleData?.name  ?? result?.character_id ?? roleId ?? "Участник",
      goal:    roleData?.goal  ?? "Пройти игру",
      icon:    roleData?.icon  ?? "sparkles",
      tone:    roleData?.tone  ?? (outcome === "win" ? "acid" : "destructive"),
      outcome,
      summary: outcome === "win"
        ? (roleData?.win_text  ?? "Цель достигнута.")
        : (roleData?.lose_text ?? "Цель не достигнута."),
      stats: {
        votes:          votesCount       ?? 0,
        secretActions:  secretActionsCount,
        betrayals,
        survivedRounds: scenes.length,
      },
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
