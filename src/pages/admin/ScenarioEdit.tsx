import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { MediaUpload } from "@/components/MediaUpload";

type PreviewJson = {
  tagline?: string;
  full_description?: string;
  warning?: string;
  host_quote?: string;
  morty_quote?: string;
  duration_minutes?: number;
  players_min?: number;
  players_max?: number;
  difficulty?: string;
  replayable?: boolean;
  age_rating?: string;
  cover_image?: string;
};

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

type PartyGame = {
  intro: { host_line: string; host_line_audio?: string; morty_line: string; morty_line_audio?: string; situation: string; background_image?: string; background_music?: string; [key: string]: any };
  endings: {
    team_wins: { host_line: string; morty_line: string; host_line_audio?: string; morty_line_audio?: string; background_image?: string; [key: string]: any };
    saboteur_wins: { host_line: string; morty_line: string; host_line_audio?: string; morty_line_audio?: string; background_image?: string; [key: string]: any };
    team_found_but_lost: { host_line: string; morty_line: string; host_line_audio?: string; morty_line_audio?: string; background_image?: string; [key: string]: any };
    team_won_but_missed: { host_line: string; morty_line: string; host_line_audio?: string; morty_line_audio?: string; background_image?: string; [key: string]: any };
  };
  rounds: Round[];
  scoring: { team_win_threshold: number; saboteur_win_threshold: number };
};

const ROUND_TEXT_FIELDS: Record<string, string[]> = {
  joke_vote:     ["title","prompt","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty","tie_host","tie_morty"],
  fork:          ["title","situation","hint","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty","tie_host","tie_morty"],
  guess_author:  ["title","prompt_prefix","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  pitch:         ["title","situation","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  blitz:         ["title","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  quiz:          ["title","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
  vote_saboteur: ["title","intro_host","intro_morty","success_host","success_morty","fail_host","fail_morty"],
};

const FIELD_LABELS: Record<string, string> = {
  title: "Ð—Ð°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº", prompt: "Ð’Ð¾Ð¿Ñ€Ð¾Ñ Ð¸Ð³Ñ€Ð¾ÐºÐ°Ð¼", situation: "ÐžÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ ÑÐ¸Ñ‚ÑƒÐ°Ñ†Ð¸Ð¸",
  hint: "ÐŸÐ¾Ð´ÑÐºÐ°Ð·ÐºÐ°", prompt_prefix: "ÐÐ°Ñ‡Ð°Ð»Ð¾ Ñ„Ñ€Ð°Ð·Ñ‹",
  intro_host: "Ð Ð¸Ðº (Ð²ÑÑ‚ÑƒÐ¿Ð»ÐµÐ½Ð¸Ðµ)", intro_morty: "ÐœÐ¾Ñ€Ñ‚Ð¸ (Ð²ÑÑ‚ÑƒÐ¿Ð»ÐµÐ½Ð¸Ðµ)",
  success_host: "Ð Ð¸Ðº (ÑƒÑÐ¿ÐµÑ…)", success_morty: "ÐœÐ¾Ñ€Ñ‚Ð¸ (ÑƒÑÐ¿ÐµÑ…)",
  fail_host: "Ð Ð¸Ðº (Ð¿Ñ€Ð¾Ð²Ð°Ð»)", fail_morty: "ÐœÐ¾Ñ€Ñ‚Ð¸ (Ð¿Ñ€Ð¾Ð²Ð°Ð»)",
  tie_host: "Рик (ничья)", tie_morty: "Морти (ничья)",
};

const ENDING_LABELS: Record<string, string> = {
  team_wins: "ÐšÐ¾Ð¼Ð°Ð½Ð´Ð° Ð¿Ð¾Ð±ÐµÐ´Ð¸Ð»Ð°", saboteur_wins: "Ð¡Ð°Ð±Ð¾Ñ‚Ð°Ð¶Ð½Ð¸Ðº Ð¿Ð¾Ð±ÐµÐ´Ð¸Ð»",
  team_found_but_lost: "ÐÐ°ÑˆÐ»Ð¸, Ð½Ð¾ Ð¿Ñ€Ð¾Ð¸Ð³Ñ€Ð°Ð»Ð¸", team_won_but_missed: "ÐŸÐ¾Ð±ÐµÐ´Ð¸Ð»Ð¸, Ð½Ð¾ Ð½Ðµ Ð½Ð°ÑˆÐ»Ð¸",
};

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const isLong = (value?.length ?? 0) > 80;
  return (
    <div className="grid gap-1">
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      {isLong ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-y min-h-[80px] focus:outline-none focus:border-portal" />
      ) : (
        <input type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-portal" />
      )}
    </div>
  );
}

function RoundEditor({ round, index, onChange }: { round: Round; index: number; onChange: (r: Round) => void }) {
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
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Ð’Ð°Ñ€Ð¸Ð°Ð½Ñ‚Ñ‹ Ð²Ñ‹Ð±Ð¾Ñ€Ð°</p>
                {round.options.length < 6 && (
                  <button onClick={() => {
                    const ids = ["A","B","C","D","E","F"];
                    const newOpt = { id: ids[round.options.length], label: "", is_correct: false, is_joke: false };
                    onChange({ ...round, options: [...round.options, newOpt] });
                  }} className="text-xs text-portal border border-portal/30 px-2 py-1 rounded hover:bg-portal/10 transition-colors">
                    + Ð’Ð°Ñ€Ð¸Ð°Ð½Ñ‚
                  </button>
                )}
              </div>
              {round.options.map((opt: any, oi: number) => (
                <div key={opt.id} className="glass-card p-3 grid gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-portal font-display w-6 shrink-0">{opt.id}</span>
                    <input type="text" value={opt.label} onChange={(e) => updateForkOption(oi, e.target.value)}
                      className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
                    <button onClick={() => {
                      const opts = round.options.filter((_: any, i: number) => i !== oi);
                      onChange({ ...round, options: opts });
                    }} className="text-muted-foreground hover:text-destructive text-xs px-2">âœ•</button>
                  </div>
                  <div className="flex items-center gap-4 pl-8">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={opt.is_correct ?? false}
                        onChange={(e) => {
                          const opts = [...round.options];
                          opts[oi] = { ...opts[oi], is_correct: e.target.checked };
                          onChange({ ...round, options: opts });
                        }} className="accent-portal w-3 h-3" />
                      ÐŸÑ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ñ‹Ð¹
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={opt.is_joke ?? false}
                        onChange={(e) => {
                          const opts = [...round.options];
                          opts[oi] = { ...opts[oi], is_joke: e.target.checked };
                          onChange({ ...round, options: opts });
                        }} className="accent-yellow-500 w-3 h-3" />
                      Ð¨ÑƒÑ‚Ð»Ð¸Ð²Ñ‹Ð¹
                    </label>
                  </div>
                  {opt.is_joke && (
                    <div className="pl-8 grid gap-2">
                      <div className="grid gap-1">
                        <input type="text" value={opt.joke_host_line ?? ""} placeholder="Ð ÐµÐ¿Ð»Ð¸ÐºÐ° Ð Ð¸ÐºÐ° Ð¿Ñ€Ð¸ Ð²Ñ‹Ð±Ð¾Ñ€Ðµ ÑˆÑƒÑ‚ÐºÐ¸"
                          onChange={(e) => {
                            const opts = [...round.options];
                            opts[oi] = { ...opts[oi], joke_host_line: e.target.value };
                            onChange({ ...round, options: opts });
                          }}
                          className="w-full bg-muted border border-yellow-500/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-yellow-500" />
                        <MediaUpload scenarioId={round.id} path={`joke_host_${oi}`} type="audio"
                          currentUrl={opt.joke_host_audio}
                          onUploaded={(p) => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_host_audio: p }; onChange({ ...round, options: opts }); }}
                          onRemoved={() => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_host_audio: "" }; onChange({ ...round, options: opts }); }} />
                      </div>
                      <div className="grid gap-1">
                        <input type="text" value={opt.joke_morty_line ?? ""} placeholder="Ð ÐµÐ¿Ð»Ð¸ÐºÐ° ÐœÐ¾Ñ€Ñ‚Ð¸ Ð¿Ñ€Ð¸ Ð²Ñ‹Ð±Ð¾Ñ€Ðµ ÑˆÑƒÑ‚ÐºÐ¸"
                          onChange={(e) => {
                            const opts = [...round.options];
                            opts[oi] = { ...opts[oi], joke_morty_line: e.target.value };
                            onChange({ ...round, options: opts });
                          }}
                          className="w-full bg-muted border border-yellow-500/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-yellow-500" />
                        <MediaUpload scenarioId={round.id} path={`joke_morty_${oi}`} type="audio"
                          currentUrl={opt.joke_morty_audio}
                          onUploaded={(p) => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_morty_audio: p }; onChange({ ...round, options: opts }); }}
                          onRemoved={() => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_morty_audio: "" }; onChange({ ...round, options: opts }); }} />
                      </div>
                      <div className="grid gap-1">
                        <p className="text-xs text-muted-foreground">ÐšÐ°Ñ€Ñ‚Ð¸Ð½ÐºÐ° Ð¿Ñ€Ð¸ Ð²Ñ‹Ð±Ð¾Ñ€Ðµ ÑˆÑƒÑ‚ÐºÐ¸</p>
                        <MediaUpload scenarioId={round.id} path={`joke_image_${oi}`} type="image"
                          currentUrl={opt.joke_image}
                          onUploaded={(p) => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_image: p }; onChange({ ...round, options: opts }); }}
                          onRemoved={() => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_image: "" }; onChange({ ...round, options: opts }); }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {round.mechanic === "pitch" && round.player_options && (
            <div className="grid gap-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Ð˜Ð´ÐµÐ¸ Ð¸Ð³Ñ€Ð¾ÐºÐ¾Ð²</p>
              {round.player_options.map((opt: string, oi: number) => (
                <div key={oi} className="flex items-center gap-2">
                  <span className="text-portal font-display w-6 text-sm">{oi + 1}</span>
                  <input type="text" value={opt} onChange={(e) => updatePlayerOption(oi, e.target.value)}
                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
                </div>
              ))}
            </div>
          )}
          {round.mechanic === "situation_deduction" && (
            <div className="grid gap-4">
              <TextField label="ÐÐ°ÑÑ‚Ð¾ÑÑ‰Ð°Ñ ÑÐ¸Ñ‚ÑƒÐ°Ñ†Ð¸Ñ (Ð´Ð»Ñ Ð¸Ð³Ñ€Ð¾ÐºÐ¾Ð²)" value={round.situation_real ?? ""} onChange={(v) => updateField("situation_real", v)} />
              <TextField label="Ð¡Ð¸Ñ‚ÑƒÐ°Ñ†Ð¸Ñ ÑÐ°Ð±Ð¾Ñ‚Ð°Ð¶Ð½Ð¸ÐºÐ° (Ð´Ñ€ÑƒÐ³Ð°Ñ)" value={round.situation_fake ?? ""} onChange={(v) => updateField("situation_fake", v)} />
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Ð—Ð°Ð¿Ñ€ÐµÑ‰Ñ‘Ð½Ð½Ñ‹Ðµ ÑÐ»Ð¾Ð²Ð° (Ñ‡ÐµÑ€ÐµÐ· Ð·Ð°Ð¿ÑÑ‚ÑƒÑŽ)</label>
                <input type="text"
                  value={(round.forbidden_words ?? []).join(", ")}
                  onChange={(e) => updateField("forbidden_words", e.target.value.split(",").map((w: string) => w.trim()).filter(Boolean) as any)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Ð’Ñ€ÐµÐ¼Ñ Ð½Ð° Ð²Ð¾Ð¿Ñ€Ð¾Ñ (ÑÐµÐº)</label>
                <input type="number" value={round.question_time_seconds ?? 20}
                  onChange={(e) => updateField("question_time_seconds", Number(e.target.value) as any)}
                  className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-3 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Ð ÐµÐ¿Ð»Ð¸ÐºÐ¸ Ð²ÐµÐ´ÑƒÑ‰Ð¸Ñ…</p>
                <div className="grid gap-1">
                  <TextField label="Ð Ð¸Ðº â€” Ð²ÑÑ‚ÑƒÐ¿Ð»ÐµÐ½Ð¸Ðµ" value={round.intro_host ?? ""} onChange={(v) => updateField("intro_host", v)} />
                  <MediaUpload scenarioId={round.id} path="intro_host" type="audio" currentUrl={round.intro_host_audio}
                    onUploaded={(p) => updateField("intro_host_audio", p as any)} onRemoved={() => updateField("intro_host_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="ÐœÐ¾Ñ€Ñ‚Ð¸ â€” Ð²ÑÑ‚ÑƒÐ¿Ð»ÐµÐ½Ð¸Ðµ" value={round.intro_morty ?? ""} onChange={(v) => updateField("intro_morty", v)} />
                  <MediaUpload scenarioId={round.id} path="intro_morty" type="audio" currentUrl={round.intro_morty_audio}
                    onUploaded={(p) => updateField("intro_morty_audio", p as any)} onRemoved={() => updateField("intro_morty_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Ð Ð¸Ðº â€” ÐºÐ¾Ð¼Ð°Ð½Ð´Ð° Ð¿Ð¾Ð±ÐµÐ´Ð¸Ð»Ð°" value={round.success_host ?? ""} onChange={(v) => updateField("success_host", v)} />
                  <MediaUpload scenarioId={round.id} path="success_host" type="audio" currentUrl={round.success_host_audio}
                    onUploaded={(p) => updateField("success_host_audio", p as any)} onRemoved={() => updateField("success_host_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="ÐœÐ¾Ñ€Ñ‚Ð¸ â€” ÐºÐ¾Ð¼Ð°Ð½Ð´Ð° Ð¿Ð¾Ð±ÐµÐ´Ð¸Ð»Ð°" value={round.success_morty ?? ""} onChange={(v) => updateField("success_morty", v)} />
                  <MediaUpload scenarioId={round.id} path="success_morty" type="audio" currentUrl={round.success_morty_audio}
                    onUploaded={(p) => updateField("success_morty_audio", p as any)} onRemoved={() => updateField("success_morty_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Ð Ð¸Ðº â€” ÑÐ°Ð±Ð¾Ñ‚Ð°Ð¶Ð½Ð¸Ðº Ð¿Ð¾Ð±ÐµÐ´Ð¸Ð»" value={round.fail_host ?? ""} onChange={(v) => updateField("fail_host", v)} />
                  <MediaUpload scenarioId={round.id} path="fail_host" type="audio" currentUrl={round.fail_host_audio}
                    onUploaded={(p) => updateField("fail_host_audio", p as any)} onRemoved={() => updateField("fail_host_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="ÐœÐ¾Ñ€Ñ‚Ð¸ â€” ÑÐ°Ð±Ð¾Ñ‚Ð°Ð¶Ð½Ð¸Ðº Ð¿Ð¾Ð±ÐµÐ´Ð¸Ð»" value={round.fail_morty ?? ""} onChange={(v) => updateField("fail_morty", v)} />
                  <MediaUpload scenarioId={round.id} path="fail_morty" type="audio" currentUrl={round.fail_morty_audio}
                    onUploaded={(p) => updateField("fail_morty_audio", p as any)} onRemoved={() => updateField("fail_morty_audio", "" as any)} />
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Ð’Ð°Ñ€Ð¸Ð°Ð½Ñ‚Ñ‹ Ð¾Ñ‚Ð²ÐµÑ‚Ð°</p>
                {(round.options ?? []).map((opt: any, oi: number) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className={`font-display w-6 ${opt.id === round.correct_option_id ? "text-portal" : "text-muted-foreground"}`}>{opt.id}</span>
                    <input type="text" value={opt.label}
                      onChange={(e) => {
                        const opts = [...(round.options ?? [])];
                        opts[oi] = { ...opts[oi], label: e.target.value };
                        updateField("options", opts as any);
                      }}
                      className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
                    <button onClick={() => updateField("correct_option_id", opt.id as any)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${opt.id === round.correct_option_id ? "border-portal text-portal bg-portal/10" : "border-border text-muted-foreground hover:border-portal"}`}>
                      {opt.id === round.correct_option_id ? "âœ“ Ð²ÐµÑ€Ð½Ñ‹Ð¹" : "Ð²ÐµÑ€Ð½Ñ‹Ð¹?"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {round.mechanic === "vote_saboteur" && (
            <div className="grid gap-3 border-t border-border pt-4">
              <p className="text-xs uppercase tracking-widest text-yellow-500">Ð ÐµÐ¿Ð»Ð¸ÐºÐ¸ Ð¿Ñ€Ð¸ Ð½Ð¸Ñ‡ÑŒÐµÐ¹</p>
              <div className="grid gap-1">
                <TextField label="Ð Ð¸Ðº â€” Ð½Ð¸Ñ‡ÑŒÑ" value={round.tie_host ?? ""} onChange={(v) => updateField("tie_host", v)} />
                <MediaUpload scenarioId={round.id} path="tie_host" type="audio" currentUrl={round.tie_host_audio}
                  onUploaded={(p) => updateField("tie_host_audio", p as any)}
                  onRemoved={() => updateField("tie_host_audio", "" as any)} />
              </div>
              <div className="grid gap-1">
                <TextField label="ÐœÐ¾Ñ€Ñ‚Ð¸ â€” Ð½Ð¸Ñ‡ÑŒÑ" value={round.tie_morty ?? ""} onChange={(v) => updateField("tie_morty", v)} />
                <MediaUpload scenarioId={round.id} path="tie_morty" type="audio" currentUrl={round.tie_morty_audio}
                  onUploaded={(p) => updateField("tie_morty_audio", p as any)}
                  onRemoved={() => updateField("tie_morty_audio", "" as any)} />
              </div>
            </div>
          )}

          {(round.mechanic === "blitz" || round.mechanic === "quiz") && round.questions && (
            <div className="grid gap-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Ð’Ð¾Ð¿Ñ€Ð¾ÑÑ‹</p>
              {round.questions.map((q: any, qi: number) => (
                <div key={q.id} className="bg-muted/30 rounded-lg p-4 grid gap-3">
                  <TextField label={"Ð’Ð¾Ð¿Ñ€Ð¾Ñ " + (qi + 1)} value={q.text} onChange={(v) => updateQuestion(qi, "text", v)} />
                  <p className="text-xs text-muted-foreground">Ð’Ð°Ñ€Ð¸Ð°Ð½Ñ‚Ñ‹ Ð¾Ñ‚Ð²ÐµÑ‚Ð°</p>
                  {q.options?.map((opt: any, oi: number) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className={"font-display w-6 text-sm " + (opt.id === q.correct_id ? "text-portal" : "text-muted-foreground")}>
                        {opt.id.toUpperCase()}
                      </span>
                      <input type="text" value={opt.label} onChange={(e) => updateOption(qi, oi, e.target.value)}
                        className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
                      {opt.id === q.correct_id && <span className="text-xs text-portal">Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ñ‹Ð¹</span>}
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
  const [scenarioJson, setScenarioJson] = useState<any>(null);
  const [preview, setPreview] = useState<PreviewJson>({});
  const [saving, setSaving] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [tab, setTab] = useState<"basic"|"intro"|"rounds"|"endings">("basic");

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
      if ((data as any).preview_json) setPreview((data as any).preview_json as PreviewJson);
      setPageLoading(false);
    });
  }, [user, scenarioId, navigate]);

  const handleSave = async () => {
    if (!scenarioId) return;
    setSaving(true);
    const newJson = { ...scenarioJson, ...(partyGame ? { party_game: partyGame } : {}) };
    const { error } = await supabase.from("scenarios")
      .update({ title, description, price_rub: priceRub, scenario_json: newJson, preview_json: preview } as any)
      .eq("id", scenarioId);
    if (error) toast.error("ÐžÑˆÐ¸Ð±ÐºÐ°: " + error.message);
    else toast.success("Ð¡Ð¾Ñ…Ñ€Ð°Ð½ÐµÐ½Ð¾!");
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
            <button onClick={() => navigate("/admin/scenarios")} className="text-muted-foreground hover:text-foreground text-sm">Ð½Ð°Ð·Ð°Ð´</button>
            <span className="font-mono text-xs text-portal border border-portal/30 px-2 py-0.5 rounded-sm">{scenarioId}</span>
            <h1 className="font-display text-2xl">{title}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-portal text-portal-foreground gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ
          </Button>
        </div>
        <div className="flex gap-1 mb-6 border-b border-border">
          {([["basic","ÐžÑÐ½Ð¾Ð²Ð½Ð¾Ðµ"],["preview","ÐŸÑ€ÐµÐ²ÑŒÑŽ"],["intro","Ð’ÑÑ‚ÑƒÐ¿Ð»ÐµÐ½Ð¸Ðµ"],["rounds","Ð Ð°ÑƒÐ½Ð´Ñ‹ ("+String(partyGame?.rounds?.length ?? 0)+")"],["endings","ÐšÐ¾Ð½Ñ†Ð¾Ð²ÐºÐ¸"]] as [string,string][]).map(([id,label]) => (
            <button key={id} onClick={() => setTab(id as any)}
              className={"px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors " + (tab === id ? "text-portal border-b-2 border-portal" : "text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>
        {tab === "basic" && (
          <div className="grid gap-4">
            <TextField label="ÐÐ°Ð·Ð²Ð°Ð½Ð¸Ðµ" value={title} onChange={setTitle} />
            <TextField label="ÐžÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ" value={description} onChange={setDescription} />
            <div className="grid gap-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Ð¦ÐµÐ½Ð° (Ñ€ÑƒÐ±Ð»ÐµÐ¹)</label>
              <input type="number" value={priceRub} onChange={(e) => setPriceRub(Number(e.target.value))}
                className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
            </div>
          </div>
        )}
        {tab === "preview" && (
          <div className="grid gap-4">
            <TextField label="Ð¢Ð¸Ð·ÐµÑ€ (Ð¾Ð´Ð½Ð° Ñ„Ñ€Ð°Ð·Ð°)" value={preview.tagline ?? ""} onChange={(v) => setPreview({...preview, tagline: v})} />
            <TextField label="ÐŸÐ¾Ð»Ð½Ð¾Ðµ Ð¾Ð¿Ð¸ÑÐ°Ð½Ð¸Ðµ" value={preview.full_description ?? ""} onChange={(v) => setPreview({...preview, full_description: v})} />
            <TextField label="Ð ÐµÐ¿Ð»Ð¸ÐºÐ° Ð Ð¸ÐºÐ° (Ñ‚Ð¸Ð·ÐµÑ€)" value={preview.host_quote ?? ""} onChange={(v) => setPreview({...preview, host_quote: v})} />
            <TextField label="Ð ÐµÐ¿Ð»Ð¸ÐºÐ° ÐœÐ¾Ñ€Ñ‚Ð¸ (Ñ‚Ð¸Ð·ÐµÑ€)" value={preview.morty_quote ?? ""} onChange={(v) => setPreview({...preview, morty_quote: v})} />
            <TextField label="ÐŸÑ€ÐµÐ´ÑƒÐ¿Ñ€ÐµÐ¶Ð´ÐµÐ½Ð¸Ðµ" value={preview.warning ?? ""} onChange={(v) => setPreview({...preview, warning: v})} />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Ð˜Ð³Ñ€Ð¾ÐºÐ¾Ð² Ð¼Ð¸Ð½</label>
                <input type="number" value={preview.players_min ?? 4} onChange={(e) => setPreview({...preview, players_min: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Ð˜Ð³Ñ€Ð¾ÐºÐ¾Ð² Ð¼Ð°ÐºÑ</label>
                <input type="number" value={preview.players_max ?? 8} onChange={(e) => setPreview({...preview, players_max: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Ð”Ð»Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ð¾ÑÑ‚ÑŒ (Ð¼Ð¸Ð½)</label>
                <input type="number" value={preview.duration_minutes ?? 30} onChange={(e) => setPreview({...preview, duration_minutes: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Ð’Ð¾Ð·Ñ€Ð°ÑÑ‚</label>
                <input type="text" value={preview.age_rating ?? "16+"} onChange={(e) => setPreview({...preview, age_rating: e.target.value})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Ð¡Ð»Ð¾Ð¶Ð½Ð¾ÑÑ‚ÑŒ</label>
              <select value={preview.difficulty ?? "medium"} onChange={(e) => setPreview({...preview, difficulty: e.target.value})}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal">
                <option value="easy">Ð›Ñ‘Ð³ÐºÐ°Ñ</option>
                <option value="medium">Ð¡Ñ€ÐµÐ´Ð½ÑÑ</option>
                <option value="hard">Ð¡Ð»Ð¾Ð¶Ð½Ð°Ñ</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="replayable" checked={preview.replayable ?? false}
                onChange={(e) => setPreview({...preview, replayable: e.target.checked})}
                className="w-4 h-4 accent-portal" />
              <label htmlFor="replayable" className="text-sm text-muted-foreground">ÐŸÐµÑ€ÐµÐ¸Ð³Ñ€Ñ‹Ð²Ð°ÐµÐ¼Ñ‹Ð¹</label>
            </div>
            <div className="grid gap-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">ÐžÐ±Ð»Ð¾Ð¶ÐºÐ° ÑÑ†ÐµÐ½Ð°Ñ€Ð¸Ñ</p>
              <p className="text-xs text-muted-foreground">Ð˜ÑÐ¿Ð¾Ð»ÑŒÐ·ÑƒÐµÑ‚ÑÑ Ð² ÐºÐ°Ñ€Ñ‚Ð¾Ñ‡ÐºÐµ ÐºÐ°Ñ‚Ð°Ð»Ð¾Ð³Ð° Ð¸ Ð½Ð° ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ðµ Ð¿Ñ€ÐµÐ²ÑŒÑŽ</p>
              <MediaUpload
                scenarioId={scenarioId!}
                path="cover"
                type="image"
                currentUrl={preview.cover_image}
                onUploaded={(p) => setPreview({...preview, cover_image: p})}
                onRemoved={() => setPreview({...preview, cover_image: ""})}
              />
            </div>
          </div>
        )}

        {tab === "intro" && partyGame && (
          <div className="grid gap-4">
            <TextField label="Ð¡Ð¸Ñ‚ÑƒÐ°Ñ†Ð¸Ñ" value={partyGame.intro.situation} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, situation: v } })} />
            <div className="grid gap-1">
              <TextField label="Ð ÐµÐ¿Ð»Ð¸ÐºÐ° Ð Ð¸ÐºÐ°" value={partyGame.intro.host_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line: v } })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/host_line" type="audio"
                currentUrl={partyGame.intro.host_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line_audio: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line_audio: "" } })} />
            </div>
            <div className="grid gap-1">
              <TextField label="Ð ÐµÐ¿Ð»Ð¸ÐºÐ° ÐœÐ¾Ñ€Ñ‚Ð¸" value={partyGame.intro.morty_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line: v } })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/morty_line" type="audio"
                currentUrl={partyGame.intro.morty_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line_audio: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line_audio: "" } })} />
            </div>
            <div className="grid gap-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Ð¤Ð¾Ð½Ð¾Ð²Ð¾Ðµ Ð¸Ð·Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ðµ</p>
              <MediaUpload scenarioId={scenarioId!} path="intro/background" type="image"
                currentUrl={partyGame.intro.background_image}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_image: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_image: "" } })} />
            </div>
            <div className="grid gap-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Ð¤Ð¾Ð½Ð¾Ð²Ð°Ñ Ð¼ÑƒÐ·Ñ‹ÐºÐ°</p>
              <MediaUpload scenarioId={scenarioId!} path="intro/music" type="audio"
                currentUrl={partyGame.intro.background_music}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_music: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_music: "" } })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">ÐŸÐ¾Ñ€Ð¾Ð³ Ð¿Ð¾Ð±ÐµÐ´Ñ‹ ÐºÐ¾Ð¼Ð°Ð½Ð´Ñ‹</label>
                <input type="number" value={partyGame.scoring.team_win_threshold}
                  onChange={(e) => setPartyGame({ ...partyGame, scoring: { ...partyGame.scoring, team_win_threshold: Number(e.target.value) } })}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">ÐŸÐ¾Ñ€Ð¾Ð³ Ð¿Ð¾Ð±ÐµÐ´Ñ‹ ÑÐ°Ð±Ð¾Ñ‚Ð°Ð¶Ð½Ð¸ÐºÐ°</label>
                <input type="number" value={partyGame.scoring.saboteur_win_threshold}
                  onChange={(e) => setPartyGame({ ...partyGame, scoring: { ...partyGame.scoring, saboteur_win_threshold: Number(e.target.value) } })}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
          </div>
        )}
        {tab === "rounds" && partyGame && (
          <div className="grid gap-3">
            {partyGame.rounds.map((round, i) => (
              <RoundEditor key={round.id} round={round} index={i} onChange={(r) => updateRound(i, r)} />
            ))}
          </div>
        )}
        {tab === "endings" && partyGame && (
          <div className="grid gap-6">
            {Object.entries(partyGame.endings).map(([key, ending]) => (
              <div key={key} className="glass-card p-5 grid gap-3">
                <p className="font-display text-base text-portal">{ENDING_LABELS[key] ?? key}</p>
                <div className="grid gap-1">
                  <TextField label="Ð ÐµÐ¿Ð»Ð¸ÐºÐ° Ð Ð¸ÐºÐ°" value={(ending as any).host_line} onChange={(v) => updateEnding(key, "host_line", v)} />
                  <MediaUpload scenarioId={scenarioId!} path={`endings/${key}/host_line`} type="audio"
                    currentUrl={(ending as any).host_line_audio}
                    onUploaded={(p) => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], host_line_audio: p } } })}
                    onRemoved={() => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], host_line_audio: "" } } })} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Ð ÐµÐ¿Ð»Ð¸ÐºÐ° ÐœÐ¾Ñ€Ñ‚Ð¸" value={(ending as any).morty_line} onChange={(v) => updateEnding(key, "morty_line", v)} />
                  <MediaUpload scenarioId={scenarioId!} path={`endings/${key}/morty_line`} type="audio"
                    currentUrl={(ending as any).morty_line_audio}
                    onUploaded={(p) => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], morty_line_audio: p } } })}
                    onRemoved={() => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], morty_line_audio: "" } } })} />
                </div>
                <div className="grid gap-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Ð¤Ð¾Ð½Ð¾Ð²Ð¾Ðµ Ð¸Ð·Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ðµ</p>
                  <MediaUpload scenarioId={scenarioId!} path={`endings/${key}/background`} type="image"
                    currentUrl={(ending as any).background_image}
                    onUploaded={(p) => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], background_image: p } } })}
                    onRemoved={() => setPartyGame({ ...partyGame!, endings: { ...partyGame!.endings, [key]: { ...(partyGame!.endings as any)[key], background_image: "" } } })} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-portal text-portal-foreground gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Ð¡Ð¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚ÑŒ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ñ
          </Button>
        </div>
      </main>
    </div>
  );
}


