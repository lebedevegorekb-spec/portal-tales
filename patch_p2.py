preview_block = """        {tab === "preview" && (
          <div className="grid gap-4">
            <TextField label="Тизер (одна фраза)" value={preview.tagline ?? ""} onChange={(v) => setPreview({...preview, tagline: v})} />
            <TextField label="Полное описание" value={preview.full_description ?? ""} onChange={(v) => setPreview({...preview, full_description: v})} />
            <TextField label="Реплика Рика (тизер)" value={preview.host_quote ?? ""} onChange={(v) => setPreview({...preview, host_quote: v})} />
            <TextField label="Реплика Морти (тизер)" value={preview.morty_quote ?? ""} onChange={(v) => setPreview({...preview, morty_quote: v})} />
            <TextField label="Предупреждение" value={preview.warning ?? ""} onChange={(v) => setPreview({...preview, warning: v})} />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Игроков мин</label>
                <input type="number" value={preview.players_min ?? 4} onChange={(e) => setPreview({...preview, players_min: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Игроков макс</label>
                <input type="number" value={preview.players_max ?? 8} onChange={(e) => setPreview({...preview, players_max: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Длительность (мин)</label>
                <input type="number" value={preview.duration_minutes ?? 30} onChange={(e) => setPreview({...preview, duration_minutes: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Возраст</label>
                <input type="text" value={preview.age_rating ?? "16+"} onChange={(e) => setPreview({...preview, age_rating: e.target.value})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Сложность</label>
              <select value={preview.difficulty ?? "medium"} onChange={(e) => setPreview({...preview, difficulty: e.target.value})}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal">
                <option value="easy">Лёгкая</option>
                <option value="medium">Средняя</option>
                <option value="hard">Сложная</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="replayable" checked={preview.replayable ?? false}
                onChange={(e) => setPreview({...preview, replayable: e.target.checked})}
                className="w-4 h-4 accent-portal" />
              <label htmlFor="replayable" className="text-sm text-muted-foreground">Переигрываемый</label>
            </div>
          </div>
        )}

"""

with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '        {tab === "intro" && partyGame && ('
content = content.replace(target, preview_block + target)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done, length:', len(content))
