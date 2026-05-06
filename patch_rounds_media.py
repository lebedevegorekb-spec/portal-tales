with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Заменим TextField в RoundEditor на TextField + MediaUpload для аудио-полей
old = '''          {fields.map((f) => (
              <TextField key={f} label={FIELD_LABELS[f] ?? f} value={round[f] ?? ""} onChange={(v) => updateField(f, v)} />
            ))}'''

new = '''          {fields.map((f) => (
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
            ))}'''

content = content.replace(old, new)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done, length:', len(content))
