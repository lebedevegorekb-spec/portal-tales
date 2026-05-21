content = open("supabase/functions/character-ready/index.ts", encoding="utf-8").read()
content = content.replace(
    'const { count } = await supabase.from("room_players").select("id", { count: "exact" }).eq("room_id", room_id);',
    'const { count } = await supabase.from("room_players").select("id", { count: "exact" }).eq("room_id", room_id).eq("is_host", false);'
)
open("supabase/functions/character-ready/index.ts", "w", encoding="utf-8", newline="\n").write(content)
print("ok")
