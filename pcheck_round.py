p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    if (phase !== "result_replicas" || !pendingReplicaRound || !isHost) return;\n    const lastResult = gameState?.round_results?.[gameState.round_results.length - 1];\n    if (!lastResult) return;',
'    if (phase !== "result_replicas" || !pendingReplicaRound || !isHost) return;\n    const lastResult = gameState?.round_results?.[gameState.round_results.length - 1];\n    if (!lastResult) return;\n    if (lastResult.round_id !== pendingReplicaRound.id) return;'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
