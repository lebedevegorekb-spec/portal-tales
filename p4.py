p='src/pages/admin/ScenarioEdit.tsx'
lines=open(p,encoding='utf-8').readlines()
seen=False
out=[]
for line in lines:
    if '  const [characters, setCharacters] = useState<any[]>([]);' in line:
        if not seen:
            seen=True
            out.append(line)
    else:
        out.append(line)
open(p,'w',encoding='utf-8',newline='\n').writelines(out)
print('ok')
