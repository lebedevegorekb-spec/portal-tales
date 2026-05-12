with open('src/pages/Join.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Исправить статус started -> playing и редирект на scene
old = '''        if (room.status === "started" && room.run_id) {
          // Ð•ÑÐ»Ð¸ Ð¿ÐµÑ€ÑÐ¾Ð½Ð°Ð¶ Ð½Ð°Ð·Ð½Ð°Ñ‡ÐµÐ½ Ð½Ð¾ ÐµÑ‰Ñ' Ð½Ðµ ÑÐ¼Ð¾Ñ‚Ñ€ÐµÐ»
          if (rp.character_id) {
            navigate(`/character?run=${room.run_id}&room=${room.id}`);
          } else {
            navigate(`/vote?run=${room.run_id}&room=${room.id}`);
          }
        } else {
          // Ð˜Ð³Ñ€Ð° ÐµÑ‰Ñ' Ð½Ðµ Ð½Ð°Ñ‡Ð°Ð»Ð°ÑÑŒ â€" Ð² Ð»Ð¾Ð±Ð±Ð¸ Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ñ
          navigate(`/waiting?room=${room.id}`);
        }'''

new = '''        if ((room.status === "playing" || room.status === "started") && room.run_id) {
          navigate(`/scene/${room.run_id}`);
        } else {
          navigate(`/waiting?room=${room.id}`);
        }'''

if old in content:
    content = content.replace(old, new)
    print('fixed status check ok')
else:
    print('NOT FOUND - trying alternative')
    idx = content.find('room.status === "started"')
    if idx >= 0:
        print(repr(content[idx-50:idx+300]))

with open('src/pages/Join.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
