p='src/pages/Character.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'          const intro=(run as any).scenarios?.scenario_json?.party_game?.intro;\n          if(intro?.character_reveal_host_line){setReplicaText(intro.character_reveal_host_line);setReplicaAudio(intro.character_reveal_host_line_audio||undefined);}else{setReplicaDone(true);}\n          ',
'          '
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
