with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''          {round.mechanic === "fork" && round.options && (
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
          )}'''

new = '''          {round.mechanic === "fork" && round.options && (
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Варианты выбора</p>
                {round.options.length < 6 && (
                  <button onClick={() => {
                    const ids = ["A","B","C","D","E","F"];
                    const newOpt = { id: ids[round.options.length], label: "", is_correct: false, is_joke: false };
                    onChange({ ...round, options: [...round.options, newOpt] });
                  }} className="text-xs text-portal border border-portal/30 px-2 py-1 rounded hover:bg-portal/10 transition-colors">
                    + Вариант
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
                    }} className="text-muted-foreground hover:text-destructive text-xs px-2">✕</button>
                  </div>
                  <div className="flex items-center gap-4 pl-8">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={opt.is_correct ?? false}
                        onChange={(e) => {
                          const opts = [...round.options];
                          opts[oi] = { ...opts[oi], is_correct: e.target.checked };
                          onChange({ ...round, options: opts });
                        }} className="accent-portal w-3 h-3" />
                      Правильный
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={opt.is_joke ?? false}
                        onChange={(e) => {
                          const opts = [...round.options];
                          opts[oi] = { ...opts[oi], is_joke: e.target.checked };
                          onChange({ ...round, options: opts });
                        }} className="accent-yellow-500 w-3 h-3" />
                      Шутливый
                    </label>
                  </div>
                  {opt.is_joke && (
                    <div className="pl-8 grid gap-2">
                      <input type="text" value={opt.joke_host_line ?? ""} placeholder="Реплика Рика при выборе шутки"
                        onChange={(e) => {
                          const opts = [...round.options];
                          opts[oi] = { ...opts[oi], joke_host_line: e.target.value };
                          onChange({ ...round, options: opts });
                        }}
                        className="w-full bg-muted border border-yellow-500/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-yellow-500" />
                      <input type="text" value={opt.joke_morty_line ?? ""} placeholder="Реплика Морти при выборе шутки"
                        onChange={(e) => {
                          const opts = [...round.options];
                          opts[oi] = { ...opts[oi], joke_morty_line: e.target.value };
                          onChange({ ...round, options: opts });
                        }}
                        className="w-full bg-muted border border-yellow-500/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-yellow-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
