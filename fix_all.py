f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
bt = chr(96)
c = c.replace(
    'glass-card p-6 max-w-md w-full text-center border }',
    bt + 'glass-card p-6 max-w-md w-full text-center border ' + bt
)
c = c.replace(
    'ext-3xl font-display mb-2 }',
    bt + 'text-3xl font-display mb-2 ' + bt
)
c = c.replace(
    'ext-sm px-3 py-1.5 rounded-lg border transition-all }',
    bt + 'text-sm px-3 py-1.5 rounded-lg border transition-all ' + bt
)
c = c.replace(
    'ext-xs px-2 py-1 rounded border transition-all }',
    bt + 'text-xs px-2 py-1 rounded border transition-all ' + bt
)
open('src/pages/admin/RoundTest.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
