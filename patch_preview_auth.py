with open('src/pages/ScenarioPreview.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''      if (user) {
        const free = (data as any).price_rub === 0;
        if (free) { setHasAccess(true); }
        else {
          const { data: ent } = await supabase
            .from("entitlements")
            .select("id")
            .eq("user_id", user.id)
            .eq("scope", scenarioId)
            .eq("active", true)
            .maybeSingle();
          setHasAccess(!!ent);
        }
      }'''

new = '''      const free = (data as any).price_rub === 0;
      if (free) { setHasAccess(true); }
      else if (user) {
        const { data: ent } = await supabase
          .from("entitlements")
          .select("id")
          .eq("user_id", user.id)
          .eq("scope", scenarioId)
          .eq("active", true)
          .maybeSingle();
        setHasAccess(!!ent);
      }'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')

with open('src/pages/ScenarioPreview.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
