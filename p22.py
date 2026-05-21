import re
p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=re.sub(r'<div className="max-w-2xl[^"]*"[^>]*>.*?</div>', '', c, flags=re.DOTALL)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok' if 'Вступление' not in c else 'NOT REMOVED')
