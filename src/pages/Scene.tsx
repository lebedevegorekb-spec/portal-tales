import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Smartphone, Users, Timer as TimerIcon, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// ----- Заглушка данных сцены (потом заменим на realtime из БД) -----

type VoteOption = {
  id: string;
  label: string;
  hint?: string;
};

type SceneData = {
  scenarioId: string;
  sceneId: string;
  title: string;
  text: string;
  emoji: string;
  gradient: string;
  question: string | null;
  options: VoteOption[];
  totalPlayers: number;
};

const DEMO_SCENE: SceneData = {
  scenarioId: "S01",
  sceneId: "scene_01",
  title: "Сцена 1 · Гараж Рика",
  text:
    "Бюрократ Глорп тычет в Морти склизким щупальцем и зачитывает приговор: «Измерение C-137 подлежит немедленной утилизации». Рик, не отрываясь от фляги, кивает в сторону портал-ганна. Решайте быстро — у вас 30 секунд.",
  emoji: "🛸",
  gradient: "from-portal/40 via-cosmic/30 to-pink/30",
  question: "Что делаете с инспектором?",
  options: [
    { id: "A", label: "Дать взятку мегасемечками", hint: "Дипломатия по-Риковски" },
    { id: "B", label: "Заехать кулаком в щупальце", hint: "Морти, нет!" },
    { id: "C", label: "Открыть портал ему под ноги", hint: "Быстро и эффективно" },
    { id: "D", label: "Подписать всё что просит", hint: "А потом разберёмся" },
  ],
  totalPlayers: 6,
};

const SCENE_TIMER_SECONDS = 30;

type Phase = "showing" | "voting" | "results";

const Scene = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();

  // Заглушка: данные сцены
  const scene = DEMO_SCENE;

  const [seconds, setSeconds] = useState(SCENE_TIMER_SECONDS);
  const [phase, setPhase] = useState<Phase>("showing");
  // Симуляция прихода голосов (заглушка вместо realtime)
  const [votes, setVotes] = useState<Record<string, number>>({});

  // Через 2.5 сек после показа — запускаем голосование
  useEffect(() => {
    const t = setTimeout(() => setPhase("voting"), 2500);
    return () => clearTimeout(t);
  }, []);

  // Таймер на голосование
  useEffect(() => {
    if (phase !== "voting") return;
    if (seconds <= 0) {
      setPhase("results");
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, seconds]);

  // Симулятор поступающих голосов (раз в ~2.5–4 сек добавляем по одному)
  useEffect(() => {
    if (phase !== "voting") return;
    const interval = setInterval(() => {
      setVotes((prev) => {
        const total = Object.values(prev).reduce((a, b) => a + b, 0);
        if (total >= scene.totalPlayers) return prev;
        const opt = scene.options[Math.floor(Math.random() * scene.options.length)];
        return { ...prev, [opt.id]: (prev[opt.id] ?? 0) + 1 };
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [phase, scene.options, scene.totalPlayers]);

  const totalVotes = useMemo(
    () => Object.values(votes).reduce((a, b) => a + b, 0),
    [votes],
  );

  // Все проголосовали — досрочно показываем результат
  useEffect(() => {
    if (phase === "voting" && totalVotes >= scene.totalPlayers) {
      const t = setTimeout(() => setPhase("results"), 700);
      return () => clearTimeout(t);
    }
  }, [phase, totalVotes, scene.totalPlayers]);

  const winner = useMemo(() => {
    if (phase !== "results") return null;
    let best: { id: string; count: number } | null = null;
    for (const opt of scene.options) {
      const c = votes[opt.id] ?? 0;
      if (!best || c > best.count) best = { id: opt.id, count: c };
    }
    return best;
  }, [phase, votes, scene.options]);

  const timerProgress = ((SCENE_TIMER_SECONDS - seconds) / SCENE_TIMER_SECONDS) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8 flex items-stretch">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
          {/* ЛЕВО: сцена */}
          <article className="glass-card scanlines rounded-md overflow-hidden flex flex-col">
            <div
              className={`relative aspect-[16/9] bg-gradient-to-br ${scene.gradient}`}
            >
              <div className="absolute inset-0 portal-orb opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[140px] md:text-[200px] drop-shadow-[0_8px_30px_hsl(var(--portal)/0.6)] select-none">
                  {scene.emoji}
                </span>
              </div>
              <div className="absolute top-4 left-4">
                <span className="hud-chip">
                  <Sparkles className="h-3 w-3" />
                  {scene.scenarioId} · {scene.sceneId}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <h1 className="font-display font-bold text-3xl md:text-4xl text-balance text-portal neon-text">
                {scene.title}
              </h1>
              <p className="text-muted-foreground mt-4 text-base md:text-lg text-pretty leading-relaxed">
                {scene.text}
              </p>
            </div>
          </article>

          {/* ПРАВО: голосование */}
          <aside className="glass-card rounded-md p-6 md:p-8 flex flex-col">
            {/* Header / status */}
            <div className="flex items-center justify-between mb-5">
              <span className="hud-chip">
                {phase === "showing" && (<><Sparkles className="h-3 w-3" /> Сцена</>)}
                {phase === "voting" && (<><Users className="h-3 w-3" /> Голосование</>)}
                {phase === "results" && (<><CheckCircle2 className="h-3 w-3" /> Результат</>)}
              </span>
              <div className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground">
                <Users className="h-4 w-4 text-portal" />
                <span className="tabular-nums">
                  <span className="text-foreground font-semibold">{totalVotes}</span>
                  /{scene.totalPlayers} проголосовали
                </span>
              </div>
            </div>

            {/* Question */}
            {scene.question ? (
              <h2 className="font-display font-bold text-2xl md:text-3xl text-balance mb-5">
                {scene.question}
              </h2>
            ) : (
              <h2 className="font-display font-bold text-2xl text-muted-foreground mb-5">
                Наблюдайте за развитием…
              </h2>
            )}

            {/* Timer */}
            {phase !== "showing" && (
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
                  <span className="inline-flex items-center gap-1.5">
                    <TimerIcon className="h-3.5 w-3.5 text-portal" />
                    {phase === "voting" ? "До конца голосования" : "Время вышло"}
                  </span>
                  <span className="tabular-nums text-portal font-bold text-base">
                    {String(Math.max(seconds, 0)).padStart(2, "0")}s
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full bg-portal shadow-[0_0_12px_hsl(var(--portal))] transition-[width] duration-[950ms] ease-linear"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <ul className="space-y-3 flex-1">
              {scene.options.map((opt) => {
                const count = votes[opt.id] ?? 0;
                const pct = scene.totalPlayers
                  ? Math.round((count / scene.totalPlayers) * 100)
                  : 0;
                const isWinner = winner?.id === opt.id && phase === "results";
                return (
                  <li
                    key={opt.id}
                    className={`relative rounded-md border ${
                      isWinner
                        ? "border-acid/60 bg-acid/10"
                        : "border-border bg-card/40"
                    } overflow-hidden`}
                  >
                    {/* Прогресс-фон */}
                    <div
                      className={`absolute inset-y-0 left-0 ${
                        isWinner ? "bg-acid/20" : "bg-portal/15"
                      } transition-[width] duration-500 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex items-center gap-4 p-4">
                      <span
                        className={`flex-none w-9 h-9 rounded-md grid place-items-center font-display font-bold ${
                          isWinner
                            ? "bg-acid text-background"
                            : "bg-portal/20 text-portal border border-portal/40"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base md:text-lg leading-tight">
                          {opt.label}
                        </div>
                        {opt.hint && (
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {opt.hint}
                          </div>
                        )}
                      </div>
                      <div className="flex-none text-right tabular-nums">
                        <div className="font-display font-bold text-lg leading-none">
                          {count}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                          {pct}%
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Footer hint / CTA-substitute */}
            <div className="mt-6 pt-5 border-t border-border/60 flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <Smartphone className="h-3.5 w-3.5 text-portal" />
                Голосуйте с телефонов
              </div>
              {phase === "results" && runId && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs font-mono text-muted-foreground hover:text-portal"
                  onClick={() => navigate(`/play/run/${runId}`, { replace: true })}
                >
                  Дальше →
                </Button>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Scene;
