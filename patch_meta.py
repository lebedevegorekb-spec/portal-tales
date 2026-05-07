with open('src/pages/ScenarioPreview.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Убрать сложность
old_diff = '''          {p.difficulty && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-portal/70" /> {DIFFICULTY_LABELS[p.difficulty] ?? p.difficulty}
            </div>
          )}'''
content = content.replace(old_diff, '')

# Заменить текст переигрываемый
content = content.replace(
    '<RotateCcw className="w-4 h-4" /> Переигрываемый',
    '<RotateCcw className="w-4 h-4" /> Можно играть больше 1 раза'
)

with open('src/pages/ScenarioPreview.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
