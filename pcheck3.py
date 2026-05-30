c=open("src/pages/admin/RoundTest.tsx",encoding="utf-8").read()
print("tab rounds:", "rounds" in c)
print("default rounds:", 'useState<Tab>("rounds")' in c)
print("selectedIndex:", "selectedIndex" in c)
