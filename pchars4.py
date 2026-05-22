p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Добавить отдельный стейт для chars_reveal реплик
c=c.replace(
'  const [charsRevealReplicasDone, setCharsRevealReplicasDone] = useState(false);',
'  const [charsRevealReplicasDone, setCharsRevealReplicasDone] = useState(false);\n  const [charsRevealReplica, setCharsRevealReplica] = useState<{speaker:"host"|"morty";text:string;audioPath?:string}|null>(null);\n  const [charsRevealQueue, setCharsRevealQueue] = useState<Array<{speaker:"host"|"morty";text:string;audioPath?:string}>>([]);'
)

# Заменить логику запуска реплик в chars_reveal
old_launch = '''    if (isHost && !charsRevealReplicasDone && currentReplica === null && replicaQueue.length === 0) {
      const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
      if (intro?.chars_reveal_host_line) queue.push({ speaker: "host", text: intro.chars_reveal_host_line, audioPath: intro.chars_reveal_host_audio });
      if (intro?.chars_reveal_morty_line) queue.push({ speaker: "morty", text: intro.chars_reveal_morty_line, audioPath: intro.chars_reveal_morty_audio });
      if (queue.length > 0) { setReplicaQueue(queue); setCurrentReplica(queue[0]); }
      setCharsRevealReplicasDone(true);
    }'''

new_launch = '''    if (isHost && !charsRevealReplicasDone) {
      const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
      if (intro?.chars_reveal_host_line) queue.push({ speaker: "host", text: intro.chars_reveal_host_line, audioPath: intro.chars_reveal_host_audio });
      if (intro?.chars_reveal_morty_line) queue.push({ speaker: "morty", text: intro.chars_reveal_morty_line, audioPath: intro.chars_reveal_morty_audio });
      if (queue.length > 0) { setCharsRevealQueue(queue); setCharsRevealReplica(queue[0]); }
      setCharsRevealReplicasDone(true);
    }'''

c=c.replace(old_launch, new_launch)

# Заменить ReplicaPlayer в chars_reveal на отдельный
old_replica_chars = '        {currentReplica && (\n          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />\n        )}\n        <div className="relative z-10 glass-card backdrop-blur-md bg-background/60 p-8 rounded-2xl text-center flex flex-col items-center gap-4">'

new_replica_chars = '        {charsRevealReplica && (\n          <ReplicaPlayer speaker={charsRevealReplica.speaker} text={charsRevealReplica.text} audioPath={charsRevealReplica.audioPath} onFinished={() => {\n            const next = charsRevealQueue.slice(1);\n            setCharsRevealQueue(next);\n            setCharsRevealReplica(next.length > 0 ? next[0] : null);\n          }} />\n        )}\n        <div className="relative z-10 glass-card backdrop-blur-md bg-background/60 p-8 rounded-2xl text-center flex flex-col items-center gap-4">'

if old_replica_chars in c:
    c=c.replace(old_replica_chars, new_replica_chars)
    print("replica_chars ok")
else:
    print("replica_chars NOT FOUND")

open(p,'w',encoding='utf-8',newline='\n').write(c)
print("done")
