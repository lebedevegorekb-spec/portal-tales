p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    const result = await advance(runId, roomId);\n    if (isHost) {\n      const won =',
'    const advanceRes = await advance(runId, roomId);\n    const result = advanceRes?.result;\n    if (isHost) {\n      const won ='
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok' if 'advanceRes' in open(p,encoding="utf-8").read() else 'NOT APPLIED')
