f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
    '<div className={glass-card p-6 max-w-md w-full text-center border }>',
    '<div className={glass-card p-6 max-w-md w-full text-center border }>'
)
c = c.replace(
    '<p className={    ext-3xl font-display mb-2 }>',
    '<p className={	ext-3xl font-display mb-2 }>'
)
c = c.replace(
    'className={   ext-sm px-3 py-1.5 rounded-lg border transition-all }>',
    'className={	ext-sm px-3 py-1.5 rounded-lg border transition-all }>'
)
c = c.replace(
    'className={   ext-xs px-2 py-1 rounded border transition-all }>',
    'className={	ext-xs px-2 py-1 rounded border transition-all }>'
)
open('src/pages/admin/RoundTest.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
