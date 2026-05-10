with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''  useEffect(() => {
    if (!user) return;
    // Загрузить сценарии
    supabase'''

new = '''  useEffect(() => {
    // Загрузить сценарии
    supabase'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
