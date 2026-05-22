p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'      setPhase("chars_reveal");',
'      setTimeout(() => setPhase("chars_reveal"), 2000);'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
