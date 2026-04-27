// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import {
  LIMITS,
  buildSystemPrompt,
  parseMeta,
  applyStatePatch,
  SUMMARY_SYSTEM_PROMPT,
  type Meta,
} from "../_shared/prompts.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { run_id, user_text } = await req.json().catch(() => ({}));
    if (!run_id || typeof user_text !== "string") {
      return json({ error: "run_id и user_text обязательны" }, 400);
    }
    const trimmed = user_text.trim().slice(0, LIMITS.USER_INPUT_MAX);
    if (!trimmed) return json({ error: "Пустой ввод" }, 400);

    // Load run
    const { data: run, error: rErr } = await supabase
      .from("runs")
      .select("*")
      .eq("id", run_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (rErr || !run) return json({ error: "Run not found" }, 404);
    if (run.status !== "active") return json({ error: "Run already finished" }, 400);

    // Rate limit: per-run interval
    if (run.last_step_at) {
      const dt = Date.now() - new Date(run.last_step_at).getTime();
      if (dt < LIMITS.RUN_MIN_INTERVAL_MS) {
        return json({ error: "Слишком быстро, подожди секунду" }, 429);
      }
    }

    // Rate limit: per-user steps/min
    const sinceIso = new Date(Date.now() - 60_000).toISOString();
    const { data: userRuns } = await supabase
      .from("runs")
      .select("id")
      .eq("user_id", userId);
    const runIds = (userRuns ?? []).map((r: any) => r.id);
    if (runIds.length) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("run_id", runIds)
        .eq("role", "user")
        .gte("created_at", sinceIso);
      if ((count ?? 0) >= LIMITS.USER_MAX_STEPS_PER_MIN) {
        return json({ error: "Лимит шагов в минуту превышен" }, 429);
      }
    }

    // Load scenario
    const { data: scenario } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", run.scenario_id)
      .maybeSingle();
    if (!scenario) return json({ error: "Scenario gone" }, 500);

    const scenes = ((scenario.scenario_json as any)?.scenes ?? []) as any[];
    const currentScene =
      scenes.find((s) => s.scene_id === run.current_scene_id) ?? scenes[0] ?? {
        scene_id: run.current_scene_id,
        scene_summary: "",
        goal_hint: "",
      };

    // Last N messages
    const { data: lastMsgs } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("run_id", run_id)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: false })
      .limit(LIMITS.CONTEXT_LAST_MESSAGES);
    const history = (lastMsgs ?? []).reverse();

    // Insert user message
    await supabase.from("messages").insert({
      run_id,
      role: "user",
      content: trimmed,
      char_count: trimmed.length,
    });

    const nextStepCount = run.step_count + 1;
    const forcedFinal = nextStepCount >= LIMITS.MAX_STEPS;
    const sinceLastCp = nextStepCount - run.last_checkpoint_step;
    const baseCheckpoint =
      nextStepCount % LIMITS.CHECKPOINT_EVERY === 0 &&
      sinceLastCp >= LIMITS.MIN_STEPS_BETWEEN_CHECKPOINTS;

    const systemPrompt = buildSystemPrompt({
      scenarioTitle: scenario.title,
      scenarioDescription: scenario.description,
      sceneId: currentScene.scene_id,
      sceneSummary: currentScene.scene_summary ?? "",
      goalHint: currentScene.goal_hint ?? "",
      summary: run.summary ?? "",
      stateJson: run.state_json,
      stepCount: nextStepCount,
      shouldCheckpoint: baseCheckpoint || forcedFinal,
    });

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: trimmed },
    ];
    if (forcedFinal) {
      messages.push({
        role: "system",
        content: `Это последний шаг (${LIMITS.MAX_STEPS}). Сделай финал: is_final=true, выбери final_id ("good"/"bad"/"neutral"), дай эпилог в 2-3 абзацах.`,
      });
    }

    const aiResp = await callAIWithRetry(messages);
    if (!aiResp.ok) {
      // не списываем шаг
      await supabase.from("messages").delete().eq("run_id", run_id).eq("role", "user").eq("content", trimmed).order("created_at", { ascending: false }).limit(1);
      return json({ error: aiResp.error }, aiResp.status);
    }

    let raw = aiResp.text ?? "";
    // Жёсткий потолок
    if (raw.length > LIMITS.ASSISTANT_HARD_MAX + 400) {
      raw = raw.slice(0, LIMITS.ASSISTANT_HARD_MAX + 400);
    }

    let { visible, meta } = parseMeta(raw);
    if (!meta) {
      meta = {
        is_checkpoint: false,
        is_final: forcedFinal,
        next_scene_id: "",
        state_patch: {},
        final_id: forcedFinal ? "neutral" : "",
      } as Meta;
    }
    // Hard cap visible text
    if (visible.length > LIMITS.ASSISTANT_HARD_MAX) {
      visible = visible.slice(0, LIMITS.ASSISTANT_HARD_MAX);
    }
    if (!visible) visible = "...";

    // Apply state patch
    const newState = applyStatePatch(
      (run.state_json as Record<string, unknown>) ?? {},
      meta.state_patch ?? {},
    );

    const isFinal = meta.is_final || forcedFinal;
    const doCheckpoint =
      !isFinal && (baseCheckpoint || (meta.is_checkpoint && sinceLastCp >= LIMITS.MIN_STEPS_BETWEEN_CHECKPOINTS));

    let newSummary = run.summary;
    if (doCheckpoint) {
      newSummary = await summarize(supabase, run_id, run.summary, visible, trimmed);
    }

    const updates: Record<string, unknown> = {
      step_count: nextStepCount,
      last_step_at: new Date().toISOString(),
      state_json: newState,
      current_scene_id: meta.next_scene_id || run.current_scene_id,
    };
    if (doCheckpoint) {
      updates.last_checkpoint_step = nextStepCount;
      updates.summary = newSummary;
    }
    if (isFinal) {
      updates.status = "finished";
      updates.finished_at = new Date().toISOString();
    }

    await supabase.from("runs").update(updates).eq("id", run_id);

    await supabase.from("messages").insert({
      run_id,
      role: "assistant",
      content: visible,
      char_count: visible.length,
    });

    return json({
      assistant: visible,
      step_count: nextStepCount,
      max_steps: LIMITS.MAX_STEPS,
      is_checkpoint: doCheckpoint,
      is_final: isFinal,
      final_id: isFinal ? meta.final_id || "neutral" : null,
      final_image_url: isFinal ? scenario.final_image_url : null,
      current_scene_id: updates.current_scene_id,
    });
  } catch (e) {
    console.error("run-step error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

async function callAIWithRetry(messages: any[]): Promise<{
  ok: boolean;
  text?: string;
  error?: string;
  status: number;
}> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return { ok: false, error: "AI key missing", status: 500 };

  const delays = [0, 500, 1200];
  let lastErr = "";
  let lastStatus = 500;
  for (const d of delays) {
    if (d) await new Promise((r) => setTimeout(r, d));
    try {
      const resp = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          stream: false,
          max_tokens: 800,
        }),
      });
      if (resp.status === 429) {
        lastErr = "AI: слишком много запросов, попробуй позже";
        lastStatus = 429;
        continue;
      }
      if (resp.status === 402) {
        return { ok: false, error: "AI: закончились кредиты в Lovable AI", status: 402 };
      }
      if (!resp.ok) {
        lastErr = `AI ${resp.status}`;
        lastStatus = 500;
        continue;
      }
      const data = await resp.json();
      const text: string = data?.choices?.[0]?.message?.content ?? "";
      return { ok: true, text, status: 200 };
    } catch (e) {
      lastErr = (e as Error).message;
    }
  }
  return { ok: false, error: lastErr || "AI failure", status: lastStatus };
}

async function summarize(
  supabase: any,
  runId: string,
  prevSummary: string,
  lastAssistant: string,
  lastUser: string,
): Promise<string> {
  const { data: msgs } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("run_id", runId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: false })
    .limit(20);
  const history = (msgs ?? []).reverse();

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return prevSummary;

  try {
    const resp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        max_tokens: 500,
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          {
            role: "user",
            content:
              `Текущая сводка:\n${prevSummary || "(пусто)"}\n\nПоследние сообщения:\n` +
              history.map((m: any) => `${m.role}: ${m.content}`).join("\n") +
              `\n\nПоследний обмен:\nuser: ${lastUser}\nassistant: ${lastAssistant}\n\nДай новую сводку (<=1200 симв.)`,
          },
        ],
      }),
    });
    if (!resp.ok) return prevSummary;
    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    return text.slice(0, 1200) || prevSummary;
  } catch {
    return prevSummary;
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
