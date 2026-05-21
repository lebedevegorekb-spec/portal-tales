p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'        {isHost && <BackgroundImage imagePath={currentRound?.background_image} />}\n        {currentReplica && (\n          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />\n        )}',
'        {isHost && <BackgroundImage imagePath={\n          lastResult?.is_tie ? (currentRound as any)?.result_tie_image :\n          lastResult?.team_scored ? (currentRound as any)?.result_success_image :\n          (currentRound as any)?.result_fail_image ||\n          currentRound?.background_image\n        } />}\n        {currentReplica && (\n          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />\n        )}'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
