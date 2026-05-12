with open('src/pages/Lobby.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Исправить минимум игроков
content = content.replace(
    'const minReached = playerCount >= (room?.min_players ?? 4);',
    'const minReached = playerCount >= (room?.min_players ?? 3);'
)

# Передать host_name при старте
old = '''    const { data, error } = await supabase.functions.invoke("party-start", {
      body: { room_id: room.id },
    });'''
new = '''    const hostName = (user.user_metadata as any)?.display_name || user.email?.split("@")[0] || "Хост";
    const { data, error } = await supabase.functions.invoke("party-start", {
      body: { room_id: room.id, host_name: hostName },
    });'''
content = content.replace(old, new)

with open('src/pages/Lobby.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done lobby')
