import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoundRouter } from "@/components/RoundRouter";
import { ReplicaPlayer } from "@/components/ReplicaPlayer";
import { BackgroundImage } from "@/components/BackgroundImage";
import { Loader2, ChevronLeft, Play, SkipForward, Users, Shuffle } from "lucide-react";
import type { RoundConfig, RoundSubmission } from "@/mechanics/types";
import { calcRoundResult, makeSubmission, TEST_PLAYERS, type TestPlayer, type RoundCalcResult } from "@/utils/roundCalc";

type Phase = "playing" | "result_replicas" | "result_screen";

const SABOTEUR_ID = "player-3";

export default function RoundTest() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [rounds, setRounds] = useState<RoundConfig[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<RoundSubmission[]>([]);
  const [phase, setPhase] = useState<Phase>("playing");
  const [result, setResult] = useState<RoundCalcResult | null>(null);
  const [replicaQueue, setReplicaQueue] = useState<Array<{speaker:"host"|"morty";text:string;audioPath?:string}>>([]);
  const [currentReplica, setCurrentReplica] = useState<{speaker:"host"|"morty";text:string;audioPath?:string} | null>(null);
  const [viewAs, setViewAs] = useState<string>("player-1");
  const [saboteurId, setSaboteurId] = useState<string>(SABOTEUR_ID);
  const [scores, setScores] = useState({ team: 0, saboteur: 0 });

  useEffect(() => { if (!authLoading && !user) navigate("/login"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!scenarioId) return;
    supabase.from("scenarios").select("scenario_json").eq("id", scenarioId).single().then(({ data }) => {
      if (data?.scenario_json?.party_game?.rounds) setRounds(data.scenario_json.party_game.rounds);
      setLoading(false);
    });
  }, [scenarioId]);

  const currentRound = selectedIndex !== null ? rounds[selectedIndex] : null;
  const players = TEST_PLAYERS.map(p => ({ ...p, isSaboteur: p.id === saboteurId }));

  const resetRound = () => {
    setSubmissions([]);
    setPhase("playing");
    setResult(null);
    setReplicaQueue([]);
    setCurrentReplica(null);
  };

  const selectRound = (idx: number) => {
    setSelectedIndex(idx);
    resetRound();
  };

  const handleSubmit = async (payload: Record<string, any>) => {
    if (!currentRound) return;
    const sub = makeSubmission(viewAs, currentRound.id, currentRound.mechanic, payload);
    setSubmissions(prev => {
      const filtered = prev.filter(s => !(s.player_id === viewAs && JSON.stringify(Object.keys(payload)) === JSON.stringify(Object.keys(s.payload))));
      return [...filtered, sub];
    });
  };

  const handleAutoSubmit = (scenario: "team_wins" | "saboteur_wins" | "tie") => {
    if (!currentRound) return;
    const newSubs: RoundSubmission[] = [];
    const mech = currentRound.mechanic;

    if (mech === "joke_vote") {
      const answers = players.map(p => makeSubmission(p.id, currentRound.id, mech, { answer: "joke-" + p.id }));
      if (scenario === "team_wins") {
        const nonSab = answers.filter(a => a.player_id !== saboteurId);
        const votes = nonSab.map(a => makeSubmission(a.player_id === nonSab[0].player_id ? players.find(p => p.id !== nonSab[0].player_id && p.id !== saboteurId)?.id ?? "player-2" : "player-1", currentRound.id, mech, { vote_for_submission_id: nonSab[0].id }));
        newSubs.push(...answers, ...votes);
      } else if (scenario === "saboteur_wins") {
        const sabAnswer = answers.find(a => a.player_id === saboteurId)!;
        const votes = players.filter(p => p.id !== saboteurId).map(p => makeSubmission(p.id, currentRound.id, mech, { vote_for_submission_id: sabAnswer.id }));
        newSubs.push(...answers, ...votes);
      } else {
        const nonSab = answers.filter(a => a.player_id !== saboteurId);
        const vote1 = makeSubmission("player-1", currentRound.id, mech, { vote_for_submission_id: nonSab[0].id });
        const vote2 = makeSubmission("player-2", currentRound.id, mech, { vote_for_submission_id: nonSab[1]?.id ?? nonSab[0].id });
        newSubs.push(...answers, vote1, vote2);
      }
    } else if (mech === "fork") {
      const correct = (currentRound as any).options?.find((o: any) => o.is_correct);
      const joke = (currentRound as any).options?.find((o: any) => o.is_joke);
      const wrong = (currentRound as any).options?.find((o: any) => !o.is_correct && !o.is_joke);
      const optId = scenario === "team_wins" ? correct?.id : scenario === "tie" ? joke?.id : wrong?.id;
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { option_id: optId })));
    } else if (mech === "guess_author") {
      players.forEach(p => {
        newSubs.push(makeSubmission(p.id, currentRound.id, mech, { completion: "answer-" + p.id }));
      });
      const guesses: Record<string, string> = {};
      players.forEach(p => { guesses[p.id] = scenario === "team_wins" ? saboteurId : p.id === saboteurId ? "player-1" : "player-2"; });
      players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { guesses })));
    } else if (mech === "vote_saboteur") {
      if (scenario === "team_wins") {
        players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { accused_player_id: saboteurId })));
      } else if (scenario === "saboteur_wins") {
        players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { accused_player_id: "player-1" })));
      } else {
        newSubs.push(makeSubmission("player-1", currentRound.id, mech, { accused_player_id: saboteurId }));
        newSubs.push(makeSubmission("player-2", currentRound.id, mech, { accused_player_id: "player-1" }));
      }
    } else {
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { answer: "auto" })));
    }
    setSubmissions(newSubs);
  };

  const handleAdvance = async () => {
    if (!currentRound) return;
    const res = calcRoundResult(currentRound, submissions, saboteurId, players.length);
    setResult(res);
    setScores(prev => ({ team: prev.team + res.team_points, saboteur: prev.saboteur + res.saboteur_points }));
    const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
    if (res.is_joke && (currentRound as any).joke_option) {
      const jo = (currentRound as any).joke_option;
      if (jo?.joke_host_line) queue.push({ speaker: "host", text: jo.joke_host_line, audioPath: jo.joke_host_audio });
      if (jo?.joke_morty_line) queue.push({ speaker: "morty", text: jo.joke_morty_line, audioPath: jo.joke_morty_audio });
    } else if (res.is_tie && (currentRound as any).tie_host) {
      queue.push({ speaker: "host", text: (currentRound as any).tie_host, audioPath: (currentRound as any).tie_host_audio });
      if ((currentRound as any).tie_morty) queue.push({ speaker: "morty", text: (currentRound as any).tie_morty, audioPath: (currentRound as any).tie_morty_audio });
    } else if (res.team_scored) {
      if (currentRound.success_host) queue.push({ speaker: "host", text: currentRound.success_host, audioPath: currentRound.success_host_audio });
      if (currentRound.success_morty) queue.push({ speaker: "morty", text: currentRound.success_morty, audioPath: currentRound.success_morty_audio });
    } else {
      if (currentRound.fail_host) queue.push({ speaker: "host", text: currentRound.fail_host, audioPath: currentRound.fail_host_audio });
      if (currentRound.fail_morty) queue.push({ speaker: "morty", text: currentRound.fail_morty, audioPath: currentRound.fail_morty_audio });
    }
    setReplicaQueue(queue);
    setCurrentReplica(queue.length > 0 ? queue[0] : null);
    setPhase(queue.length > 0 ? "result_replicas" : "result_screen");
  };

  const onReplicaFinished = useCallback(() => {
    setReplicaQueue(prev => {
      const next = prev.slice(1);
      setCurrentReplica(next.length > 0 ? next[0] : null);
      if (next.length === 0) setPhase("result_screen");
      return next;
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-portal" /></div>;

  if (selectedIndex === null || !currentRound) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to={"/admin/scenarios/" + scenarioId} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-display">Тест раундов — {scenarioId}</h1>
          </div>
          <div className="grid gap-3">
            {rounds.map((r, i) => (
              <button key={r.id} onClick={() => selectRound(i)}
                className="glass-card p-5 text-left hover:border-portal/60 transition-all flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-portal border border-portal/30 px-2 py-0.5 rounded">{i + 1}</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{r.mechanic}</span>
                  </div>
                  <p className="font-display text-lg">{r.title}</p>
                </div>
                <Play className="w-5 h-5 text-portal" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* LEFT: Host View */}
      <div className="flex-1 relative overflow-auto">
        <BackgroundImage imagePath={currentRound?.background_image} />
        {currentReplica && (
          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />
        )}

        {phase === "result_replicas" && !currentReplica && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={() => setPhase("result_screen")} className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl">Далее →</button>
          </div>
        )}

        {phase === "result_screen" && result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
            <div className={glass-card p-6 max-w-md w-full text-center border }>
              <p className={	ext-3xl font-display mb-2 }>
                {result.is_tie ? "Ничья!" : result.team_scored ? "Команда побеждает!" : "Саботажник побеждает!"}
              </p>
              <p className="text-sm text-muted-foreground">+{result.team_points} команда / +{result.saboteur_points} хаос</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center"><p className="text-xs text-muted-foreground">Команда</p><p className="text-4xl font-display text-portal">{scores.team}</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Хаос</p><p className="text-4xl font-display text-destructive">{scores.saboteur}</p></div>
            </div>
            <button onClick={resetRound} className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl">Сыграть снова →</button>
          </div>
        )}

        {phase === "playing" && (
          <RoundRouter
            round={currentRound}
            isHost={true}
            runId="test-run"
            roomId="test-room"
            playerId="host"
            isSaboteur={false}
            submissions={submissions}
            playerCount={players.length}
            players={players}
            onSubmit={handleSubmit}
            onAdvance={handleAdvance}
          />
        )}
      </div>

      {/* RIGHT: Control Panel */}
      <div className="w-80 border-l border-border bg-background/95 flex flex-col overflow-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <button onClick={() => setSelectedIndex(null)} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" /> Раунды
          </button>
          <span className="text-xs font-mono text-portal">{currentRound.mechanic}</span>
        </div>

        {/* Players */}
        <div className="p-4 border-b border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><Users className="w-3 h-3" /> Игроки</p>
          <div className="grid gap-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <button onClick={() => setViewAs(p.id)}
                  className={	ext-sm px-3 py-1.5 rounded-lg border transition-all }>
                  {p.display_name}
                </button>
                <button onClick={() => setSaboteurId(p.id)}
                  className={	ext-xs px-2 py-1 rounded border transition-all }>
                  {p.id === saboteurId ? "Саботажник" : "Команда"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-submit */}
        <div className="p-4 border-b border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><Shuffle className="w-3 h-3" /> Симуляция</p>
          <div className="grid gap-2">
            <button onClick={() => handleAutoSubmit("team_wins")} className="text-sm px-3 py-2 rounded-lg border border-acid/40 text-acid hover:bg-acid/10 transition-all">✓ Команда побеждает</button>
            <button onClick={() => handleAutoSubmit("saboteur_wins")} className="text-sm px-3 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-all">✗ Саботажник побеждает</button>
            <button onClick={() => handleAutoSubmit("tie")} className="text-sm px-3 py-2 rounded-lg border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 transition-all">⚡ Ничья</button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Submissions: {submissions.length}</p>
        </div>

        {/* Player View */}
        <div className="p-4 border-b border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Вид игрока: {players.find(p => p.id === viewAs)?.display_name}</p>
          <div className="rounded-xl overflow-hidden border border-border" style={{height: 400, overflow: "auto"}}>
            <div style={{transform: "scale(0.6)", transformOrigin: "top left", width: "167%", height: "167%", pointerEvents: "auto"}}>
              <RoundRouter
                round={currentRound}
                isHost={false}
                runId="test-run"
                roomId="test-room"
                playerId={viewAs}
                isSaboteur={viewAs === saboteurId}
                submissions={submissions}
                playerCount={players.length}
                players={players}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>

        {/* Nav between rounds */}
        <div className="p-4 mt-auto flex gap-2">
          {selectedIndex > 0 && (
            <button onClick={() => selectRound(selectedIndex - 1)} className="flex-1 text-sm px-3 py-2 rounded-lg border border-border hover:border-muted-foreground transition-all">← Пред.</button>
          )}
          {selectedIndex < rounds.length - 1 && (
            <button onClick={() => selectRound(selectedIndex + 1)} className="flex-1 text-sm px-3 py-2 rounded-lg border border-portal/40 text-portal hover:bg-portal/10 transition-all">След. →</button>
          )}
        </div>
      </div>
    </div>
  );
}
