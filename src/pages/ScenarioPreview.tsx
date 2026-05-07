import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Users, Lock, Play, RotateCcw, AlertTriangle, Star } from "lucide-react";

type PreviewJson = {
  tagline?: string;
  full_description?: string;
  warning?: string;
  host_quote?: string;
  morty_quote?: string;
  duration_minutes?: number;
  players_min?: number;
  players_max?: number;
  difficulty?: string;
  replayable?: boolean;
  age_rating?: string;
  cover_image?: string;
};

type Scenario = {
  id: string;
  title: string;
  description: string;
  price_rub: number;
  preview_json: PreviewJson;
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Сложная",
};

const META: Record<string, { gradient: string; emoji: string; tags: string[] }> = {
  S01: { gradient: "from-portal/40 via-cosmic/30 to-pink/30", emoji: "🛸", tags: ["sci-fi", "bureaucracy"] },
  S11: { gradient: "from-portal/30 via-cosmic/30 to-pink/30", emoji: "🌀", tags: ["sci-fi", "party", "detective"] },
};
const DEFAULT_META = { gradient: "from-portal/30 via-cosmic/30 to-pink/30", emoji: "🌀", tags: [] };

export default function ScenarioPreview() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scenarioId) return;
    const load = async () => {
      const { data } = await supabase
        .from("scenarios")
        .select("id, title, description, price_rub, preview_json")
        .eq("id", scenarioId)
        .single();
      if (!data) { navigate("/catalog"); return; }
      setScenario(data as Scenario);
      if (user) {
        const free = (data as any).price_rub === 0;
        if (free) { setHasAccess(true); }
        else {
          const { data: ent } = await supabase
            .from("entitlements")
            .select("id")
            .eq("user_id", user.id)
            .eq("scope", scenarioId)
            .eq("active", true)
            .maybeSingle();
          setHasAccess(!!ent);
        }
      }
      setLoading(false);
    };
    load();
  }, [scenarioId, user, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-portal" />
    </div>
  );

  if (!scenario) return null;

  const meta = META[scenario.id] ?? DEFAULT_META;
  const p = scenario.preview_json ?? {};
  const free = scenario.price_rub === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <div className={`relative w-full h-80 bg-gradient-to-br ${meta.gradient} overflow-hidden`}>
        {p.cover_image && (
          <img
            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/scenario-media/${p.cover_image}`}
            alt={scenario.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 portal-orb opacity-20" />
        <div className="absolute inset-0 scanlines opacity-30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <span className="text-8xl drop-shadow-[0_4px_24px_hsl(var(--portal)/0.8)]">{meta.emoji}</span>
          <div className="text-center px-4">
            <p className="text-xs uppercase tracking-[0.3em] text-portal/80 mb-2">{scenario.id}</p>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">{scenario.title}</h1>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-10 grid gap-8">

        {/* TAGLINE */}
        {p.tagline && (
          <p className="text-xl md:text-2xl text-muted-foreground text-center font-display italic border-l-2 border-portal pl-4">
            {p.tagline}
          </p>
        )}

        {/* META CHIPS */}
        <div className="flex flex-wrap gap-3 justify-center">
          {p.duration_minutes && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-portal/70" /> {p.duration_minutes} мин
            </div>
          )}
          {(p.players_min || p.players_max) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-portal/70" /> {p.players_min}–{p.players_max} игроков
            </div>
          )}
          {p.difficulty && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-portal/70" /> {DIFFICULTY_LABELS[p.difficulty] ?? p.difficulty}
            </div>
          )}
          {p.replayable && (
            <div className="flex items-center gap-1.5 text-sm text-portal border border-portal/30 bg-portal/5 px-3 py-1.5 rounded-full">
              <RotateCcw className="w-4 h-4" /> Переигрываемый
            </div>
          )}
          {p.age_rating && (
            <div className="text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              {p.age_rating}
            </div>
          )}
        </div>

        {/* ТЕГИ */}
        <div className="flex flex-wrap gap-2 justify-center">
          {meta.tags.map(tag => (
            <span key={tag} className="text-[11px] font-mono uppercase tracking-widest text-portal/80 border border-portal/25 bg-portal/5 px-2.5 py-1 rounded-sm">
              #{tag}
            </span>
          ))}
        </div>

        {/* РЕПЛИКИ */}
        {(p.host_quote || p.morty_quote) && (
          <div className="grid gap-4">
            {p.host_quote && (
              <div className="glass-card p-5 flex items-start gap-4 border-l-2 border-portal">
                <div className="w-10 h-10 rounded-full bg-portal/20 flex items-center justify-center text-lg shrink-0">🧪</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-portal mb-1">Рик</p>
                  <p className="text-sm text-foreground italic">«{p.host_quote}»</p>
                </div>
              </div>
            )}
            {p.morty_quote && (
              <div className="glass-card p-5 flex items-start gap-4 border-l-2 border-pink/50">
                <div className="w-10 h-10 rounded-full bg-pink/20 flex items-center justify-center text-lg shrink-0">😰</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-pink/70 mb-1">Морти</p>
                  <p className="text-sm text-foreground italic">«{p.morty_quote}»</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ОПИСАНИЕ */}
        {p.full_description && (
          <div className="glass-card p-6 grid gap-3">
            <h2 className="font-display text-lg text-portal">О сценарии</h2>
            {p.full_description.split("\n\n").map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed text-sm">{para}</p>
            ))}
          </div>
        )}

        {/* ПРЕДУПРЕЖДЕНИЕ */}
        {p.warning && (
          <div className="flex items-start gap-3 border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground italic">{p.warning}</p>
          </div>
        )}

        {/* CTA */}
        <div className="glass-card p-6 flex flex-col items-center gap-4">
          <div className="text-3xl font-display font-bold text-portal">
            {free ? "БЕСПЛАТНО" : `${scenario.price_rub} ₽`}
          </div>
          {hasAccess ? (
            <Button onClick={() => navigate("/catalog")}
              className="w-full max-w-xs h-14 bg-portal text-portal-foreground font-display text-lg gap-2">
              <Play className="w-5 h-5" /> Играть
            </Button>
          ) : user ? (
            <Link to={`/payment/${scenario.id}`} className="w-full max-w-xs">
              <Button className="w-full h-14 font-display text-lg gap-2">
                <Lock className="w-5 h-5" /> Купить за {scenario.price_rub} ₽
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="w-full max-w-xs">
              <Button className="w-full h-14 font-display text-lg">
                Войти чтобы купить
              </Button>
            </Link>
          )}
          <Link to="/catalog" className="text-xs text-muted-foreground hover:text-portal transition-colors">
            ← Все сценарии
          </Link>
        </div>

      </div>
    </div>
  );
}