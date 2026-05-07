with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Добавить тип PreviewJson
old_type = 'type Round = {'
new_type = '''type PreviewJson = {
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

type Round = {'''
content = content.replace(old_type, new_type)

# 2. Добавить state для preview
old_state = '  const [saving, setSaving] = useState(false);'
new_state = '''  const [preview, setPreview] = useState<PreviewJson>({});
  const [saving, setSaving] = useState(false);'''
content = content.replace(old_state, new_state)

# 3. Загрузить preview_json при загрузке сценария
old_load = '      if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);'
new_load = '''      if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);
      if ((data as any).preview_json) setPreview((data as any).preview_json as PreviewJson);'''
content = content.replace(old_load, new_load)

# 4. Сохранять preview_json при сохранении
old_save = '    const { error } = await supabase.from("scenarios")\n      .update({ title, description, price_rub: priceRub, scenario_json: newJson })'
new_save = '    const { error } = await supabase.from("scenarios")\n      .update({ title, description, price_rub: priceRub, scenario_json: newJson, preview_json: preview } as any)'
content = content.replace(old_save, new_save)

# 5. Добавить таб "preview" в список табов
old_tabs = '([["basic","Основное"],["intro","Вступление"],["rounds","Раунды ("+String(partyGame?.rounds?.length ?? 0)+")"],["endings","Концовки"]] as [string,string][])'
new_tabs = '([["basic","Основное"],["preview","Превью"],["intro","Вступление"],["rounds","Раунды ("+String(partyGame?.rounds?.length ?? 0)+")"],["endings","Концовки"]] as [string,string][])'
content = content.replace(old_tabs, new_tabs)

# 6. Добавить таб preview перед табом intro
old_intro_tab = '        {tab === "intro" && partyGame && ('
new_preview_tab = '''        {tab === "preview" && (
          <div className="grid gap-4">
            <TextField label="Тизер (одна фраза)" value={preview.tagline ?? ""} onChange={(v) => setPreview({...preview, tagline: v})} />
            <TextField label="Полное описание" value={preview.full_description ?? ""} onChange={(v) => setPreview({...preview, full_description: v})} />
            <TextField label="Реплика Рика (тизер)" value={preview.host_quote ?? ""} onChange={(v) => setPreview({...preview, host_quote: v})} />
            <TextField label="Реплика Морти (тизер)" value={preview.morty_quote ?? ""} onChange={(v) => setPreview({...preview, morty_quote: v})} />
            <TextField label="Предупреждение" value={preview.warning ?? ""} onChange={(v) => setPreview({...preview, warning: v})} />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Игроков мин</label>
                <input type="number" value={preview.players_min ?? 4} onChange={(e) => setPreview({...preview, players_min: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Игроков макс</label>
                <input type="number" value={preview.players_max ?? 8} onChange={(e) => setPreview({...preview, players_max: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Длительность (мин)</label>
                <input type="number" value={preview.duration_minutes ?? 30} onChange={(e) => setPreview({...preview, duration_minutes: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Возраст</label>
                <input type="text" value={preview.age_rating ?? "16+"} onChange={(e) => setPreview({...preview, age_rating: e.target.value})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Сложность</
@'
with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Добавить тип PreviewJson
old_type = 'type Round = {'
new_type = '''type PreviewJson = {
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

type Round = {'''
content = content.replace(old_type, new_type)

# 2. Добавить state для preview
old_state = '  const [saving, setSaving] = useState(false);'
new_state = '''  const [preview, setPreview] = useState<PreviewJson>({});
  const [saving, setSaving] = useState(false);'''
content = content.replace(old_state, new_state)

# 3. Загрузить preview_json при загрузке сценария
old_load = '      if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);'
new_load = '''      if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);
      if ((data as any).preview_json) setPreview((data as any).preview_json as PreviewJson);'''
content = content.replace(old_load, new_load)

# 4. Сохранять preview_json при сохранении
old_save = '    const { error } = await supabase.from("scenarios")\n      .update({ title, description, price_rub: priceRub, scenario_json: newJson })'
new_save = '    const { error } = await supabase.from("scenarios")\n      .update({ title, description, price_rub: priceRub, scenario_json: newJson, preview_json: preview } as any)'
content = content.replace(old_save, new_save)

# 5. Добавить таб "preview" в список табов
old_tabs = '([["basic","Основное"],["intro","Вступление"],["rounds","Раунды ("+String(partyGame?.rounds?.length ?? 0)+")"],["endings","Концовки"]] as [string,string][])'
new_tabs = '([["basic","Основное"],["preview","Превью"],["intro","Вступление"],["rounds","Раунды ("+String(partyGame?.rounds?.length ?? 0)+")"],["endings","Концовки"]] as [string,string][])'
content = content.replace(old_tabs, new_tabs)

# 6. Добавить таб preview перед табом intro
old_intro_tab = '        {tab === "intro" && partyGame && ('
new_preview_tab = '''        {tab === "preview" && (
          <div className="grid gap-4">
            <TextField label="Тизер (одна фраза)" value={preview.tagline ?? ""} onChange={(v) => setPreview({...preview, tagline: v})} />
            <TextField label="Полное описание" value={preview.full_description ?? ""} onChange={(v) => setPreview({...preview, full_description: v})} />
            <TextField label="Реплика Рика (тизер)" value={preview.host_quote ?? ""} onChange={(v) => setPreview({...preview, host_quote: v})} />
            <TextField label="Реплика Морти (тизер)" value={preview.morty_quote ?? ""} onChange={(v) => setPreview({...preview, morty_quote: v})} />
            <TextField label="Предупреждение" value={preview.warning ?? ""} onChange={(v) => setPreview({...preview, warning: v})} />
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Игроков мин</label>
                <input type="number" value={preview.players_min ?? 4} onChange={(e) => setPreview({...preview, players_min: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Игроков макс</label>
                <input type="number" value={preview.players_max ?? 8} onChange={(e) => setPreview({...preview, players_max: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Длительность (мин)</label>
                <input type="number" value={preview.duration_minutes ?? 30} onChange={(e) => setPreview({...preview, duration_minutes: Number(e.target.value)})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
              <div className="grid gap-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Возраст</label>
                <input type="text" value={preview.age_rating ?? "16+"} onChange={(e) => setPreview({...preview, age_rating: e.target.value})}
                  className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal" />
              </div>
            </div>
            <div className="grid gap-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Сложность</label>
              <select value={preview.difficulty ?? "medium"} onChange={(e) => setPreview({...preview, difficulty: e.target.value})}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-portal">
                <option value="easy">Лёгкая</option>
                <option value="medium">Средняя</option>
                <option value="hard">Сложная</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="replayable" checked={preview.replayable ?? false} onChange={(e) => setPreview({...preview, replayable: e.target.checked})}
                className="w-4 h-4 accent-portal" />
              <label htmlFor="replayable" className="text-sm text-muted-foreground">Переигрываемый</label>
            </div>
          </div>
        )}

        {tab === "intro" && partyGame && ('''
content = content.replace(old_intro_tab, new_preview_tab)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done, length:', len(content))
