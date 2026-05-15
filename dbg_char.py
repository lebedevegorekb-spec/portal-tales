f = open('src/pages/Character.tsx', encoding='utf-8')
lines = f.readlines()
f.close()
for i, l in enumerate(lines[150:], 151):
    print(i, repr(l))
