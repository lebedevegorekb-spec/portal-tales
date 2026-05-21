p='src/components/BackgroundImage.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    <div className="fixed inset-0 -z-10 overflow-hidden">',
'    <div className="fixed inset-0 overflow-hidden" style={{zIndex: 0}}>'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
