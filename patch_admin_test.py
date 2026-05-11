with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить state isAdmin
if 'isAdmin' not in content:
    content = content.replace(
        '  const [busy, setBusy] = useState<string | null>(null);',
        '  const [busy, setBusy] = useState<string | null>(null);\n  const [isAdmin, setIsAdmin] = useState(false);'
    )
    print('added isAdmin state')
else:
    print('isAdmin already exists')

# Загрузить роль
if 'profiles' not in content:
    content = content.replace(
        '    if (!user) return;\n    supabase\n      .from("entitlements")',
        '    if (!user) return;\n    supabase.from("profiles").select("role").eq("user_id", user.id).single()\n      .then(({ data }) => { if (data?.role === "admin") setIsAdmin(true); });\n    supabase\n      .from("entitlements")'
    )
    print('added profile load')
else:
    print('profiles already exists')

# Добавить кнопку тест
if 'Тест (1 игрок)' not in content:
    old = '''                      ) : (
                        <Link to={`/payment/${s.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            <Lock className="h-4 w-4" />
                            Купить за ₽{s.price_rub}
                          </Button>
                        </Link>
                      )}'''
    new = '''                      ) : (
                        <Link to={`/payment/${s.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            <Lock className="h-4 w-4" />
                            Купить за ₽{s.price_rub}
                          </Button>
                        </Link>
                      )}
                      {isAdmin && (
                        <Button variant="outline" size="sm"
                          onClick={() => startTest(s.id)}
                          disabled={busy === s.id + "_test"}
                          className="w-full border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 mt-1">
                          {busy === s.id + "_test" ? "..." : "Тест (1 игрок)"}
                        </Button>
                      )}'''
    if old in content:
        content = content.replace(old, new)
        print('added test button')
    else:
        print('button target NOT FOUND')
        idx = content.find('Купить за')
        print(repr(content[idx-200:idx+200]))
else:
    print('button already exists')

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
