p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    console.log("advance result:", JSON.stringify(advanceRes));\n    ',
'    '
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
