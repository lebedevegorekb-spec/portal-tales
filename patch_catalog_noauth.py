with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Убрать проверки if (!user) return в useEffect-ах
content = content.replace(
    '    if (!user) return;\n    supabase\n      .from("scenarios")',
    '    supabase\n      .from("scenarios")'
)

content = content.replace(
    '    if (!user) return;\n    supabase\n      .from("entitlements")',
    '    if (!user) return;\n    supabase\n      .from("entitlements")'
)

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
