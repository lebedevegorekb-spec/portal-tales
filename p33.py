p='src/pages/Character.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'.from("room_players").select("id").eq("room_id", roomId).eq("user_id", userId).maybeSingle();',
'.from("room_players").select("id").eq("room_id", roomId).eq("user_id", userId).maybeSingle();'
)
print('checking...')
if '.eq("is_host", false)' in c:
    c=c.replace(
        '.from("room_players").select("id").eq("room_id", roomId).eq("user_id", userId).eq("is_host", false).maybeSingle();',
        '.from("room_players").select("id").eq("room_id", roomId).eq("user_id", userId).maybeSingle();'
    )
    print('fixed is_host filter')
else:
    print('no is_host filter found - issue elsewhere')
open(p,'w',encoding='utf-8',newline='\n').write(c)
