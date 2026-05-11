with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''                        <MediaUpload scenarioId={round.id} path={`joke_morty_${oi}`} type="audio"
                          currentUrl={opt.joke_morty_audio}
                          onUploaded={(p) => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_morty_audio: p }; onChange({ ...round, options: opts }); }}
                          onRemoved={() => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_morty_audio: "" }; onChange({ ...round, options: opts }); }} />
                      </div>
                    </div>
                  )}'''

new = '''                        <MediaUpload scenarioId={round.id} path={`joke_morty_${oi}`} type="audio"
                          currentUrl={opt.joke_morty_audio}
                          onUploaded={(p) => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_morty_audio: p }; onChange({ ...round, options: opts }); }}
                          onRemoved={() => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_morty_audio: "" }; onChange({ ...round, options: opts }); }} />
                      </div>
                      <div className="grid gap-1">
                        <p className="text-xs text-muted-foreground">Картинка при выборе шутки</p>
                        <MediaUpload scenarioId={round.id} path={`joke_image_${oi}`} type="image"
                          currentUrl={opt.joke_image}
                          onUploaded={(p) => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_image: p }; onChange({ ...round, options: opts }); }}
                          onRemoved={() => { const opts = [...round.options]; opts[oi] = { ...opts[oi], joke_image: "" }; onChange({ ...round, options: opts }); }} />
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
