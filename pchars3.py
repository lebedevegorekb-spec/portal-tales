p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# В chars_reveal блоке у игроков показываем заглушку без реплик
# Проблема: currentReplica глобальный и рендерится в playing фазе тоже
# Фикс: в chars_reveal для не-хоста — return раньше

# Уже есть правильный return для !isHost, но реплика рендерится ДО него
# Нужно переместить !isHost проверку ПЕРЕД запуском реплик

old = '''    if (isHost && !charsRevealReplicasDone && currentReplica === null && replicaQueue.length === 0) {
      const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
      if (intro?.chars_reveal_host_line) queue.push({ speaker: "host", text: intro.chars_reveal_host_line, audioPath: intro.chars_reveal_host_audio });
      if (intro?.chars_reveal_morty_line) queue.push({ speaker: "morty", text: intro.chars_reveal_morty_line, audioPath: intro.chars_reveal_morty_audio });
      if (queue.length > 0) { setReplicaQueue(queue); setCurrentReplica(queue[0]); }
      setCharsRevealReplicasDone(true);
    }
    if (!isHost) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-portal" />
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Смотрим вступление...</p>
        </div>
      );
    }'''

new = '''    if (!isHost) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-portal" />
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Смотрим вступление...</p>
        </div>
      );
    }
    if (isHost && !charsRevealReplicasDone && currentReplica === null && replicaQueue.length === 0) {
      const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
      if (intro?.chars_reveal_host_line) queue.push({ speaker: "host", text: intro.chars_reveal_host_line, audioPath: intro.chars_reveal_host_audio });
      if (intro?.chars_reveal_morty_line) queue.push({ speaker: "morty", text: intro.chars_reveal_morty_line, audioPath: intro.chars_reveal_morty_audio });
      if (queue.length > 0) { setReplicaQueue(queue); setCurrentReplica(queue[0]); }
      setCharsRevealReplicasDone(true);
    }'''

if old in c:
    c=c.replace(old,new)
    print("ok")
else:
    print("NOT FOUND")
open(p,'w',encoding='utf-8',newline='\n').write(c)
