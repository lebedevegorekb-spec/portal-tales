import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGameState } from "@/hooks/useGameState";
import { useRoundSubmissions } from "@/hooks/useRoundSubmissions";
import { useRoundSubmit } from "@/hooks/useRoundSubmit";
import { useRoundAdvance } from "@/hooks/useRoundAdvance";
import { RoundRouter } from "@/components/RoundRouter";
import { PauseButton } from "@/components/PauseButton";
import { Loader2, Pause } from "lucide-react";
import type { PartyGameConfig, RoundConfig } from "@/mechanics/types";
import { MediaPlayer } from "@/components/MediaPlayer";
import { ReplicaPlayer } from "@/components/ReplicaPlayer";
import { BackgroundImage } from "@/components/BackgroundImage";

const Scene = () => {
  const { runId } = useParams<{ runId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<string>("playing");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [partyConfig, setPartyConfig] = useState<PartyGameConfig | null>(null);
  const [playerCount, setPlayerCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [replicaQueue, setReplicaQueue] = useState<Array<{speaker:"host"|"morty";text:string;audioPath?:string}>>([]);
  const [currentReplica, setCurrentReplica] = useState<{speaker:"host"|"morty";text:string;audioPath?:string} | null>(null);

  const gameState = useGameState(runId ?? null);
  const { advance, loading: advancing } = useRoundAdvance();
  const { submit } = useRoundSubmit();

  const currentRound: RoundConfig | null = partyConfig && gameState
    ? partyConfig.rounds[gameState.current_round_index] ?? null
    : null;

  const submissions = useRoundSubmissions(
    runId ?? null,
    currentRound?.id ?? null
  );

  // Показать очередь реплик
  const showReplicas = (replicas: Array<{speaker:"host"|"morty";text:string;audioPath?:string}>) => {
    setReplicaQueue(replicas);
    if (replicas.length > 0) setCurrentReplica(replicas[0]);
  };

  const onReplicaFinished = () => {
    setReplicaQueue(prev => {
      const next = prev.slice(1);
      setCurrentReplica(next.length > 0 ? next[0] : null);
      return next;
    });
  };

  // Загрузить данные комнаты и сценария
  useEffect(() => {
    if (!runId || !user) return;

    const load = async () => {
      // Получить run
      const { data: run } = await supabase
        .from("runs")
        .select("scenario_id")
        .eq("id", runId)
        .single();

      if (!run) { navigate("/catalog"); return; }

      // Получить комнату
      const { data: room } = await supabase
        .from("rooms")
        .select("id, host_user_id, status, min_players")
        .eq("run_id", runId)
        .maybeSingle();

      if (room) {
        setRoomId(room.id);
        setRoomStatus(room.status);
        setIsHost(room.host_user_id === user.id);

        // Получить кол-во игроков
        const { count } = await supabase
          .from("room_players")
          .select("id", { count: "exact" })
          .eq("room_id", room.id);
        setPlayerCount(count ?? room.min_players ?? 4);

        // Получить player_id текущего пользователя
        const { data: playerRow } = await supabase
          .from("room_players")
          .select("id")
          .eq("room_id", room.id)
          .eq("user_id", user.id)
          .maybeSingle();
        if (playerRow) setPlayerId(playerRow.id);
      }

      // Получить scenario_json
      const { data: scenario } = await supabase
        .from("scenarios")
        .select("scenario_json")
        .eq("id", run.scenario_id)
        .single();

      if (scenario?.scenario_json?.party_game) {
        setPartyConfig(scenario.scenario_json.party_game as PartyGameConfig);
      }

      setLoading(false);
    };

    load();
  }, [runId, user, navigate]);

  // Realtime подписка на статус комнаты
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room_status:${roomId}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}`
      }, (payload) => {
        setRoomStatus((payload.new as any).status);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  // Переход на финал
  useEffect(() => {
    if (gameState?.phase === "final" && runId) {
      navigate(`/final/${runId}`);
    }
  }, [gameState?.phase, runId, navigate]);

  const handleSubmit = async (payload: Record<string, any>) => {
    if (!runId || !roomId || !playerId || !currentRound) return;
    await submit({
      runId,
      roomId,
      playerId,
      roundId: currentRound.id,
      mechanic: currentRound.mechanic,
      payload,
    });
  };

  const handleAdvance = async () => {
    if (!runId || !roomId) return;
    await advance(runId, roomId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-portal" />
      </div>
    );
  }

  // Пауза
  if (roomStatus === "paused") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
        <Pause className="w-16 h-16 text-portal animate-pulse" />
        <h1 className="font-display text-4xl">Игра на паузе</h1>
        <p className="text-muted-foreground">Ожидайте, хост скоро продолжит...</p>
        {isHost && roomId && (
          <PauseButton roomId={roomId} status={roomStatus} />
        )}
      </div>
    );
  }

  if (!partyConfig || !gameState || !currentRound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка раунда...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Кнопка паузы для хоста — всегда видна */}
      {isHost && roomId && (
        <div className="fixed top-4 right-4 z-50">
          <PauseButton roomId={roomId} status={roomStatus} />
        </div>
      )}

      {/* Прогресс раундов */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
          Раунд {gameState.current_round_index + 1} / {partyConfig.rounds.length}
        </span>
        <div className="flex gap-1">
          {partyConfig.rounds.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-all ${
                i < gameState.current_round_index
                  ? "bg-portal"
                  : i === gameState.current_round_index
                  ? "bg-portal animate-pulse"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Счёт */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-4 text-xs font-mono">
        <span className="text-portal">Команда: {gameState.scores.team}</span>
        <span className="text-destructive">Хаос: {gameState.scores.saboteur}</span>
      </div>

      <BackgroundImage imagePath={currentRound?.background_image} />
      <MediaPlayer musicPath={currentRound?.background_music} />
      {currentReplica && (
        <ReplicaPlayer
          speaker={currentReplica.speaker}
          text={currentReplica.text}
          audioPath={currentReplica.audioPath}
          onFinished={onReplicaFinished}
        />
      )}

      {/* Раунд */}
      <RoundRouter
        round={currentRound}
        isHost={isHost}
        runId={runId ?? ""}
        roomId={roomId ?? ""}
        playerId={playerId ?? ""}
        isSaboteur={gameState.saboteur_player_id === playerId}
        submissions={submissions}
        playerCount={playerCount}
        onSubmit={handleSubmit}
        onAdvance={isHost ? handleAdvance : undefined}
      />
    </div>
  );
};

export default Scene;
