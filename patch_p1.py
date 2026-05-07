lines_to_find = '{tab === "intro" && partyGame && ('
with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Тип
content = content.replace('type Round = {', '''type PreviewJson = {
  tagline?: string;
  full_description?: string;
  warning?: string;
  host_quote?: string;
  morty_quote?: string;
  duration_minutes?: number;
  players_min?: number;
  players_max?: number;
  difficulty?: string;
  replayable?: boolean;
  age_rating?: string;
};

type Round = {''')

# 2. State
content = content.replace(
    '  const [saving, setSaving] = useState(false);',
    '  const [preview, setPreview] = useState<PreviewJson>({});\n  const [saving, setSaving] = useState(false);'
)

# 3. Загрузка
content = content.replace(
    'if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);',
    'if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);\n      if ((data as any).preview_json) setPreview((data as any).preview_json as PreviewJson);'
)

# 4. Сохранение
content = content.replace(
    '.update({ title, description, price_rub: priceRub, scenario_json: newJson })',
    '.update({ title, description, price_rub: priceRub, scenario_json: newJson, preview_json: preview } as any)'
)

# 5. Таб в список
content = content.replace(
    '["basic","Основное"],["intro",',
    '["basic","Основное"],["preview","Превью"],["intro",'
)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('step1 done')
