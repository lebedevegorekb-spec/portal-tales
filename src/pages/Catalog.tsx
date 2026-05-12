import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Lock, Play as PlayIcon, Clock, Users, Sparkles } from "lucide-react";

type Scenario = {
  id: string;
  title: string;
  description: string;
  price_rub: number;
  scenario_json: any;
  preview_json: any;
};

type ScenarioMeta = {
  duration: string;
  players: string;
  tags: string[];
  gradient: string;
  emoji: string;
};

const META: Record<string, ScenarioMeta> = {
  S01: { duration: "30 мин", players: "4–6", tags: ["sci-fi", "bureaucracy", "dark_humor"], gradient: "from-portal/40 via-cosmic/30 to-pink/30", emoji: "🛸" },
  S02: { duration: "35 мин", players: "4–6", tags: ["sci-fi", "betrayal", "thriller"],     gradient: "from-pink/40 via-portal/20 to-cosmic/40", emoji: "🧬" },
  S03: { duration: "40 мин", players: "5–7", tags: ["heist", "dark_humor"],                gradient: "from-acid/40 via-portal/30 to-cosmic/30", emoji: "💰" },
  S04: { duration: "45 мин", players: "4–6", tags: ["sci-fi", "horror"],                   gradient: "from-pink/50 via-destructive/30 to-portal/20", emoji: "👁️" },
  S05: { duration: "30 мин", players: "3–5", tags: ["comedy", "sci-fi"],                   gradient: "from-cosmic/40 via-acid/30 to-portal/30", emoji: "🪐" },
  S11: { duration: "30 мин", players: "4–8", tags: ["sci-fi", "party"],                    gradient: "from-portal/30 via-cosmic/30 to-pink/30", emoji: "🌀" },
};

const DEFAULT_META: ScenarioMeta = {
  duration: "30 мин", players: "4–6", tags: ["sci-fi"],
  gradient: "from-portal/30 via-cosmic/30 to-pink/30", emoji: "🌀",
};

const Catalog = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [entitlements, setEntitlements] = useState<Set<string>>(new Set());
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);



  useEffect(() => {

    // Загрузить сценарии
    supabase
      .from("scenarios")
      .select("id, title, description, price_rub, scenario_json, preview_json")
      .order("id")
      .then(({ data }) => {
        if (data) setScenarios(data as Scenario[]);
        setLoadingScenarios(false);
      });

  }, [user]);

  const hasAccess = (scenarioId: string, priceRub: number) => {
    if (priceRub === 0) return true;
    if (entitlements.has(scenarioId)) return true;
    if (entitlements.has("all")) return true;
    return false;
  };

  const startTest = async (id: string) => {
    if (!user) return;
    setBusy(id + "_test");
    const { data, error } = await supabase.functions.invoke("room-create", {
      body: {
        scenario_id: id,
        host_user_id: user.id,
        host_name: "ТЕСТ",
        min_players: 1,
      },
    });
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Ошибка");
      setBusy(null);
      return;
    }
    const roomId = data.room.id;
    const { data: startData, error: startError } = await supabase.functions.invoke("party-start", {
      body: { room_id: roomId },
    });
    setBusy(null);
    if (startError || startData?.error) {
      toast.error(startData?.error || startError?.message || "Ошибка старта");
      return;
    }
    window.location.href = `/scene/${startData.run_id}`;
  };

  const startRun = async (id: string) => {
    if (!user) { navigate("/login"); return; }
    setBusy(id);
    const { data, error } = await supabase.functions.invoke("room-create", {
      body: {
        scenario_id: id,
        host_user_id: user.id,
        host_name:
          (user.user_metadata as { display_name?: string })?.display_name ||
          user.email?.split("@")[0] ||
          "Хост",
        min_players: 3,
      },
    });
    setBusy(null);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Не удалось создать комнату");
      return;
    }
    window.location.href = `/lobby/${data.room.id}`;
  };

  const cards = useMemo(
    () => scenarios.map((s) => ({ ...s, meta: META[s.id] ?? DEFAULT_META })),
    [scenarios],
  );


  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-10">
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

        {loadingScenarios ? (
          <div className="text-center text-muted-foreground py-20">Загрузка...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((s) => {
              const free = s.price_rub === 0;
              const unlocked = hasAccess(s.id, s.price_rub);
              return (
                <article
                  key={s.id}
                  className="glass-card rounded-md overflow-hidden flex flex-col group hover:border-portal/50 transition-colors"
                >
                  <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${s.meta.gradient}`}>
                    <div className="absolute inset-0 portal-orb opacity-30" />
                  {s.preview_json?.cover_image ? (
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/scenario-media/${s.preview_json.cover_image}`}
                      alt={s.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-7xl drop-shadow-[0_4px_18px_hsl(var(--portal)/0.6)] select-none">
                        {s.meta.emoji}
                      </span>
                    </div>
                  )}
                    <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-[0.2em] text-portal bg-background/70 backdrop-blur-sm px-2 py-1 rounded-sm border border-portal/30">
                      {s.id}
                    </div>
                    <div className="absolute top-3 right-3">
                      {unlocked ? (
                        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-portal bg-background/70 backdrop-blur-sm px-2 py-1 rounded-sm border border-portal/40">
                          Доступен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground bg-background/70 backdrop-blur-sm px-2 py-1 rounded-sm border border-border">
                          <Lock className="h-3 w-3" /> Замок
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 text-xs font-display font-bold bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-sm border border-portal/30">
                      {free ? (
                        <span className="text-portal neon-text">БЕСПЛАТНО</span>
                      ) : unlocked ? (
                        <span className="text-portal">КУПЛЕН</span>
                      ) : (
                        <span>₽{s.price_rub}</span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <Link to={`/scenarios/${s.id}`} className="hover:text-portal transition-colors">
                    <h3 className="font-display font-semibold text-lg leading-tight">{s.title}</h3>
                  </Link>
                    <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{s.description}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-portal/70" />{s.meta.duration}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-portal/70" />{s.meta.players}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.meta.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono uppercase tracking-[0.14em] text-portal/80 border border-portal/25 bg-portal/5 px-2 py-0.5 rounded-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex-1 flex items-end">
                      {unlocked ? (
                        <Button
                          onClick={() => startRun(s.id)}
                          disabled={busy === s.id}
                          className="w-full bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]"
                        >
                          <PlayIcon className="h-4 w-4" />
                          {busy === s.id ? "..." : "Создать комнату"}
                        </Button>
                      ) : (
                        <Link to={`/payment/${s.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            <Lock className="h-4 w-4" />
                            Купить за ₽{s.price_rub}
                          </Button>
                        </Link>
                      )}
                      {isAdmin && (
                        <Button variant="outline" size="sm"
                          onClick={() => startTest(s.id)}
                          disabled={busy === s.id + "_test"}
                          className="w-full border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 mt-1">
                          {busy === s.id + "_test" ? "..." : "⚡ Тест (1 игрок)"}
                        </Button>
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

