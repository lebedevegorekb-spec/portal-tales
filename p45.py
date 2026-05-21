content = open("supabase/functions/party-start/index.ts", encoding="utf-8").read()
content = content.replace(
    "    const playerIds = players.map((p: any) => p.id);",
    "    const playerIds = players.filter((p: any) => !p.is_host).map((p: any) => p.id);"
)
open("supabase/functions/party-start/index.ts", "w", encoding="utf-8", newline="\n").write(content)
print("ok")
