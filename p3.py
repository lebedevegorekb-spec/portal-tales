p='src/pages/admin/ScenarioEdit.tsx'
c=open(p,encoding='utf-8').read()
old='''            <div className="grid gap-1">
              <TextField label="Реплика Морти" value={partyGame.intro.morty_line} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line: v } })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/morty_line" type="audio"
                currentUrl={partyGame.intro.morty_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line_audio: p } })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, morty_line_audio: "" } })} />
            </div>'''
new=old+'''
            <div className="grid gap-1 border border-portal/20 rounded-lg p-4">
              <p className="text-xs uppercase tracking-widest text-portal mb-2">Реплика Рика (показ роли)</p>
              <TextField label="Текст реплики" value={(partyGame.intro as any).character_reveal_host_line ?? ""} onChange={(v) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, character_reveal_host_line: v } as any })} />
              <MediaUpload scenarioId={scenarioId!} path="intro/character_reveal" type="audio"
                currentUrl={(partyGame.intro as any).character_reveal_host_line_audio}
                onUploaded={(p) => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, character_reveal_host_line_audio: p } as any })}
                onRemoved={() => setPartyGame({ ...partyGame, intro: { ...partyGame.intro, character_reveal_host_line_audio: "" } as any })} />
            </div>'''
if old in c:
    c=c.replace(old,new)
    print('reveal block inserted OK')
else:
    print('ERROR: marker not found')
open(p,'w',encoding='utf-8',newline='\n').write(c)
