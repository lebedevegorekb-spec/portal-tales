with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Убрать редирект на логин
content = content.replace(
    '  useEffect(() => {\n    if (!loading && !user) navigate("/login");\n  }, [user, loading, navigate]);',
    ''
)

# Убрать проверку if (loading || !user) return null
content = content.replace(
    '  if (loading || !user) return null;\n',
    ''
)

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done catalog')
