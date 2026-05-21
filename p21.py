p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'  const onReplicaFinished = useCallback(() => {\n    setReplicaQueue(prev => {\n      const next = prev.slice(1);\n      setCurrentReplica(next.length > 0 ? next[0] : null);\n      if (next.length === 0) {\n        if (phase === "result_replicas") setPhase("result_screen");\n        if (phase === "intro") handleIntroFinish();\n      }\n      return next;\n    });\n  }, []);',
'  const phaseRef = useRef<ScenePhase>("loading");\n  useEffect(() => { phaseRef.current = phase; }, [phase]);\n  const onReplicaFinished = useCallback(() => {\n    setReplicaQueue(prev => {\n      const next = prev.slice(1);\n      setCurrentReplica(next.length > 0 ? next[0] : null);\n      if (next.length === 0) {\n        if (phaseRef.current === "result_replicas") setPhase("result_screen");\n        if (phaseRef.current === "intro") handleIntroFinish();\n      }\n      return next;\n    });\n  }, []);'
)
c=c.replace(
'import { useEffect, useState, useCallback } from "react";',
'import { useEffect, useState, useCallback, useRef } from "react";'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
