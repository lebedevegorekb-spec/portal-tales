with open('src/pages/ScenarioPreview.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Убрать редирект на логин
content = content.replace(
    '  const navigate = useNavigate();\n',
    '  const navigate = useNavigate();\n'
)

# Убрать проверку navigate login
old = '''    const load = async () => {
      const { data } = await supabase
        .from("scenarios")
        .select("id, title, description, price_rub, preview_json")
        .eq("id", scenarioId)
        .single();
      if (!data) { navigate("/catalog"); return; }'''

new = '''    const load = async () => {
      const { data } = await supabase
        .from("scenarios")
        .select("id, title, description, price_rub, preview_json")
        .eq("id", scenarioId)
        .single();
      if (!data) { navigate("/catalog"); return; }
'''

# Убрать useEffect редирект логин в ScenarioPreview если есть
content = content.replace(
    'if (!loading && !user) navigate("/login");',
    ''
)

with open('src/pages/ScenarioPreview.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done preview')
