f = open('supabase/functions/party-start/index.ts', encoding='utf-8')
c = f.read()
f.close()
old = 'ui_phase: "intro"'
new = 'ui_phase: scenario?.scenario_json?.party_game?.intro?.comic_frames?.length ? "comic_intro" : "intro"'
c = c.replace(old, new, 1)
open('supabase/functions/party-start/index.ts', 'w', encoding='utf-8', newline='\n').write(c)
print('done party-start')
