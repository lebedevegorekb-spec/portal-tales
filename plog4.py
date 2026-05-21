p='src/pages/Character.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'  const handleReady = async () => {\n    if (!myPlayerId || !runId || !roomId) return;',
'  const handleReady = async () => {\n    console.log("handleReady", {myPlayerId, runId, roomId});\n    if (!myPlayerId || !runId || !roomId) return;'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
