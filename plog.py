p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    if (phase !== "intro" || !isHost || !partyConfig?.intro || introReplicasShown) return;',
'    console.log("intro effect", {phase, isHost, hasIntro: !!partyGame?.intro, introReplicasShown});\n    if (phase !== "intro" || !isHost || !partyConfig?.intro || introReplicasShown) return;'
)
c=c.replace(
'    if (!gameState || !currentRound || !isHost) return;\n    if (phase !== "playing" && phase !== "loading") return;',
'    console.log("round effect", {phase, isHost, roundIdx: gameState?.current_round_index, introShownForRound});\n    if (!gameState || !currentRound || !isHost) return;\n    if (phase !== "playing" && phase !== "loading") return;'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
