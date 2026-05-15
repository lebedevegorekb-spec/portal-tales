import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Check, X, Trophy, Skull, Eye, Flame, Sparkles, RotateCw, Vote } from "lucide-react";
import { toast } from "sonner";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  skull: Skull, trophy: Trophy, eye: Eye, flame: Flame, sparkles: Sparkles, vote: Vote,
};

const TONE = {
  acid:        { text: "text-acid",        bg: "bg-acid/15",        border: "border-acid/40",        ring: "ring-acid/30",        shadow: "shadow-[0_0_60px_-15px_hsl(var(--acid)/0.6)]" },
  destructive: { text: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/40", ring: "ring-destructive/30", shadow: "shadow-[0_0_60px_-15px_hsl(var(--destructive)/0.6)]" },
  portal:      { text: "text-portal",      bg: "bg-portal/15",      border: "border-portal/40",      ring: "ring-portal/30",      shadow: "shadow-[var(--shadow-portal)]" },
} as const;

const StatCell = ({ Icon, label, value, tone }: { Icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone?: "acid" | "destructive" }) => {
  const accent = tone === "acid" ? "text-acid" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="size-3.5" />{label}
      </div>
      <div className={`mt-1 font-display font-bold text-2xl tabular-nums ${accent`}`}>{value}</div>
    </div>
  );
};

const PersonalResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const runId = searchParams.get("run");

  const [loading, setLoading]   = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!runId) { setError("run не указан"); setLoading(false); return; }
    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("personal-result", {
          body: { run_id: runId },
        });
        if (error || data?.error) throw new Error(data?.error ?? error?.message);
        setResult(data);
        setTimeout(() => setRevealed(true), 80);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId]);

  const share = async () => {
    if (!result) return;
    const won = result.outcome === "win";
    const text = `Я был ${result.role} в Портал Хаоса. ${won ? "Цель выполнена ✅" : "Цель провалена ❌"}. ${result.summary ?? ""}`;
    const url = window.location.origin;
    if (navigator.share) {
      try { await navigator.share({ title: "Портал Хаоса", text, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text} — ${url}`);
      toast.success("Скопировано в буфер");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const playAgain = () => {
    if (runId) navigate(`/offer/${runId}`);
    else navigate("/catalog");
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-portal" />
      </main>
    </div>
  );

  if (error || !result) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-mono text-sm">{error ?? "Результат не найден"}</p>
          <Button onClick={() => navigate("/catalog")}>В каталог</Button>
        </div>
      </main>
    </div>
  );

  const won  = result.outcome === "win";
  const toneKey: keyof typeof TONE = result.tone ?? (won ? "acid" : "destructive");
  const tone = TONE[toneKey];
  const Icon = ICON_MAP[result.icon ?? "sparkles"] ?? Sparkles;

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">Твой итог</div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          {won ? "Ты справился." : "Ты провалился."}
        </h1>

        <div className={`glass-card rounded-3xl p-6 space-y-5 border ${tone.border`} ${tone.shadow} transition-all duration-500 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <div className="flex flex-col items-center text-center pt-2">
            <div className={`relative size-28 rounded-full ${tone.bg`} ${tone.border} border-2 ring-4 ${tone.ring} flex items-center justify-center`}>
              <Icon className={`size-12 ${tone.text`}`} />
              <div className="portal-orb absolute -inset-4 -z-10 opacity-70" />
            </div>
            <div className={`mt-4 text-[11px] font-mono uppercase tracking-[0.3em] ${tone.text`}`}>Ты был</div>
            <div className={`mt-1 font-display font-bold text-3xl ${tone.text`}`}>{result.role}</div>
          </div>

          {result.goal && (
            <div className={`rounded-2xl border ${tone.border`} ${tone.bg} p-4 text-center`}>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">Твоя цель</div>
              <div className="mt-1 font-display font-semibold text-base text-balance">{result.goal}</div>
            </div>
          )}

          <div className={`rounded-2xl p-4 flex items-center gap-3 border-2 ${won ? "border-acid/50 bg-acid/10" : "border-destructive/50 bg-destructive/10"`}`}>
            <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${won ? "bg-acid/20 border-2 border-acid/40" : "bg-destructive/20 border-2 border-destructive/40"`}`}>
              {won ? <Check className="size-6 text-acid" /> : <X className="size-6 text-destructive" />}
            </div>
            <div className="flex-1">
              <div className={`font-display font-bold text-lg ${won ? "text-acid" : "text-destructive"`}`}>
                {won ? "Цель выполнена" : "Цель провалена"}
              </div>
              {result.summary && <div className="text-xs text-muted-foreground text-pretty">{result.summary}</div>}
            </div>
          </div>

          {result.stats && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2.5">Твоя статистика</div>
              <div className="grid grid-cols-2 gap-2.5">
                <StatCell Icon={Vote}   label="Голосований"     value={result.stats.votes          ?? 0} />
                <StatCell Icon={Eye}    label="Тайных действий" value={result.stats.secretActions  ?? 0} />
                <StatCell Icon={Skull}  label="Предательств"    value={result.stats.betrayals      ?? 0} tone="destructive" />
                <StatCell Icon={Trophy} label="Раундов выжил"   value={result.stats.survivedRounds ?? 0} tone="acid" />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2.5">
          <Button onClick={share} size="lg" className="w-full bg-portal hover:bg-portal/90 shadow-[var(--shadow-portal)] h-14 text-base font-display font-semibold">
            <Share2 className="size-5" /> Поделиться итогом
          </Button>
          <Button onClick={playAgain} variant="outline" size="lg" className="w-full h-12 font-display">
            <RotateCw className="size-4" /> Сыграть ещё
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-4 px-4">
          На ТВ скоро покажут общий финал и раскрытие всех ролей.
        </p>
      </main>
    </div>
  );
};

export default PersonalResult;
