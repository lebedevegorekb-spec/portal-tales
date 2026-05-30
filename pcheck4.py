c=open("src/pages/admin/RoundTest.tsx",encoding="utf-8").read()
idx=c.find("runAdvance")
print(repr(c[idx:idx+500]))
