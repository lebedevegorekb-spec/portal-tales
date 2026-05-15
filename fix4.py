f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
bt = chr(96)
old = '"text-destructive"}'
new = '"text-destructive"}' + bt
c = c.replace(old, new, 1)
open('src/pages/admin/RoundTest.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
