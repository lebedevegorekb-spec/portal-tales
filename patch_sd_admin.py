with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''          {(round.mechanic === "blitz" || round.mechanic === "quiz") && round.questions && ('''

new = '''          {round.mechanic === "situation_deduction" && (
            <div className="grid gap-4">
              <TextField label="Настоящая ситуация (для игроков)" value={round.situation_real ?? ""} onChange={(v) => updateField("situation_real", v)} />
              <TextField label="Ситуация саботажника (другая)" value={round.situation_fake ?? ""} onChange={(v) => updateField("situation_fake", v)} />
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Запрещённые слова (через запятую)</label>
                <input type="text"
                  value={(round.forbidden_words ?? []).join(", ")}
                  onChange={(e) => updateField("forbidden_words", e.target.value.split(",").map((w: string) => w.trim()).filter(Boolean) as any)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Время на вопрос (сек)</label>
                <input type="number" value={round.question_time_seconds ?? 20}
                  onChange={(e) => updateField("question_time_seconds", Number(e.target.value) as any)}
                  className="w-32 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Варианты ответа</p>
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
                      {opt.id === round.correct_option_id ? "✓ верный" : "верный?"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(round.mechanic === "blitz" || round.mechanic === "quiz") && round.questions && ('''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
