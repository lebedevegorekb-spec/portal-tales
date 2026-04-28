import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  Skull,
  ShoppingCart,
  RotateCcw,
  Crown,
} from "lucide-react";

// ----- Заглушка финальных данных -----

type PlayerReveal = {
  id: string;
  name: string;
  role: string;
  roleTone: "good" | "evil" | "neutral";
  goal: string;
  achieved: boolean;
};

type Betrayal = {
  by: string;
  victim: string;
  what: string;
};

type FinalData = {
  scenarioId: string;
  endingTitle: string;
  endingId: string;
  endingText: string;
  emoji: string;
  gradient: string;
  imageUrl: string | null;
  players: PlayerReveal[];
  betrayals: Betrayal[];
};

const DEMO: FinalData = {
  scenarioId: "S01",
  endingId: "ending_good",
  endingTitle: "Налоговая утоплена в портале",
  endingText:
    "Бюрократ Глорп, рыдая на родном языке, исчез в фиолетовой воронке вместе со всем долгом. Земля C-137 продолжает существование — пока кто-нибудь снова не нажмёт не на ту кнопку. Рик уже наливает.",
  emoji: "🛸",
  gradient: "from-portal/40 via-cosmic/30 to-pink/30",
  imageUrl: null,
  players: [
    {
      id: "p1",
      name: "Морти",
      role: "Учёный",
      roleTone: "good",
      goal: "Сохранить измерение C-137",
      achieved: true,
    },
    {
      id: "p2",
      name: "Саммер",
      role: "Дипломат",
      roleTone: "good",
      goal: "Не дать никому умереть",
      achieved: true,
    },
    {
      id: "p3",
      name: "Джерри",
      role: "Двойной агент",
      roleTone: "evil",
      goal: "Тайно сдать Рика налоговой",
      achieved: false,
    },
    {
      id: "p4",
      name: "Бёрдперсон",
      role: "Наблюдатель",
      roleTone: "neutral",
      goal: "Дожить до финала",
      achieved: true,
    },
  ],
  betrayals: [
    {
      by: "Джерри",
      victim: "Рик",
      what: "Передал координаты гаража инспектору Глорпу",
    },
    {
      by: "Саммер",
      victim: "Джерри",
      what: "Подменила его подпись на договоре утилизации",
    },
  ],
};

const roleToneClass: Record<PlayerReveal["roleTone"], string> = {
  good: "text-acid border-acid/40 bg-acid/10",
  evil: "text-destructive border-destructive/40 bg-destructive/10",
  neutral: "text-muted-foreground border-border bg-muted/40",
};

const Final = () => {
  const { runId: _runId } = useParams<{ runId: string }>();
  const data = DEMO;

  const achievedCount = useMemo(
    () => data.players.filter((p) => p.achieved).length,
    [data.players],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* HUD */}
          <div className="text-center">
            <span className="hud-chip">
              <Sparkles className="h-3 w-3" />
              {data.scenarioId} · FINAL · {data.endingId}
            </span>
          </div>

          {/* Hero ending */}
          <article className="glass-card scanlines rounded-md overflow-hidden">
            <div
              className={`relative aspect-[21/9] md:aspect-[21/8] bg-gradient-to-br ${data.gradient}`}
            >
              <div className="absolute inset-0 portal-orb opacity-30" />
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt={data.endingTitle}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-90"
                  loading="eager"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[140px] md:text-[200px] drop-shadow-[0_8px_30px_hsl(var(--portal)/0.6)] select-none">
                    {data.emoji}
                  </span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-acid/50 bg-background/80 backdrop-blur px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-acid">
                  <Trophy className="h-3.5 w-3.5" /> Финал
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="p-8 md:p-12 text-center">
              <h1 className="font-display font-bold text-4xl md:text-6xl text-balance">
                <span className="text-portal neon-text">{data.endingTitle}</span>
              </h1>
              <p className="text-muted-foreground mt-5 md:mt-6 text-base md:text-xl text-pretty max-w-3xl mx-auto leading-relaxed">
                {data.endingText}
              </p>
            </div>
          </article>

          {/* Reveals grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles & goals table */}
            <div className="glass-card rounded-md p-6 md:p-8 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl md:text-2xl inline-flex items-center gap-2">
                  <Crown className="h-5 w-5 text-portal" />
                  Раскрытие ролей и целей
                </h2>
                <span className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
                  {achievedCount}/{data.players.length} достигли цели
                </span>
              </div>

              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm md:text-base">
                  <thead>
                    <tr className="text-left font-mono uppercase tracking-[0.16em] text-[10px] md:text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-normal">Игрок</th>
                      <th className="px-3 py-2 font-normal">Роль</th>
                      <th className="px-3 py-2 font-normal">Цель</th>
                      <th className="px-3 py-2 font-normal text-right">Итог</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.players.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-border/60 align-middle"
                      >
                        <td className="px-3 py-3 font-display font-bold text-base md:text-lg">
                          {p.name}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono uppercase tracking-wider ${roleToneClass[p.roleTone]}`}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-portal/70 flex-none" />
                            <span>{p.goal}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          {p.achieved ? (
                            <span className="inline-flex items-center gap-1 text-acid font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-xs uppercase tracking-wider">Успех</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                              <XCircle className="h-4 w-4" />
                              <span className="text-xs uppercase tracking-wider">Провал</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Betrayals */}
            <div className="glass-card rounded-md p-6 md:p-8">
              <h2 className="font-display font-bold text-xl md:text-2xl inline-flex items-center gap-2 mb-5">
                <Skull className="h-5 w-5 text-destructive" />
                Ключевые предательства
              </h2>

              {data.betrayals.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  В этой партии все были честны. Подозрительно.
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.betrayals.map((b, i) => (
                    <li
                      key={i}
                      className="rounded-md border border-destructive/30 bg-destructive/5 p-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-display font-bold">
                        <span className="text-foreground">{b.by}</span>
                        <span className="text-destructive">→</span>
                        <span className="text-muted-foreground">{b.victim}</span>
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {b.what}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* CTAs */}
          <section className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/catalog">
              <Button
                size="lg"
                className="bg-portal hover:bg-portal/90 text-primary-foreground font-display font-bold gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Сыграть ещё
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-acid/50 text-acid hover:bg-acid/10 hover:text-acid font-display font-bold gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Купить следующий сценарий
              </Button>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Final;
