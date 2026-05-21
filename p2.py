p='src/pages/Character.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace('import { Loader2, Shield, Zap } from "lucide-react";','import { Loader2, Shield, Zap } from "lucide-react";\nimport { ReplicaPlayer } from "@/components/ReplicaPlayer";')
c=c.replace('  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);','  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);\n  const [replicaText, setReplicaText] = useState("");\n  const [replicaAudio, setReplicaAudio] = useState<string|undefined>(undefined);\n  const [replicaDone, setReplicaDone] = useState(false);')
c=c.replace('        const charId = pg?.player_characters?.[rp.id];','        const intro=(run as any).scenarios?.scenario_json?.party_game?.intro;\n        if(intro?.character_reveal_host_line){setReplicaText(intro.character_reveal_host_line);setReplicaAudio(intro.character_reveal_host_line_audio||undefined);}else{setReplicaDone(true);}\n        const charId = pg?.player_characters?.[rp.id];')
c=c.replace('      <div className="max-w-md mx-auto space-y-6">','      {replicaText && !replicaDone && (\n        <ReplicaPlayer speaker="host" text={replicaText} audioPath={replicaAudio} onFinished={() => setReplicaDone(true)} />\n      )}\n      <div className={`max-w-md mx-auto space-y-6 transition-opacity duration-500 ${replicaDone ? "opacity-100" : "opacity-0 pointer-events-none"}`}>')
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('Char ok')
