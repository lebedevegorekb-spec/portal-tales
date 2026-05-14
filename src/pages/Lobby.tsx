import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Users, PlayCircle, Loader2, Pause, Play } from "lucide-react";

type Room = {
  id: string; code: string; host_user_id: string; scenario_id: string;
  status: string; min_players: number; max_players: number; run_id: string | null;
};

type Player = {
  id: string; room_id: string; user_id: string | null;
  display_name: string; is_host: boolean; ready: boolean; joined_at: string;
};

const Lobby = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [starting, setStarting] = useState(false);
  const [pausing, setPausing] = useState(false);

  const joinUrl = useMemo(() => room ? `${window.location.origin}/join/${room.code}` : "", [room]);
  const qrUrl = useMemo(() => joinUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=8&data=${encodeURIComponent(joinUrl)}` : "", [joinUrl]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const loadRoom = async () => {
    if (!roomId) return;
    const { data: r, error } = await supabase.from("rooms").select("*").eq("id", roomId).maybeSingle();
    if (error || !r) { toast.error("Комната не найдена"); navigate("/catalog"); return; }
    setRoom(r as Room);
    const { data: ps } = await supabase.from("room_players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true });
    // фильтр хоста на фронте
    setPlayers((ps as Player[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && roomId) loadRoom();
  }, [user, roomId]);

  // Realtime
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room:${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` }, () => {
        supabase.from("room_players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true })
          .then(({ data }) => setPlayers((data as Player[]) ?? []));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new as Room);
        if ((payload.new as Room).status === "playing" && (payload.new as Room).run_id) {
          navigate(`/scene/${(payload.new as Room).run_id}`);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, navigate]);

  const isHost = room?.host_user_id === user?.id;
  const nonHostPlayers = players.filter(p => !p.is_host);
  const playerCount = nonHostPlayers.length;
  const minReached = playerCount >= (room?.min_players ?? 3);
  const isPaused = room?.status === "paused";

  const copyCode = async () => {
    await navigator.clipboard.writeText(room?.code ?? "");
    setCopied("code"); setTimeout(() => setCopied(null), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied("link"); setTimeout(() => setCopied(null), 2000);
  };

  const handleStart = async () => {
    if (!room || !user) return;
    setStarting(true);
    const hostName = (user.user_metadata as any)?.display_name || user.email?.split("@")[0] || "Хост";
    const { data, error } = await supabase.functions.invoke("party-start", {
      body: { room_id: room.id, host_name: hostName },
    });
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Не удалось начать игру");
      setStarting(false);
      return;
    }
    navigate(`/scene/${data.run_id}`);
  };

  const handlePause = async () => {
    if (!room) return;
    setPausing(true);
    const { error } = await supabase.functions.invoke("room-pause", {
      body: { room_id: room.id },
    });
    if (error) toast.error("Не удалось поставить паузу");
    setPausing(false);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-portal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground scanlines">
      <SiteHeader />
      <div className="container max-w-5xl mx-auto py-8 px-4 grid md:grid-cols-2 gap-8">

        {/* Левая колонка — QR и код */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-6 flex flex-col items-center gap-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Присоединиться</p>
            {qrUrl && <img src={qrUrl} alt="QR" className="w-48 h-48 rounded-lg border border-border" />}
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl tracking-widest text-portal">{room?.code}</span>
              <button onClick={copyCode} className="text-muted-foreground hover:text-portal transition-colors">
                {copied === "code" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <button onClick={copyLink} className="text-xs text-muted-foreground hover:text-portal transition-colors flex items-center gap-1">
              {copied === "link" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Скопировать ссылку
            </button>
          </div>

          <div className="glass-card p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Сценарий</p>
            <p className="font-display text-lg">{room?.scenario_id}</p>
          </div>
        </div>

        {/* Правая колонка — игроки и управление */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Игроки
              </span>
              <span className="font-display text-portal">{playerCount}/{room?.max_players ?? 8}</span>
            </div>

            <div className="grid gap-2">
              {nonHostPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-portal/20 flex items-center justify-center text-portal font-display text-sm">
                    {p.display_name[0]?.toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm">{p.display_name}</span>
                  {p.is_host && <span className="text-xs text-portal uppercase tracking-widest">Хост</span>}
                </div>
              ))}
              {Array.from({ length: Math.max(0, (room?.min_players ?? 3) - playerCount) }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border border-dashed border-border">
                  <div className="w-8 h-8 rounded-full bg-muted/40" />
                  <span className="text-sm text-muted-foreground">Ожидание игрока...</span>
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleStart}
                disabled={starting || isPaused}
                className="w-full h-14 bg-portal text-portal-foreground font-display text-lg"
              >
                {starting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <PlayCircle className="w-5 h-5 mr-2" />}
                {minReached ? "Начать" : `Начать (не хватает ${Math.max(0, (room?.min_players ?? 3) - playerCount)})`}
              </Button>

              {room?.status === "playing" && (
                <Button
                  onClick={handlePause}
                  disabled={pausing}
                  variant="outline"
                  className="w-full h-12"
                >
                  {pausing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                  {isPaused ? "Продолжить" : "Пауза"}
                </Button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Статус: {room?.status === "paused" ? "пауза" : room?.status === "playing" ? "идёт игра" : "ожидание"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;

