import { useEffect, useState, useCallback } from "react";
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

type ScenePhase = "loading" | "intro" | "playing" | "result_replicas" | "result_screen";

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
  const [players, setPlayers] = useState<{id:string;display_name:string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<ScenePhase>("loading");
  const [replicaQueue, setReplicaQueue] = useState<Array<{speaker:"host"|"morty";text:string;audioPath?:string}>>([]);
  const [currentReplica, setCurrentReplica] = useState<{speaker:"host"|"morty";text:string;audioPath?:string} | null>(null);
  const [introShownForRound, setIntroShownForRound] = useState<number>(-1);
  const [introReplicasShown, setIntroReplicasShown] = useState(false);

  const gameState = useGameState(runId ?? null);
  const { advance } = useRoundAdvance();
  const { submit } = useRoundSubmit();

  const currentRound: RoundConfig | null = partyConfig && gameState
    ? partyConfig.rounds[gameState.current_round_index] ?? null
    : null;

  const submissions = useRoundSubmissions(runId ?? null, currentRound?.id ?? null);

  // Загрузить данные
  useEffect(() => {
    if (!runId) return;
    const userId = user?.id ?? localStorage.getItem("guest_player_id");
    const load = async () => {
      const { data: run } = await supabase.from("runs").select("scenario_id").eq("id", runId).single();
      if (!run) { navigate("/catalog"); return; }
      const { data: room } = await supabase.from("rooms").select("id, host_user_id, status, min_players").eq("run_id", runId).maybeSingle();
      if (room) {
        setRoomId(room.id);
        setRoomStatus(room.status);
        setIsHost(!!user?.id && room.host_user_id === user.id);
        const { count } = await supabase.from("room_players").select("id", { count: "exact" }).eq("room_id", room.id).eq("is_host", false);
        setPlayerCount(count ?? room.min_players ?? 3);
        const { data: pls } = await supabase.from("room_players").select("id,display_name").eq("room_id", room.id).eq("is_host", false);
        setPlayers((pls ?? []) as {id:string;display_name:string}[]);
        if (userId) {
          const { data: playerRow } = await supabase.from("room_players").select("id").eq("room_id", room.id).eq("user_id", userId).maybeSingle();
          if (playerRow) setPlayerId(playerRow.id);
        }
      }
      const { data: scenario } = await supabase.from("scenarios").select("scenario_json").eq("id", run.scenario_id).single();
      if (scenario?.scenario_json?.party_game) setPartyConfig(scenario.scenario_json.party_game as PartyGameConfig);
      setLoading(false);
    };
    load();
  }, [runId, user, navigate]);

  // Определить начальную фазу
  useEffect(() => {
    if (loading || !partyConfig || !gameState || phase !== "loading") return;
    const uiPhase = (gameState as any)?.ui_phase;
    if (isHost && uiPhase === "intro" && partyConfig?.intro?.situation) {
      setPhase("intro");
    } else if (uiPhase === "chars_reveal") {
      setPhase("chars_reveal");
    } else if (uiPhase === "playing" || uiPhase === "result") {
      setPhase("playing");
    } else {
      setPhase("playing");
    }
  }, [loading, partyConfig, gameState, isHost, phase]);

  // Запустить реплики intro при входе в фазу intro (только 1 раз)
  useEffect(() => {
    if (phase !== "intro" || !isHost || !partyConfig?.intro || introReplicasShown) return;
    setIntroReplicasShown(true);
    const intro = partyConfig.intro;
    const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
    if (intro.host_line) queue.push({ speaker: "host", text: intro.host_line, audioPath: intro.host_line_audio });
    if (intro.morty_line) queue.push({ speaker: "morty", text: intro.morty_line, audioPath: intro.morty_line_audio });
    if (queue.length > 0) { setReplicaQueue(queue); setCurrentReplica(queue[0]); }
  }, [phase, isHost, partyConfig, introReplicasShown]);

  // При смене раунда — показать intro реплики раунда
  useEffect(() => {
    if (!gameState || !currentRound || !isHost || phase !== "playing") return;
    const idx = gameState.current_round_index;
    if (introShownForRound === idx) return;
    setIntroShownForRound(idx);
    const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
    if (currentRound.intro_host) queue.push({ speaker: "host", text: currentRound.intro_host, audioPath: currentRound.intro_host_audio });
    if (currentRound.intro_morty) queue.push({ speaker: "morty", text: currentRound.intro_morty, audioPath: currentRound.intro_morty_audio });
    if (queue.length > 0) { setReplicaQueue(queue); setCurrentReplica(queue[0]); }
  }, [gameState?.current_round_index, isHost, introShownForRound, phase]);

  // Realtime статус комнаты
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase.channel(`room_status:${roomId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        (payload) => { setRoomStatus((payload.new as any).status); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  // Финал
  useEffect(() => {
    if (gameState?.phase === "final" && runId) navigate(`/final/${runId}`);
  }, [gameState?.phase, runId, navigate]);

  // Слушаем ui_phase из gameState
  useEffect(() => {
    const uiPhase = (gameState as any)?.ui_phase;
    if (!uiPhase) return;
    if (uiPhase === "chars_reveal" && phase === "loading") {
      setPhase(isHost ? "chars_reveal" : "chars_reveal");
    }
    if (uiPhase === "playing" && (phase === "chars_reveal" || phase === "result_screen")) {
      setPhase("playing");
    }
    if (uiPhase === "result" && phase === "playing") setPhase("result_screen");
  }, [(gameState as any)?.ui_phase, isHost, phase]);

  const onReplicaFinished = useCallback(() => {
    setReplicaQueue(prev => {
      const next = prev.slice(1);
      setCurrentReplica(next.length > 0 ? next[0] : null);
      if (next.length === 0) {
        setPhase(p => p === "result_replicas" ? "result_screen" : p);
      }
      return next;
    });
  }, []);

  const handleIntroFinish = async () => {
    setReplicaQueue([]);
    setCurrentReplica(null);
    // Переходим в chars_reveal — игроки идут смотреть роли
    if (runId) {
      const { data: run } = await supabase.from("runs").select("state_json").eq("id", runId).single();
      if (run?.state_json) {
        const newState = { ...run.state_json, party_game: { ...run.state_json.party_game, phase: "round", ui_phase: "chars_reveal" } };
        await supabase.from("runs").update({ state_json: newState }).eq("id", runId);
      }
    }
    setPhase("chars_reveal");
  };

  const handleSubmit = async (payload: Record<string, any>) => {
    if (!runId || !roomId || !playerId || !currentRound) return;
    await submit({ runId, roomId, playerId, roundId: currentRound.id, mechanic: currentRound.mechanic, payload });
  };

  const handleAdvance = async () => {
    if (!runId || !roomId || !currentRound) return;
    const result = await advance(runId, roomId);
    if (isHost) {
      const won = result?.team_scored;
      const isTie = result?.is_tie ?? false;
      const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
      if (result?.is_joke) {
        const jo = result.joke_option;
        if (jo?.joke_host_line) queue.push({ speaker: "host", text: jo.joke_host_line, audioPath: jo.joke_host_audio });
        if (jo?.joke_morty_line) queue.push({ speaker: "morty", text: jo.joke_morty_line, audioPath: jo.joke_morty_audio });
      } else if (isTie && (currentRound as any).tie_host) {
        queue.push({ speaker: "host", text: (currentRound as any).tie_host, audioPath: (currentRound as any).tie_host_audio });
        if ((currentRound as any).tie_morty) queue.push({ speaker: "morty", text: (currentRound as any).tie_morty, audioPath: (currentRound as any).tie_morty_audio });
      } else if (won) {
        if (currentRound.success_host) queue.push({ speaker: "host", text: currentRound.success_host, audioPath: currentRound.success_host_audio });
        if (currentRound.success_morty) queue.push({ speaker: "morty", text: currentRound.success_morty, audioPath: currentRound.success_morty_audio });
      } else {
        if (currentRound.fail_host) queue.push({ speaker: "host", text: currentRound.fail_host, audioPath: currentRound.fail_host_audio });
        if (currentRound.fail_morty) queue.push({ speaker: "morty", text: currentRound.fail_morty, audioPath: currentRound.fail_morty_audio });
      }
      setReplicaQueue(queue);
      setCurrentReplica(queue.length > 0 ? queue[0] : null);
      setPhase("result_replicas");
    }
  };

  // --- RENDER ---

  if (loading || phase === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-portal" />
      </div>
    );
  }

  if (roomStatus === "paused") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
        <Pause className="w-16 h-16 text-portal animate-pulse" />
        <h1 className="font-display text-4xl">Игра на паузе</h1>
        <p className="text-muted-foreground">Ожидайте, хост скоро продолжит...</p>
        {isHost && roomId && <PauseButton roomId={roomId} status={roomStatus} />}
      </div>
    );
  }

  if (phase === "intro" && isHost && partyConfig?.intro) {
    const intro = partyConfig.intro;

    return (
      <div className="min-h-screen text-foreground relative flex flex-col items-center justify-center p-8">
        <BackgroundImage imagePath={intro.background_image?.replace(/^"|"$/g, "")} />
        <MediaPlayer musicPath={intro.background_music} />
        {currentReplica && (
          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />
        )}
        <div className="max-w-2xl text-center space-y-6 animate-in fade-in duration-700" style={{textShadow:"0 2px 8px rgba(0,0,0,0.9)"}}>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Вступление</p>
          <h1 className="text-4xl font-display">{partyConfig.title ?? "Портал Хаоса"}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{intro.situation}</p>
          <button onClick={handleIntroFinish} className="mt-8 bg-portal text-portal-foreground px-12 py-4 rounded-lg font-display text-xl hover:bg-portal/90 transition-colors">
            Начать игру →
          </button>
        </div>
      </div>
    );
  }

  // Игроки видят ожидание пока хост на intro
  if (!isHost && gameState?.phase === "intro") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-portal" />
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Хост запускает игру...</p>
      </div>
    );
  }

  // Фаза chars_reveal — ждём пока все посмотрят роли
  if (phase === "chars_reveal") {
    const charsReady = (gameState as any)?.characters_ready?.length ?? 0;
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
        <BackgroundImage imagePath={partyConfig?.intro?.background_image} />
        <Loader2 className="w-10 h-10 animate-spin text-portal" />
        <p className="text-2xl font-display">Игроки знакомятся с ролями</p>
        <p className="text-muted-foreground">{charsReady} / {playerCount} готовы</p>
      </div>
    );
  }

  // Фаза result_replicas — реплики играют
  if (phase === "result_replicas") {
    return (
      <div className="min-h-screen bg-background text-foreground relative flex flex-col items-center justify-center gap-6">
        <BackgroundImage imagePath={currentRound?.background_image} />
        {currentReplica && (
          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />
        )}
        {!currentReplica && isHost && (
          <button onClick={() => setPhase("result_screen")} className="bg-portal text-portal-foreground px-12 py-4 rounded-lg font-display text-xl">
            Далее →
          </button>
        )}
        {!isHost && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-portal" />
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Итоги раунда...</p>
          </div>
        )}
      </div>
    );
  }

  // Фаза result_screen — итоги, ждём хоста
  if (phase === "result_screen") {
    const lastResult = gameState?.round_results?.[gameState.round_results.length - 1];
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-8">
        <BackgroundImage imagePath={currentRound?.background_image} />
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Итог раунда</p>
        {lastResult && (
          <div className={`glass-card p-6 max-w-md w-full text-center border ${lastResult.team_scored ? "border-acid/40" : "border-destructive/40"`}`}>
            <p className={`text-3xl font-display mb-2 ${lastResult.team_scored ? "text-acid" : "text-destructive"`}`}>
              {lastResult.team_scored ? "Команда побеждает!" : "Саботажник побеждает!"}
            </p>
          </div>
        )}
        <div className="flex gap-8 text-center">
          <div><p className="text-xs text-muted-foreground uppercase tracking-widest">Команда</p><p className="text-4xl font-display text-portal">{gameState?.scores.team ?? 0}</p></div>
          <div><p className="text-xs text-muted-foreground uppercase tracking-widest">Хаос</p><p className="text-4xl font-display text-destructive">{gameState?.scores.saboteur ?? 0}</p></div>
        </div>
        {isHost ? (
          <button
            onClick={async () => {
              if (!runId || !roomId) return;
              const { supabase: sb } = await import("@/integrations/supabase/client").then(m => ({ supabase: m.supabase }));
              await sb.functions.invoke("round-result-ack", { body: { run_id: runId, room_id: roomId } });
              setPhase("playing");
            }}
            className="bg-portal text-portal-foreground px-12 py-4 rounded-lg font-display text-xl hover:bg-portal/90 transition-colors"
          >
            Следующий раунд →
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-portal" />
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Ждём хоста...</p>
          </div>
        )}
      </div>
    );
  }

  if (!partyConfig || !gameState || !currentRound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-portal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {isHost && roomId && (
        <div className="fixed top-4 right-4 z-50">
          <PauseButton roomId={roomId} status={roomStatus} />
        </div>
      )}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">
          Раунд {gameState.current_round_index + 1} / {partyConfig.rounds.length}
        </span>
        <div className="flex gap-1">
          {partyConfig.rounds.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${
              i < gameState.current_round_index ? "bg-portal"
              : i === gameState.current_round_index ? "bg-portal animate-pulse"
              : "bg-muted"
            `}`} />
          ))}
        </div>
      </div>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-4 text-xs font-mono">
        <span className="text-portal">Команда: {gameState.scores.team}</span>
        <span className="text-destructive">Хаос: {gameState.scores.saboteur}</span>
      </div>
      <BackgroundImage imagePath={currentRound?.background_image} />
      <MediaPlayer musicPath={currentRound?.background_music} />
      {currentReplica && (
        <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />
      )}
      <RoundRouter
        round={currentRound}
        isHost={isHost}
        runId={runId ?? ""}
        roomId={roomId ?? ""}
        playerId={playerId ?? ""}
        isSaboteur={gameState.saboteur_player_id === playerId}
        submissions={submissions}
        playerCount={playerCount}
        players={players}
        onSubmit={handleSubmit}
        onAdvance={isHost ? handleAdvance : undefined}
      />
    </div>
  );
};

export default Scene;






















