p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
idx=c.find('const result = await advance')
print(repr(c[idx-10:idx+80]))
