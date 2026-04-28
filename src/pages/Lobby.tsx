import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  Crown,
  PlayCircle,
  Loader2,
} from "lucide-react";

type Room = {
  id: string;
  code: string;
  host_user_id: string;
  scenario_id: string;
  status: string;
  min_players: number;
  max_players: number;
  run_id: string | null;
};

type Player = {
  id: string;
  room_id: string;
  user_id: string | null;
  display_name: string;
  is_host: boolean;
  ready: boolean;
  joined_at: string;
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

  const joinUrl = useMemo(() => {
    if (!room) return "";
    return `${window.location.origin}/join/${room.code}`;
  }, [room]);

  const qrUrl = useMemo(() => {
    if (!joinUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=8&data=${encodeURIComponent(joinUrl)}`;
  }, [joinUrl]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const loadRoom = async () => {
    if (!roomId) return;
    const { data: r, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .maybeSingle();
    if (error || !r) {
      toast.error("Комната не найдена");
      navigate("/catalog");
      return;
    }
    setRoom(r as Room);

    const { data: ps } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });
    setPlayers((ps as Player[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user && roomId) loadRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roomId]);

  // Realtime — игроки и комната
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
        () => {
          supabase
            .from("room_players")
            .select("*")
            .eq("room_id", roomId)
            .order("joined_at", { ascending: true })
            .then(({ data }) => setPlayers((data as Player[]) ?? []));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          const next = payload.new as Room;
          setRoom(next);
          if (next.status === "started" && next.run_id) {
            navigate(`/play/run/${next.run_id}`);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, navigate]);

  const copy = async (value: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const isHost = !!user && !!room && room.host_user_id === user.id;
  const playerCount = players.length;
  const canStart = isHost && playerCount >= (room?.min_players ?? 4);

  const start = async () => {
    if (!room || !canStart) return;
    setStarting(true);
    const { data, error } = await supabase.functions.invoke("run-start", {
      body: { scenario_id: room.scenario_id },
    });
    if (error || data?.error) {
      setStarting(false);
      toast.error(data?.error || error?.message || "Не удалось запустить");
      return;
    }
    await supabase
      .from("rooms")
      .update({ status: "started", run_id: data.run_id })
      .eq("id", room.id);
    navigate(`/play/run/${data.run_id}`);
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
          <Link
            to="/catalog"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> К сценариям
          </Link>
          <div className="text-right">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-portal">
              {room.scenario_id} · LOBBY
            </div>
            <div className="font-display font-semibold">Ожидание игроков</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* Левый блок: QR + код */}
          <div className="glass-card scanlines rounded-md p-6 md:p-10 text-center">
            <h1 className="font-display font-bold text-3xl md:text-5xl text-balance">
              Покажи QR друзьям{" "}
              <span className="text-portal neon-text">или назови код</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-sm md:text-base">
              Игроки сканируют QR со своих телефонов или открывают ссылку и вводят код.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="rounded-md border border-portal/40 bg-background/80 p-4 shadow-[var(--shadow-portal)]">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR-код комнаты ${room.code}`}
                    width={420}
                    height={420}
                    className="block w-[280px] h-[280px] md:w-[420px] md:h-[420px]"
                    loading="eager"
                  />
                ) : null}
              </div>
            </div>

            {/* Код */}
            <div className="mt-8">
              <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground mb-2">
                Код комнаты
              </div>
              <button
                onClick={() => copy(room.code, "code")}
                className="group inline-flex items-center gap-4 rounded-md border border-portal/40 bg-portal/5 px-6 py-4 hover:bg-portal/10 transition-colors"
              >
                <span className="font-display font-bold text-5xl md:text-6xl tabular-nums tracking-[0.18em] text-portal neon-text">
                  {room.code}
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-portal/40 bg-background/60">
                  {copied === "code" ? (
                    <Check className="h-4 w-4 text-acid" />
                  ) : (
                    <Copy className="h-4 w-4 text-portal" />
                  )}
                </span>
              </button>
            </div>

            {/* Ссылка */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => copy(joinUrl, "link")}
                className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-portal transition-colors max-w-full"
              >
                <span className="truncate">{joinUrl}</span>
                {copied === "link" ? (
                  <Check className="h-3.5 w-3.5 text-acid shrink-0" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Правый блок: игроки + старт */}
          <aside className="glass-card rounded-md p-5 md:p-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <Users className="h-4 w-4 text-portal" /> Игроки
              </div>
              <div className="font-display font-bold text-xl tabular-nums">
                <span className={canStart ? "text-portal" : "text-foreground"}>
                  {playerCount}
                </span>
                <span className="text-muted-foreground">/{room.min_players}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-5">
              {players.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-sm border border-border/60 bg-background/40 px-3 py-2"
                >
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-portal/15 border border-portal/30 text-xs font-display font-bold text-portal shrink-0">
                      {p.display_name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate text-sm">{p.display_name}</span>
                  </span>
                  {p.is_host ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.18em] text-portal">
                      <Crown className="h-3 w-3" /> хост
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-acid">
                      готов
                    </span>
                  )}
                </li>
              ))}
              {Array.from({ length: Math.max(0, room.min_players - players.length) }).map(
                (_, i) => (
                  <li
                    key={`slot-${i}`}
                    className="flex items-center gap-2 rounded-sm border border-dashed border-border/60 px-3 py-2 text-xs font-mono text-muted-foreground"
                  >
                    <span className="h-7 w-7 rounded-full border border-dashed border-border/60" />
                    Ожидание игрока…
                  </li>
                ),
              )}
            </ul>

            {isHost ? (
              <Button
                onClick={start}
                disabled={!canStart || starting}
                className="w-full bg-portal hover:bg-portal/90 text-primary-foreground shadow-[var(--shadow-portal)]"
                size="lg"
              >
                {starting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-5 w-5" />
                )}
                {canStart
                  ? "Начать"
                  : `Нужно ещё ${Math.max(0, room.min_players - playerCount)}`}
              </Button>
            ) : (
              <div className="text-xs font-mono text-center text-muted-foreground">
                Ждём, пока хост начнёт игру…
              </div>
            )}

            <p className="text-[11px] font-mono text-muted-foreground/80 text-center mt-3">
              {room.status === "waiting" ? "Статус: ожидание" : `Статус: ${room.status}`}
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
