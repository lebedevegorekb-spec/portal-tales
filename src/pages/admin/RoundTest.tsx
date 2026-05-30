import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { RoundRouter } from "@/components/RoundRouter";
import { ReplicaPlayer } from "@/components/ReplicaPlayer";
import { BackgroundImage } from "@/components/BackgroundImage";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Loader2, ChevronLeft, Play, Users, Shuffle, RotateCcw } from "lucide-react";
import type { RoundConfig, RoundSubmission, PartyGameConfig } from "@/mechanics/types";
import { calcRoundResult, makeSubmission, TEST_PLAYERS, type RoundCalcResult } from "@/utils/roundCalc";

type Tab = "intro" | "chars" | "rounds" | "final";
type Phase = "playing" | "result_replicas" | "result_screen";
const SABOTEUR_ID = "player-3";

export default function RoundTest() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<PartyGameConfig | null>(null);
  const [rounds, setRounds] = useState<RoundConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("rounds");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<RoundSubmission[]>([]);
  const [phase, setPhase] = useState<Phase>("playing");
  const [result, setResult] = useState<RoundCalcResult | null>(null);
  const [replicaQueue, setReplicaQueue] = useState<Array<{speaker:"host"|"morty";text:string;audioPath?:string}>>([]);
  const [currentReplica, setCurrentReplica] = useState<{speaker:"host"|"morty";text:string;audioPath?:string} | null>(null);
  const [viewAs, setViewAs] = useState<string>("player-1");
  const [saboteurId, setSaboteurId] = useState<string>(SABOTEUR_ID);
  const [scores, setScores] = useState({ team: 0, saboteur: 0 });
  const [finalScenario, setFinalScenario] = useState<"team_wins"|"saboteur_wins">("team_wins");

  useEffect(() => { if (!authLoading && !user) navigate("/login"); }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!scenarioId) return;
    supabase.from("scenarios").select("scenario_json").eq("id", scenarioId).single().then(({ data }) => {
      if (data?.scenario_json?.party_game) {
        setConfig(data.scenario_json.party_game as PartyGameConfig);
        setRounds(data.scenario_json.party_game.rounds ?? []);
      }
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

  const selectRound = (idx: number) => { setSelectedIndex(idx); resetRound(); };

  const startReplicas = (queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}>) => {
    setReplicaQueue(queue);
    setCurrentReplica(queue.length > 0 ? queue[0] : null);
  };

  const stopReplicas = () => { setReplicaQueue([]); setCurrentReplica(null); };

  const onReplicaFinished = useCallback(() => {
    setReplicaQueue(prev => {
      const next = prev.slice(1);
      setCurrentReplica(next.length > 0 ? next[0] : null);
      if (next.length === 0) setPhase("result_screen");
      return next;
    });
  }, []);

  const onGenericReplicaFinished = useCallback(() => {
    setReplicaQueue(prev => {
      const next = prev.slice(1);
      setCurrentReplica(next.length > 0 ? next[0] : null);
      return next;
    });
  }, []);

  const handleSubmit = async (payload: Record<string, any>) => {
    if (!currentRound) return;
    const sub = makeSubmission(viewAs, currentRound.id, currentRound.mechanic, payload);
    setSubmissions(prev => {
      const filtered = prev.filter(s => !(s.player_id === viewAs));
      return [...filtered, sub];
    });
  };

  const runAdvance = (round: RoundConfig, subs: RoundSubmission[]) => {
    const res = calcRoundResult(round, subs, saboteurId, players.length);
    setResult(res);
    setScores(prev => ({ team: prev.team + res.team_points, saboteur: prev.saboteur + res.saboteur_points }));
    const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
    const r = round as any;
    if (res.is_joke && res.joke_option) {
      const jo = res.joke_option;
      if (jo?.joke_host_line) queue.push({ speaker: "host", text: jo.joke_host_line, audioPath: jo.joke_host_audio });
      if (jo?.joke_morty_line) queue.push({ speaker: "morty", text: jo.joke_morty_line, audioPath: jo.joke_morty_audio });
    } else if (res.is_tie) {
      if (r.tie_host) queue.push({ speaker: "host", text: r.tie_host, audioPath: r.tie_host_audio });
      if (r.tie_morty) queue.push({ speaker: "morty", text: r.tie_morty, audioPath: r.tie_morty_audio });
    } else if (res.team_scored) {
      if (round.success_host) queue.push({ speaker: "host", text: round.success_host, audioPath: round.success_host_audio });
      if (round.success_morty) queue.push({ speaker: "morty", text: round.success_morty, audioPath: round.success_morty_audio });
    } else {
      if (round.fail_host) queue.push({ speaker: "host", text: round.fail_host, audioPath: round.fail_host_audio });
      if (round.fail_morty) queue.push({ speaker: "morty", text: round.fail_morty, audioPath: round.fail_morty_audio });
    }
    startReplicas(queue);
    setPhase(queue.length > 0 ? "result_replicas" : "result_screen");
  };

  const handleAdvance = async () => {
    if (!currentRound) return;
    setSubmissions(prev => { runAdvance(currentRound, prev); return prev; });
  };

  const handleAutoSubmit = (scenario: "team_wins" | "saboteur_wins" | "tie", triggerAdvance = true) => {
    if (!currentRound) return;
    const newSubs: RoundSubmission[] = [];
    const mech = currentRound.mechanic;
    if (mech === "fork") {
      const correct = (currentRound as any).options?.find((o: any) => o.is_correct);
      const joke = (currentRound as any).options?.find((o: any) => o.is_joke);
      const wrong = (currentRound as any).options?.find((o: any) => !o.is_correct && !o.is_joke);
      const optId = scenario === "team_wins" ? correct?.id : scenario === "tie" ? joke?.id : wrong?.id;
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { option_id: optId })));
    } else if (mech === "joke_vote") {
      const answers = players.map(p => makeSubmission(p.id, currentRound.id, mech, { answer: "joke-" + p.id }));
      newSubs.push(...answers);
      const sabAnswer = answers.find(a => a.player_id === saboteurId)!;
      const nonSabAnswers = answers.filter(a => a.player_id !== saboteurId);
      if (scenario === "saboteur_wins") {
        players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { vote_for_submission_id: sabAnswer.id })));
      } else if (scenario === "tie") {
        newSubs.push(makeSubmission(players[0].id, currentRound.id, mech, { vote_for_submission_id: nonSabAnswers[0].id }));
        newSubs.push(makeSubmission(players[1].id, currentRound.id, mech, { vote_for_submission_id: nonSabAnswers[1]?.id ?? nonSabAnswers[0].id }));
        newSubs.push(makeSubmission(saboteurId, currentRound.id, mech, { vote_for_submission_id: sabAnswer.id }));
      } else {
        players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { vote_for_submission_id: nonSabAnswers[0].id })));
      }
    } else if (mech === "vote_saboteur") {
      const target = scenario === "team_wins" ? saboteurId : players.find(p => p.id !== saboteurId)?.id;
      players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { accused_player_id: target })));
    } else if (mech === "quiz") {
      const questions = (currentRound as any).questions ?? [];
      players.forEach(p => {
        const answers: Record<string,string> = {};
        questions.forEach((q: any) => { answers[q.id] = scenario === "team_wins" ? q.correct_id : "wrong-answer"; });
        newSubs.push(makeSubmission(p.id, currentRound.id, mech, { answers }));
      });
    } else if (mech === "blitz") {
      const questions = (currentRound as any).questions ?? [];
      players.forEach(p => {
        const answers: Record<string,string> = {};
        const isSab = p.id === saboteurId;
        questions.forEach((q: any) => {
          if (scenario === "team_wins") answers[q.id] = isSab ? "wrong-answer" : q.correct_id;
          else if (scenario === "saboteur_wins") answers[q.id] = isSab ? q.correct_id : "wrong-answer";
          else answers[q.id] = q.correct_id;
        });
        newSubs.push(makeSubmission(p.id, currentRound.id, mech, { answers }));
      });
    } else if (mech === "guess_author") {
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { completion: "test-" + p.id })));
      players.forEach(p => {
        const guesses: Record<string,string> = {};
        const others = players.filter(x => x.id !== p.id);
        others.forEach(x => {
          if (scenario === "team_wins") guesses[x.id] = saboteurId;
          else if (scenario === "saboteur_wins") guesses[x.id] = others.find(o => o.id !== saboteurId)?.id ?? x.id;
          else guesses[x.id] = x.id;
        });
        newSubs.push(makeSubmission(p.id, currentRound.id, mech, { guesses }));
      });
    } else if (mech === "pitch") {
      const sabIdx = players.findIndex(p => p.id === saboteurId);
      const nonSabIdx = sabIdx === 0 ? 1 : 0;
      players.forEach((p, i) => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { my_option_index: i })));
      if (scenario === "tie") {
        players.forEach((p, i) => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { vote_for_option_index: i % 2 === 0 ? sabIdx : nonSabIdx })));
      } else {
        players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { vote_for_option_index: scenario === "saboteur_wins" ? sabIdx : nonSabIdx })));
      }
    } else if (mech === "situation_deduction") {
      const correctId = (currentRound as any).correct_option_id;
      const wrongOpt = (currentRound as any).options?.find((o: any) => o.id !== correctId);
      const optId = scenario === "team_wins" ? correctId : wrongOpt?.id ?? correctId;
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { option_id: optId })));
    } else {
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { answer: "auto" })));
    }
    setSubmissions(newSubs);
    if (triggerAdvance) setTimeout(() => runAdvance(currentRound, newSubs), 300);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-portal" /></div>;
  if (!config) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">No config</div>;

  const accentColor = result?.is_tie ? "#facc15" : result?.team_scored ? "hsl(var(--portal))" : "hsl(var(--destructive))";
  const resultText = result?.is_tie ? "Ничья!" : result?.team_scored ? "Команда!" : "Саботажник!";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center gap-4 shrink-0">
        <Link to={"/admin/scenarios/" + scenarioId} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-lg">Тест — {scenarioId}</h1>
        <div className="flex gap-1 ml-4">
          {(["intro","chars","rounds","final"] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t !== "rounds") setSelectedIndex(null); }}
              className={"text-xs px-3 py-1.5 rounded-lg border transition-all uppercase tracking-widest " + (tab === t ? "border-portal bg-portal/10 text-portal" : "border-border text-muted-foreground hover:border-muted-foreground")}>
              {t === "rounds" ? "Раунды" : t === "intro" ? "Вступление" : t === "chars" ? "Персонажи" : "Финал"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">Команда: <span className="text-portal">{scores.team}</span> | Хаос: <span className="text-destructive">{scores.saboteur}</span></span>
          <button onClick={() => setScores({ team: 0, saboteur: 0 })} className="text-xs text-muted-foreground hover:text-foreground border border-border px-2 py-1 rounded">Сброс счёта</button>
        </div>
      </div>

      {/* INTRO TAB */}
      {tab === "intro" && (
        <div className="flex-1 relative">
          <BackgroundImage imagePath={(config.intro as any)?.background_image} />
          <MediaPlayer musicPath={(config.intro as any)?.background_music} />
          {currentReplica && <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onGenericReplicaFinished} />}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-8 gap-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Вступление</p>
            <h1 className="text-4xl font-display text-center">{config.title}</h1>
            <p className="text-xl text-muted-foreground text-center max-w-2xl">{(config.intro as any)?.situation}</p>
            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              <button onClick={() => { const q: any[] = []; const i = config.intro as any; if (i?.host_line) q.push({ speaker: "host", text: i.host_line, audioPath: i.host_line_audio }); if (i?.morty_line) q.push({ speaker: "morty", text: i.morty_line, audioPath: i.morty_line_audio }); startReplicas(q); }} className="bg-portal text-portal-foreground px-5 py-2.5 rounded-lg font-display text-sm">▶ Реплики вступления</button>
              <button onClick={() => { const q: any[] = []; const i = config.intro as any; if (i?.chars_reveal_host_line) q.push({ speaker: "host", text: i.chars_reveal_host_line, audioPath: i.chars_reveal_host_audio }); if (i?.chars_reveal_morty_line) q.push({ speaker: "morty", text: i.chars_reveal_morty_line, audioPath: i.chars_reveal_morty_audio }); startReplicas(q); }} className="border border-portal/40 text-portal px-5 py-2.5 rounded-lg font-display text-sm">▶ Реплики ролей</button>
              <button onClick={stopReplicas} className="border border-border px-5 py-2.5 rounded-lg text-sm text-muted-foreground">■ Стоп</button>
            </div>
          </div>
        </div>
      )}

      {/* CHARS TAB */}
      {tab === "chars" && (
        <div className="flex-1 p-8 max-w-2xl mx-auto w-full">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Персонажи</p>
          <div className="grid gap-4">
            {players.map((p, i) => {
              const charData = (config as any).characters?.[i];
              const isSab = p.id === saboteurId;
              return (
                <div key={p.id} className={"glass-card p-5 border " + (isSab ? "border-destructive/40" : "border-portal/20")}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display text-lg">{p.display_name}</p>
                    <span className={"text-xs px-2 py-1 rounded border " + (isSab ? "border-destructive text-destructive" : "border-portal text-portal")}>{isSab ? "Саботажник" : "Команда"}</span>
                  </div>
                  {charData && <p className="text-sm text-muted-foreground">{charData.name} — {charData.description}</p>}
                  {!charData && <p className="text-xs text-muted-foreground italic">Персонаж не назначен</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ROUNDS TAB — список */}
      {tab === "rounds" && selectedIndex === null && (
        <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Выберите раунд</p>
          <div className="grid gap-3">
            {rounds.map((r, i) => (
              <button key={r.id} onClick={() => selectRound(i)} className="glass-card p-5 text-left hover:border-portal/60 transition-all flex items-center justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-portal border border-portal/30 px-2 py-0.5 rounded">{i + 1}</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{r.mechanic}</span>
                  </div>
                  <p className="font-display text-lg">{r.title}</p>
                </div>
                <Play className="w-5 h-5 text-portal opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ROUNDS TAB — тест раунда */}
      {tab === "rounds" && selectedIndex !== null && currentRound && (
        <div className="flex-1 flex overflow-hidden">
          {/* Основная зона */}
          <div className="flex-1 relative overflow-auto flex flex-col">
            <BackgroundImage imagePath={
              result?.is_tie ? (currentRound as any)?.result_tie_image :
              (result as any)?.is_joke ? (currentRound as any)?.result_joke_image :
              result?.team_scored ? (currentRound as any)?.result_success_image :
              result ? (currentRound as any)?.result_fail_image :
              currentRound.background_image
            } />
            {currentReplica && <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />}

            {/* Экран результата */}
            {(phase === "result_replicas" || phase === "result_screen") && result && (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 z-10 relative">
                <div className="w-full max-w-sm rounded-2xl p-7 text-center backdrop-blur-md"
                  style={{ background: "rgba(9,13,21,0.8)", border: "1px solid " + accentColor + "40", boxShadow: "0 0 30px " + accentColor + "20" }}>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Итог раунда {(selectedIndex ?? 0) + 1}</p>
                  <p className="text-5xl font-display mb-3" style={{ color: accentColor }}>{resultText}</p>
                  <div className="flex justify-center gap-4 text-sm mb-4">
                    {result.team_points > 0 && <span className="text-portal">+{result.team_points} команде</span>}
                    {result.saboteur_points > 0 && <span className="text-destructive">+{result.saboteur_points} хаосу</span>}
                    {result.team_points === 0 && result.saboteur_points === 0 && <span className="text-muted-foreground">0 — 0</span>}
                  </div>
                  <div className="flex justify-center gap-10 pt-4 border-t border-white/10">
                    <div><p className="text-xs text-muted-foreground">Команда</p><p className="text-4xl font-display text-portal">{scores.team}</p></div>
                    <div><p className="text-xs text-muted-foreground">Хаос</p><p className="text-4xl font-display text-destructive">{scores.saboteur}</p></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={resetRound} className="border border-border px-6 py-2.5 rounded-lg text-sm text-muted-foreground hover:border-muted-foreground">↺ Заново</button>
                  {selectedIndex < rounds.length - 1 && (
                    <button onClick={() => selectRound(selectedIndex + 1)} className="bg-portal text-portal-foreground px-6 py-2.5 rounded-lg font-display">Следующий раунд →</button>
                  )}
                </div>
              </div>
            )}

            {/* Игровой экран */}
            {phase === "playing" && (
              <div className="absolute inset-0 overflow-auto z-10">
                <RoundRouter round={currentRound} isHost={true} runId="test-run" roomId="test-room" playerId="host" isSaboteur={false} submissions={submissions} playerCount={players.length} players={players} onSubmit={handleSubmit} onAdvance={handleAdvance} />
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="w-64 border-l border-border bg-background flex flex-col shrink-0 relative z-20">
            {/* Навигация */}
            <div className="p-3 border-b border-border flex items-center justify-between">
              <button onClick={() => { setSelectedIndex(null); resetRound(); }} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs">
                <ChevronLeft className="w-4 h-4" /> Раунды
              </button>
              <span className="text-xs font-mono text-portal border border-portal/30 px-2 py-0.5 rounded">{currentRound.mechanic}</span>
            </div>

            {/* Симуляция */}
            <div className="p-3 border-b border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Симуляция</p>
              <div className="grid gap-1.5">
                <button onClick={() => handleAutoSubmit("team_wins")} className="text-xs px-3 py-2 rounded-lg border border-acid/40 text-acid hover:bg-acid/10 transition-colors">✦ Команда побеждает</button>
                <button onClick={() => handleAutoSubmit("saboteur_wins")} className="text-xs px-3 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors">☠ Саботажник побеждает</button>
                <button onClick={() => handleAutoSubmit("tie")} className="text-xs px-3 py-2 rounded-lg border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 transition-colors">⚡ Ничья / Шутка</button>
              </div>
              <button onClick={() => handleAutoSubmit("team_wins", false)} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-muted-foreground w-full mt-1">Только заполнить (без итога)</button>
              <p className="text-xs text-muted-foreground mt-1.5">Сабмитов: {submissions.length}</p>
              {phase === "playing" && submissions.length > 0 && (
                <button onClick={handleAdvance} className="text-xs px-3 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 w-full mt-1.5 transition-colors">▶ Подвести итог</button>
              )}
            </div>

            {/* Игроки */}
            <div className="p-3 border-b border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Игроки</p>
              <div className="grid gap-1.5">
                {players.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <button onClick={() => setViewAs(p.id)} className={"text-xs px-2 py-1.5 rounded-lg border transition-all flex-1 text-left " + (viewAs === p.id ? "border-portal bg-portal/10 text-portal" : "border-border text-foreground")}>{p.display_name}</button>
                    <button onClick={() => setSaboteurId(p.id)} className={"text-xs px-2 py-1 rounded border transition-all " + (p.id === saboteurId ? "border-destructive text-destructive bg-destructive/10" : "border-border text-muted-foreground")}>
                      {p.id === saboteurId ? "САБ" : "ком"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Превью игрока */}
            <div className="p-3 flex-1 overflow-hidden">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Вид игрока</p>
              <div className="rounded-xl overflow-hidden border border-border" style={{ height: 280 }}>
                <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%", pointerEvents: "none" }}>
                  <RoundRouter round={currentRound} isHost={false} runId="test-run" roomId="test-room" playerId={viewAs} isSaboteur={viewAs === saboteurId} submissions={submissions} playerCount={players.length} players={players} onSubmit={handleSubmit} />
                </div>
              </div>
            </div>

            {/* Prev/Next */}
            <div className="p-3 border-t border-border flex gap-2">
              {selectedIndex > 0 && <button onClick={() => selectRound(selectedIndex - 1)} className="flex-1 text-xs px-2 py-2 rounded-lg border border-border hover:border-muted-foreground transition-colors">← Пред</button>}
              {selectedIndex < rounds.length - 1 && <button onClick={() => selectRound(selectedIndex + 1)} className="flex-1 text-xs px-2 py-2 rounded-lg border border-portal/40 text-portal hover:bg-portal/10 transition-colors">След →</button>}
            </div>
          </div>
        </div>
      )}

      {/* FINAL TAB */}
      {tab === "final" && (
        <div className="flex-1 relative">
          <div className="flex gap-3 p-4 z-10 relative">
            <button onClick={() => setFinalScenario("team_wins")} className={"px-4 py-2 rounded-lg border text-sm transition-all " + (finalScenario === "team_wins" ? "border-acid text-acid bg-acid/10" : "border-border text-muted-foreground")}>Команда победила</button>
            <button onClick={() => setFinalScenario("saboteur_wins")} className={"px-4 py-2 rounded-lg border text-sm transition-all " + (finalScenario === "saboteur_wins" ? "border-destructive text-destructive bg-destructive/10" : "border-border text-muted-foreground")}>Саботажник победил</button>
          </div>
          {(() => {
            const ending = finalScenario === "team_wins" ? config.endings?.team_wins : config.endings?.saboteur_wins;
            return (
              <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-8 gap-6">
                <BackgroundImage imagePath={(ending as any)?.background_image} />
                {currentReplica && <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onGenericReplicaFinished} />}
                <p className={"text-5xl font-display relative z-10 " + (finalScenario === "team_wins" ? "text-acid" : "text-destructive")}>
                  {finalScenario === "team_wins" ? "Команда победила!" : "Саботажник победил!"}
                </p>
                <button onClick={() => { const q: any[] = []; if ((ending as any)?.host_line) q.push({ speaker: "host", text: (ending as any).host_line, audioPath: (ending as any).host_line_audio }); if ((ending as any)?.morty_line) q.push({ speaker: "morty", text: (ending as any).morty_line, audioPath: (ending as any).morty_line_audio }); startReplicas(q); }} className="bg-portal text-portal-foreground px-6 py-3 rounded-lg font-display relative z-10">▶ Реплики финала</button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
