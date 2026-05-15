f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
bt = chr(96)
dollar = chr(36)
tab = chr(9)
old = tab + bt + 'text-3xl font-display mb-2 ' + dollar + '{result.is_tie ? "text-yellow-500" : result.team_scored ? "text-acid" : "text-destructive"}'
new = bt + 'text-3xl font-display mb-2 ' + dollar + '{result.is_tie ? "text-yellow-500" : result.team_scored ? "text-acid" : "text-destructive"}' + bt
c = c.replace(old, new)
open('src/pages/admin/RoundTest.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
