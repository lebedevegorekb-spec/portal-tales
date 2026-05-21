import re
p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Найдем блок от комментария до закрывающей скобки
pattern = r'    // Фаза result_screen.*?    \}'
match = re.search(pattern, c, re.DOTALL)
if match:
    print("FOUND:", match.start(), "-", match.end())
    print(repr(c[match.start():match.start()+100]))
else:
    print("NOT FOUND")
