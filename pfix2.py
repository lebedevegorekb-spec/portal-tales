p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
if 'export default Scene' not in c:
    c=c+'\nexport default Scene;\n'
    open(p,'w',encoding='utf-8',newline='\n').write(c)
    print('added export default')
else:
    print('already exists')
