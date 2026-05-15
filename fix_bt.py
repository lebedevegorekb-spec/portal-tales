f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
bt = chr(96)
fixed1 = bt + 'glass-card p-6 max-w-md w-full text-center border ' + bt
fixed2 = bt + 'text-3xl font-display mb-2 ' + bt
c = c.replace('glass-card p-6 max-w-md w-full text-center border }', fixed1)
c = c.replace('ext-3xl font-display mb-2 }', fixed2)
open('src/pages/admin/RoundTest.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
