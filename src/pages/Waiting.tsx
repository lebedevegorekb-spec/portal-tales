import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Loader2, Check, Clock } from "lucide-react";

type Player = { id: string; display_name: string; ready: boolean };

const initials = (name: string) =>
  name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

function getPlayerId(userId?: string | null): string | null {
  if (userId) return userId;
  return localStorage.getItem("guest_player_id");
}

const Waiting = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roomId = params.get("room");

  const [players, setPlayers] = useState<Player[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [readying, setReadying] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const load = async () => {
      const { data: room } = await supabase
        .from("rooms")
        .select("run_id, status")
        .eq("id", roomId)
        .maybeSingle();

      if ((room?.status === "playing" || room?.status === "started") && room?.run_id) {
        navigate(`/character?run=${room.run_id}&room=${roomId}`);
        return;
      }

      const userId = getPlayerId(user?.id);
      if (userId) {
        const { data: rp } = await supabase
          .from("room_players")
          .select("id, ready")
          .eq("room_id", roomId)
          .eq("user_id", userId)
          .maybeSingle();
        if (rp) { setMyPlayerId(rp.id); setIsReady(rp.ready); }
      }

      const { data: ps } = await supabase
        .from("room_players")
        .select("id, display_name, ready")
        .eq("room_id", roomId)
        .eq("is_host", false)
        .order("joined_at", { ascending: true });

      setPlayers((ps as Player[]) ?? []);
      setLoading(false);
    };
    load();
  }, [roomId, navigate, user?.id]);

  useEffect(() => {
    if (!roomId) return;
    const ch = supabase
      .channel(`waiting:${roomId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        () => {
          supabase.from("room_players").select("id, display_name, ready")
            .eq("room_id", roomId).eq("is_host", false)
            .order("joined_at", { ascending: true })
            .then(({ data }) => setPlayers((data as Player[]) ?? []));
        })
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        async (payload) => {
          const r = payload.new as any;
          if ((r.status === "playing" || r.status === "started") && r.run_id) {
            const { data: runData } = await supabase.from("runs").select("state_json").eq("id", r.run_id).single();
            const uiPhase = runData?.state_json?.party_game?.ui_phase;
            if (uiPhase === "playing") navigate(`/scene/${r.run_id}`);
            else navigate(`/character?run=${r.run_id}&room=${roomId}`);
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId, navigate]);

  const handleReady = async () => {
    if (!myPlayerId || isReady) return;
    setReadying(true);
    await supabase.from("room_players").update({ ready: true }).eq("id", myPlayerId);
    setIsReady(true);
    setReadying(false);
  };

  const ready = useMemo(() => players.filter((p) => p.ready).length, [players]);
  const total = players.length;
  const allReady = total > 0 && ready === total;
  const progress = total > 0 ? (ready / total) * 100 : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  if (loading && !players.length) {
    return (
      <div className="min-h-screen flex flex-col bg-background scanlines">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-portal" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background scanlines">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-md flex flex-col">
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Ожидание
        </div>
        <h1 className="font-display font-bold text-2xl text-balance mb-5">
          {allReady ? "Все готовы!" : "Ждём остальных…"}
        </h1>

        <div className={`glass-card rounded-3xl p-7 flex flex-col items-center text-center gap-5 border transition-colors ${allReady ? "border-acid/40" : "border-portal/40"}`}>
          <div className="relative size-28 flex items-center justify-center">
            {allReady ? (
              <div className="size-20 rounded-full bg-acid/15 border-2 border-acid/40 flex items-center justify-center">
                <Check className="size-10 text-acid" />
              </div>
            ) : (
              <div className="size-20 rounded-full bg-portal/15 border-2 border-portal/40 flex items-center justify-center">
                <Loader2 className="size-10 text-portal animate-spin" />
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Готовы</div>
            <div className="mt-1 font-display font-bold text-5xl tabular-nums">
              <span className={allReady ? "text-acid" : "text-portal"}>{ready}</span>
              <span className="text-muted-foreground/50"> / {total}</span>
            </div>
          </div>

          <div className="w-full">
            <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${allReady ? "bg-acid" : "bg-portal"}`}
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono tabular-nums">
            <Clock className="size-3.5" />
            {mm}:{ss}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2.5 px-1">Игроки</div>
          <div className="glass-card rounded-2xl divide-y divide-border/60 overflow-hidden">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3.5">
                <div className={`size-10 rounded-full border flex items-center justify-center font-display font-bold text-sm shrink-0 ${p.ready ? "bg-acid/15 border-acid/40 text-acid" : "bg-muted/40 border-border text-muted-foreground"}`}>
                  {initials(p.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.display_name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.ready ? "Готов" : "Ещё думает…"}</div>
                </div>
                {p.ready
                  ? <div className="size-6 rounded-full bg-acid/15 border border-acid/40 flex items-center justify-center"><Check className="size-3.5 text-acid" /></div>
                  : <Loader2 className="size-4 text-muted-foreground animate-spin" />
                }
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <button
            onClick={handleReady}
            disabled={isReady || readying}
            className="w-full h-14 rounded-lg font-display text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-portal text-portal-foreground"
          >
            {isReady ? "✓ Готов!" : readying ? "Отмечаем..." : "Я готов"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Waiting;


