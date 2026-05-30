c=open("src/pages/admin/RoundTest.tsx",encoding="utf-8").read()
# Найдем боковую панель
idx=c.find("w-64 border-l")
print(repr(c[idx:idx+1000]))
