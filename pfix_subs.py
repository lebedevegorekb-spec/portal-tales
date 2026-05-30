p="src/pages/admin/RoundTest.tsx"
c=open(p,encoding="utf-8").read()

# Добавить кнопку Submit за всех в боковой панели
c=c.replace(
'              <p className="text-xs text-muted-foreground mt-2">Сабмитов: {submissions.length}</p>',
'              <button onClick={() => handleAutoSubmit("team_wins")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-muted-foreground w-full mt-1">Только заполнить (без итога)</button>\n              <p className="text-xs text-muted-foreground mt-2">Сабмитов: {submissions.length}</p>'
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
