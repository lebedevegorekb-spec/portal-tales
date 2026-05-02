import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Copy, Check, Users, Crown, PlayCircle, Loader2 } from "lucide-react";

type Room = {
  id: string; code: string; host_user_id: string; scenario_id: string;
  status: string; min_players: number; max_players: number; run_id: string | null;
};
type Player = {
  id: string; room_id: string; user_id: string | null;
  display_name: string; is_host: boolean; ready: boolean; joined_at: string;
};

// ÐŸÐµÑ€ÐµÐ¼ÐµÑˆÐ°Ñ‚ÑŒ Ð¼Ð°ÑÑÐ¸Ð² ÑÐ»ÑƒÑ‡Ð°Ð¹Ð½Ð¾
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Lobby = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [room,     setRoom]     = useState<Room | null>(null);
  const [players,  setPlayers]  = useState<Player[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [copied,   setCopied]   = useState<"code" | "link" | null>(null);
  const [starting, setStarting] = useState(false);

  const joinUrl = useMemo(() => room ? `${window.location.origin}/join/${room.code}` : "", [room]);
  const qrUrl   = useMemo(() => joinUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=8&data=${encodeURIComponent(joinUrl)}` : "", [joinUrl]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const loadRoom = async () => {
    if (!roomId) return;
    const { data: r, error } = await supabase.from("rooms").select("*").eq("id", roomId).maybeSingle();
    if (error || !r) { toast.error("ÐšÐ¾Ð¼Ð½Ð°Ñ‚Ð° Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ð°"); navigate("/catalog"); return; }
    setRoom(r as Room);
    const { data: ps } = await supabase.from("room_players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true });
    setPlayers((ps as Player[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user && roomId) loadRoom(); }, [user, roomId]);

  // Realtime
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase.channel(`room:${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` }, () => {
        supabase.from("room_players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true })
          .then(({ data }) => setPlayers((data as Player[]) ?? []));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => {
        const next = payload.new as Room;
        setRoom(next);
        if (next.status === "started" && next.run_id) {
          navigate(`/character?run=${next.run_id}&room=${roomId}`);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, navigate]);

  const copy = async (value: string, kind: "code" | "link") => {
    try { await navigator.clipboard.writeText(value); setCopied(kind); setTimeout(() => setCopied(null), 1600); }
    catch { toast.error("ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ ÑÐºÐ¾Ð¿Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ"); }
  };

  const isHost     = !!user && !!room && room.host_user_id === user.id;
  const playerCount = players.length;
  const minReached  = playerCount >= (room?.min_players ?? 4);
const canStart    = isHost && minReached;

  const start = async () => {
    if (!room || !canStart || !user) return;
    setStarting(true);

    try {
      // 1. Ð“Ñ€ÑƒÐ·Ð¸Ð¼ scenario_json Ð´Ð»Ñ Ð½Ð°Ð·Ð½Ð°Ñ‡ÐµÐ½Ð¸Ñ Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð¶ÐµÐ¹ Ð¸ Ñ€Ð¾Ð»ÐµÐ¹
      const { data: scenario } = await supabase
        .from("scenarios")
        .select("scenario_json")
        .eq("id", room.scenario_id)
        .single();

      const characters: any[] = (scenario?.scenario_json as any)?.characters ?? [];
      const roles:      any[] = (scenario?.scenario_json as any)?.roles      ?? [];

      // 2. ÐŸÐµÑ€ÐµÐ¼ÐµÑˆÐ¸Ð²Ð°ÐµÐ¼ Ð¸ Ð½Ð°Ð·Ð½Ð°Ñ‡Ð°ÐµÐ¼ ÐºÐ°Ð¶Ð´Ð¾Ð¼Ñƒ Ð¸Ð³Ñ€Ð¾ÐºÑƒ Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð¶Ð° Ð¸ Ñ€Ð¾Ð»ÑŒ
      const shuffledChars = shuffle(characters);
      const shuffledRoles = shuffle(roles);

      const playerAssignments = players.map((p, i) => ({
        id:           p.id,
        character_id: shuffledChars[i % shuffledChars.length]?.id ?? null,
        role_id:      shuffledRoles[i % shuffledRoles.length]?.id  ?? null,
      }));

      // 3. ÐžÐ±Ð½Ð¾Ð²Ð»ÑÐµÐ¼ room_players Ñ Ð½Ð°Ð·Ð½Ð°Ñ‡ÐµÐ½Ð¸ÑÐ¼Ð¸
      const results = await Promise.all(
  playerAssignments.map(({ id, character_id, role_id }) =>
    supabase.from("room_players").update({ character_id, role_id }).eq("id", id)
  )
);
console.log("assignments:", JSON.stringify(playerAssignments));
console.log("errors:", results.map(r => r.error?.message));

      // 4. Ð¡Ð¾Ð·Ð´Ð°Ñ‘Ð¼ run
      const { data: run, error: runErr } = await supabase
        .from("runs")
        .insert({
          user_id:          user.id,
          scenario_id:      room.scenario_id,
          status:           "active",
          current_scene_id: "start",
          state_json:       { players: {}, flags: {}, resources: {} },
        })
        .select("id")
        .single();

      if (runErr || !run) throw new Error(runErr?.message || "ÐÐµ ÑƒÐ´Ð°Ð»Ð¾ÑÑŒ ÑÐ¾Ð·Ð´Ð°Ñ‚ÑŒ Ð¸Ð³Ñ€Ñƒ");

      // 5. ÐžÐ±Ð½Ð¾Ð²Ð»ÑÐµÐ¼ ÐºÐ¾Ð¼Ð½Ð°Ñ‚Ñƒ
      await supabase.from("rooms").update({ status: "started", run_id: run.id }).eq("id", room.id);

      navigate(`/character?run=${run.id}&room=${room.id}`);
    } catch (err: any) {
      toast.error(err?.message || "ÐžÑˆÐ¸Ð±ÐºÐ° Ð·Ð°Ð¿ÑƒÑÐºÐ°");
      setStarting(false);
    }
  };

  if (authLoading || !user || loading || !room) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 container py-10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-portal" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6 gap-3">
          <Link to="/catalog" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Ðš ÑÑ†ÐµÐ½Ð°Ñ€Ð¸ÑÐ¼
          </Link>
          <div className="text-right">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-portal">{room.scenario_id} Â· LOBBY</div>
            <div className="font-display font-semibold">ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ Ð¸Ð³Ñ€Ð¾ÐºÐ¾Ð²</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* QR + ÐºÐ¾Ð´ */}
          <div className="glass-card scanlines rounded-md p-6 md:p-10 text-center">
            <h1 className="font-display font-bold text-3xl md:text-5xl text-balance">
              ÐŸÐ¾ÐºÐ°Ð¶Ð¸ QR Ð´Ñ€ÑƒÐ·ÑŒÑÐ¼ <span className="text-portal neon-text">Ð¸Ð»Ð¸ Ð½Ð°Ð·Ð¾Ð²Ð¸ ÐºÐ¾Ð´</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-sm md:text-base">
              Ð˜Ð³Ñ€Ð¾ÐºÐ¸ ÑÐºÐ°Ð½Ð¸Ñ€ÑƒÑŽÑ‚ QR ÑÐ¾ ÑÐ²Ð¾Ð¸Ñ… Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½Ð¾Ð² Ð¸Ð»Ð¸ Ð¾Ñ‚ÐºÑ€Ñ‹Ð²Ð°ÑŽÑ‚ ÑÑÑ‹Ð»ÐºÑƒ Ð¸ Ð²Ð²Ð¾Ð´ÑÑ‚ ÐºÐ¾Ð´.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="rounded-md border border-portal/40 bg-background/80 p-4 shadow-[var(--shadow-portal)]">
                {qrUrl && <img src={qrUrl} alt={`QR ${room.code}`} width={420} height={420} className="block w-[280px] h-[280px] md:w-[420px] md:h-[420px]" loading="eager" />}
              </div>
            </div>
            <div className="mt-8">
              <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground mb-2">ÐšÐ¾Ð´ ÐºÐ¾Ð¼Ð½Ð°Ñ‚Ñ‹</div>
              <button onClick={() => copy(room.code, "code")} className="group inline-flex items-center gap-4 rounded-md border border-portal/40 bg-portal/5 px-6 py-4 hover:bg-portal/10 transition-colors">
                <span className="font-display font-bold text-5xl md:text-6xl tabular-nums tracking-[0.18em] text-portal neon-text">{room.code}</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-portal/40 bg-background/60">
                  {copied === "code" ? <Check className="h-4 w-4 text-acid" /> : <Copy className="h-4 w-4 text-portal" />}
                </span>
              </button>
            </div>
            <div className="mt-5 flex justify-center">
              <button onClick={() => copy(joinUrl, "link")} className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-portal transition-colors max-w-full">
                <span className="truncate">{joinUrl}</span>
                {copied === "link" ? <Check className="h-3.5 w-3.5 text-acid shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Ð˜Ð³Ñ€Ð¾ÐºÐ¸ + ÑÑ‚Ð°Ñ€Ñ‚ */}
          <aside className="glass-card rounded-md p-5 md:p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <Users className="h-4 w-4 text-portal" /> Ð˜Ð³Ñ€Ð¾ÐºÐ¸
              </div>
              <div className="font-display font-bold text-xl tabular-nums">
                <span className={minReached ? "text-portal" : "text-foreground"}>{playerCount}</span>
                <span className="text-muted-foreground">/{room.min_players}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-5">
              {players.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-sm border border-border/60 bg-background/40 px-3 py-2">
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-portal/15 border border-portal/30 text-xs font-display font-bold text-portal shrink-0">
                      {p.display_name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate text-sm">{p.display_name}</span>
                  </span>
                  {p.is_host
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-portal"><Crown className="h-3 w-3" /> Ñ…Ð¾ÑÑ‚</span>
                    : <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-acid">Ð³Ð¾Ñ‚Ð¾Ð²</span>
                  }
                </li>
              ))}
              {Array.from({ length: Math.max(0, room.min_players - players.length) }).map((_, i) => (
                <li key={`slot-${i}`} className="flex items-center gap-2 rounded-sm border border-dashed border-border/60 px-3 py-2 text-xs font-mono text-muted-foreground">
                  <span className="h-7 w-7 rounded-full border border-dashed border-border/60" />
                  ÐžÐ¶Ð¸Ð´Ð°Ð½Ð¸Ðµ Ð¸Ð³Ñ€Ð¾ÐºÐ°â€¦
                </li>
              ))}
            </ul>

            {isHost ? (
              <Button onClick={start} disabled={!canStart || starting} className="w-full bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]" size="lg">
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
                {minReached ? "ÐÐ°Ñ‡Ð°Ñ‚ÑŒ" : `ÐÐ°Ñ‡Ð°Ñ‚ÑŒ (Ñ‚ÐµÑÑ‚, Ð½Ðµ Ñ…Ð²Ð°Ñ‚Ð°ÐµÑ‚ ${Math.max(0, room.min_players - playerCount)})`}
              </Button>
            ) : (
              <div className="text-xs font-mono text-center text-muted-foreground">Ð–Ð´Ñ‘Ð¼, Ð¿Ð¾ÐºÐ° Ñ…Ð¾ÑÑ‚ Ð½Ð°Ñ‡Ð½Ñ‘Ñ‚ Ð¸Ð³Ñ€Ñƒâ€¦</div>
            )}

            <p className="text-[11px] font-mono text-muted-foreground/80 text-center mt-3">
              Ð¡Ñ‚Ð°Ñ‚ÑƒÑ: {room.status === "waiting" ? "Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ðµ" : room.status}
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Lobby;

