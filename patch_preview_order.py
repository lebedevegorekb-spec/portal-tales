with open('src/pages/ScenarioPreview.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = """      <div className="container max-w-3xl mx-auto px-4 py-10 grid gap-8">

        {/* TAGLINE */}
        {p.tagline && (
          <p className="text-xl md:text-2xl text-muted-foreground text-center font-display italic border-l-2 border-portal pl-4">
            {p.tagline}
          </p>
        )}

        {/* META CHIPS */}
        <div className="flex flex-wrap gap-3 justify-center">
          {p.duration_minutes && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-portal/70" /> {p.duration_minutes} мин
            </div>
          )}
          {(p.players_min || p.players_max) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-portal/70" /> {p.players_min}–{p.players_max} игроков
            </div>
          )}
          {p.difficulty && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-portal/70" /> {DIFFICULTY_LABELS[p.difficulty] ?? p.difficulty}
            </div>
          )}
          {p.replayable && (
            <div className="flex items-center gap-1.5 text-sm text-portal border border-portal/30 bg-portal/5 px-3 py-1.5 rounded-full">
              <RotateCcw className="w-4 h-4" /> Переигрываемый
            </div>
          )}
          {p.age_rating && (
            <div className="text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              {p.age_rating}
            </div>
          )}
        </div>

        {/* ТЕГИ */}
        <div className="flex flex-wrap gap-2 justify-center">
          {meta.tags.map(tag => (
            <span key={tag} className="text-[11px] font-mono uppercase tracking-widest text-portal/80 border border-portal/25 bg-portal/5 px-2.5 py-1 rounded-sm">
              #{tag}
            </span>
          ))}
        </div>

        {/* РЕПЛИКИ */}
        {(p.host_quote || p.morty_quote) && (
          <div className="grid gap-4">
            {p.host_quote && (
              <div className="glass-card p-5 flex items-start gap-4 border-l-2 border-portal">
                <div className="w-10 h-10 rounded-full bg-portal/20 flex items-center justify-center text-lg shrink-0">🧪</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-portal mb-1">Рик</p>
                  <p className="text-sm text-foreground italic">«{p.host_quote}»</p>
                </div>
              </div>
            )}
            {p.morty_quote && (
              <div className="glass-card p-5 flex items-start gap-4 border-l-2 border-pink/50">
                <div className="w-10 h-10 rounded-full bg-pink/20 flex items-center justify-center text-lg shrink-0">😰</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-pink/70 mb-1">Морти</p>
                  <p className="text-sm text-foreground italic">«{p.morty_quote}»</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ОПИСАНИЕ */}
        {p.full_description && (
          <div className="glass-card p-6 grid gap-3">
            <h2 className="font-display text-lg text-portal">О сценарии</h2>
            {p.full_description.split("\\n\\n").map((para, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed text-sm">{para}</p>
            ))}
          </div>
        )}

        {/* ПРЕДУПРЕЖДЕНИЕ */}
        {p.warning && (
          <div className="flex items-start gap-3 border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground italic">{p.warning}</p>
          </div>
        )}

        {/* CTA */}"""

new = """      <div className="container max-w-3xl mx-auto px-4 py-10 grid gap-8">

        {/* ОПИСАНИЕ */}
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
        )}

        {/* ПРЕДУПРЕЖДЕНИЕ */}
        {p.warning && (
          <div className="flex items-start gap-3 border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground italic">{p.warning}</p>
          </div>
        )}

        {/* META CHIPS */}
        <div className="flex flex-wrap gap-3">
          {p.duration_minutes && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-portal/70" /> {p.duration_minutes} мин
            </div>
          )}
          {(p.players_min || p.players_max) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4 text-portal/70" /> {p.players_min}–{p.players_max} игроков
            </div>
          )}
          {p.difficulty && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-portal/70" /> {DIFFICULTY_LABELS[p.difficulty] ?? p.difficulty}
            </div>
          )}
          {p.replayable && (
            <div className="flex items-center gap-1.5 text-sm text-portal border border-portal/30 bg-portal/5 px-3 py-1.5 rounded-full">
              <RotateCcw className="w-4 h-4" /> Переигрываемый
            </div>
          )}
          {p.age_rating && (
            <div className="text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              {p.age_rating}
            </div>
          )}
        </div>

        {/* ТЕГИ */}
        <div className="flex flex-wrap gap-2">
          {meta.tags.map(tag => (
            <span key={tag} className="text-[11px] font-mono uppercase tracking-widest text-portal/80 border border-portal/25 bg-portal/5 px-2.5 py-1 rounded-sm">
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}"""

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/ScenarioPreview.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
