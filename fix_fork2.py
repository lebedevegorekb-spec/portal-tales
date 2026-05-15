f = open('src/mechanics/Fork/HostView.tsx', encoding='utf-8')
c = f.read()
f.close()
bt = chr(96)
d = chr(36)
old = 'return ' + d + '{SUPABASE_URL}/storage/v1/object/public/scenario-media/;'
new = 'return ' + bt + d + '{SUPABASE_URL}/storage/v1/object/public/scenario-media/' + d + '{path}' + bt + ';'
c = c.replace(old, new)
open('src/mechanics/Fork/HostView.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
