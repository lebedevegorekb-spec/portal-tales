p="src/pages/admin/RoundTest.tsx"
c=open(p,encoding="utf-8").read()

# Вернуть playerCount=4
c=c.replace(
'submissions={submissions} playerCount={1} players={players} onSubmit={handleSubmit} onAdvance={handleAdvance} />',
'submissions={submissions} playerCount={players.length} players={players} onSubmit={handleSubmit} onAdvance={handleAdvance} />'
)

# Добавить кнопку "Подвести итог" в боковую панель после симуляции
c=c.replace(
'              <p className="text-xs text-muted-foreground mt-2">Сабмитов: {submissions.length}</p>',
'              <p className="text-xs text-muted-foreground mt-1.5">Сабмитов: {submissions.length}</p>\n              {phase === "playing" && submissions.length > 0 && (\n                <button onClick={handleAdvance} className="text-xs px-3 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 w-full mt-1.5 transition-colors">▶ Подвести итог</button>\n              )}'
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
