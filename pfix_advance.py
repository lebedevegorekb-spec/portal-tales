p="src/pages/admin/RoundTest.tsx"
c=open(p,encoding="utf-8").read()

# Фикс handleAdvance - читать актуальный стейт
c=c.replace(
'  const handleAdvance = async () => { if (currentRound) runAdvance(currentRound, submissions); };',
'  const handleAdvance = async () => {\n    if (!currentRound) return;\n    setSubmissions(prev => { runAdvance(currentRound, prev); return prev; });\n  };'
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
