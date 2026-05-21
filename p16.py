p='src/components/ComicFrameView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    const t = setTimeout(() => setCurrent(queue[0] ?? null), 50);',
'    const t = setTimeout(() => setCurrent(queue[0] ?? null), 400);'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
