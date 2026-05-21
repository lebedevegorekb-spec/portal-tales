p='src/pages/Character.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'          setIsSaboteur(pg?.player_roles?.[rp.id] === "saboteur");',
'          console.log("rp.id:", rp.id, "player_roles:", JSON.stringify(pg?.player_roles), "match:", pg?.player_roles?.[rp.id]);\n          setIsSaboteur(pg?.player_roles?.[rp.id] === "saboteur");'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
