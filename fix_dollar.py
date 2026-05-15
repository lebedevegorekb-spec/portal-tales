f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
bt = chr(96)
dollar = chr(36)
old1 = bt + 'glass-card p-6 max-w-md w-full text-center border ' + bt
new1 = bt + 'glass-card p-6 max-w-md w-full text-center border ' + dollar + '{result.is_tie ? "border-yellow-500/40" : result.team_scored ? "border-acid/40" : "border-destructive/40"}' + bt
c = c.replace(old1, new1)
idx = c.find("'text-3xl font-display mb-2 '")
if idx == -1:
    idx = c.find(bt + 'text-3xl font-display mb-2 ' + bt)
print('idx2:', idx)
old2 = bt + 'text-3xl font-display mb-2 ' + bt
new2 = bt + 'text-3xl font-display mb-2 ' + dollar + '{result.is_tie ? "text-yellow-500" : result.team_scored ? "text-acid" : "text-destructive"}' + bt
c = c.replace(old2, new2)
open('src/pages/admin/RoundTest.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
