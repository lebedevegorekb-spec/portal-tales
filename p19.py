p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'          <button onClick={handleIntroFinish} className="mt-8 bg-portal text-portal-foreground px-12 py-4 rounded-lg font-display text-xl hover:bg-portal/90 transition-colors">\n            Начать игру →\n          </button>',
''
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
