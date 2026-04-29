import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Lock } from "lucide-react";
import { toast } from "sonner";

type SceneOption = { id: string; text: string; consequences?: Record<string, number> };
type Scene = { scene_id: string; scene_summary: string; goal_hint: string; options?: SceneOption[] };

function getPlayerId(userId?: string | null): string {
  if (userId) return userId;
  let id = localStorage.getItem("guest_player_id");
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("guest_player_id", id);
  }
  return id;
}

const Vote = () => {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const runId  = params.get("run");
  const roomId = params.get("room");

  const [scene,        setScene]        = useState<Scene | null>(null);
  const [allScenes,    setAllScenes]    = useState<Scene[]>([]);
  const [scenarioId,   setScenarioId]   = useState("");
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [voted,        setVoted]        = useState(false);
  const [votedId,      setVotedId]      = useState<string | null>(null);
  const [voting,       setVoting]       = useState(false);
  const [advancing,    setAdvancing]    = useState(false);

  const advancedRef = useRef(false);

  const playerId = getPlayerId(user?.id);
  const votes    = useRealtimeVotes(runId || "", scene?.scene_id || "");

  const voteCounts: Record<string, number> = {};
  votes.forEach((v) => { voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1; });
  const totalVotes = votes.length;

  useEffect(() => {
    if (!runId) return;
    const load = async () => {
      try {
        const { data: run } = await supabase
          .from("runs")
          .select("current_scene_id, scenario_id")
          .eq("id", runId)
          .single();
        if (!run) throw new Error("Игра не найдена");

        setScenarioId(run.scenario_id);

        const { data: scenario } = await supabase
          .from("scenarios")
          .select("scenario_json")
          .eq("id", run.scenario_id)
          .single();
        if (!scenario) throw new Error("Сценарий не найден");

        const scenes: Scene[] = (scenario.scenario_json as any)?.scenes ?? [];
        setAllScenes(scenes);

        const found = scenes.find((s) => s.scene_id === run.current_scene_id) ?? scenes[0];
        if (!found) throw new Error("Сцена не найдена");
        setScene(found);

        if (roomId) {
          const { count } = await supabase
            .from("room_players")
            .select("id", { count: "exact", head: true })
            .eq("room_id", roomId);
          setTotalPlayers(count ?? 0);
        }

        const { data: existingVote } = await supabase
          .from("votes")
          .select("option_id")
          .eq("run_id", runId)
          .eq("scene_id", found.scene_id)
          .eq("player_id", playerId)
          .maybeSingle();

        if (existingVote) {
          setVoted(true);
          setVotedId(existingVote.option_id);
        }
      } catch (err: any) {
        toast.error(err?.message ?? "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, roomId]);

  useEffect(() => {
    if (!runId || !scene || totalPlayers === 0) return;
    if (totalVotes < totalPlayers) return;
    if (advancedRef.current || advancing) return;

    advancedRef.current = true;
    setAdvancing(true);

    const advance = async () => {
      try {
        // Определяем победивший вариант
        let winnerId = "";
        let maxCount = 0;
        Object.entries(voteCounts).forEach(([id, count]) => {
          if (count > maxCount) { maxCount = count; winnerId = id; }
        });

        // Берём consequences из победившего варианта
        const winningOption = scene.options?.find((o) => o.id === winnerId);
        const consequences  = winningOption?.consequences ?? {};

        // Применяем consequences к state_json
        if (Object.keys(consequences).length > 0) {
          const { data: run } = await supabase
            .from("runs")
            .select("state_json")
            .eq("id", runId)
            .single();

          const currentState: Record<string, number> = (run?.state_json as any) ?? {};

          const newState: Record<string, number> = { ...currentState };
          for (const [key, delta] of Object.entries(consequences)) {
            const prev = newState[key] ?? 0;
            newState[key] = Math.min(100, Math.max(0, prev + delta));
          }

          await supabase.from("runs").update({ state_json: newState }).eq("id", runId);
        }

        // Следующая сцена по индексу
        const currentIdx = allScenes.findIndex((s) => s.scene_id === scene.scene_id);
        const nextScene  = allScenes[currentIdx + 1];

        if (!nextScene) {
          await supabase.from("runs").update({ status: "finished", finished_at: new Date().toISOString() }).eq("id", runId);
        } else {
          await supabase.from("runs").update({ current_scene_id: nextScene.scene_id }).eq("id", runId);
        }
      } catch (err) {
        console.error("advance error", err);
        advancedRef.current = false;
        setAdvancing(false);
      }
    };

    setTimeout(advance, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalVotes, totalPlayers]);

  useEffect(() => {
    if (!runId) return;
    const ch = supabase
      .channel(`vote-run:${runId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "runs", filter: `id=eq.${runId}` },
        (payload) => {
          const next = payload.new as any;
          if (next.status === "finished") {
            navigate(`/final/${runId}`);
            return;
          }
          if (next.current_scene_id !== scene?.scene_id) {
            advancedRef.current = false;
            setAdvancing(false);
            setVoted(false);
            setVotedId(null);
            const found = allScenes.find((s) => s.scene_id === next.current_scene_id);
            if (found) setScene(found);
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, scene?.scene_id, allScenes]);

  const handleVote = async (optionId: string) => {
    if (!runId || !scene || voted || voting || !playerId) return;
    setVoting(true);
    try {
      const { error } = await supabase.from("votes").insert({
        run_id:    runId,
        player_id: playerId,
        scene_id:  scene.scene_id,
        option_id: optionId,
      });
      if (error) throw error;
      setVoted(true);
      setVotedId(optionId);
      toast.success("Голос принят!");
    } catch (err: any) {
      toast.error(err?.message ?? "Ошибка голосования");
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-portal" />
        </main>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-destructive font-mono text-sm">Сцена не найдена</p>
        </main>
      </div>
    );
  }

  const currentIdx   = allScenes.findIndex((s) => s.scene_id === scene.scene_id);
  const isLastScene  = currentIdx === allScenes.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col gap-5">

        {/* HUD */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            {scenarioId} · {scene.scene_id}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {totalVotes}/{totalPlayers} проголосовали
          </span>
        </div>

        {/* Сцена */}
        <div className="glass-card rounded-3xl p-6 border border-portal/30 shadow-[var(--shadow-portal)]">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Текущая сцена
          </p>
          <p className="text-base leading-relaxed font-display">{scene.scene_summary}</p>
          {scene.goal_hint && (
            <div className="mt-4 rounded-2xl border border-portal/30 bg-portal/10 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">Подсказка</p>
              <p className="text-sm text-portal">{scene.goal_hint}</p>
            </div>
          )}
        </div>

        {/* Голосование */}
        <div className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground px-1">
            {voted ? "Твой выбор" : "Выбери вариант"}
          </p>

          {scene.options?.map((opt) => {
            const count    = voteCounts[opt.id] ?? 0;
            const pct      = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isMyVote = votedId === opt.id;

            return (
              <Button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={voted || voting || !playerId}
                size="lg"
                className={`w-full h-auto min-h-[60px] text-left justify-between px-5 py-4 font-display text-base gap-3 relative overflow-hidden
                  ${isMyVote
                    ? "bg-portal/20 border-portal text-portal hover:bg-portal/25"
                    : voted
                    ? "bg-muted/20 border-border/50 text-muted-foreground"
                    : "bg-background/40 border-border hover:border-portal/50 hover:bg-portal/10"
                  } border`}
                variant="outline"
              >
                {voted && (
                  <div className="absolute inset-y-0 left-0 bg-portal/10 transition-all duration-500" style={{ width: `${pct}%` }} />
                )}
                <span className="relative">{opt.text}</span>
                <span className="relative flex items-center gap-2 shrink-0">
                  {voted && pct > 0 && <span className="text-xs font-mono text-muted-foreground">{pct}%</span>}
                  {isMyVote && <Check className="size-4 text-portal" />}
                  {!voted && <Lock className="size-3.5 text-muted-foreground/40" />}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Статус */}
        {advancing && (
          <div className="glass-card rounded-2xl p-4 text-center border border-portal/30">
            <Loader2 className="size-5 animate-spin text-portal mx-auto mb-2" />
            <p className="text-sm font-mono text-portal">
              {isLastScene ? "Завершаем игру…" : "Переключаем сцену…"}
            </p>
          </div>
        )}

        {voted && !advancing && (
          <div className="glass-card rounded-2xl p-4 text-center border border-acid/30 bg-acid/5">
            <p className="text-sm font-mono text-acid">✓ Голос принят — ждём остальных</p>
            <p className="text-xs text-muted-foreground mt-1">{totalVotes}/{totalPlayers} проголосовали</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default Vote;
