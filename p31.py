content = open("supabase/functions/character-ready/index.ts", encoding="utf-8").read()
content = content.replace(
    'const allReady = ready.length >= (count ?? 999);',
    'console.log("character-ready", { ready_length: ready.length, count, currentPhase });\n    const allReady = ready.length >= (count ?? 999);'
)
open("supabase/functions/character-ready/index.ts", "w", encoding="utf-8", newline="\n").write(content)
print("ok")
