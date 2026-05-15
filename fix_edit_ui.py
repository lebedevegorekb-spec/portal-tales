f = open('src/pages/admin/ScenarioEdit.tsx', encoding='utf-8')
c = f.read()
f.close()

old = '            <div className="grid grid-cols-2 gap-4">'
new = """            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Кадры комикса</p>
                <button onClick={() => {
                  const frames = partyGame.intro.comic_frames ?? [];
                  const newFrame = { id: "frame-" + Date.now(), caption: "", image: "", host_line: "", host_line_audio: "", morty_line: "", morty_line_audio: "" };
                  setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: [...frames, newFrame] } });
                }} className="flex items-center gap-1 text-xs text-portal border border-portal/30 px-2 py-1 rounded hover:bg-portal/10">
                  <Plus className="w-3 h-3" /> Добавить кадр
                </button>
              </div>
              {(partyGame.intro.comic_frames ?? []).map((frame, fi) => (
                <div key={frame.id} className="glass-card p-4 grid gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-portal">Кадр {fi + 1}</p>
                    <button onClick={() => {
                      const frames = (partyGame.intro.comic_frames ?? []).filter((_, i) => i !== fi);
                      setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } });
                    }} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Изображение</p>
                    <MediaUpload scenarioId={scenarioId!} path={"intro/comic/" + frame.id + "/image"} type="image"
                      currentUrl={frame.image}
                      onUploaded={(p) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], image: p }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }}
                      onRemoved={() => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], image: "" }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                  </div>
                  <TextField label="Подпись кадра" value={frame.caption ?? ""} onChange={(v) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], caption: v }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                  <div className="grid gap-1">
                    <TextField label="Реплика Рика" value={frame.host_line ?? ""} onChange={(v) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], host_line: v }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                    <MediaUpload scenarioId={scenarioId!} path={"intro/comic/" + frame.id + "/rick"} type="audio"
                      currentUrl={frame.host_line_audio}
                      onUploaded={(p) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], host_line_audio: p }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }}
                      onRemoved={() => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], host_line_audio: "" }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                  </div>
                  <div className="grid gap-1">
                    <TextField label="Реплика Морти" value={frame.morty_line ?? ""} onChange={(v) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], morty_line: v }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                    <MediaUpload scenarioId={scenarioId!} path={"intro/comic/" + frame.id + "/morty"} type="audio"
                      currentUrl={frame.morty_line_audio}
                      onUploaded={(p) => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], morty_line_audio: p }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }}
                      onRemoved={() => { const frames = [...(partyGame.intro.comic_frames ?? [])]; frames[fi] = { ...frames[fi], morty_line_audio: "" }; setPartyGame({ ...partyGame, intro: { ...partyGame.intro, comic_frames: frames } }); }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">"""
c = c.replace(old, new)
open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done ui')
