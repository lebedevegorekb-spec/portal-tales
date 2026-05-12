with open('src/pages/Join.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if 'room.status === "started" && room.run_id' in line:
        # Заменяем блок if/else
        new_lines.append('        if ((room.status === "playing" || room.status === "started") && room.run_id) {\n')
        new_lines.append('          navigate(`/scene/${room.run_id}`);\n')
        # Пропускаем старые строки до закрывающего else
        depth = 1
        i += 1
        while i < len(lines) and depth > 0:
            if '{' in lines[i]: depth += lines[i].count('{') - lines[i].count('}')
            else: depth -= lines[i].count('}')
            i += 1
        new_lines.append('        } else {\n')
        new_lines.append('          navigate(`/waiting?room=${room.id}`);\n')
        new_lines.append('        }\n')
    else:
        new_lines.append(line)
        i += 1

with open('src/pages/Join.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(new_lines)
print('done, lines:', len(new_lines))
