with open('src/pages/ScenarioPreview.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Убрать tagline из середины и вставить перед описанием
old = '''        {/* ОПИСАНИЕ */}
        {p.full_description && (
          <div className="grid gap-3">
            <h2 className="font-display text-2xl text-foreground">О сценарии</h2>
            {p.full_description.split("\\n\\n").map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{para}</p>
            ))}
          </div>
        )}

        {/* TAGLINE */}
        {p.tagline && (
          <p className="text-lg text-muted-foreground font-display italic border-l-2 border-portal pl-4">
            {p.tagline}
          </p>
        )}'''

new = '''        {/* TAGLINE */}
        {p.tagline && (
          <p className="text-lg text-muted-foreground font-display italic border-l-2 border-portal pl-4">
            {p.tagline}
          </p>
        )}

        {/* ОПИСАНИЕ */}
        {p.full_description && (
          <div className="grid gap-3">
            <h2 className="font-display text-2xl text-foreground">О сценарии</h2>
            {p.full_description.split("\\n\\n").map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">{para}</p>
            ))}
          </div>
        )}'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/ScenarioPreview.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
