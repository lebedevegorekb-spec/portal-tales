import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Lock,
  Play as PlayIcon,
  RotateCcw,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";

type Scenario = { id: string; title: string; description: string };

// Жёстко заданная мета по сценариям (длительность, игроки, теги, цена, превью).
// Дефолт применяется к любому id, которого нет в карте.
type ScenarioMeta = {
  duration: string;
  players: string;
  tags: string[];
  priceRub: number; // 0 = бесплатно
  gradient: string; // tailwind-классы фона превью
  emoji: string;
};

const META: Record<string, ScenarioMeta> = {
  S01: {
    duration: "30 мин",
    players: "4–6",
    tags: ["sci-fi", "bureaucracy", "dark_humor"],
    priceRub: 0,
    gradient: "from-portal/40 via-cosmic/30 to-pink/30",
    emoji: "🛸",
  },
  S02: {
    duration: "35 мин",
    players: "4–6",
    tags: ["sci-fi", "betrayal", "thriller"],
    priceRub: 250,
    gradient: "from-pink/40 via-portal/20 to-cosmic/40",
    emoji: "🧬",
  },
  S03: {
    duration: "40 мин",
    players: "5–7",
    tags: ["heist", "dark_humor"],
    priceRub: 250,
    gradient: "from-acid/40 via-portal/30 to-cosmic/30",
    emoji: "💰",
  },
  S04: {
    duration: "45 мин",
    players: "4–6",
    tags: ["sci-fi", "horror"],
    priceRub: 300,
    gradient: "from-pink/50 via-destructive/30 to-portal/20",
    emoji: "👁️",
  },
  S05: {
    duration: "30 мин",
    players: "3–5",
    tags: ["comedy", "sci-fi"],
    priceRub: 250,
    gradient: "from-cosmic/40 via-acid/30 to-portal/30",
    emoji: "🪐",
  },
};

const DEFAULT_META: ScenarioMeta = {
  duration: "30 мин",
  players: "4–6",
  tags: ["sci-fi", "party"],
  priceRub: 250,
  gradient: "from-portal/30 via-cosmic/30 to-pink/30",
  emoji: "🌀",
};

const FREE_SCENARIO_FALLBACKS: Scenario[] = [
  {
    id: "S01",
    title: "Налог на Реальность C-137",
    description:
      "Инспектор-бюрократ из Налоговой Службы Мультивселенной требует утилизировать измерение C-137 за 47 лет неуплаты налога на существование.",
  },
];

const formatPrice = (rub: number) => (rub === 0 ? "БЕСПЛАТНО" : `₽${rub}`);

const Catalog = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [scenariosError, setScenariosError] = useState<string | null>(null);
  const [entitledScopes, setEntitledScopes] = useState<Set<string>>(new Set());
  const [activeRuns, setActiveRuns] = useState<Map<string, string>>(new Map());
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const refresh = async () => {
    setScenariosLoading(true);
    setScenariosError(null);

    let loaded: Scenario[] | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase
        .from("scenarios")
        .select("id,title,description")
        .eq("is_active", true)
        .order("id");
      if (!error && data) {
        loaded = data;
        break;
      }
      if (attempt < 2) await new Promise((r) => setTimeout(r, 900 * (attempt + 1)));
    }

    if (loaded) {
      const merged = [...loaded];
      FREE_SCENARIO_FALLBACKS.forEach((f) => {
        if (!merged.some((s) => s.id === f.id)) merged.push(f);
      });
      merged.sort((a, b) => a.id.localeCompare(b.id));
      setScenarios(merged);
    } else {
      setScenarios(FREE_SCENARIO_FALLBACKS);
      setScenariosError("Не удалось загрузить сценарии. Попробуй ещё раз.");
    }
    setScenariosLoading(false);

    if (!user) return;
    const { data: ents } = await supabase
      .from("entitlements")
      .select("scope, expires_at, active")
      .eq("user_id", user.id)
      .eq("active", true);
    const now = Date.now();
    const set = new Set<string>();
    (ents ?? []).forEach((e) => {
      if (!e.expires_at || new Date(e.expires_at).getTime() > now) set.add(e.scope);
    });
    setEntitledScopes(set);

    const { data: runs } = await supabase
      .from("runs")
      .select("id, scenario_id")
      .eq("user_id", user.id)
      .eq("status", "active");
    const map = new Map<string, string>();
    (runs ?? []).forEach((r) => map.set(r.scenario_id, r.id));
    setActiveRuns(map);
  };

  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const isEntitled = (id: string, priceRub: number) =>
    priceRub === 0 ||
    entitledScopes.has("all") ||
    entitledScopes.has(id) ||
    entitledScopes.has(`scenario:${id}`);

  const startRun = async (id: string) => {
    if (!user) return;
    setBusy(id);
    const { data, error } = await supabase.functions.invoke("room-create", {
      body: {
        scenario_id: id,
        host_user_id: user.id,
        host_name:
          (user.user_metadata as { display_name?: string })?.display_name ||
          user.email?.split("@")[0] ||
          "Хост",
        min_players: 4,
      },
    });
    setBusy(null);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Не удалось создать комнату");
      return;
    }
    navigate(`/lobby/${data.room.id}`);
  };

  const cards = useMemo(
    () =>
      scenarios.map((s) => {
        const meta = META[s.id] ?? DEFAULT_META;
        return { ...s, meta };
      }),
    [scenarios],
  );

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
        {/* Заголовок */}
        <div className="mb-8">
          <span className="hud-chip mb-4">
            <Sparkles className="h-3 w-3" />
            Каталог · Сезон 1
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-balance">
            Выбери сценарий
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Каждый — 30–45 минут хаоса на 3–8 игроков. Создавай комнату и зови друзей.
          </p>
        </div>

        {/* Ошибка / повтор */}
        {scenariosError ? (
          <div className="glass-card rounded-md p-5 flex items-center justify-between gap-4 mb-4">
            <p className="text-sm text-muted-foreground">{scenariosError}</p>
            <Button variant="outline" onClick={refresh}>
              Повторить
            </Button>
          </div>
        ) : null}

        {/* Загрузка */}
        {scenariosLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-md overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-muted/60" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                  <div className="h-9 w-full bg-muted rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          // Пустое состояние
          <div className="glass-card scanlines rounded-md p-10 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-portal/40 bg-portal/10 mb-4">
              <Sparkles className="h-6 w-6 text-portal" />
            </div>
            <h2 className="font-display font-semibold text-xl">Пока нет сценариев</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Скоро здесь появятся новые истории. Загляни попозже или подпишись на новости.
            </p>
            <Button variant="outline" className="mt-6" onClick={refresh}>
              Обновить
            </Button>
          </div>
        ) : (
          // Карточки
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((s) => {
              const entitled = isEntitled(s.id, s.meta.priceRub);
              const activeRun = activeRuns.get(s.id);
              const purchased = entitled && s.meta.priceRub > 0;

              return (
                <article
                  key={s.id}
                  className="glass-card rounded-md overflow-hidden flex flex-col group hover:border-portal/50 transition-colors"
                >
                  {/* Превью */}
                  <div
                    className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${s.meta.gradient}`}
                  >
                    <div className="absolute inset-0 portal-orb opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-7xl drop-shadow-[0_4px_18px_hsl(var(--portal)/0.6)] select-none">
                        {s.meta.emoji}
                      </span>
                    </div>
                    {/* ID и статус поверх */}
                    <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-[0.2em] text-portal bg-background/70 backdrop-blur-sm px-2 py-1 rounded-sm border border-portal/30">
                      {s.id}
                    </div>
                    <div className="absolute top-3 right-3">
                      {entitled ? (
                        purchased ? (
                          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-acid bg-background/70 backdrop-blur-sm px-2 py-1 rounded-sm border border-acid/40">
                            Куплен
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-portal bg-background/70 backdrop-blur-sm px-2 py-1 rounded-sm border border-portal/40">
                            Доступен
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground bg-background/70 backdrop-blur-sm px-2 py-1 rounded-sm border border-border">
                          <Lock className="h-3 w-3" />
                          Замок
                        </span>
                      )}
                    </div>
                    {/* Цена */}
                    <div className="absolute bottom-3 right-3 text-xs font-display font-bold bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-portal/30">
                      {s.meta.priceRub === 0 ? (
                        <span className="text-portal neon-text">БЕСПЛАТНО</span>
                      ) : (
                        <span>₽{s.meta.priceRub}</span>
                      )}
                    </div>
                  </div>

                  {/* Контент */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-lg leading-tight">
                      {s.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                      {s.description}
                    </p>

                    {/* Мета: длительность + игроки */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-portal/70" />
                        {s.meta.duration}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-portal/70" />
                        {s.meta.players}
                      </span>
                    </div>

                    {/* Теги */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.meta.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono uppercase tracking-[0.14em] text-portal/80 border border-portal/25 bg-portal/5 px-2 py-0.5 rounded-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-5 flex-1 flex items-end">
                      {entitled && activeRun ? (
                        <Button
                          onClick={() => navigate(`/play/run/${activeRun}`)}
                          className="w-full bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]"
                        >
                          <RotateCcw className="h-4 w-4" /> Продолжить
                        </Button>
                      ) : entitled ? (
                        <Button
                          onClick={() => startRun(s.id)}
                          disabled={busy === s.id}
                          className="w-full bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]"
                        >
                          <PlayIcon className="h-4 w-4" />
                          {busy === s.id ? "..." : "Создать комнату"}
                        </Button>
                      ) : (
                        <Link to="/pricing" className="w-full">
                          <Button variant="outline" className="w-full">
                            <Lock className="h-4 w-4" />
                            Купить за {formatPrice(s.meta.priceRub)}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalog;
