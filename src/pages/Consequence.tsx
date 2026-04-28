import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight, CheckCircle2, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// ----- Заглушка результата выбора -----

type StatChange = {
  id: string;
  label: string;
  from: number;
  to: number;
  // higher_is_good: рост = хорошо (зелёный), падение = плохо (красный)
  higherIsGood: boolean;
  unit?: string;
};

type ConsequenceData = {
  scenarioId: string;
  sceneId: string;
  chosenLabel: string;
  chosenId: string;
  narrative: string;
  stats: StatChange[];
};

const DEMO: ConsequenceData = {
  scenarioId: "S01",
  sceneId: "scene_01",
  chosenId: "C",
  chosenLabel: "Немедленно выключить",
  narrative:
    "Рик дёргает рубильник. Что-то щёлкает в стене, бюрократ Глорп моргает всеми семью глазами и испаряется, оставив после себя запах горелой бумаги и чек на 0.00 кредитов.",
  stats: [
    { id: "portal", label: "Стабильность портала", from: 100, to: 120, higherIsGood: true },
    { id: "chaos", label: "Уровень хаоса", from: 50, to: 40, higherIsGood: false },
  ],
};

const COUNTDOWN_SECONDS = 5;

// Лёгкий tween числа от → к
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const tone = isNeutral
    ? "text-muted-foreground"
    : isPositiveOutcome
      ? "text-acid"
      : "text-destructive";

  const TrendIcon = delta >= 0 ? TrendingUp : TrendingDown;

  return (
    <li className="rounded-md border border-border bg-card/40 p-5 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="font-mono uppercase tracking-[0.16em] text-xs md:text-sm text-muted-foreground">
          {stat.label}
        </span>
        <span
          className={`inline-flex items-center gap-1 font-display font-bold text-base md:text-lg tabular-nums ${tone}`}
        >
          <TrendIcon className="h-4 w-4" />
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <span className="font-display font-bold text-3xl md:text-4xl tabular-nums text-muted-foreground/70">
          {stat.from}
        </span>
        <ArrowRight className="h-6 w-6 md:h-7 md:w-7 text-portal flex-none" />
        <span
          className={`font-display font-bold text-4xl md:text-6xl tabular-nums ${tone} drop-shadow-[0_0_18px_currentColor]`}
        >
          {display}
        </span>
      </div>
    </li>
  );
};

const Consequence = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  const data = DEMO;
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  const goNext = useMemo(
    () => () => {
      if (runId) navigate(`/scene/${runId}`, { replace: true });
      else navigate("/scene", { replace: true });
    },
    [runId, navigate],
  );

  useEffect(() => {
    if (seconds <= 0) {
      goNext();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, goNext]);

  const progress = ((COUNTDOWN_SECONDS - seconds) / COUNTDOWN_SECONDS) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10 flex items-center">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <span className="hud-chip">
              <Sparkles className="h-3 w-3" />
              {data.scenarioId} · {data.sceneId} · CONSEQUENCE
            </span>
          </div>

          <article className="glass-card scanlines rounded-md overflow-hidden p-8 md:p-12">
            {/* Что выбрали */}
            <div className="text-center mb-10 md:mb-12">
              <div className="inline-flex items-center gap-2 text-xs md:text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">
                <CheckCircle2 className="h-4 w-4 text-acid" />
                Вы выбрали
              </div>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-balance">
                <span className="text-portal neon-text">{data.chosenLabel}</span>
              </h1>
              <p className="text-muted-foreground mt-5 md:mt-6 text-base md:text-lg text-pretty max-w-3xl mx-auto leading-relaxed">
                {data.narrative}
              </p>
            </div>

            {/* Последствия */}
            <div className="mb-10">
              <div className="text-xs md:text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4 text-center">
                Последствия
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.stats.map((s) => (
                  <StatRow key={s.id} stat={s} />
                ))}
              </ul>
            </div>

            {/* Countdown */}
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-3 rounded-md border border-portal/40 bg-portal/5 px-5 py-3">
                <span className="text-sm md:text-base font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Следующая сцена через
                </span>
                <span className="font-display font-bold text-3xl md:text-4xl tabular-nums text-portal neon-text w-10 text-center">
                  {Math.max(seconds, 0)}
                </span>
                <span className="text-sm md:text-base font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  сек
                </span>
              </div>

              <div className="w-full max-w-md h-1 rounded-full bg-border/60 overflow-hidden">
                <div
                  className="h-full bg-portal shadow-[0_0_12px_hsl(var(--portal))] transition-[width] duration-[950ms] ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-mono text-muted-foreground hover:text-portal"
                onClick={goNext}
              >
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
