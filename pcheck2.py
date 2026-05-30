c=open("src/pages/admin/RoundTest.tsx",encoding="utf-8").read()
print("default tab:", "useState<Tab>(\"rounds\")" in c)
print("intro buttons:", "Реплики вступления" in c)
print("auto-advance:", "Авто-advance через" in c)
