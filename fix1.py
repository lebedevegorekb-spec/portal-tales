f = open('src/mechanics/types.ts', encoding='utf-8')
c = f.read()
f.close()
old = '  onAdvance?: () => Promise<void>;\n}'
new = '  onAdvance?: () => Promise<void>;\n  players?: { id: string; display_name: string }[];\n}'
c = c.replace(old, new)
open('src/mechanics/types.ts', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
