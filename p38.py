p='src/components/BackgroundImage.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    <div className="fixed inset-0 -z-10 overflow-hidden">',
'    <div className="fixed inset-0 z-0 overflow-hidden">'
)
c=c.replace(
'      <div\n        ref={divRef}\n        className="absolute inset-0 transition-opacity duration-700"',
'      <div\n        ref={divRef}\n        className="absolute inset-0 transition-opacity duration-700 bg-background"'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
