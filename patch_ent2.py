with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Найти и удалить блок entitlements в первом useEffect
start = None
end = None
for i, line in enumerate(lines):
    if 'Загрузить entitlements' in line and start is None:
        start = i
    if start and i > start and '});' in line and end is None:
        end = i
        break

if start and end:
    print(f'Removing lines {start+1} to {end+1}')
    for i in range(start, end+1):
        print(f'  {i+1}: {lines[i].rstrip()}')
        lines[i] = ''
else:
    print(f'NOT FOUND: start={start} end={end}')

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)
