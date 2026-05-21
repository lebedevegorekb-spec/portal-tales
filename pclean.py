p='src/pages/Character.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace('          console.log("DEBUG role", {rpId: rp.id, roles: pg?.player_roles, isSab: pg?.player_roles?.[rp.id]});\n          ','')
c=c.replace('    console.log("handleReady", {myPlayerId, runId, roomId});\n    ','')
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
