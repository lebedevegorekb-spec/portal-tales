p='src/components/ComicFrameView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'      {queue.length > 0 && !replicasDone && !flipping && (\n        <ReplicaChain key={frameIndex} queue={queue} onFinished={handleReplicasDone} />\n      )}',
'      {queue.length > 0 && !replicasDone && (\n        <ReplicaChain key={frameIndex} queue={queue} onFinished={handleReplicasDone} />\n      )}'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
