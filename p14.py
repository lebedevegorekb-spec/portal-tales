p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'          replicasDone={comicReplicasDone}\n          setReplicasDone={setComicReplicasDone}\n          onReplicasFinished={() => setComicReplicasDone(true)}',
'          replicasDone={comicReplicasDone}\n          setReplicasDone={setComicReplicasDone}\n          onReplicasFinished={() => setComicReplicasDone(true)}\n          flipping={comicFlipping}'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
