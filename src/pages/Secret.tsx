import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Lock, Check } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type SecretRoleData = {
  id: string;
  role: string;
  goal: string;
  hint: string;
  tone?: "destructive" | "acid" | "portal";
};

type Tone = { text: string; bg: string; border: string; glow: string };

// ─── Tone map ─────────────────────────────────────────────────────────────────

const TONES: Record<string, Tone> = {
  destructive: {
    text:   "text-destructive",
    bg:     "bg-destructive/15",
    border: "border-destructive/40",
    glow:   "shadow-[0_0_60px_-15px_hsl(var(--destructive)/0.6)]",
  },
  acid: {
    text:   "text-acid",
    bg:     "bg-acid/15",
    border: "border-acid/40",
    glow:   "shadow-[0_0_60px_-15px_hsl(var(--acid)/0.6)]",
  },
  portal: {
    text:   "text-portal",
    bg:     "bg-portal/15",
    border: "border-portal/40",
    glow:   "shadow-[var(--shadow-portal)]",
  },
};

function getTone(tone?: string): Tone {
  return TONES[tone ?? "portal"] ?? TONES.portal;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getPlayerId(userId?: string | null): string | null {
  if (userId) return userId;
  return localStorage.getItem("guest_player_id");
}

// ─── Component ────────────────────────────────────────────────────────────────

const Secret = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const runId  = searchParams.get("run");
  const roomId = searchParams.get("room");

  const [role,         setRole]         = useState<SecretRoleData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [revealed,     setRevealed]     = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!runId) throw new Error("Передай ?run=<run_id> в URL");

        const playerId = getPlayerId(user?.id);
        if (!playerId) throw new Error("guest_player_id не найден в localStorage");

        // 1. Грузим run + scenario_json
        const { data: run, error: runErr } = await supabase
          .from("runs")
          .select("state_json, scenarios(scenario_json)")
          .eq("id", runId)
          .single();

        if (runErr || !run) throw new Error("Игра не найдена");

        const scenarioJson = (run as any).scenarios?.scenario_json as Record<string, any>;
        const roles: SecretRoleData[] = scenarioJson?.roles ?? [];

        // 2. Ищем role_id: сначала в state_json, потом в room_players
        const stateJson   = run.state_json as Record<string, any>;
        let roleId: string | undefined = stateJson?.players?.[playerId]?.role_id;

        if (!roleId && roomId) {
          const { data: rp } = await supabase
            .from("room_players")
            .select("role_id")
            .eq("room_id", roomId)
            .or(`user_id.eq.${playerId},user_id.is.null`)
            .order("joined_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          roleId = rp?.role_id ?? undefined;
        }

        if (!roleId) throw new Error("Тайная роль ещё не назначена — дождись старта игры");

        const found = roles.find((r) => r.id === roleId);
        if (!found) throw new Error(`Роль "${roleId}" не найдена в сценарии`);

        setRole(found);
      } catch (err: any) {
        const msg = err?.message ?? "Ошибка загрузки тайной роли";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, roomId, user?.id]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleReady = () => {
    if (!acknowledged) return;
    const q = new URLSearchParams();
    if (runId)  q.set("run",  runId);
    if (roomId) q.set("room", roomId);
    navigate(`/vote?${q.toString()}`)
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-portal" />
            <span className="text-sm font-mono">Получаем твою тайну…</span>
          </div>
        </main>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !role) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card rounded-3xl p-8 max-w-sm w-full text-center space-y-4 border border-destructive/40">
            <p className="text-destructive font-mono text-sm">{error ?? "Роль не найдена"}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Назад</Button>
          </div>
        </main>
      </div>
    );
  }

  const tone = getTone(role.tone);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">

        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Тайная роль
        </div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          Только для твоих глаз.
        </h1>

        {/* ── Tap-to-reveal ──────────────────────────────────────────────── */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className={`glass-card rounded-3xl p-8 border ${tone.border`} ${tone.glow}
              flex flex-col items-center justify-center gap-4 min-h-[260px]
              cursor-pointer select-none active:scale-[0.98] transition-transform`}
            aria-label="Нажми чтобы увидеть тайную роль"
          >
            <div className={`size-20 rounded-full ${tone.bg`} ${tone.border} border-2 flex items-center justify-center`}>
              <Lock className={`size-10 ${tone.text`}`} />
            </div>
            <div className="space-y-1 text-center">
              <p className="font-display font-bold text-xl">Нажми, чтобы открыть</p>
              <p className="text-sm text-muted-foreground">Убедись, что никто не смотрит</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Eye className="size-3" /> tap to reveal
            </div>
          </button>

        ) : (

          /* ── Revealed card ─────────────────────────────────────────────── */
          <div className={`glass-card rounded-3xl p-6 space-y-5 border ${tone.border`} ${tone.glow}
            animate-in fade-in zoom-in-95 duration-300`}
          >
            {/* Role badge */}
            <div className="flex flex-col items-center text-center pt-2 gap-2">
              <div className={`size-20 rounded-full ${tone.bg`} ${tone.border} border-2 ring-4 ring-offset-2 ring-offset-background flex items-center justify-center`}>
                <EyeOff className={`size-10 ${tone.text`}`} />
              </div>
              <div className={`text-[11px] font-mono uppercase tracking-[0.25em] ${tone.text`}`}>
                Тайная роль
              </div>
              <h2 className="font-display font-bold text-3xl">{role.role}</h2>
            </div>

            {/* Goal */}
            <div className={`rounded-2xl border ${tone.border`} ${tone.bg} p-4 space-y-1`}>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                Твоя тайная цель
              </div>
              <div className={`font-display font-semibold text-base ${tone.text`}`}>
                {role.goal}
              </div>
            </div>

            {/* Hint */}
            <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                Подсказка
              </div>
              <p className="text-sm text-foreground leading-relaxed">{role.hint}</p>
            </div>

            <div className="h-px bg-border" />

            {/* Acknowledge checkbox */}
            <button
              onClick={() => setAcknowledged((v) => !v)}
              className={`flex items-center gap-3 rounded-2xl border p-4 w-full text-left transition-colors
                ${acknowledged
                  ? `${tone.border} ${tone.bg}`
                  : "border-border bg-muted/10 hover:border-muted-foreground/30"
                }`}
            >
              <div className={`size-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                ${acknowledged ? `${tone.border} ${tone.bg}` : "border-muted-foreground/30"}`}
              >
                {acknowledged && <Check className={`size-3.5 ${tone.text`}`} />}
              </div>
              <span className="text-sm font-medium">
                Я прочитал(а) и запомнил(а) свою роль
              </span>
            </button>
          </div>
        )}

        {/* CTA — появляется только после reveal */}
        {revealed && (
          <div className="mt-6">
            <Button
              size="lg"
              className="w-full h-14 text-base font-display gap-2"
              disabled={!acknowledged}
              onClick={handleReady}
            >
              Я готов(а) играть
              <Check className="size-5" />
            </Button>
          </div>
        )}

      </main>
    </div>
  );
};

export default Secret;
