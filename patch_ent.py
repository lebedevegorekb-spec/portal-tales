with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    // Загрузить entitlements пользователя
    supabase
      .from("entitlements")
      .select("scope")
      .eq("user_id", user.id)
      .eq("active", true)
      .then(({ data }) => {
        if (data) {
          const scopes = new Set(data.map((e) => e.scope));
          setEntitlements(scopes);
        }
      });
  }, []);'''

new = '''  }, []);'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')
    idx = content.find('Загрузить entitlements')
    print(repr(content[idx-50:idx+300]))

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
