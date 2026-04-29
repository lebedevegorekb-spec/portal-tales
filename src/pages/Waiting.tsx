import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Loader2, Check, Clock } from "lucide-react";

type Player = { id: string; display_name: string; ready: boolean };

const initials = (name: string) =>
  name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const Waiting = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const roomId = params.get("room");

  const [players, setPlayers] = useState<Player[]>([]);
  const [runId,   setRunId]   = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Таймер
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Загрузка комнаты и игроков
  useEffect(() => {
    if (!roomId) return;
    const load = async () => {
      const { data: room } = await supabase
        .from("rooms")
        .select("run_id, status")
        .eq("id", roomId)
        .maybeSingle();

      if (room?.run_id) setRunId(room.run_id);
      if (room?.status === "started" && room?.run_id) {
        navigate(`/scene/${room.run_id}`);
        return;
      }

      const { data: ps } = await supabase
        .from("room_players")
        .select("id, display_name, ready")
        .eq("room_id", roomId)
        .order("joined_at", { ascending: true });

      setPlayers((ps as Player[]) ?? []);
      setLoading(false);
    };
    load();
  }, [roomId, navigate]);

  // Realtime — игроки и статус комнаты
  useEffect(() => {
    if (!roomId) return;
    const ch = supabase
      .channel(`waiting:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        () => {
          supabase
            .from("room_players")
            .select("id, display_name, ready")
            .eq("room_id", roomId)
            .order("joined_at", { ascending: true })
            .then(({ data }) => setPlayers((data as Player[]) ?? []));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          const next = payload.new as any;
          if (next.status === "started" && next.run_id) {
            navigate(`/character?run=${next.run_id}&room=${roomId}`)
          }
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId, navigate]);

  const ready = useMemo(() => players.filter((p) => p.ready).length, [players]);
  const total  = players.length;
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

        {/* Status card */}
        <div className={`glass-card rounded-3xl p-7 flex flex-col items-center text-center gap-5 border transition-colors
          ${allReady ? "border-acid/40 shadow-[0_0_40px_-10px_hsl(var(--acid)/0.5)]" : "border-portal/40 shadow-[var(--shadow-portal)]"}`}
        >
          <div className="relative size-28 flex items-center justify-center">
            <div className="portal-orb absolute inset-0 -z-10 opacity-70" />
            {allReady ? (
              <div className="size-20 rounded-full bg-acid/15 border-2 border-acid/40 ring-4 ring-acid/20 flex items-center justify-center animate-in zoom-in-95 duration-300">
                <Check className="size-10 text-acid" />
              </div>
            ) : (
              <div className="size-20 rounded-full bg-portal/15 border-2 border-portal/40 ring-4 ring-portal/20 flex items-center justify-center">
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
              <div
                className={`h-full rounded-full transition-all duration-500 ${allReady ? "bg-acid" : "bg-portal"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono tabular-nums">
            <Clock className="size-3.5" />
            {mm}:{ss}
          </div>
        </div>

        {/* Player list */}
        <div className="mt-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2.5 px-1">
            Игроки
          </div>
          <div className="glass-card rounded-2xl divide-y divide-border/60 overflow-hidden">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3.5">
                <div className={`size-10 rounded-full border flex items-center justify-center font-display font-bold text-sm shrink-0
                  ${p.ready ? "bg-acid/15 border-acid/40 text-acid" : "bg-muted/40 border-border text-muted-foreground"}`}
                >
                  {initials(p.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.display_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.ready ? "Выбор сделан" : "Ещё думает…"}
                  </div>
                </div>
                {p.ready
                  ? <div className="size-6 rounded-full bg-acid/15 border border-acid/40 flex items-center justify-center"><Check className="size-3.5 text-acid" /></div>
                  : <Loader2 className="size-4 text-muted-foreground animate-spin" />
                }
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-6 px-4">
          {allReady
            ? "Хост переключит сцену с большого экрана."
            : "Не закрывай экран. Как только все проголосуют — игра продолжится."}
        </p>

      </main>
    </div>
  );
};

export default Waiting;
