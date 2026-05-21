p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Фикс 1: авто-переход после intro реплик (убрать кнопку)
c=c.replace(
'    if (queue.length > 0) { setReplicaQueue(queue); setCurrentReplica(queue[0]); }\n  }, [phase, isHost, partyConfig, introReplicasShown]);',
'    if (queue.length > 0) { setReplicaQueue(queue); setCurrentReplica(queue[0]); }\n    else { handleIntroFinish(); }\n  }, [phase, isHost, partyConfig, introReplicasShown]);'
)

# Фикс 2: onReplicaFinished — после intro реплик вызвать handleIntroFinish
c=c.replace(
'      if (next.length === 0) {\n        setPhase(p => p === "result_replicas" ? "result_screen" : p);\n      }',
'      if (next.length === 0) {\n        if (phase === "result_replicas") setPhase("result_screen");\n        if (phase === "intro") handleIntroFinish();\n      }'
)

# Фикс 3: реплики раунда — убрать проверку phase !== "playing"
c=c.replace(
'    if (!gameState || !currentRound || !isHost || phase !== "playing") return;',
'    if (!gameState || !currentRound || !isHost) return;\n    if (phase !== "playing" && phase !== "loading") return;'
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
