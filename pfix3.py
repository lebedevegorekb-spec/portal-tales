p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    const result = await advance(runId, roomId);\n      if (isHost) {\n        const won = result?.team_scored;\n        const isTie = result?.is_tie ?? false;',
'    const res = await advance(runId, roomId);\n      const result = res?.result;\n      if (isHost) {\n        const won = result?.team_scored;\n        const isTie = result?.is_tie ?? false;'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
