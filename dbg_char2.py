f = open('src/pages/Character.tsx', encoding='utf-8')
lines = f.readlines()
f.close()
for i, l in enumerate(lines):
    if "'" in l and l.count("'") % 2 != 0:
        print(i+1, repr(l))
