import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { MediaUpload } from "@/components/MediaUpload";

type Round = {
  id: string; mechanic: string; title: string;
  intro_host: string; intro_morty: string;
  success_host: string; success_morty: string;
  fail_host: string; fail_morty: string;
  prompt?: string; situation?: string; hint?: string; prompt_prefix?: string;
  options?: any[]; questions?: any[]; player_options?: string[];
  points: { team_success: number; saboteur_success: number };
  [key: string]: any;
};

type ComicFrame = { id: string; caption?: string; image?: string; host_line?: string; host_line_audio?: string; morty_line?: string; morty_line_audio?: string; };
type PartyGame = {
  intro: { host_line: string; morty_line: string; situation: string; comic_frames?: ComicFrame[] };
  endings: {
    team_wins: { host_line: string; morty_line: string };
    saboteur_wins: { host_line: string; morty_line: string };
    team_found_but_lost: { host_line: string; morty_line: string };
    team_won_but_missed: { host_line: string; morty_line: string };
  };
  rounds: Round[];
  scoring: { team_win_threshold: number; saboteur_win_threshold: number };
};

const ROUND_TEXT_FIELDS: Record<string, string[]> = {
  joke_vote:     ["title","prompt","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty","tie_host","tie_morty"],
  fork:          ["title","situation","hint","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  guess_author:  ["title","prompt_prefix","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  pitch:         ["title","situation","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  blitz:         ["title","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  quiz:          ["title","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  vote_saboteur: ["title","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
};

const FIELD_LABELS: Record<string, string> = {
  title: "Заголовок", prompt: "Вопрос игрокам", situation: "Описание ситуации",
  hint: "Подсказка", prompt_prefix: "Начало фразы",
  intro_host: "Рик (вступление)", intro_morty: "Морти (вступление)",
  success_host: "Рик (успех)", success_morty: "Морти (успех)",
  fail_host: "Рик (провал)", fail_morty: "Морти (провал)", tie_host: "Рик (ничья)", tie_morty: "Морти (ничья)",
};

const ENDING_LABELS: Record<string, string> = {
  team_wins: "Команда победила", saboteur_wins: "Саботажник победил",
  team_found_but_lost: "Нашли, но проиграли", team_won_but_missed: "Победили, но не нашли",
};

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const isLong = (value?.length ?? 0) > 80;
  return (
    <div className="grid gap-1">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      {isLong ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-portal" />
      ) : (
        <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-portal" />
      )}
    </div>
  );
}

function RoundEditor({ round, index, onChange, scenarioId }: { round: Round; index: number; onChange: (r: Round) => void; scenarioId: string }) {
  const [open, setOpen] = useState(false);
  const fields = ROUND_TEXT_FIELDS[round.mechanic] ?? [];
  const updateField = (key: string, value: string) => onChange({ ...round, [key]: value });
  const updateQuestion = (qi: number, field: string, value: string) => {
    const qs = [...(round.questions ?? [])];
    qs[qi] = { ...qs[qi], [field]: value };
    onChange({ ...round, questions: qs });
  };
  const updateOption = (qi: number, oi: number, value: string) => {
    const qs = [...(round.questions ?? [])];
    const opts = [...(qs[qi].options ?? [])];
    opts[oi] = { ...opts[oi], label: value };
    qs[qi] = { ...qs[qi], options: opts };
    onChange({ ...round, questions: qs });
  };
  const updateForkOption = (oi: number, value: string) => {
    const opts = [...(round.options ?? [])];
    opts[oi] = { ...opts[oi], label: value };
    onChange({ ...round, options: opts });
  };
  const updatePlayerOption = (oi: number, value: string) => {
    const opts = [...(round.player_options ?? [])];
    opts[oi] = value;
    onChange({ ...round, player_options: opts });
  };
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-portal border border-portal/30 px-2 py-0.5 rounded-sm">{index + 1}</span>
          <span className="font-mono text-xs text-muted-foreground uppercase">{round.mechanic}</span>
          <span className="font-display text-base">{round.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 grid gap-4 border-t border-border">
          <div className="mt-4 grid gap-4">
            <div className="grid gap-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Фон раунда</p>
            <MediaUpload scenarioId={scenarioId} path={"rounds/" + round.id + "/background"} type="image"
              currentUrl={round.background_image}
              onUploaded={(p) => updateField("background_image", p)}
              onRemoved={() => updateField("background_image", "")} />
          </div>
          <div className="grid gap-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Фон победы команды</p>
            <MediaUpload scenarioId={scenarioId} path={"rounds/" + round.id + "/result_success"} type="image"
              currentUrl={round.result_success_image}
              onUploaded={(p) => updateField("result_success_image", p)}
              onRemoved={() => updateField("result_success_image", "")} />
          </div>
          <div className="grid gap-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Фон победы саботажника</p>
            <MediaUpload scenarioId={scenarioId} path={"rounds/" + round.id + "/result_fail"} type="image"
              currentUrl={round.result_fail_image}
              onUploaded={(p) => updateField("result_fail_image", p)}
              onRemoved={() => updateField("result_fail_image", "")} />
          </div>
          <div className="grid gap-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Фон ничьей</p>
            <MediaUpload scenarioId={scenarioId} path={"rounds/" + round.id + "/result_tie"} type="image"
              currentUrl={round.result_tie_image}
              onUploaded={(p) => updateField("result_tie_image", p)}
              onRemoved={() => updateField("result_tie_image", "")} />
          </div>
          {round.options?.some((o: any) => o.is_joke) && (
            <div className="grid gap-1 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-xs uppercase tracking-widest text-yellow-500 mb-2">Шутливый вариант (только в этом раунде)</p>
              <p className="text-xs text-muted-foreground mb-2">Фон при выборе шутки</p>
              <MediaUpload scenarioId={scenarioId} path={"rounds/" + round.id + "/result_joke"} type="image"
                currentUrl={(round as any).result_joke_image}
                onUploaded={(p) => updateField("result_joke_image", p)}
                onRemoved={() => updateField("result_joke_image", "")} />
            </div>
          )}
          {fields.map((f) => (
              <div key={f} className="grid gap-1">
                <TextField label={FIELD_LABELS[f] ?? f} value={round[f] ?? ""} onChange={(v) => updateField(f, v)} />
                {f.includes("host") || f.includes("morty") ? (
                  <MediaUpload
                    scenarioId={round.id}
                    path={f}
                    type="audio"
                    currentUrl={round[f + "_audio"]}
                    onUploaded={(path) => updateField(f + "_audio", path)}
                    onRemoved={() => updateField(f + "_audio", "")}
                  />
                ) : null}
              </div>
            ))}
          </div>
          {round.mechanic === "fork" && round.options && (
            <div className="grid gap-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Варианты выбора</p>
              {round.options.map((opt: any, oi: number) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="text-portal font-display w-6">{opt.id}</span>
                  <input type="text" value={opt.label} onChange={(e) => updateForkOption(oi, e.target.value)}
                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
                  {opt.is_correct && <span className="text-xs text-portal">правильный</span>}
                </div>
              ))}
            </div>
          )}
          {round.mechanic === "pitch" && round.player_options && (
            <div className="grid gap-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Идеи игроков</p>
              {round.player_options.map((opt: string, oi: number) => (
                <div key={oi} className="flex items-center gap-2">
                  <span className="text-portal font-display w-6 text-sm">{oi + 1}</span>
                  <input type="text" value={opt} onChange={(e) => updatePlayerOption(oi, e.target.value)}
                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
                </div>
              ))}
            </div>
          )}
          {(round.mechanic === "blitz" || round.mechanic === "quiz") && round.questions && (
            <div className="grid gap-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Вопросы</p>
              {round.questions.map((q: any, qi: number) => (
                <div key={q.id} className="bg-muted/30 rounded-lg p-4 grid gap-3">
                  <TextField label={"Вопрос " + (qi + 1)} value={q.text} onChange={(v) => updateQuestion(qi, "text", v)} />
                  <p className="text-xs text-muted-foreground">Варианты выбора</p>
                  {q.options?.map((opt: any, oi: number) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className={"font-display w-6 text-sm " + (opt.id === q.correct_id ? "text-portal" : "text-muted-foreground")}>
                        {opt.id.toUpperCase()}
                      </span>
                      <input type="text" value={opt.label} onChange={(e) => updateOption(qi, oi, e.target.value)}
                        className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
                      {opt.id === q.correct_id && <span className="text-xs text-portal">правильный</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminScenarioEdit() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceRub, setPriceRub] = useState(250);
  const [partyGame, setPartyGame] = useState<PartyGame | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [scenarioJson, setScenarioJson] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tab, setTab] = useState<"basic"|"intro"|"roles"|"rounds"|"endings">("basic");

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);

  useEffect(() => {
    if (!user || !scenarioId) return;
    supabase.from("profiles").select("role").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.role !== "admin") navigate("/catalog");
    });
    supabase.from("scenarios").select("*").eq("id", scenarioId).single().then(({ data }) => {
      if (!data) { navigate("/admin/scenarios"); return; }
      setTitle(data.title);
      setDescription(data.description);
      setPriceRub(data.price_rub ?? 250);
      setScenarioJson(data.scenario_json);
      if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);
      setCharacters(data.scenario_json?.characters ?? []);
      setCharacters(data.scenario_json?.characters ?? []);
      setPageLoading(false);
    });
  }, [user, scenarioId, navigate]);

  const handleSave = async () => {
    if (!scenarioId) return;
    setSaving(true);
    const newJson = { ...scenarioJson, ...(partyGame ? { party_game: partyGame } : {}), characters };
    const { error } = await supabase.from("scenarios")
      .update({ title, description, price_rub: priceRub, scenario_json: newJson })
      .eq("id", scenarioId);
    if (error) toast.error("Ошибка: " + error.message);
    else toast.success("Сохранено!");
    setSaving(false);
  };

  const updateRound = (index: number, round: Round) => {
    if (!partyGame) return;
    const rounds = [...partyGame.rounds];
    rounds[index] = round;
    setPartyGame({ ...partyGame, rounds });
  };

  const updateEnding = (key: string, field: "host_line" | "morty_line", value: string) => {
    if (!partyGame) return;
    setPartyGame({ ...partyGame, endings: { ...partyGame.endings, [key]: { ...(partyGame.endings as any)[key], [field]: value } } });
  };

  if (loading || pageLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-portal" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 container max-w-4xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/scenarios")} className="text-muted-foreground hover:text-foreground text-sm">назад</button>
            <span className="font-mono text-xs text-portal border border-portal/30 px-2 py-0.5 rounded-sm">{scenarioId}</span>
            <h1 className="font-display text-2xl">{title}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-portal text-portal-foreground gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
          </Button>
        </div>
        <div className="flex gap-1 mb-6 border-b border-border">
          {([["basic","Основное"],["intro","Вступление"],["roles","Персонажи"],["rounds","Раунды ("+String(partyGame?.rounds?.length ?? 0)+")"],["endings","Концовки"]] as [string,string][]).map(([id,label]) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={"px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors " + (tab === id ? "text-portal border-b-2 border-portal" : "text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>
        {tab === "basic" && (
          <div className="grid gap-4">
            <TextField label="Основное" value={title} onChange={setTitle} />
            <TextField label="Основное" value={description} onChange={setDescription} />
            <div className="grid gap-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Цена (рублей)</label>
              <input type="number" value={priceRub} onChange={(e) => setPriceRub(Number(e.target.value))}
                className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
            </div>
          </div>
        )}
        {tab === "intro" && partyGame && (
          <div className="grid gap-4">
            <TextField label="Основное" value={partyGame.intro.situation} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, situation: v } })} />
            <div className="grid gap-1">
              <TextField label="Реплика Рика" value={partyGame.intro.host_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line: v } })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/host_line" type="audio"
                currentUrl={partyGame.intro.host_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line_audio: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line_audio: "" } })} />
            </div>
            <div className="grid gap-1">
              <TextField label="Реплика Морти" value={partyGame.intro.morty_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line: v } })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/morty_line" type="audio"
                currentUrl={partyGame.intro.morty_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line_audio: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line_audio: "" } })} />
            </div>
            <div className="grid gap-1 border border-portal/20 rounded-lg p-4">
              <p className="text-xs uppercase tracking-widest text-portal mb-2">Реплика Рика (показ роли)</p>
              <TextField label="Текст реплики" value={(partyGame.intro as any).character_reveal_host_line ?? ""} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, character_reveal_host_line: v } as any })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/character_reveal" type="audio"
                currentUrl={(partyGame.intro as any).character_reveal_host_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, character_reveal_host_line_audio: p } as any })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, character_reveal_host_line_audio: "" } as any })} />
            </div>
            <div className="grid gap-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Фоновое изображение</p>
              <MediaUpload scenarioId={scenarioId!} path="intro/background" type="image"
                currentUrl={partyGame.intro.background_image}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_image: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_image: "" } })} />
            </div>
            <div className="grid gap-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Фоновая музыка</p>
              <MediaUpload scenarioId={scenarioId!} path="intro/music" type="audio"
                currentUrl={partyGame.intro.background_music}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_music: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_music: "" } })} />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Кадры комикса</p>
                <button onClick={() => {
                  const frames = partyGame.intro.comic_frames ?? [];
                  const newFrame = { id: "frame-" + Date.now(), caption: "", image: "", host_line: "", host_line_audio: "", morty_line: "", morty_line_audio: "" };
                  setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: [...frames, newFrame] } });
                }} className="flex items-center gap-1 text-xs text-portal border border-portal/30 px-2 py-1 rounded hover:bg-portal/10">
                  <Plus className="w-3 h-3" /> Добавить кадр
                </button>
              </div>
              {(partyGame.intro.comic_frames ?? []).map((frame, fi) => (
                <div key={frame.id} className="glass-card p-4 grid gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-portal">Кадр {fi + 1}</p>
                    <button onClick={() => {
                      const frames = (partyGame.intro.comic_frames ?? []).filter((_, i) => i !== fi);
                      setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } });
                    }} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Изображение</p>
                    <MediaUpload scenarioId={scenarioId!} path={"intro/comic/" + frame.id + "/image"} type="image"
                      currentUrl={frame.image}
                      onUploaded={(p) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], image: p }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }}
                      onRemoved={() => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], image: "" }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                  </div>
                  <TextField label="Подпись кадра" value={frame.caption ?? ""} onChange={(v) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], caption: v }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                  <div className="grid gap-1">
                    <TextField label="Реплика Рика" value={frame.host_line ?? ""} onChange={(v) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], host_line: v }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                    <MediaUpload scenarioId={scenarioId!} path={"intro/comic/" + frame.id + "/rick"} type="audio"
                      currentUrl={frame.host_line_audio}
                      onUploaded={(p) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], host_line_audio: p }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }}
                      onRemoved={() => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], host_line_audio: "" }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                  </div>
                  <div className="grid gap-1">
                    <TextField label="Реплика Морти" value={frame.morty_line ?? ""} onChange={(v) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], morty_line: v }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                    <MediaUpload scenarioId={scenarioId!} path={"intro/comic/" + frame.id + "/morty"} type="audio"
                      currentUrl={frame.morty_line_audio}
                      onUploaded={(p) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], morty_line_audio: p }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }}
                      onRemoved={() => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], morty_line_audio: "" }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Порог победы команды</label>
                <input type="number" value={partyGame.scoring.team_win_threshold}
                  onChange={(e) => setPartyGame({ ...partyGame, scoring: { ...partyGame.scoring, team_win_threshold: Number(e.target.value) } })}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Порог победы саботажника</label>
                <input type="number" value={partyGame.scoring.saboteur_win_threshold}
                  onChange={(e) => setPartyGame({ ...partyGame, scoring: { ...partyGame.scoring, saboteur_win_threshold: Number(e.target.value) } })}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
          </div>
        )}
        {tab === "roles" && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Персонажи (до 8)</p>
              {characters.length < 8 && (
                <button onClick={() => setCharacters([...characters, { id: "char-" + Date.now(), name: "", description: "", traits: [] }])}
                  className="flex items-center gap-1 text-xs text-portal border border-portal/30 px-2 py-1 rounded hover:bg-portal/10">
                  <Plus className="w-3 h-3" /> Добавить
                </button>
              )}
            </div>
            {characters.map((char, ci) => (
              <div key={char.id} className="glass-card p-5 grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-portal">#{ci + 1}</span>
                  <button onClick={() => setCharacters(characters.filter((_, i) => i !== ci))}
                    className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                </div>
                <TextField label="Имя" value={char.name} onChange={(v) => { const arr = [...characters]; arr[ci] = { ...arr[ci], name: v }; setCharacters(arr); }} />
                <TextField label="Описание" value={char.description} onChange={(v) => { const arr = [...characters]; arr[ci] = { ...arr[ci], description: v }; setCharacters(arr); }} />
                <div className="grid gap-1">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Черты (через запятую)</label>
                  <input type="text" value={(char.traits ?? []).join(", ")}
                    onChange={(e) => { const arr = [...characters]; arr[ci] = { ...arr[ci], traits: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }; setCharacters(arr); }}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "rounds" && partyGame && (
          <div className="grid gap-3">
            {partyGame.rounds.map((round, i) => (
              <RoundEditor key={round.id} round={round} index={i} onChange={(r) => updateRound(i, r)} scenarioId={scenarioId!} />
            ))}
          </div>
        )}
        {tab === "endings" && partyGame && (
          <div className="grid gap-6">
            {Object.entries(partyGame.endings).map(([key, ending]) => (
              <div key={key} className="glass-card p-5 grid gap-3">
                <p className="font-display text-base text-portal">{ENDING_LABELS[key] ?? key}</p>
                <div className="grid gap-1">
                  <TextField label="Реплика Рика" value={(ending as any).host_line} onChange={(v) => updateEnding(key, "host_line", v)} />
                  <MediaUpload scenarioId={scenarioId!} path={`endings/${key}/host_line`} type="audio"
                    currentUrl={(ending as any).host_line_audio}
                    onUploaded={(p) => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], host_line_audio: p } } })}
                    onRemoved={() => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], host_line_audio: "" } } })} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Реплика Морти" value={(ending as any).morty_line} onChange={(v) => updateEnding(key, "morty_line", v)} />
                  <MediaUpload scenarioId={scenarioId!} path={`endings/${key}/morty_line`} type="audio"
                    currentUrl={(ending as any).morty_line_audio}
                    onUploaded={(p) => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], morty_line_audio: p } } })}
                    onRemoved={() => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], morty_line_audio: "" } } })} />
                </div>
                <div className="grid gap-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Фоновое изображение</p>
                  <MediaUpload scenarioId={scenarioId!} path={`endings/${key}/background`} type="image"
                    currentUrl={(ending as any).background_image}
                    onUploaded={(p) => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], background_image: p } } })}
                    onRemoved={() => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], background_image: "" } } })} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-between items-center"><Link to={"/admin/scenarios/" + scenarioId + "/test"} className="text-sm px-4 py-2 rounded-lg border border-portal/40 text-portal hover:bg-portal/10 transition-all">Test Rounds</Link>
          <Button onClick={handleSave} disabled={saving} className="bg-portal text-portal-foreground gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить изменения
          </Button>
        </div>
      </main>
    </div>
  );
}
