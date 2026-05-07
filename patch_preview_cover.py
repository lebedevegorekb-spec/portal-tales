with open('src/pages/ScenarioPreview.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить cover_image в тип
content = content.replace(
    '  age_rating?: string;\n};',
    '  age_rating?: string;\n  cover_image?: string;\n};'
)

# Обновить hero секцию — показать обложку если есть
old_hero = '      <div className={`relative w-full h-80 bg-gradient-to-br ${meta.gradient} overflow-hidden`}>'
new_hero = '      <div className={`relative w-full h-80 bg-gradient-to-br ${meta.gradient} overflow-hidden`}>\n        {p.cover_image && (\n          <img\n            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/scenario-media/${p.cover_image}`}\n            alt={scenario.title}\n            className="absolute inset-0 w-full h-full object-cover opacity-60"\n          />\n        )}'

content = content.replace(old_hero, new_hero)

with open('src/pages/ScenarioPreview.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
