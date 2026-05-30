p = "src/pages/admin/RoundTest.tsx"
content = open(p, encoding="utf-8").read()

# Фикс 1: превью игрока - добавить pointer-events-none чтобы не перекрывал кнопки
content = content.replace(
'                  <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}>',
'                  <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%", pointerEvents: "none" }}>'
)

# Фикс 2: убрать дублирующуюся кнопку "Только заполнить"
content = content.replace(
'                <button onClick={() => handleAutoSubmit("team_wins")} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-muted-foreground w-full mt-1">Только заполнить (без итога)</button>\n                ',
''
)

open(p, "w", encoding="utf-8", newline="\n").write(content)
print("ok")
