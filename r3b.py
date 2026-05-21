p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'  // Фаза result_screen — итоги, ждём хоста\n  if (phase === "result_screen") {\n    const lastResult = gameState?.round_results?.[gameState.round_results.length - 1];\n    return (\n      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-8">\n        {isHost && <BackgroundImage imagePath={currentRound?.background_image} />}',
'  // Фаза result_screen — итоги + реплики одновременно\n  if (phase === "result_screen" || phase === "result_replicas") {\n    const lastResult = gameState?.round_results?.[gameState.round_results.length - 1];\n    return (\n      <div className="min-h-screen text-foreground flex flex-col items-center justify-center gap-6 p-8">\n        {isHost && <BackgroundImage imagePath={currentRound?.background_image} />}\n        {currentReplica && (\n          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />\n        )}'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
