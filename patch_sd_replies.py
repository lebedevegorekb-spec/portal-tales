with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Варианты ответа</p>'''

new = '''              <div className="grid gap-3 border-t border-border pt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Реплики ведущих</p>
                <TextField label="Рик — вступление" value={round.intro_host ?? ""} onChange={(v) => updateField("intro_host", v)} />
                <TextField label="Морти — вступление" value={round.intro_morty ?? ""} onChange={(v) => updateField("intro_morty", v)} />
                <TextField label="Рик — команда победила" value={round.success_host ?? ""} onChange={(v) => updateField("success_host", v)} />
                <TextField label="Морти — команда победила" value={round.success_morty ?? ""} onChange={(v) => updateField("success_morty", v)} />
                <TextField label="Рик — саботажник победил" value={round.fail_host ?? ""} onChange={(v) => updateField("fail_host", v)} />
                <TextField label="Морти — саботажник победил" value={round.fail_morty ?? ""} onChange={(v) => updateField("fail_morty", v)} />
              </div>

              <div className="grid gap-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Варианты ответа</p>'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
