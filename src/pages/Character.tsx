import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Shield, Zap } from "lucide-react";
import { ReplicaPlayer } from "@/components/ReplicaPlayer";

function getPlayerId(userId?: string | null): string | null {
  if (userId) return userId;
  return localStorage.getItem("guest_player_id");
}

const Character = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const runId = searchParams.get("run");
  const roomId = searchParams.get("room");

  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [readyCount, setReadyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [character, setCharacter] = useState<any>(null);
  const [isSaboteur, setIsSaboteur] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [replicaDone] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userId = getPlayerId(user?.id);
        if (!userId || !runId || !roomId) return;

        const { data: rp } = await supabase
          .from("room_players").select("id").eq("room_id", roomId).eq("user_id", userId).maybeSingle();
        if (!rp) throw new Error("Игрок не найден");
        setMyPlayerId(rp.id);

        const { data: run } = await supabase
          .from("runs").select("state_json, scenarios(scenario_json)").eq("id", runId).single();
        if (!run) throw new Error("Игра не найдена");

        const pg = run.state_json?.party_game;
        setIsSaboteur(pg?.player_roles?.[rp.id] === "saboteur");
        setReadyCount((pg?.characters_ready ?? []).length);

        const { count } = await supabase.from("room_players").select("id", { count: "exact" }).eq("room_id", roomId).eq("is_host", false);
        setTotalCount(count ?? 0);

        const intro=(run as any).scenarios?.scenario_json?.party_game?.intro;
        const charId = pg?.player_characters?.[rp.id];
        const characters = (run as any).scenarios?.scenario_json?.characters ?? [];
        setCharacter(characters.find((c: any) => c.id === charId) ?? null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId, roomId, user?.id]);

  // Слушаем ui_phase — когда все готовы → переходим к сцене
  useEffect(() => {
    if (!runId || !waiting) return;
    const ch = supabase.channel(`char_ready:${runId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "runs", filter: `id=eq.${runId}` },
        (payload) => {
          const pg = (payload.new as any)?.state_json?.party_game;
          setReadyCount((pg?.characters_ready ?? []).length);
          if (pg?.ui_phase === "playing") navigate(`/scene/${runId}`);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [runId, waiting, navigate]);

  const handleReady = async () => {
if (!myPlayerId || !runId || !roomId) return;
    setWaiting(true);
    const userId = getPlayerId(user?.id);
    const res = await supabase.functions.invoke("character-ready", {
      body: { run_id: runId, room_id: roomId, player_id: myPlayerId, guest_user_id: userId }
    });
    if (res.data?.all_ready) navigate(`/scene/${runId}`);
    else setReadyCount(res.data?.ready_count ?? readyCount + 1);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-portal" /></div>;
  }

  if (waiting) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 px-4">
        <Loader2 className="w-10 h-10 animate-spin text-portal" />
        <p className="text-2xl font-display">Ждём остальных...</p>
        <p className="text-muted-foreground">{readyCount} / {totalCount} готовы</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 pb-24">

      <div className={`max-w-md mx-auto space-y-6 transition-opacity duration-500 ${replicaDone ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground text-center">Твоя роль</p>

        {character && (
          <div className="glass-card p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-display mb-2">{character.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">{character.description}</p>
            {character.traits?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {character.traits.map((t: string, i: number) => (
                  <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {!revealed ? (
          <button onClick={() => setRevealed(true)}
            className="w-full glass-card p-6 rounded-2xl border border-dashed border-border text-center hover:border-portal/40 transition-colors">
            <p className="text-muted-foreground text-sm">Нажми чтобы узнать секретную роль</p>
          </button>
        ) : (
          <div className={`glass-card p-6 rounded-2xl animate-in zoom-in-95 duration-300 ${isSaboteur ? "border-destructive/40" : "border-acid/40"}`}>
            {isSaboteur ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-8 h-8 text-destructive" />
                  <h3 className="text-xl font-display text-destructive">Ты — Саботажник</h3>
                </div>
                <p className="text-sm text-muted-foreground">Твоя цель: помешать команде и незаметно всё сломать. Не раскрывайся.</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-8 h-8 text-acid" />
                  <h3 className="text-xl font-display text-acid">Ты — в Команде</h3>
                </div>
                <p className="text-sm text-muted-foreground">Ваша цель: спасти вселенную и найти саботажника среди вас.</p>
              </>
            )}
          </div>
        )}

        {revealed && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
            <button onClick={handleReady}
              className="w-full h-14 bg-portal text-portal-foreground rounded-lg font-display text-lg">
              Понял, играем →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Character;
