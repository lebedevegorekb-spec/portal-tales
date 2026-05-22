p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    const advanceRes = await advance(runId, roomId);\n    const result = advanceRes?.result;',
'    const advanceRes = await advance(runId, roomId);\n    const result = advanceRes?.result;\n    console.log("advance result:", JSON.stringify(advanceRes));'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
