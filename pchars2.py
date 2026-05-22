p='src/pages/admin/ScenarioEdit.tsx'
c=open(p,encoding='utf-8').read()

# Добавим блок chars_reveal после блока comic_frames в intro табе
old_scoring = '            <div className="grid grid-cols-2 gap-4">'
new_scoring = '''            <div className="grid gap-1 border border-portal/20 rounded-lg p-4">
              <p className="text-xs uppercase tracking-widest text-portal mb-2">Экран показа ролей (хост)</p>
              <p className="text-xs text-muted-foreground mb-1">Фон</p>
              <MediaUpload scenarioId={scenarioId!} path="intro/chars_reveal_bg" type="image"
                currentUrl={(partyGame.intro as any).chars_reveal_background}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, chars_reveal_background: p } as any })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, chars_reveal_background: "" } as any })} />
              <TextField label="Реплика Рика" value={(partyGame.intro as any).chars_reveal_host_line ?? ""} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, chars_reveal_host_line: v } as any })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/chars_reveal_host" type="audio"
                currentUrl={(partyGame.intro as any).chars_reveal_host_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, chars_reveal_host_audio: p } as any })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, chars_reveal_host_audio: "" } as any })} />
              <TextField label="Реплика Морти" value={(partyGame.intro as any).chars_reveal_morty_line ?? ""} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, chars_reveal_morty_line: v } as any })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/chars_reveal_morty" type="audio"
                currentUrl={(partyGame.intro as any).chars_reveal_morty_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, chars_reveal_morty_audio: p } as any })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, chars_reveal_morty_audio: "" } as any })} />
            </div>
            <div className="grid grid-cols-2 gap-4">'''

c=c.replace(old_scoring, new_scoring)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
