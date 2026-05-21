p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'        <Loader2 className="w-10 h-10 animate-spin text-portal" />\n        <p className="text-2xl font-display">Игроки знакомятся с ролями</p>\n        <p className="text-muted-foreground">{charsReady} / {playerCount} готовы</p>',
'        <Loader2 className="w-10 h-10 animate-spin text-portal" />\n        <p className="text-2xl font-display">Игроки знакомятся с ролями</p>\n        <p className="text-muted-foreground">{charsReady} / {playerCount} готовы</p>\n        {isHost && charsReady >= playerCount && (\n          <button onClick={async () => {\n            if (!runId) return;\n            const { data: run } = await supabase.from("runs").select("state_json").eq("id", runId).single();\n            if (run?.state_json) {\n              const ns = { ...run.state_json, party_game: { ...run.state_json.party_game, ui_phase: "playing" } };\n              await supabase.from("runs").update({ state_json: ns }).eq("id", runId);\n            }\n            setPhase("playing");\n          }} className="bg-portal text-portal-foreground px-8 py-3 rounded-lg font-display text-lg">\n            Начать раунд →\n          </button>\n        )}'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
