with open('src/pages/Scene.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить подписку на rooms чтобы игроки переходили к сцене
old = '  // Realtime подписка на статус комнаты\n  useEffect(() => {\n    if (!roomId) return;\n    const channel = supabase\n      .channel(`room_status:${roomId}`)\n      .on("postgres_changes", {\n        event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}`\n      }, (payload) => {\n        setRoomStatus((payload.new as any).status);\n      })\n      .subscribe();\n    return () => { supabase.removeChannel(channel); };\n  }, [roomId]);'

new = '  // Realtime подписка на статус комнаты\n  useEffect(() => {\n    if (!roomId) return;\n    const channel = supabase\n      .channel(`room_status:${roomId}`)\n      .on("postgres_changes", {\n        event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}`\n      }, (payload) => {\n        const newRoom = payload.new as any;\n        setRoomStatus(newRoom.status);\n      })\n      .subscribe();\n    return () => { supabase.removeChannel(channel); };\n  }, [roomId]);'

content = content.replace(old, new)

with open('src/pages/Scene.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done scene')
