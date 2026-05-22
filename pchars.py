p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# 1. Добавить стейт для chars_reveal реплик
c=c.replace(
'  const [replicaQueue, setReplicaQueue] = useState',
'  const [charsRevealReplicasDone, setCharsRevealReplicasDone] = useState(false);\n  const [replicaQueue, setReplicaQueue] = useState'
)

# 2. Заменить chars_reveal блок
old_chars = '''  // Фаза chars_reveal — ждём пока все посмотрят роли
  if (phase === "chars_reveal") {
    const charsReady = (gameState as any)?.characters_ready?.length ?? 0;
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">
        <BackgroundImage imagePath={partyConfig?.intro?.background_image} />
        <Loader2 className="w-10 h-10 animate-spin text-portal" />
        <p className="text-2xl font-display">Игроки знакомятся с ролями</p>
        <p className="text-muted-foreground">{charsReady} / {playerCount} готовы</p>

      </div>
    );
  }'''

new_chars = '''  // Фаза chars_reveal
  if (phase === "chars_reveal") {
    const charsReady = (gameState as any)?.characters_ready?.length ?? 0;
    const intro = partyConfig?.intro as any;
    // Запустить реплики chars_reveal автоматически (только хост, только 1 раз)
    if (isHost && !charsRevealReplicasDone && currentReplica === null && replicaQueue.length === 0) {
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
    }
    return (
      <div className="min-h-screen text-foreground flex flex-col items-center justify-center gap-6">
        <BackgroundImage imagePath={intro?.chars_reveal_background || partyConfig?.intro?.background_image} />
        {currentReplica && (
          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />
        )}
        <div className="relative z-10 glass-card backdrop-blur-md bg-background/60 p-8 rounded-2xl text-center flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-portal" />
          <p className="text-2xl font-display">Игроки знакомятся с ролями</p>
          <p className="text-muted-foreground">{charsReady} / {playerCount} готовы</p>
        </div>
      </div>
    );
  }'''

if old_chars in c:
    c=c.replace(old_chars, new_chars)
    print("chars_reveal ok")
else:
    print("NOT FOUND")

# 3. Игроки до chars_reveal видят заглушку (фаза loading когда ui_phase не chars_reveal)
# Уже есть "Хост запускает игру..." — нужно поменять текст для игроков
c=c.replace(
'          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Хост запускает игру...</p>',
'          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">{isHost ? "Загрузка..." : "Смотрим вступление..."}</p>'
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print("ok")
