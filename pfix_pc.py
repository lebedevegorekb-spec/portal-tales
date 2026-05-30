p="src/pages/admin/RoundTest.tsx"
c=open(p,encoding="utf-8").read()

# Уменьшить playerCount до 1 чтобы авто-advance срабатывал после 1 ответа
c=c.replace(
'submissions={submissions} playerCount={players.length} players={players} onSubmit={handleSubmit} onAdvance={handleAdvance} />',
'submissions={submissions} playerCount={1} players={players} onSubmit={handleSubmit} onAdvance={handleAdvance} />'
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
