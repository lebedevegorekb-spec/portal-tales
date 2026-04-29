import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";
import { SiteHeader } from "@/components/SiteHeader";
import { Loader2, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

type SceneOption = { id: string; text: string };
type Scene = { scene_id: string; scene_summary: string; goal_hint: string; options?: SceneOption[] };

const Scene = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  const [scene,        setScene]        = useState<Scene | null>(null);
  const [scenarioId,   setScenarioId]   = useState("");
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading,      setLoading]      = useState(true);

  const votes = useRealtimeVotes(runId || "", scene?.scene_id || "");

  // Подсчёт голосов по опциям
  const voteCounts: Record<string, number> = {};
  votes.forEach((v) => {
    voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1;
  });
  const totalVotes = votes.length;

  useEffect(() => {
    if (!runId) return;
    const load = async () => {
      try {
        // 1. Грузим run
        const { data: run, error: runErr } = await supabase
          .from("runs")
          .select("current_scene_id, scenario_id, state_json")
          .eq("id", runId)
          .single();
        if (runErr || !run) throw new Error("Игра не найдена");

        setScenarioId(run.scenario_id);

        // 2. Грузим scenario_json
        const { data: scenario, error: sErr } = await supabase
          .from("scenarios")
          .select("scenario_json")
          .eq("id", run.scenario_id)
          .single();
        if (sErr || !scenario) throw new Error("Сценарий не найден");

        const scenes: Scene[] = (scenario.scenario_json as any)?.scenes ?? [];
        const found = scenes.find((s) => s.scene_id === run.current_scene_id) ?? scenes[0];
        if (!found) throw new Error("Сцена не найдена");

        setScene(found);

        // 3. Кол-во игроков из room
        const { data: room } = await supabase
          .from("rooms")
          .select("id")
          .eq("run_id", runId)
          .maybeSingle();

        if (room) {
          const { count } = await supabase
            .from("room_players")
            .select("id", { count: "exact", head: true })
            .eq("room_id", room.id);
          setTotalPlayers(count ?? 0);
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Ошибка загрузки сцены");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId]);

  // Realtime: следим за обновлением runs (смена сцены)
  useEffect(() => {
    if (!runId) return;
    const ch = supabase
      .channel(`run:${runId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "runs", filter: `id=eq.${runId}` },
        (payload) => {
          const next = payload.new as any;
          if (next.status === "finished") navigate(`/final/${runId}`);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [runId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="size-10 animate-spin text-portal" />
        </main>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-destructive font-mono">Сцена не найдена</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-10 max-w-5xl">

        {/* HUD */}
        <div className="flex items-center justify-between mb-8">
          <span className="hud-chip">
            <Sparkles className="h-3 w-3" />
            {scenarioId} · {scene.scene_id}
          </span>
          <div className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground">
            <Users className="h-4 w-4 text-portal" />
            {totalVotes}/{totalPlayers} проголосовали
          </div>
        </div>

        {/* Сцена */}
        <div className="glass-card rounded-3xl p-8 md:p-14 mb-8 border border-portal/30 shadow-[var(--shadow-portal)]">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Текущая сцена
          </p>
          <p className="text-xl md:text-3xl leading-relaxed text-balance font-display">
            {scene.scene_summary}
          </p>
          {scene.goal_hint && (
            <div className="mt-8 rounded-2xl border border-portal/30 bg-portal/10 p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                Подсказка
              </p>
              <p className="text-base text-portal">{scene.goal_hint}</p>
            </div>
          )}
        </div>

        {/* Варианты + счётчики голосов */}
        {scene.options && scene.options.length > 0 && (
          <div className="space-y-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Варианты выбора
            </p>
            {scene.options.map((opt) => {
              const count = voteCounts[opt.id] ?? 0;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              return (
                <div
                  key={opt.id}
                  className="glass-card rounded-2xl border border-border p-5 relative overflow-hidden"
                >
                  {/* Прогресс-бар */}
                  <div
                    className="absolute inset-y-0 left-0 bg-portal/15 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-4">
                    <span className="text-base md:text-lg font-display">{opt.text}</span>
                    <span className="text-sm font-mono text-portal shrink-0">
                      {count} {pct > 0 ? `(${pct}%)` : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Нет вариантов */}
        {(!scene.options || scene.options.length === 0) && (
          <div className="glass-card rounded-2xl p-6 text-center border border-border">
            <p className="text-muted-foreground font-mono text-sm">
              Варианты голосования не заданы в сценарии
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default Scene;
