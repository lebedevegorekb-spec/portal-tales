with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''              <div key={key} className="glass-card p-5 grid gap-3">
                <p className="font-display text-base text-portal">{ENDING_LABELS[key] ?? key}</p>
                <TextField label="Реплика Рика" value={(ending as any).host_line} onChange={(v) => updateEnding(key, "host_line", v)} />
                <TextField label="Реплика Морти" value={(ending as any).morty_line} onChange={(v) => updateEnding(key, "morty_line", v)} />
              </div>'''

new = '''              <div key={key} className="glass-card p-5 grid gap-3">
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
              </div>'''

content = content.replace(old, new)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done, length:', len(content))
