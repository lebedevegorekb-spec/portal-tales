with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''                  {opt.is_joke && (
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
                  )}'''

new = '''                  {opt.is_joke && (
                    <div className="pl-8 grid gap-2">
                      <div className="grid gap-1">
                        <input type="text" value={opt.joke_host_line ?? ""} placeholder="Реплика Рика при выборе шутки"
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
                        <input type="text" value={opt.joke_morty_line ?? ""} placeholder="Реплика Морти при выборе шутки"
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
                    </div>
                  )}'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
