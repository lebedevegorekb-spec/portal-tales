with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Найти строку с if (!user) return; после useEffect
for i, line in enumerate(lines):
    if 'if (!user) return;' in line and i > 40 and i < 100:
        lines[i] = ''  # убрать строку
        print(f'Removed line {i+1}: {line.strip()}')
        break

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)
print('done')
