with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''        {tab === "intro" && partyGame && (
          <div className="grid gap-4">
            <TextField label="Ситуация" value={partyGame.intro.situation} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, situation: v } })} />
            <TextField label="Реплика Рика" value={partyGame.intro.host_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line: v } })} />
            <TextField label="Реплика Морти" value={partyGame.intro.morty_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line: v } })} />'''

new = '''        {tab === "intro" && partyGame && (
          <div className="grid gap-4">
            <TextField label="Ситуация" value={partyGame.intro.situation} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, situation: v } })} />
            <div className="grid gap-1">
              <TextField label="Реплика Рика" value={partyGame.intro.host_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line: v } })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/host_line" type="audio"
                currentUrl={partyGame.intro.host_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line_audio: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, host_line_audio: "" } })} />
            </div>
            <div className="grid gap-1">
              <TextField label="Реплика Морти" value={partyGame.intro.morty_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line: v } })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/morty_line" type="audio"
                currentUrl={partyGame.intro.morty_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line_audio: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line_audio: "" } })} />
            </div>
            <div className="grid gap-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Фоновое изображение</p>
              <MediaUpload scenarioId={scenarioId!} path="intro/background" type="image"
                currentUrl={partyGame.intro.background_image}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_image: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_image: "" } })} />
            </div>
            <div className="grid gap-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Фоновая музыка</p>
              <MediaUpload scenarioId={scenarioId!} path="intro/music" type="audio"
                currentUrl={partyGame.intro.background_music}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_music: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, background_music: "" } })} />
            </div>'''

content = content.replace(old, new)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done, length:', len(content))
