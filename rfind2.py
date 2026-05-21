import re
p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
# Ищем по уникальной строке
idx = c.find('result_screen" || phase === "result_replicas"')
if idx >= 0:
    print("FOUND at", idx)
    # Показываем контекст
    print(repr(c[idx-50:idx+200]))
else:
    print("NOT FOUND")
