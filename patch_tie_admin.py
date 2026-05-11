with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''          {(round.mechanic === "blitz" || round.mechanic === "quiz") && round.questions && ('''

new = '''          {round.mechanic === "vote_saboteur" && (
            <div className="grid gap-3 border-t border-border pt-4">
              <p className="text-xs uppercase tracking-widest text-yellow-500">Реплики при ничьей</p>
              <div className="grid gap-1">
                <TextField label="Рик — ничья" value={round.tie_host ?? ""} onChange={(v) => updateField("tie_host", v)} />
                <MediaUpload scenarioId={round.id} path="tie_host" type="audio" currentUrl={round.tie_host_audio}
                  onUploaded={(p) => updateField("tie_host_audio", p as any)}
                  onRemoved={() => updateField("tie_host_audio", "" as any)} />
              </div>
              <div className="grid gap-1">
                <TextField label="Морти — ничья" value={round.tie_morty ?? ""} onChange={(v) => updateField("tie_morty", v)} />
                <MediaUpload scenarioId={round.id} path="tie_morty" type="audio" currentUrl={round.tie_morty_audio}
                  onUploaded={(p) => updateField("tie_morty_audio", p as any)}
                  onRemoved={() => updateField("tie_morty_audio", "" as any)} />
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
