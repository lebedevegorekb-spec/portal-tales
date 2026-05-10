with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''  const startRun = async (id: string) => {
    if (!user) return;'''

new = '''  const startRun = async (id: string) => {
    if (!user) { navigate("/login"); return; }'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND - checking...')
    idx = content.find('const startRun')
    print(repr(content[idx:idx+100]))

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
