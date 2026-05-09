with open('src/pages/Lobby.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const { data, error } = await supabase.functions.invoke("run-start", {',
    'const { data, error } = await supabase.functions.invoke("party-start", {'
)

with open('src/pages/Lobby.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
