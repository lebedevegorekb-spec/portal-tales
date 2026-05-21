content = open("supabase/functions/party-start/index.ts", encoding="utf-8").read()
content = content.replace(
    "    if (players.length < minPlayers && !isTest) {",
    "    const nonHostPlayers = players.filter((p: any) => !p.is_host);\n    if (nonHostPlayers.length < minPlayers && !isTest) {"
)
open("supabase/functions/party-start/index.ts", "w", encoding="utf-8", newline="\n").write(content)
print("ok")
