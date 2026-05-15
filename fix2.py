f = open('src/pages/Scene.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
  'const [playerCount, setPlayerCount] = useState(4);',
  'const [playerCount, setPlayerCount] = useState(4);\n  const [players, setPlayers] = useState<{id:string;display_name:string}[]>([]);'
)
c = c.replace(
  'setPlayerCount(count ?? room.min_players ?? 3);',
  'setPlayerCount(count ?? room.min_players ?? 3);\n        const { data: pls } = await supabase.from("room_players").select("id,display_name").eq("room_id", room.id).eq("is_host", false);\n        setPlayers((pls ?? []) as {id:string;display_name:string}[]);'
)
c = c.replace(
  '        playerCount={playerCount}',
  '        playerCount={playerCount}\n        players={players}'
)
open('src/pages/Scene.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
