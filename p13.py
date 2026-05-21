p='src/components/ComicFrameView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'interface ComicFrameProps {\n  frame: ComicFrame;\n  frameIndex: number;\n  totalFrames: number;\n  onReplicasFinished?: () => void;\n  isHost: boolean;\n  onNext?: () => void;\n  replicasDone: boolean;\n  setReplicasDone: (v: boolean) => void;\n}',
'interface ComicFrameProps {\n  frame: ComicFrame;\n  frameIndex: number;\n  totalFrames: number;\n  onReplicasFinished?: () => void;\n  isHost: boolean;\n  onNext?: () => void;\n  replicasDone: boolean;\n  setReplicasDone: (v: boolean) => void;\n  flipping?: boolean;\n}'
)
c=c.replace(
'export function ComicFrameView({ frame, frameIndex, totalFrames, isHost, onNext, replicasDone, setReplicasDone }: ComicFrameProps) {',
'export function ComicFrameView({ frame, frameIndex, totalFrames, isHost, onNext, replicasDone, setReplicasDone, flipping }: ComicFrameProps) {'
)
c=c.replace(
'      {queue.length > 0 && !replicasDone && (\n        <ReplicaChain key={frameIndex} queue={queue} onFinished={handleReplicasDone} />\n      )}',
'      {queue.length > 0 && !replicasDone && !flipping && (\n        <ReplicaChain key={frameIndex} queue={queue} onFinished={handleReplicasDone} />\n      )}'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
