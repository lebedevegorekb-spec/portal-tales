import { Link, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, Lock, Star, Flame, Zap } from "lucide-react";

type PaidScenario = {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  gradient: string;
  duration: string;
  players: string;
  difficulty: "Лайт" | "Средне" | "Хардкор";
  badge?: { label: string; tone: "hot" | "new" };
  priceRub: number;
  priceOldRub?: number;
};

const SCENARIOS: PaidScenario[] = [
  {
    id: "S02",
    title: "Паразит-имитатор",
    tagline: "Один из вас — не вы. Доверяй, но проверяй каждое слово.",
    emoji: "🧬",
    gradient: "from-pink/40 via-portal/20 to-cosmic/40",
    duration: "45 мин",
    players: "4–8",
    difficulty: "Средне",
    badge: { label: "Хит", tone: "hot" },
    priceRub: 250,
  },
  {
    id: "S03",
    title: "Сделка с торговцем",
    tagline: "Обмен, от которого нельзя отказаться. Или всё-таки можно?",
    emoji: "💰",
    gradient: "from-acid/40 via-portal/30 to-cosmic/30",
    duration: "30 мин",
    players: "4–6",
    difficulty: "Лайт",
    priceRub: 250,
  },
  {
    id: "S04",
    title: "Лаборатория-ловушка",
    tagline: "Двери запечатаны, кислород уходит. Кто-то знает выход.",
    emoji: "👁️",
    gradient: "from-pink/50 via-destructive/30 to-portal/20",
    duration: "60 мин",
    players: "5–8",
    difficulty: "Хардкор",
    badge: { label: "Новое", tone: "new" },
    priceRub: 350,
    priceOldRub: 450,
  },
];

const difficultyTone: Record<PaidScenario["difficulty"], string> = {
  "Лайт": "text-acid border-acid/40 bg-acid/10",
  "Средне": "text-portal border-portal/40 bg-portal/10",
  "Хардкор": "text-destructive border-destructive/40 bg-destructive/10",
};

const badgeTone = {
  hot: "text-pink border-pink/50 bg-pink/10",
  new: "text-acid border-acid/50 bg-acid/10",
} as const;

const formatRub = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₽";

const Offer = () => {
  const { runId } = useParams<{ runId: string }>();
  const replayHref = runId ? `/intro/${runId}` : "/catalog";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        <div className="w-full max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <header className="text-center space-y-4">
            <span className="hud-chip mx-auto">
              <Sparkles className="h-3 w-3" />
              POST-GAME · OFFER
            </span>
            <h1 className="font-display font-bold text-5xl md:text-7xl text-balance">
              Понравилось<span className="text-portal neon-text">?</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-xl text-pretty max-w-2xl mx-auto leading-relaxed">
              Демо закончилось на самом интересном. Откройте полные сценарии — больше сцен, ролей и предательств.
            </p>
          </header>

          {/* Scenario cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SCENARIOS.map((s) => (
              <article
                key={s.id}
                className="glass-card scanlines rounded-md overflow-hidden flex flex-col group transition-[box-shadow] hover:shadow-[0_20px_60px_-20px_hsl(var(--portal)/0.6)]"
              >
                {/* Cover */}
                <div
                  className={`relative aspect-[16/9] bg-gradient-to-br ${s.gradient}`}
                >
                  <div className="absolute inset-0 portal-orb opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[100px] drop-shadow-[0_8px_30px_hsl(var(--portal)/0.6)] select-none transition-transform duration-500 group-hover:scale-110">
                      {s.emoji}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <Lock className="h-3 w-3" /> {s.id}
                    </span>
                    {s.badge && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${badgeTone[s.badge.tone]}`}
                      >
                        {s.badge.tone === "hot" ? (
                          <Flame className="h-3 w-3" />
                        ) : (
                          <Star className="h-3 w-3" />
                        )}
                        {s.badge.label}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h2 className="font-display font-bold text-xl md:text-2xl text-balance">
                    {s.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 text-pretty leading-relaxed flex-1">
                    {s.tagline}
                  </p>

                  {/* Meta */}
                  <ul className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                    <li
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 ${difficultyTone[s.difficulty]}`}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {s.difficulty}
                    </li>
                    <li className="inline-flex items-center rounded-md border border-border bg-muted/40 text-muted-foreground px-2 py-0.5">
                      {s.duration}
                    </li>
                    <li className="inline-flex items-center rounded-md border border-border bg-muted/40 text-muted-foreground px-2 py-0.5">
                      {s.players} игроков
                    </li>
                  </ul>

                  {/* Price + CTA */}
                  <div className="mt-5 pt-5 border-t border-border/60 flex items-center justify-between gap-4">
                    <div className="leading-none">
                      {s.priceOldRub && (
                        <div className="text-xs font-mono text-muted-foreground line-through tabular-nums mb-1">
                          {formatRub(s.priceOldRub)}
                        </div>
                      )}
                      <div className="font-display font-bold text-2xl tabular-nums text-portal neon-text">
                        {formatRub(s.priceRub)}
                      </div>
                    </div>
                    <Link to="/pricing">
                      <Button
                        size="sm"
                        className="bg-portal hover:bg-portal/90 text-primary-foreground font-display font-bold"
                      >
                        Купить
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Bottom CTAs */}
          <section className="glass-card rounded-md p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-center md:text-left">
              <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1">
                Не готовы покупать?
              </div>
              <div className="font-display font-bold text-xl md:text-2xl text-balance">
                Сыграйте демо ещё раз — выбор может изменить финал.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link to={replayHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full font-display font-bold gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Повторить демо
                </Button>
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-portal hover:bg-portal/90 text-primary-foreground font-display font-bold"
                >
                  Купить за {formatRub(250)}
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Offer;
