p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    console.log("intro effect", {phase, isHost, hasIntro: !!partyGame?.intro, introReplicasShown});',
'    console.log("intro effect", {phase, isHost, hasIntro: !!partyConfig?.intro, introReplicasShown});'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
