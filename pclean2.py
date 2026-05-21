p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace('    console.log("intro effect", {phase, isHost, hasIntro: !!partyConfig?.intro, introReplicasShown});\n    ','')
c=c.replace('    console.log("round effect", {phase, isHost, roundIdx: gameState?.current_round_index, introShownForRound});\n    ','')
c=c.replace('    console.log("ui_phase effect", {uiPhase, phase});\n    ','')
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
