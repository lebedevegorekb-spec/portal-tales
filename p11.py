p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'        setComicReplicasDone(false);\n        setComicFlipping(true);\n        setTimeout(() => { setComicFrameIndex(i => i + 1); setComicFlipping(false); }, 300);',
'        setComicReplicasDone(false);\n        setComicFlipping(true);\n        setTimeout(() => { setComicFrameIndex(i => i + 1); setComicFlipping(false); }, 2000);'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
