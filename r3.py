p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Убрать отдельный рендер result_replicas — объединить с result_screen
old_replicas = '''  // Фаза result_replicas — реплики играют
  if (phase === "result_replicas") {
    return (
      <div className="min-h-screen bg-background text-foreground relative flex flex-col items-center justify-center gap-6">
        {isHost && <BackgroundImage imagePath={currentRound?.background_image} />}
        {currentReplica && (
          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />
        )}
        {!currentReplica && isHost && (
          <button onClick={() => setPhase("result_screen")} className="bg-portal text-portal-foreground px-12 py-4 rounded-lg font-display text-xl">
            Далее →
          </button>
        )}
        {!isHost && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-portal" />
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Итоги раунда...</p>
          </div>
        )}
      </div>
    );
  }'''

# Заменяем result_replicas фазу на переход в result_screen
new_replicas = '''  // Фаза result_replicas — переходим сразу в result_screen
  if (phase === "result_replicas") {
    // просто показываем result_screen с репликами
  }'''

if old_replicas in c:
    c = c.replace(old_replicas, new_replicas)
    print("result_replicas removed ok")
else:
    print("NOT FOUND - check manually")

open(p,'w',encoding='utf-8',newline='\n').write(c)
