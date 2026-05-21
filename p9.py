p='src/components/ComicFrameView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'import { useRef, useState } from "react";',
'import { useRef, useState, useEffect } from "react";'
)
c=c.replace(
'  const handleReplicasDone = () => {\n    setReplicasDone(true);\n    if (isHost && onNext) onNext();\n  };',
'  const handleReplicasDone = () => {\n    setReplicasDone(true);\n    if (isHost && onNext) setTimeout(() => onNext!(), 800);\n  };\n  useEffect(() => {\n    if (queue.length === 0 && isHost && onNext) {\n      const t = setTimeout(() => { setReplicasDone(true); onNext!(); }, 3000);\n      return () => clearTimeout(t);\n    }\n  }, [frameIndex]);'
)
c=c.replace(
'        <ReplicaChain key={frameIndex} queue={queue} onFinished={handleReplicasDone} />',
'        <ReplicaChain key={frameIndex} queue={queue} onFinished={handleReplicasDone} />'
)
c=c.replace(
'      {queue.length > 0 && !replicasDone && (\n        <ReplicaChain queue={queue} onFinished={handleReplicasDone} />\n      )}',
'      {queue.length > 0 && !replicasDone && (\n        <ReplicaChain key={frameIndex} queue={queue} onFinished={handleReplicasDone} />\n      )}'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
