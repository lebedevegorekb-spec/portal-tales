p='src/mechanics/JokeVote/HostView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Раунд — Шутка</p>\n        <h1 className="text-5xl font-display text-center mb-4">{round.title}</h1>\n        <p className="text-xl text-muted-foreground text-center max-w-2xl mb-8">{round.prompt}</p>\n        <p className="text-sm text-muted-foreground mb-8">Ответов получено: {answerSubmissions.length} / {playerCount}</p>\n        <button disabled className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl opacity-40 cursor-not-allowed">\n          Ждём ({answerSubmissions.length}/{playerCount})\n        </button>',
'        <div className="glass-card backdrop-blur-md bg-background/60 p-8 rounded-2xl max-w-2xl w-full text-center flex flex-col items-center gap-4">\n          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Раунд — Шутка</p>\n          <h1 className="text-5xl font-display">{round.title}</h1>\n          <p className="text-xl text-muted-foreground">{round.prompt}</p>\n          <p className="text-sm text-muted-foreground">Ответов получено: {answerSubmissions.length} / {playerCount}</p>\n          <button disabled className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl opacity-40 cursor-not-allowed">Ждём ({answerSubmissions.length}/{playerCount})</button>\n        </div>'
)
c=c.replace(
'        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Раунд — Шутка</p>\n        <h1 className="text-5xl font-display text-center mb-8">{round.title}</h1>\n        <div className="grid gap-4 w-full max-w-2xl mb-8">',
'        <div className="glass-card backdrop-blur-md bg-background/60 p-8 rounded-2xl max-w-2xl w-full text-center flex flex-col items-center gap-4">\n          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Раунд — Шутка</p>\n          <h1 className="text-5xl font-display">{round.title}</h1>\n        </div>\n        <div className="grid gap-4 w-full max-w-2xl">'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
