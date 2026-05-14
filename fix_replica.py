content = open('src/components/ReplicaPlayer.tsx', encoding='utf-8', errors='ignore').read()
idx = content.find('const NAMES')
fixed = content[:idx] + 'const NAMES = { host: "\u0420\u0438\u043a", morty: "\u041c\u043e\u0440\u0442\u0438" };' + content[idx+content[idx:].find(';')+1:]
open('src/components/ReplicaPlayer.tsx', 'w', encoding='utf-8', newline='\n').write(fixed)
print('done')
