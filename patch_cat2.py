with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl drop-shadow-[0_4px_18px_hsl(var(--portal)/0.6)] select-none">
                      {s.meta.emoji}
                    </span>
                  </div>'''

new = '''                  {s.preview_json?.cover_image ? (
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

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND - searching for emoji line')
    idx = content.find('text-7xl drop-shadow')
    print(repr(content[idx-200:idx+200]))

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
