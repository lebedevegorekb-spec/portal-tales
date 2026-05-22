p='src/pages/Character.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'  const [replicaText, setReplicaText] = useState("");\n  const [replicaAudio, setReplicaAudio] = useState<string|undefined>(undefined);\n  const [replicaDone, setReplicaDone] = useState(false);',
'  const [replicaDone] = useState(true);'
)
c=c.replace(
'          const intro=(run as any).scenarios?.scenario_json?.party_game?.intro;\n          if(intro?.character_reveal_host_line){setReplicaText(intro.character_reveal_host_line);setReplicaAudio(intro.character_reveal_host_line_audio||undefined);}else{setReplicaDone(true);}',
''
)
c=c.replace(
'      {replicaText && !replicaDone && (\n        <ReplicaPlayer speaker="host" text={replicaText} audioPath={replicaAudio} onFinished={() => setReplicaDone(true)} />\n      )}',
''
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
