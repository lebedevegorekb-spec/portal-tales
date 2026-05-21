p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Убрать текст вступления
c=c.replace(
'''        <div className="max-w-2xl text-center space-y-6 animate-in fade-in duration-700" style={{textShadow:"0 2px 8px rgba(0,0,0,0.9)"}}>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Вступление</p>
          <h1 className="text-4xl font-display">{partyConfig.title ?? "Портал Хаоса"}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{intro.situation}</p>
          
        </div>''',
''
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
