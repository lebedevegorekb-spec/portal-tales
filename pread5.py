c=open("src/pages/admin/RoundTest.tsx",encoding="utf-8").read()
idx=c.find("absolute inset-0 flex flex-col items-center")
print(repr(c[idx:idx+200]))
