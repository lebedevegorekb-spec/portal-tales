with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Убрать resize-none из textarea
content = content.replace(
    'className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-portal"',
    'className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-y min-h-[80px] focus:outline-none focus:border-portal"'
)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
