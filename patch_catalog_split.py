with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''  useEffect(() => {
    // Загрузить сценарии
    supabase
      .from("scenarios")
      .select("id, title, description, price_rub, scenario_json, preview_json")
      .order("id")
      .then(({ data }) => {
        if (data) setScenarios(data as Scenario[]);
        setLoadingScenarios(false);
      });
    // Загрузить entitlements пользователя
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
  }, [user]);'''

new = '''  useEffect(() => {
    supabase
      .from("scenarios")
      .select("id, title, description, price_rub, scenario_json, preview_json")
      .order("id")
      .then(({ data }) => {
        if (data) setScenarios(data as Scenario[]);
        setLoadingScenarios(false);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
