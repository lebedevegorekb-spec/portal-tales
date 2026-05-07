with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить cover_image в тип Scenario
content = content.replace(
    '  price_rub: number;\n  scenario_json: any;\n};',
    '  price_rub: number;\n  scenario_json: any;\n  preview_json: any;\n};'
)

# Добавить preview_json в запрос
content = content.replace(
    '.select("id, title, description, price_rub, scenario_json")',
    '.select("id, title, description, price_rub, scenario_json, preview_json")'
)

# Показать обложку если есть
old_img = '''                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl drop-shadow-[0_4px_18px_hsl(var(--portal)/0.6)] select-none">
                      {s.meta.emoji}
                    </span>
                  </div>'''

new_img = '''                  {s.preview_json?.cover_image ? (
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/scenario-media/${s.preview_json.cover_image}`}
                      alt={s.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-7xl drop-shadow-[0_4px_18px_hsl(var(--portal)/0.6)] select-none">
                        {s.meta.emoji}
                      </span>
                    </div>
                  )}'''

content = content.replace(old_img, new_img)

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
