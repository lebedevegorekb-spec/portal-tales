import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Lock, User } from "lucide-react";
import { toast } from "sonner";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type CharacterData = {
  id: string;
  name: string;
  role: string;
  description: string;
  publicGoal: string;
  traits: string[];
  avatar_url?: string | null;
};

// â”€â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getPlayerId(userId?: string | null): string | null {
  if (userId) return userId;
  return localStorage.getItem("guest_player_id");
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const Character = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const runId  = searchParams.get("run");
  const roomId = searchParams.get("room");

  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [revealed,  setRevealed]  = useState(false);

  // â”€â”€ Fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!runId) throw new Error("ÐŸÐµÑ€ÐµÐ´Ð°Ð¹ ?run=<run_id> Ð² URL");

        const playerId = getPlayerId(user?.id);
        if (!playerId) throw new Error("guest_player_id Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½ Ð² localStorage");

        // 1. Ð“Ñ€ÑƒÐ·Ð¸Ð¼ run + scenario_json Ð·Ð° Ð¾Ð´Ð¸Ð½ Ð·Ð°Ð¿Ñ€Ð¾Ñ
        const { data: run, error: runErr } = await supabase
          .from("runs")
          .select("state_json, scenarios(scenario_json)")
          .eq("id", runId)
          .single();

        if (runErr || !run) throw new Error("Ð˜Ð³Ñ€Ð° Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð°");

        const scenarioJson = (run as any).scenarios?.scenario_json as Record<string, any>;
        const characters: CharacterData[] = scenarioJson?.characters ?? [];

        // 2. Ð˜Ñ‰ÐµÐ¼ character_id: ÑÐ½Ð°Ñ‡Ð°Ð»Ð° Ð² state_json, Ð¿Ð¾Ñ‚Ð¾Ð¼ Ð² room_players
        const stateJson   = run.state_json as Record<string, any>;
        let charId: string | undefined = stateJson?.players?.[playerId]?.character_id;

        if (!charId && roomId) {
          const { data: rp } = await supabase
            .from("room_players")
            .select("character_id")
            .eq("room_id", roomId)
            .or(`user_id.eq.${playerId},user_id.is.null`)
            .order("joined_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          charId = rp?.character_id ?? undefined;
        }

        if (!charId) throw new Error("ÐŸÐµÑ€ÑÐ¾Ð½Ð°Ð¶ ÐµÑ‰Ñ‘ Ð½Ðµ Ð½Ð°Ð·Ð½Ð°Ñ‡ÐµÐ½ â€” Ð´Ð¾Ð¶Ð´Ð¸ÑÑŒ ÑÑ‚Ð°Ñ€Ñ‚Ð° Ð¸Ð³Ñ€Ñ‹");

        const found = characters.find((c) => c.id === charId);
        if (!found) throw new Error(`ÐŸÐµÑ€ÑÐ¾Ð½Ð°Ð¶ "${charId}" Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½ Ð² ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ð¸`);

        setCharacter(found);
        setTimeout(() => setRevealed(true), 80);
      } catch (err: any) {
        const msg = err?.message ?? "ÐžÑˆÐ¸Ð±ÐºÐ° Ð·Ð°Ð³Ñ€ÑƒÐ·ÐºÐ¸ Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð¶Ð°";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, roomId, user?.id]);

  // â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleNext = () => {
    const q = new URLSearchParams();
    if (runId)  q.set("run",  runId);
    if (roomId) q.set("room", roomId);
    navigate(`/secret?${q.toString()}`);
  };

  // â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-portal" />
            <span className="text-sm font-mono">Ð—Ð°Ð³Ñ€ÑƒÐ¶Ð°ÐµÐ¼ Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð¶Ð°â€¦</span>
          </div>
        </main>
      </div>
    );
  }

  // â”€â”€ Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (error || !character) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="glass-card rounded-3xl p-8 max-w-sm w-full text-center space-y-4 border border-destructive/40">
            <p className="text-destructive font-mono text-sm">{error ?? "ÐŸÐµÑ€ÑÐ¾Ð½Ð°Ð¶ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½"}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>ÐÐ°Ð·Ð°Ð´</Button>
          </div>
        </main>
      </div>
    );
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">

        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Ð¢Ð²Ð¾Ñ Ñ€Ð¾Ð»ÑŒ
        </div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          Ð—Ð°Ð¿Ð¾Ð¼Ð½Ð¸. ÐÐ¸ÐºÐ¾Ð¼Ñƒ Ð½Ðµ Ñ€Ð°ÑÑÐºÐ°Ð·Ñ‹Ð²Ð°Ð¹.
        </h1>

        <div
          className={`glass-card rounded-3xl p-6 space-y-5 border border-portal/40
            shadow-[var(--shadow-portal)] transition-all duration-500
            ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="relative size-32 rounded-full bg-portal/15 border-2 border-portal/40 ring-4 ring-portal/30 flex items-center justify-center overflow-hidden">
              {character.avatar_url
                ? <img src={character.avatar_url} alt={character.name} className="size-full object-cover" />
                : <User className="size-14 text-portal" />
              }
            </div>
            <div className="mt-4 text-[11px] font-mono uppercase tracking-[0.25em] text-portal">
              {character.role}
            </div>
            <h2 className="mt-1 font-display font-bold text-3xl text-balance">
              {character.name}
            </h2>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground text-pretty leading-relaxed text-center">
            {character.description}
          </p>

          {/* Traits */}
          {character.traits.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {character.traits.map((t) => (
                <span key={t} className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-border bg-background/40">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Public goal */}
          {character.publicGoal && (
            <div className="rounded-2xl border border-portal/40 bg-portal/15 p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                Ð˜Ð·Ð²ÐµÑÑ‚Ð½Ð°Ñ Ð²ÑÐµÐ¼ Ñ†ÐµÐ»ÑŒ
              </div>
              <div className="mt-1 font-display font-semibold text-base text-portal">
                {character.publicGoal}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              <Lock className="size-3" /> Ð”Ð°Ð»ÐµÐµ â€” Ñ‚Ð°Ð¹Ð½Ð°Ñ Ñ†ÐµÐ»ÑŒ
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button size="lg" className="w-full h-14 text-base font-display gap-2" onClick={handleNext}>
            Ð£Ð·Ð½Ð°Ñ‚ÑŒ Ñ‚Ð°Ð¹Ð½ÑƒÑŽ Ñ†ÐµÐ»ÑŒ
            <ArrowRight className="size-5" />
          </Button>
        </div>

      </main>
    </div>
  );
};

export default Character;
