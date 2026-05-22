p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'  const [pendingReplicaRound, setPendingReplicaRound] = useState<any>(null);\n  const [pendingReplicaRound, setPendingReplicaRound] = useState<any>(null);',
'  const [pendingReplicaRound, setPendingReplicaRound] = useState<any>(null);'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
