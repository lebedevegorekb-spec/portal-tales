with open('src/pages/Waiting.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Исправить статус started -> playing
content = content.replace(
    'if (room?.status === "started" && room?.run_id)',
    'if ((room?.status === "playing" || room?.status === "started") && room?.run_id)'
)

# Найти Realtime подписку и добавить обработку playing
old = '.on("postgres_changes"'
# Найдём блок с rooms подпиской
idx = content.find('table: "rooms"')
if idx > 0:
    # Найдём обработчик payload
    payload_idx = content.find('(payload)', idx)
    if payload_idx > 0:
        block_start = content.find('=>', payload_idx) + 2
        # Заменим тело обработчика
        brace_start = content.find('{', block_start)
        depth = 1
        pos = brace_start + 1
        while pos < len(content) and depth > 0:
            if content[pos] == '{': depth += 1
            elif content[pos] == '}': depth -= 1
            pos += 1
        old_handler = content[brace_start:pos]
        new_handler = '''{\n        const r = payload.new as any;\n        if (r.run_id) setRunId(r.run_id);\n        if ((r.status === "playing" || r.status === "started") && r.run_id) {\n          navigate(`/scene/${r.run_id}`);\n        }\n      }'''
        content = content[:brace_start] + new_handler + content[pos:]
        print('replaced rooms handler ok')
    else:
        print('payload not found')
else:
    print('rooms table not found')

with open('src/pages/Waiting.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
