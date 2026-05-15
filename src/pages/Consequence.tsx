import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight, CheckCircle2, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type StatChange = { id: string; label: string; from: number; to: number; higherIsGood: boolean };

const STAT_META: Record<string, { label: string; higherIsGood: boolean }> = {
  chaos_level:       { label: "Уровень хаоса",        higherIsGood: false },
  portal_stability:  { label: "Стабильность портала",  higherIsGood: true  },
};

const COUNTDOWN_SECONDS = 6;

function useTweenedNumber(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    const start = performance.now();
    const initial = value;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(initial + (target - initial) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

const StatRow = ({ stat }: { stat: StatChange }) => {
  const [animateTo, setAnimateTo] = useState(stat.from);
  useEffect(() => {
    const t = setTimeout(() => setAnimateTo(stat.to), 350);
    return () => clearTimeout(t);
  }, [stat.to]);
  const display = useTweenedNumber(animateTo);
  const delta = stat.to - stat.from;
  const isPositiveOutcome = stat.higherIsGood ? delta > 0 : delta < 0;
  const isNeutral = delta === 0;
  const tone = isNeutral ? "text-muted-foreground" : isPositiveOutcome ? "text-acid" : "text-destructive";
  const TrendIcon = delta >= 0 ? TrendingUp : TrendingDown;

  return (
    <li className="rounded-md border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="font-mono uppercase tracking-[0.16em] text-xs text-muted-foreground">{stat.label}</span>
        <span className={`inline-flex items-center gap-1 font-display font-bold text-base tabular-nums ${tone}`}>
          <TrendIcon className="h-4 w-4" />
          {delta > 0 ? "+" : ""}{delta}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-display font-bold text-3xl tabular-nums text-muted-foreground/70">{stat.from}</span>
        <ArrowRight className="h-6 w-6 text-portal flex-none" />
        <span className={`font-display font-bold text-4xl tabular-nums ${tone} drop-shadow-[0_0_18px_currentColor]`}>{display}</span>
      </div>
    </li>
  );
};

const Consequence = () => {
  const { runId } = useParams<{ runId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [chosenLabel, setChosenLabel] = useState("");
  const [scenarioId, setScenarioId] = useState("");
  const [sceneId, setSceneId] = useState("");
  const [stats, setStats] = useState<StatChange[]>([]);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!runId) { setLoading(false); return; }
    const load = async () => {
      try {
        const { data: run } = await supabase
          .from("runs")
          .select("state_json, scenario_id, current_scene_id")
          .eq("id", runId)
          .single();
        if (!run) return;

        setScenarioId(run.scenario_id);

        // Получить предыдущую сцену и выбранный вариант из query params
        const prevSceneId = searchParams.get("scene") ?? "";
        const chosenId    = searchParams.get("chosen") ?? "";
        const prevState: Record<string, number> = JSON.parse(searchParams.get("prev") ?? "{}");
        const curState: Record<string, number>  = (run.state_json as any) ?? {};

        setSceneId(prevSceneId);

        // Найти label выбранного варианта
        const { data: scenario } = await supabase
          .from("scenarios")
          .select("scenario_json")
          .eq("id", run.scenario_id)
          .single();

        const scenes: any[] = (scenario?.scenario_json as any)?.scenes ?? [];
        const scene = scenes.find((s: any) => s.scene_id === prevSceneId);
        const option = scene?.options?.find((o: any) => o.id === chosenId);
        setChosenLabel(option?.text ?? chosenId);

        // Построить изменения статов
        const changes: StatChange[] = Object.keys({ ...prevState, ...curState })
          .filter((k) => k in STAT_META && prevState[k] !== curState[k])
          .map((k) => ({
            id: k,
            label: STAT_META[k].label,
            higherIsGood: STAT_META[k].higherIsGood,
            from: prevState[k] ?? 0,
            to: curState[k] ?? 0,
          }));

        setStats(changes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId]);

  const goNext = useMemo(() => () => {
    if (runId) navigate(`/vote?run=${runId}`, { replace: true });
    else navigate("/", { replace: true });
  }, [runId, navigate]);

  useEffect(() => {
    if (seconds <= 0) { goNext(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, goNext]);

  const progress = ((COUNTDOWN_SECONDS - seconds) / COUNTDOWN_SECONDS) * 100;

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-portal" />
      </main>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10 flex items-center">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="hud-chip">
              <Sparkles className="h-3 w-3" />
              {scenarioId} · {sceneId} · ПОСЛЕДСТВИЯ
            </span>
          </div>

          <article className="glass-card scanlines rounded-md overflow-hidden p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">
                <CheckCircle2 className="h-4 w-4 text-acid" />
                Вы выбрали
              </div>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-balance">
                <span className="text-portal neon-text">{chosenLabel}</span>
              </h1>
            </div>

            {stats.length > 0 && (
              <div className="mb-10">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4 text-center">
                  Последствия
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.map((s) => <StatRow key={s.id} stat={s} />)}
                </ul>
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-md border border-portal/40 bg-portal/5 px-5 py-3">
                <span className="text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">Следующая сцена через</span>
                <span className="font-display font-bold text-3xl tabular-nums text-portal neon-text w-10 text-center">{Math.max(seconds, 0)}</span>
                <span className="text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">сек</span>
              </div>
              <div className="w-full max-w-md h-1 rounded-full bg-border/60 overflow-hidden">
                <div className="h-full bg-portal shadow-[0_0_12px_hsl(var(--portal))] transition-[width] duration-[950ms] ease-linear" style={{ width: `${progress}%` }} />
              </div>
              <Button variant="ghost" size="sm" className="text-xs font-mono text-muted-foreground hover:text-portal" onClick={goNext}>
                Пропустить →
              </Button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default Consequence;
