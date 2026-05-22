p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
idx=c.find('const roundSnapshot')
print(repr(c[idx:idx+300]))
