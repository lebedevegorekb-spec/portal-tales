import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Loader2, Sparkles, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Локальные превью/вступления — на случай, если в БД ещё пусто.
const SCENARIO_INTRO: Record<
  string,
  { title: string; intro: string; emoji: string; gradient: string }
> = {
  S01: {
    title: "Налог на Реальность C-137",
    intro:
      "Бюрократ из Налоговой Службы Мультивселенной материализовался в гостиной. У вас 30 минут, чтобы спасти измерение от утилизации.",
    emoji: "🛸",
    gradient: "from-portal/40 via-cosmic/30 to-pink/30",
  },
  S02: {
    title: "Паразит-имитатор",
    intro:
      "Один из вас — не вы. Мозговой паразит уже здесь и копирует воспоминания. Доверяй, но проверяй каждое слово.",
    emoji: "🧬",
    gradient: "from-pink/40 via-portal/20 to-cosmic/40",
  },
  S03: {
    title: "Сделка с инопланетным торговцем",
    intro:
      "Торговец предлагает обмен, от которого нельзя отказаться. И, кажется, он знает о вас больше, чем стоило бы.",
    emoji: "💰",
    gradient: "from-acid/40 via-portal/30 to-cosmic/30",
  },
  S04: {
    title: "Лаборатория-ловушка",
    intro:
      "Эксперимент Рика вышел из-под контроля. Двери запечатаны, кислород уходит. Кто-то здесь точно знает выход.",
    emoji: "👁️",
    gradient: "from-pink/50 via-destructive/30 to-portal/20",
  },
  S05: {
    title: "Суд мультивселенной",
    intro:
      "Совет Риков обвиняет вас в преступлениях, которых вы ещё не совершили. Защищайтесь — или сдайте друг друга.",
    emoji: "🪐",
    gradient: "from-cosmic/40 via-acid/30 to-portal/30",
  },
};

const DEFAULT_INTRO = {
  title: "Сценарий",
  intro: "Сейчас всё начнётся. Глубокий вдох — и в портал.",
  emoji: "🌀",
  gradient: "from-portal/30 via-cosmic/30 to-pink/30",
};

const COUNTDOWN_SECONDS = 5;

const Intro = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [scenarioMeta, setScenarioMeta] = useState<{
    title: string;
    description: string;
    image: string | null;
  } | null>(null);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  // 1) Получаем scenario_id из run
  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("runs")
        .select("scenario_id")
        .eq("id", runId)
        .maybeSingle();
      if (!cancelled && data?.scenario_id) setScenarioId(data.scenario_id);
    })();
    return () => {
      cancelled = true;
    };
  }, [runId]);

  // 2) Подтягиваем мету сценария (тихо, не блокируя UI)
  useEffect(() => {
    if (!scenarioId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("scenarios")
        .select("title,description,final_image_url")
        .eq("id", scenarioId)
        .maybeSingle();
      if (!cancelled && data) {
        setScenarioMeta({
          title: data.title,
          description: data.description,
          image: data.final_image_url ?? null,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  // 3) Обратный отсчёт + автопереход
  useEffect(() => {
    if (!runId) return;
    if (seconds <= 0) {
      navigate(`/play/run/${runId}`, { replace: true });
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, runId, navigate]);

  const fallback = useMemo(
    () => (scenarioId ? SCENARIO_INTRO[scenarioId] ?? DEFAULT_INTRO : DEFAULT_INTRO),
    [scenarioId],
  );

  const title = scenarioMeta?.title ?? fallback.title;
  const intro = scenarioMeta?.description ?? fallback.intro;
  const image = scenarioMeta?.image ?? null;
  const progress = ((COUNTDOWN_SECONDS - seconds) / COUNTDOWN_SECONDS) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10 flex items-center">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="hud-chip">
              <Sparkles className="h-3 w-3" />
              {scenarioId ?? "RUN"} · INTRO
            </span>
          </div>

          <article className="glass-card scanlines rounded-md overflow-hidden">
            {/* Изображение / арт сценария */}
            <div
              className={`relative aspect-[21/9] md:aspect-[21/8] bg-gradient-to-br ${fallback.gradient}`}
            >
              <div className="absolute inset-0 portal-orb opacity-30" />
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90"
                  loading="eager"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[140px] md:text-[180px] drop-shadow-[0_8px_30px_hsl(var(--portal)/0.6)] select-none">
                    {fallback.emoji}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Текст */}
            <div className="p-8 md:p-12 text-center">
              <h1 className="font-display font-bold text-4xl md:text-6xl text-balance">
                <span className="text-portal neon-text">{title}</span>
              </h1>
              <p className="text-muted-foreground mt-5 md:mt-6 text-base md:text-xl text-pretty max-w-3xl mx-auto leading-relaxed">
                {intro}
              </p>

              {/* Обратный отсчёт */}
              <div className="mt-10 md:mt-12 flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-3 rounded-md border border-portal/40 bg-portal/5 px-5 py-3">
                  {seconds > 0 ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-portal" />
                      <span className="text-sm md:text-base font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        Игра начинается через
                      </span>
                      <span className="font-display font-bold text-3xl md:text-4xl tabular-nums text-portal neon-text w-10 text-center">
                        {seconds}
                      </span>
                      <span className="text-sm md:text-base font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        сек
                      </span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-5 w-5 text-acid" />
                      <span className="font-display font-bold text-lg text-acid">
                        Поехали…
                      </span>
                    </>
                  )}
                </div>

                {/* Прогресс-бар */}
                <div className="w-full max-w-md h-1 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full bg-portal shadow-[0_0_12px_hsl(var(--portal))] transition-[width] duration-[950ms] ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {runId ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono text-muted-foreground hover:text-portal"
                    onClick={() => navigate(`/play/run/${runId}`, { replace: true })}
                  >
                    Пропустить
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default Intro;
