with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''                <TextField label="Рик — вступление" value={round.intro_host ?? ""} onChange={(v) => updateField("intro_host", v)} />
                <TextField label="Морти — вступление" value={round.intro_morty ?? ""} onChange={(v) => updateField("intro_morty", v)} />
                <TextField label="Рик — команда победила" value={round.success_host ?? ""} onChange={(v) => updateField("success_host", v)} />
                <TextField label="Морти — команда победила" value={round.success_morty ?? ""} onChange={(v) => updateField("success_morty", v)} />
                <TextField label="Рик — саботажник победил" value={round.fail_host ?? ""} onChange={(v) => updateField("fail_host", v)} />
                <TextField label="Морти — саботажник победил" value={round.fail_morty ?? ""} onChange={(v) => updateField("fail_morty", v)} />'''

new = '''                <div className="grid gap-1">
                  <TextField label="Рик — вступление" value={round.intro_host ?? ""} onChange={(v) => updateField("intro_host", v)} />
                  <MediaUpload scenarioId={round.id} path="intro_host" type="audio" currentUrl={round.intro_host_audio}
                    onUploaded={(p) => updateField("intro_host_audio", p as any)} onRemoved={() => updateField("intro_host_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Морти — вступление" value={round.intro_morty ?? ""} onChange={(v) => updateField("intro_morty", v)} />
                  <MediaUpload scenarioId={round.id} path="intro_morty" type="audio" currentUrl={round.intro_morty_audio}
                    onUploaded={(p) => updateField("intro_morty_audio", p as any)} onRemoved={() => updateField("intro_morty_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Рик — команда победила" value={round.success_host ?? ""} onChange={(v) => updateField("success_host", v)} />
                  <MediaUpload scenarioId={round.id} path="success_host" type="audio" currentUrl={round.success_host_audio}
                    onUploaded={(p) => updateField("success_host_audio", p as any)} onRemoved={() => updateField("success_host_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Морти — команда победила" value={round.success_morty ?? ""} onChange={(v) => updateField("success_morty", v)} />
                  <MediaUpload scenarioId={round.id} path="success_morty" type="audio" currentUrl={round.success_morty_audio}
                    onUploaded={(p) => updateField("success_morty_audio", p as any)} onRemoved={() => updateField("success_morty_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Рик — саботажник победил" value={round.fail_host ?? ""} onChange={(v) => updateField("fail_host", v)} />
                  <MediaUpload scenarioId={round.id} path="fail_host" type="audio" currentUrl={round.fail_host_audio}
                    onUploaded={(p) => updateField("fail_host_audio", p as any)} onRemoved={() => updateField("fail_host_audio", "" as any)} />
                </div>
                <div className="grid gap-1">
                  <TextField label="Морти — саботажник победил" value={round.fail_morty ?? ""} onChange={(v) => updateField("fail_morty", v)} />
                  <MediaUpload scenarioId={round.id} path="fail_morty" type="audio" currentUrl={round.fail_morty_audio}
                    onUploaded={(p) => updateField("fail_morty_audio", p as any)} onRemoved={() => updateField("fail_morty_audio", "" as any)} />
                </div>'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
